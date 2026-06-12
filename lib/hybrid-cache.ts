// lib/hybrid-cache.ts
import { NextResponse } from "next/server";

const globalAny: any = global;

// In-Memory Cache (Sunucu hafızası)
// Node.js çalıştığı sürece (veya dev modda hot-reload olmadığı sürece) bu veri silinmez.
if (!globalAny.hybridMatchCache) {
  globalAny.hybridMatchCache = {};
}
if (!globalAny.apiFootballDailyMap) {
  // Tarihe göre API-Football maç listesi (ID bulmak için)
  globalAny.apiFootballDailyMap = {}; 
}

const API_FOOTBALL_HOST = "v3.football.api-sports.io";

import { normalizeApiTeamName } from "./team-mapper";

/**
 * Football-Data.org maç ID'sini API-Football ID'sine dönüştürür
 */
async function getApiFootballFixtureId(dateStr: string, homeTeam: string, awayTeam: string, apiKey: string) {
  const dateOnly = dateStr.split("T")[0]; // YYYY-MM-DD
  
  if (!globalAny.apiFootballDailyMap[dateOnly]) {
    console.log(`[Hybrid Cache] Fetching daily fixtures from API-Football for mapper: ${dateOnly}`);
    try {
      const res = await fetch(`https://${API_FOOTBALL_HOST}/fixtures?date=${dateOnly}&timezone=Europe/Istanbul`, {
        headers: {
          "x-rapidapi-host": API_FOOTBALL_HOST,
          "x-rapidapi-key": apiKey
        }
      });
      const data = await res.json();
      if (data.response && data.response.length > 0) {
        globalAny.apiFootballDailyMap[dateOnly] = data.response;
      } else {
        return null;
      }
    } catch (e) {
      console.error("[Hybrid Cache] Mapper error:", e);
      return null;
    }
  }

  // Önbellekteki günlük maçlardan takım adlarına göre eşleşeni bul
  const dailyFixtures = globalAny.apiFootballDailyMap[dateOnly] || [];
  const normHome = normalizeApiTeamName(homeTeam);
  const normAway = normalizeApiTeamName(awayTeam);

  const matched = dailyFixtures.find((f: any) => {
    if (!f.teams || !f.teams.home || !f.teams.away) return false;
    const fHome = normalizeApiTeamName(f.teams.home.name);
    const fAway = normalizeApiTeamName(f.teams.away.name);
    return (fHome.includes(normHome) || normHome.includes(fHome)) && 
           (fAway.includes(normAway) || normAway.includes(fAway));
  });

  return matched ? matched.fixture.id : null;
}

/**
 * Hibrit Motor: 
 * 1. Eğer ilk 11 yoksa, API-Football'dan çeker (Single Fetch).
 * 2. Eğer skor/durum değiştiyse, API-Football'dan Event'leri (Gol/Kart) günceller (Event-Driven).
 */
