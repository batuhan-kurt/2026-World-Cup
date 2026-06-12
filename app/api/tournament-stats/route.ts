import { NextResponse } from "next/server";

const globalAny: any = global;

export async function GET() {
  try {
    let totalMatches = 0;
    let totalGoals = 0;
    let totalYellowCards = 0;
    let totalRedCards = 0;
    let goalScorers: Record<string, { name: string, goals: number, team: string }> = {};
    let teamStats: Record<string, { name: string, scored: 0, conceded: 0, played: 0 }> = {};

    // 1. Önce Football-Data'dan oynanan tüm maçları çekelim (Temel golleri saymak için)
    const token = process.env.FOOTBALL_DATA_TOKEN;
    if (token) {
      const res = await fetch(`https://api.football-data.org/v4/competitions/WC/matches`, {
        method: "GET",
        headers: { "X-Auth-Token": token },
        next: { revalidate: 60 }
      });
      if (res.ok) {
        const data = await res.json();
        const matches = data.matches || [];
        totalMatches = matches.filter((m: any) => m.status === "FINISHED" || ["IN_PLAY", "PAUSED"].includes(m.status)).length;
        
        matches.forEach((m: any) => {
          if (m.status === "FINISHED" || ["IN_PLAY", "PAUSED"].includes(m.status)) {
            const hTeam = m.homeTeam?.name || "Bilinmiyor";
            const aTeam = m.awayTeam?.name || "Bilinmiyor";
            if (!teamStats[hTeam]) teamStats[hTeam] = { name: hTeam, scored: 0, conceded: 0, played: 0 };
            if (!teamStats[aTeam]) teamStats[aTeam] = { name: aTeam, scored: 0, conceded: 0, played: 0 };
            
            teamStats[hTeam].played++;
            teamStats[aTeam].played++;
            
            if (m.score?.fullTime) {
              const hG = m.score.fullTime.home || 0;
              const aG = m.score.fullTime.away || 0;
              teamStats[hTeam].scored += hG;
              teamStats[hTeam].conceded += aG;
              teamStats[aTeam].scored += aG;
              teamStats[aTeam].conceded += hG;
              totalGoals += (hG + aG);
            }
          }
        });
      }
    }

    // 2. RAM'deki Cache'den detaylı istatistikleri (Kartlar ve Oyuncular) say
    const cachedMatches = globalAny.hybridMatchCache || {};
    let topAssists: Record<string, { name: string, assists: number, team: string }> = {};
    
    Object.values(cachedMatches).forEach((match: any) => {
      const events = match.events || [];
      
      events.forEach((ev: any) => {
        // Sarı ve Kırmızı Kart Sayımı
        if (ev.type === "Card" || ev.type === "Kart") {
          if (ev.detail?.includes("Yellow") || ev.detail?.includes("Sarı")) totalYellowCards++;
          if (ev.detail?.includes("Red") || ev.detail?.includes("Kırmızı")) totalRedCards++;
        }
        
        // Gol Krallığı Sayımı (Sadece Normal Gol ve Penaltı)
        if ((ev.type === "Goal" || ev.type === "Gol") && !ev.detail?.includes("cancelled") && !ev.detail?.includes("İptal") && !ev.detail?.includes("Own") && !ev.detail?.includes("Kendi")) {
          const playerName = ev.player?.name;
          const teamName = ev.team?.name;
          const assistName = ev.assist?.name;

          if (playerName) {
            if (!goalScorers[playerName]) {
              goalScorers[playerName] = { name: playerName, goals: 0, team: teamName };
            }
            goalScorers[playerName].goals++;
          }

          if (assistName) {
             if (!topAssists[assistName]) {
                topAssists[assistName] = { name: assistName, assists: 0, team: teamName };
             }
             topAssists[assistName].assists++;
          }
        }
      });
    });

    // En çok gol atanları sırala
    const topScorers = Object.values(goalScorers).sort((a, b) => b.goals - a.goals).slice(0, 5);
    const topAssisters = Object.values(topAssists).sort((a, b) => b.assists - a.assists).slice(0, 5);
    
    // Takım İstatistikleri
    const teamsArray = Object.values(teamStats).filter(t => t.played > 0 && t.name !== "Bilinmiyor");
    const topScoringTeams = [...teamsArray].sort((a, b) => b.scored - a.scored).slice(0, 5);
    const bestDefendingTeams = [...teamsArray].sort((a, b) => a.conceded - b.conceded).slice(0, 5);

    return NextResponse.json({ 
      totalMatches, 
      totalGoals, 
      totalYellowCards, 
      totalRedCards,
      topScorers,
      topAssisters,
      topScoringTeams,
      bestDefendingTeams
    });
  } catch (error) {
    console.error("Tournament stats error:", error);
    return NextResponse.json({ error: "Failed to fetch tournament stats" }, { status: 500 });
  }
}
