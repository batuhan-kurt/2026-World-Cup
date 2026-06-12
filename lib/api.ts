/**
 * API-Football (v3.football.api-sports.io) Integration
 */

const API_KEY = process.env.RAPIDAPI_KEY || "";
const BASE_URL = "https://v3.football.api-sports.io";

export interface Team {
  id: number;
  name: string;
  logo: string;
}

export interface Fixture {
  id: number;
  date: string;
  timestamp: number;
  status: {
    short: string;
    long: string;
    elapsed: number | null;
  };
}

export interface Goals {
  home: number | null;
  away: number | null;
}

export interface MatchResponse {
  fixture: Fixture;
  league: {
    id: number;
    name: string;
    logo: string;
    flag: string | null;
    season: number;
    round: string;
  };
  teams: {
    home: Team;
    away: Team;
  };
  goals: Goals;
  score: {
    halftime: Goals;
    fulltime: Goals;
    extratime: Goals;
    penalty: Goals;
  };
}

// ============================================================
// Core Fetcher
// ============================================================
export async function fetchApi<T>(endpoint: string, revalidate: number = 60): Promise<T | null> {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'x-apisports-key': API_KEY,
      },
      next: { revalidate }, // Next.js Cache
    });

    if (!res.ok) {
      console.error(`API Error: ${res.status}`);
      return null;
    }

    const data = await res.json();
    return data.response as T;
  } catch (error) {
    console.error("Fetch API Error:", error);
    return null;
  }
}

// ============================================================
// Maçlar (Fikstür)
// ============================================================

export async function getMatchesByDate(dateYYYYMMDD: string): Promise<MatchResponse[]> {
  // Format YYYY-MM-DD
  const formattedDate = `${dateYYYYMMDD.substring(0, 4)}-${dateYYYYMMDD.substring(4, 6)}-${dateYYYYMMDD.substring(6, 8)}`;
  const matches = await fetchApi<MatchResponse[]>(`/fixtures?date=${formattedDate}`, 60);
  
  if (!matches) return [];
  // Sadece World Cup (League ID = 1) maçlarını filtrele
  return matches.filter(m => m.league.id === 1);
}

// ============================================================
// Takımlar ve Kadrolar
// ============================================================

import { WC_2026_CONFIG } from "./wc2026-config";
import squadsData from "../data/wc2026-squads.json";

const TEAM_ID_TO_TURKISH_NAME: Record<number, string> = {
    25: "Almanya", 10: "İngiltere", 775: "Avusturya", 1: "Belçika",
    9991: "Bosna-Hersek", 3: "Hırvatistan", 1108: "İskoçya", 9: "İspanya",
    2: "Fransa", 1090: "Norveç", 1118: "Hollanda", 27: "Portekiz",
    5: "İsveç", 15: "İsviçre", 770: "Çekya", 9992: "Türkiye",
    26: "Arjantin", 6: "Brezilya", 8: "Kolombiya", 2382: "Ekvador",
    2380: "Paraguay", 7: "Uruguay", 5529: "Kanada", 2384: "ABD",
    16: "Meksika", 5530: "Curaçao", 2386: "Haiti", 11: "Panama",
    1531: "Güney Afrika", 1532: "Cezayir", 9993: "Yeşil Burun Adaları", 1501: "Fildişi Sahili",
    32: "Mısır", 1504: "Gana", 31: "Fas", 9994: "Kongo DC",
    13: "Senegal", 28: "Tunus", 23: "Suudi Arabistan", 20: "Avustralya",
    1567: "Irak", 12: "Japonya", 1548: "Ürdün", 1568: "Özbekistan",
    1569: "Katar", 17: "Güney Kore", 22: "İran", 4673: "Yeni Zelanda"
};

export async function getTeams(leagueId: number = 1, season: number = 2026) {
  const data = await fetchApi<any[]>(`/teams?league=${leagueId}&season=${season}`, 86400); // 24 saat cache
  
  if (!data || data.length === 0) {
    // API sunucularında 2026 takımları yüklenene kadar manuel eşleştirme (Fallback)
    return WC_2026_CONFIG.teams.map(t => ({
      team: { 
        id: t.id, 
        name: (t as any).turkishName || t.name, 
        code: t.code, 
        logo: t.logo, 
        country: (t as any).turkishName || t.name,
        coach: (t as any).coach || "Bilinmiyor"
      },
      venue: { name: (t as any).camp || "Bilinmiyor" }
    }));
  }
  return data;
}

export async function getSquad(teamId: number) {
  const turkishName = TEAM_ID_TO_TURKISH_NAME[teamId];
  if (turkishName && (squadsData as any)[turkishName]) {
    const localSquadObj = (squadsData as any)[turkishName];
    return localSquadObj.players.map((p: any) => {
      let position = "Unknown";
      if (p.position.includes("KL")) position = "Goalkeeper";
      else if (p.position.includes("DF")) position = "Defender";
      else if (p.position.includes("OS") || p.position.includes("MF")) position = "Midfielder";
      else if (p.position.includes("FV") || p.position.includes("FW")) position = "Attacker";

      return {
        id: p.number || Math.floor(Math.random() * 100000),
        name: p.name,
        number: p.number,
        position: position,
        age: p.age || "?",
        club: p.club || "Serbest",
        photo: `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=1e293b&color=fff`
      };
    });
  }

  const data = await fetchApi<any[]>(`/players/squads?team=${teamId}`, 86400);
  return data?.[0]?.players || [];
}

// ============================================================
// Gruplar (Puan Durumu)
// ============================================================

export async function getStandings(leagueId: number = 1, season: number = 2026) {
  const data = await fetchApi<any[]>(`/standings?league=${leagueId}&season=${season}`, 300); // 5 dk cache
  
  if (!data || data.length === 0) {
    // API sunucularında 2026 grupları yüklenene kadar manuel eşleştirme (Fallback)
    const syntheticStandings = Object.entries(WC_2026_CONFIG.groups).map(([groupName, teamIds]) => {
      return teamIds.map((teamId, index) => {
        const teamInfo = WC_2026_CONFIG.teams.find(t => t.id === teamId);
        return {
          rank: index + 1,
          team: { id: teamInfo?.id, name: teamInfo?.name, logo: teamInfo?.logo },
          points: 0,
          goalsDiff: 0,
          group: groupName,
          all: { played: 0, win: 0, draw: 0, lose: 0, goals: { for: 0, against: 0 } }
        };
      });
    });
    
    return [{ league: { standings: syntheticStandings } }];
  }
  return data;
}
