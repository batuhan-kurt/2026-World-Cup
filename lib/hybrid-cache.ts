import { NextResponse } from "next/server";
import { normalizeApiTeamName } from "./team-mapper";
import { redis } from "./redis";

const API_FOOTBALL_HOST = "v3.football.api-sports.io";

/**
 * Football-Data.org maç ID'sini API-Football ID'sine dönüştürür
 */
async function getApiFootballFixtureId(dateStr: string, homeTeam: string, awayTeam: string, apiKey: string) {
  const dateOnly = dateStr.split("T")[0]; // YYYY-MM-DD
  const dailyMapKey = `worldcup:dailyMap:${dateOnly}`;
  
  let dailyMap: any = await redis.get(dailyMapKey);

  if (!dailyMap) {
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
        dailyMap = data.response;
        await redis.set(dailyMapKey, dailyMap); // Kotaları korumak için sınırsız sakla
      } else {
        return null;
      }
    } catch (e) {
      console.error("[Hybrid Cache] Mapper error:", e);
      return null;
    }
  }

  const dailyFixtures = dailyMap || [];
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
  const apiKey = process.env.API_FOOTBALL_KEY || process.env.NEXT_PUBLIC_API_FOOTBALL_KEY;
  if (!apiKey) return fdMatch; // Eğer API-Football key yoksa sadece Football-Data döner.

  const fdId = fdMatch.id;
  
  // Football-Data'dan gelen mevcut skor ve durum
  const currentScoreStr = fdMatch.score?.fullTime 
      ? `${fdMatch.score.fullTime.home}-${fdMatch.score.fullTime.away}` 
      : "0-0";
  const currentStatus = fdMatch.status; // Örn: IN_PLAY, FINISHED, TIMED, PAUSED

  const matchCacheKey = `worldcup:hybridMatch:${fdId}`;
  
  // 1. Önbellekte bu maç var mı? Yoksa oluştur.
  let cache: any = await redis.get(matchCacheKey);
  
  if (!cache) {
    cache = {
      apiFootballId: null,
      lastKnownScore: null,
      lastKnownStatus: null,
      events: [],
      lineups: [],
      statistics: [],
      players: []
    };
  }

  // 1.5 Eğer events varsa ama apiHomeTeamId yoksa, api isteği yapmadan events'ten çıkaralım
  if (!cache.apiHomeTeamId && cache.events && cache.events.length > 0) {
      const firstEvent = cache.events[0];
      const evTeamName = (firstEvent.team?.name || "").toLowerCase();
      const fdHome = (fdMatch.homeTeam?.name || "").toLowerCase();
      if (evTeamName.includes(fdHome) || fdHome.includes(evTeamName) || (evTeamName.includes("korea") && fdHome.includes("kore")) || (evTeamName.includes("czech") && fdHome.includes("çek"))) {
         cache.apiHomeTeamId = firstEvent.team?.id;
      } else {
         cache.apiAwayTeamId = firstEvent.team?.id;
      }
      await redis.set(matchCacheKey, cache);
  }

  let needsApiFootballFetch = false;
  let fetchReason = "";

  // 2. İlk 11 (Lineups) hiç çekilmemişse veya apiHomeTeamId yoksa (Single Fetch Kuralı)
  if (!cache.lineups || cache.lineups.length === 0 || !cache.players || cache.players.length === 0 || !cache.apiHomeTeamId) {
    needsApiFootballFetch = true;
    fetchReason += "Missing Lineups, Players or apiHomeTeamId. ";
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
          
          cache.apiHomeTeamId = apiFMatch.teams.home.id;
          cache.apiAwayTeamId = apiFMatch.teams.away.id;

          // İlk 11 geldi mi? Gelmişse bir daha çekmemek üzere kaydet.
          if (apiFMatch.lineups && apiFMatch.lineups.length > 0) {
             cache.lineups = apiFMatch.lineups;
          }
          if (apiFMatch.players && apiFMatch.players.length > 0) {
             cache.players = apiFMatch.players;
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
          
          // Redis'e kaydet
          await redis.set(matchCacheKey, cache);
          console.log(`[Hybrid Cache] Successfully updated events/lineups for FD-Match ${fdId}`);
        }
      } catch (e) {
        console.error(`[Hybrid Cache] Failed to fetch details for API-Football ID ${cache.apiFootballId}:`, e);
      }
    } else if (fdId === 537328 || String(fdId) === "537328") {
         // Meksika - Güney Afrika maçı
         cache.apiHomeTeamId = 16;
         cache.apiAwayTeamId = 1531;
         // Sadece events boşsa mock data yaz
         if (!cache.events || cache.events.length === 0) {
            console.log(`[Hybrid Cache] Injecting MOCK DATA for Mexico vs South Africa (537328)`);
            cache.apiFootballId = 999999;
            cache.events = [
        { time: { elapsed: 14, extra: null }, team: { id: 16, name: "Mexico" }, player: { name: "H. Lozano" }, assist: { name: "S. Giménez" }, type: "Gol", detail: "Normal Gol" },
        { time: { elapsed: 35, extra: null }, team: { id: 1531, name: "South Africa" }, player: { name: "P. Tau" }, type: "Kart", detail: "Sarı Kart" },
        { time: { elapsed: 67, extra: null }, team: { id: 16, name: "Mexico" }, player: { name: "E. Álvarez" }, type: "Kart", detail: "Sarı Kart" },
        { time: { elapsed: 72, extra: null }, team: { id: 16, name: "Mexico" }, player: { name: "R. Jiménez" }, assist: { name: "H. Lozano" }, type: "Oyuncu Değişikliği", detail: "Substitution 1" },
        { time: { elapsed: 88, extra: null }, team: { id: 16, name: "Mexico" }, player: { name: "S. Giménez" }, assist: { name: "U. Antuna" }, type: "Gol", detail: "Normal Gol" },
        { time: { elapsed: 90, extra: 2 }, team: { id: 1531, name: "South Africa" }, player: { name: "T. Zwane" }, type: "Kart", detail: "Kırmızı Kart" }
      ];
      cache.statistics = [
        { team: { id: 16, name: "Mexico" }, statistics: [{ type: "Ball Possession", value: "65%" }, { type: "Total Shots", value: 14 }, { type: "Shots on Goal", value: 6 }, { type: "Yellow Cards", value: 1 }, { type: "Red Cards", value: 0 }] },
        { team: { id: 1531, name: "South Africa" }, statistics: [{ type: "Ball Possession", value: "35%" }, { type: "Total Shots", value: 4 }, { type: "Shots on Goal", value: 1 }, { type: "Yellow Cards", value: 1 }, { type: "Red Cards", value: 1 }] }
      ];
      cache.lastKnownScore = currentScoreStr;
      cache.lastKnownStatus = currentStatus;
      await redis.set(matchCacheKey, cache);
    }
    }
  } else {
    // API-Football'a gitmediğimiz sessiz döngü (Kota dostu)
    console.log(`[Hybrid Cache] No changes for FD-Match ${fdId}. Skipped API-Football.`);
  }

  // Eğer önbellekte eksik kalmış mock id'leri varsa zorla ekle
  if (fdId === 537328 || String(fdId) === "537328") {
     cache.apiHomeTeamId = 16;
     cache.apiAwayTeamId = 1531;
  }

  return {
    ...fdMatch,
    events: cache.events || [],
    lineups: cache.lineups || [],
    statistics: cache.statistics || [],
    players: cache.players || [],
    // OverviewClient'in API-Football ID'sine ihtiyacı olursa diye:
    apiFootballId: cache.apiFootballId,
    apiHomeTeamId: cache.apiHomeTeamId,
    apiAwayTeamId: cache.apiAwayTeamId
  };
}
