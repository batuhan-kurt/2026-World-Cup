import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export async function GET() {
  try {
    let totalMatches = 0;
    let totalGoals = 0;
    let totalYellowCards = 0;
    let totalRedCards = 0;
    let goalScorers: Record<string, { name: string, goals: number, team: string }> = {};
    let topAssists: Record<string, { name: string, assists: number, team: string }> = {};
    let teamStats: Record<string, { name: string, scored: number, conceded: number, played: number, yellow: number, red: number }> = {};
    let playerRatings: Record<string, { name: string, team: string, totalRating: number, count: number, photo: string }> = {};
    let playerCards: Record<string, { name: string, team: string, yellow: number, red: number }> = {};

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
            if (!teamStats[hTeam]) teamStats[hTeam] = { name: hTeam, scored: 0, conceded: 0, played: 0, yellow: 0, red: 0 };
            if (!teamStats[aTeam]) teamStats[aTeam] = { name: aTeam, scored: 0, conceded: 0, played: 0, yellow: 0, red: 0 };
            
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

    // 2. Redis'ten tüm hibrit maç detaylarını çek (Olaylar, İstatistikler, Oyuncular)
    const keys = await redis.keys("worldcup:hybridMatch:*");
    if (keys.length > 0) {
      const cachedMatches = await redis.mget(...keys);
      
      cachedMatches.forEach((match: any) => {
        if (!match) return;
        
        const events = match.events || [];
        const playersData = match.players || [];
        
        // Goller, Kartlar, Asistler
        events.forEach((ev: any) => {
          if (ev.type === "Card" || ev.type === "Kart") {
            const playerName = ev.player?.name;
            const teamName = ev.team?.name;
            
            if (playerName) {
               if (!playerCards[playerName]) playerCards[playerName] = { name: playerName, team: teamName, yellow: 0, red: 0 };
            }
            if (teamName && !teamStats[teamName]) {
               teamStats[teamName] = { name: teamName, scored: 0, conceded: 0, played: 0, yellow: 0, red: 0 };
            }

            if (ev.detail?.includes("Yellow") || ev.detail?.includes("Sarı")) {
                totalYellowCards++;
                if (playerName) playerCards[playerName].yellow++;
                if (teamName && teamStats[teamName]) teamStats[teamName].yellow = (teamStats[teamName].yellow || 0) + 1;
            }
            if (ev.detail?.includes("Red") || ev.detail?.includes("Kırmızı")) {
                totalRedCards++;
                if (playerName) playerCards[playerName].red++;
                if (teamName && teamStats[teamName]) teamStats[teamName].red = (teamStats[teamName].red || 0) + 1;
            }
          }
          
          if ((ev.type === "Goal" || ev.type === "Gol") && !ev.detail?.includes("cancelled") && !ev.detail?.includes("İptal") && !ev.detail?.includes("Own") && !ev.detail?.includes("Kendi")) {
            const playerName = ev.player?.name;
            const teamName = ev.team?.name;
            const assistName = ev.assist?.name;

            if (playerName) {
              if (!goalScorers[playerName]) goalScorers[playerName] = { name: playerName, goals: 0, team: teamName };
              goalScorers[playerName].goals++;
            }
            if (assistName) {
               if (!topAssists[assistName]) topAssists[assistName] = { name: assistName, assists: 0, team: teamName };
               topAssists[assistName].assists++;
            }
          }
        });

        // Oyuncu Rating'leri (Sadece API-Football'dan gelenler)
        playersData.forEach((teamInfo: any) => {
          const teamName = teamInfo.team?.name;
          const players = teamInfo.players || [];
          players.forEach((p: any) => {
            const playerInfo = p.player;
            const stats = p.statistics?.[0];
            if (playerInfo && stats && stats.games?.rating) {
              const rating = parseFloat(stats.games.rating);
              if (!isNaN(rating)) {
                if (!playerRatings[playerInfo.id]) {
                  playerRatings[playerInfo.id] = {
                    name: playerInfo.name,
                    team: teamName,
                    totalRating: 0,
                    count: 0,
                    photo: playerInfo.photo
                  };
                }
                playerRatings[playerInfo.id].totalRating += rating;
                playerRatings[playerInfo.id].count++;
              }
            }
          });
        });
      });
    }

    // Sıralamalar
    const topScorers = Object.values(goalScorers).sort((a, b) => b.goals - a.goals).slice(0, 5);
    const topAssisters = Object.values(topAssists).sort((a, b) => b.assists - a.assists).slice(0, 5);
    const topYellowCardPlayers = Object.values(playerCards).sort((a, b) => b.yellow - a.yellow).slice(0, 5);
    const topRedCardPlayers = Object.values(playerCards).sort((a, b) => b.red - a.red).filter(p => p.red > 0).slice(0, 5);
    
    // Rating Ortalamaları
    const topRatedPlayers = Object.values(playerRatings)
      .filter(p => p.count > 0)
      .map(p => ({
        name: p.name,
        team: p.team,
        rating: (p.totalRating / p.count).toFixed(2),
        photo: p.photo
      }))
      .sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating))
      .slice(0, 5);

    const teamsArray = Object.values(teamStats).filter(t => t.played > 0 && t.name !== "Bilinmiyor");
    const topScoringTeams = [...teamsArray].sort((a, b) => b.scored - a.scored).slice(0, 5);
    const bestDefendingTeams = [...teamsArray].sort((a, b) => a.conceded - b.conceded).slice(0, 5);
    const topYellowCardTeams = [...teamsArray].sort((a, b) => (b.yellow || 0) - (a.yellow || 0)).slice(0, 5);
    const topRedCardTeams = [...teamsArray].sort((a, b) => (b.red || 0) - (a.red || 0)).filter(t => (t.red || 0) > 0).slice(0, 5);

    return NextResponse.json({ 
      totalMatches, 
      totalGoals, 
      totalYellowCards, 
      totalRedCards,
      topScorers,
      topAssisters,
      topYellowCardPlayers,
      topRedCardPlayers,
      topRatedPlayers,
      topScoringTeams,
      bestDefendingTeams,
      topYellowCardTeams,
      topRedCardTeams
    });
  } catch (error) {
    console.error("Tournament stats error:", error);
    return NextResponse.json({ error: "Failed to fetch tournament stats" }, { status: 500 });
  }
}