export async function getHybridMatchDetails(fdMatch: any) {
  const apiKey = process.env.API_FOOTBALL_KEY;
  if (!apiKey) return fdMatch; // Eğer API-Football key yoksa sadece Football-Data döner.

  const fdId = fdMatch.id;
  
  // Football-Data'dan gelen mevcut skor ve durum
  const currentScoreStr = fdMatch.score?.fullTime 
      ? `${fdMatch.score.fullTime.home}-${fdMatch.score.fullTime.away}` 
      : "0-0";
  const currentStatus = fdMatch.status; // Örn: IN_PLAY, FINISHED, TIMED, PAUSED

  // 1. Önbellekte bu maç var mı? Yoksa oluştur.
  if (!globalAny.hybridMatchCache[fdId]) {
    globalAny.hybridMatchCache[fdId] = {
      apiFootballId: null,
      lastKnownScore: null,
      lastKnownStatus: null,
      events: [],
      lineups: [],
      statistics: []
    };
  }

  const cache = globalAny.hybridMatchCache[fdId];
  let needsApiFootballFetch = false;
  let fetchReason = "";

  // 2. İlk 11 (Lineups) hiç çekilmemişse (Single Fetch Kuralı)
  if (!cache.lineups || cache.lineups.length === 0) {
    // Maç başlamamış olsa bile (TIMED), eğer ilk 11 açıklandıysa çekmek isteriz.
    needsApiFootballFetch = true;
    fetchReason += "Missing Lineups. ";
  }

  // 3. Skor veya Statü değişmiş mi? (Event-Driven Kuralı)
  if (cache.lastKnownScore !== currentScoreStr || cache.lastKnownStatus !== currentStatus) {
    // Maç "TIMED" (Başlamamış) iken skor değişmez, boşuna istek atma.
    if (currentStatus !== "TIMED" && currentStatus !== "SCHEDULED") {
      needsApiFootballFetch = true;
      fetchReason += `Status/Score changed (Score: ${cache.lastKnownScore}->${currentScoreStr}, Status: ${cache.lastKnownStatus}->${currentStatus}). `;
    }
  }

  // 4. Eğer bir değişiklik varsa API-Football'a git!
  if (needsApiFootballFetch) {
    console.log(`[Hybrid Cache] Triggering API-Football for FD-Match ${fdId}. Reason: ${fetchReason}`);
    
    // API-Football ID'sini bul
    if (!cache.apiFootballId) {
      const apiFId = await getApiFootballFixtureId(fdMatch.utcDate, fdMatch.homeTeam.name, fdMatch.awayTeam.name, apiKey);
      if (apiFId) {
        cache.apiFootballId = apiFId;
      }
    }

    if (cache.apiFootballId) {
      try {
        const res = await fetch(`https://${API_FOOTBALL_HOST}/fixtures?id=${cache.apiFootballId}&timezone=Europe/Istanbul`, {
          headers: {
            "x-rapidapi-host": API_FOOTBALL_HOST,
            "x-rapidapi-key": apiKey
          }
        });
        const data = await res.json();
        
        if (data.response && data.response.length > 0) {
          const apiFMatch = data.response[0];
          // İlk 11 geldi mi? Gelmişse bir daha çekmemek üzere kaydet.
          if (apiFMatch.lineups && apiFMatch.lineups.length > 0) {
             cache.lineups = apiFMatch.lineups;
          }
          // Olayları (Events) ve İstatistikleri her tetiklenmede güncelle
          if (apiFMatch.events) {
            // Çeviri yap
            cache.events = apiFMatch.events.map((ev: any) => {
              let typeTr = ev.type;
              let detailTr = ev.detail;
              
              if (ev.type === "Goal") typeTr = "Gol";
              else if (ev.type === "Card") typeTr = "Kart";
              else if (ev.type === "subst") typeTr = "Oyuncu Değişikliği";
              else if (ev.type === "Var") typeTr = "VAR";

              if (ev.detail === "Yellow Card") detailTr = "Sarı Kart";
              else if (ev.detail === "Red Card") detailTr = "Kırmızı Kart";
              else if (ev.detail === "Normal Goal") detailTr = "Normal Gol";
              else if (ev.detail === "Penalty") detailTr = "Penaltı";
              else if (ev.detail === "Own Goal") detailTr = "Kendi Kalesine";
              else if (ev.detail === "Goal cancelled") detailTr = "İptal Edilen Gol";
              else if (ev.detail === "Penalty cancelled") detailTr = "İptal Edilen Penaltı";
              
              return { ...ev, type: typeTr, detail: detailTr };
            });
          }
          if (apiFMatch.statistics) {
            cache.statistics = apiFMatch.statistics;
          }
          
          // Son durumu kaydet (Bir sonraki döngüde değişmediyse API'ye gitmez)
          cache.lastKnownScore = currentScoreStr;
          cache.lastKnownStatus = currentStatus;
          console.log(`[Hybrid Cache] Successfully updated events/lineups for FD-Match ${fdId}`);
        }
      } catch (e) {
        console.error(`[Hybrid Cache] Failed to fetch details for API-Football ID ${cache.apiFootballId}:`, e);
      }
    } else {
      console.log(`[Hybrid Cache] Could not map FD-Match ${fdId} to an API-Football ID.`);
    }
  } else {
    // API-Football'a gitmediğimiz sessiz döngü (Kota dostu)
    console.log(`[Hybrid Cache] No changes for FD-Match ${fdId}. Skipped API-Football.`);
  }

  // 5. Birleştirme (Merge)
  // Football-Data'dan gelen ham objeye, bizim Cache'den aldığımız events, lineups ve statistics'i ekliyoruz.
  // Bu sayede Frontend (OverviewClient) hiçbir değişikliğe uğramadan verileri okuyabilecek.
  return {
    ...fdMatch,
    events: cache.events || [],
    lineups: cache.lineups || [],
    statistics: cache.statistics || [],
    // OverviewClient'in API-Football ID'sine ihtiyacı olursa diye:
    apiFootballId: cache.apiFootballId
  };
}
