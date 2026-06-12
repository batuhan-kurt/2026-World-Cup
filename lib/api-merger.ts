import { normalizeApiTeamName, findCanonicalTeam } from "./team-mapper";

export function mergeStandings(staticGroups: any[], liveStandings: any[]) {
  if (!liveStandings || !Array.isArray(liveStandings) || liveStandings.length === 0) {
    return staticGroups; // Eşleşecek canlı veri yoksa statik dön
  }

  return staticGroups.map(group => {
    const updatedTeams = group.teams.map((team: any) => {
      // Find team in live standings
      const liveTeam = liveStandings.find(
        (lt: any) => {
          if (lt.team?.id === team.id) return true;
          const canonical = findCanonicalTeam(lt.team?.name);
          return canonical && canonical.id === team.id;
        }
      );
      
      if (liveTeam) {
        return {
          ...team,
          points: liveTeam.points || 0,
          played: liveTeam.playedGames || 0,
          win: liveTeam.won || 0,
          draw: liveTeam.draw || 0,
          lose: liveTeam.lost || 0,
          goalsFor: liveTeam.goalsFor || 0,
          goalsAgainst: liveTeam.goalsAgainst || 0,
          goalDifference: liveTeam.goalDifference || 0
        };
      }
      
      // Default / fallback if no live data for this specific team yet
      return {
        ...team,
        points: team.points || 0,
        played: team.played || 0,
        win: team.win || 0,
        draw: team.draw || 0,
        lose: team.lose || 0,
        goalsFor: team.goalsFor || 0,
        goalsAgainst: team.goalsAgainst || 0,
        goalDifference: team.goalDifference || 0
      };
    });

    // Sort updated teams by points (desc), goal difference (desc), goals for (desc)
    updatedTeams.sort((a: any, b: any) => {
      if ((b.points || 0) !== (a.points || 0)) return (b.points || 0) - (a.points || 0);
      if ((b.goalDifference || 0) !== (a.goalDifference || 0)) return (b.goalDifference || 0) - (a.goalDifference || 0);
      return (b.goalsFor || 0) - (a.goalsFor || 0);
    });

    return {
      ...group,
      teams: updatedTeams
    };
  });
}

export function mergeFixtures(staticFixtures: any[], liveFixtures: any[]) {
  if (!liveFixtures || !Array.isArray(liveFixtures) || liveFixtures.length === 0) {
    return staticFixtures;
  }

  return staticFixtures.map(fixture => {
    const liveMatch = liveFixtures.find((lf: any) => {
      if (!lf || !lf.homeTeam || !lf.awayTeam) return false;
      
      const homeAPI = normalizeApiTeamName(lf.homeTeam.name);
      const awayAPI = normalizeApiTeamName(lf.awayTeam.name);
      
      const team1ConfigName = fixture.team1Config ? normalizeApiTeamName(fixture.team1Config.name) : '';
      const team2ConfigName = fixture.team2Config ? normalizeApiTeamName(fixture.team2Config.name) : '';
      
      const team1Tr = fixture.team1 ? normalizeApiTeamName(fixture.team1) : '';
      const team2Tr = fixture.team2 ? normalizeApiTeamName(fixture.team2) : '';

      const isHomeMatch = (homeAPI === team1ConfigName || homeAPI === team1Tr || homeAPI.includes(team1Tr) || team1Tr.includes(homeAPI));
      const isAwayMatch = (awayAPI === team2ConfigName || awayAPI === team2Tr || awayAPI.includes(team2Tr) || team2Tr.includes(awayAPI));
      
      return isHomeMatch && isAwayMatch;
    });

    if (liveMatch) {
      let newScore = fixture.score;
      
      // Football-Data.org status mapping to our UI logic (FT, LIVE, HT, NS)
      let parsedStatus = "NS";
      if (liveMatch.status === "FINISHED") parsedStatus = "FT";
      else if (liveMatch.status === "IN_PLAY") parsedStatus = "LIVE";
      else if (liveMatch.status === "PAUSED") parsedStatus = "HT";
      else if (liveMatch.status === "POSTPONED") parsedStatus = "PST";
      else if (liveMatch.status === "CANCELLED") parsedStatus = "CANC";

      // Countdown logic
      if (parsedStatus === "NS" && liveMatch.utcDate) {
        const matchTime = new Date(liveMatch.utcDate).getTime();
        const now = new Date().getTime();
        const diffMs = matchTime - now;
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins > 0 && diffMins <= 60) {
          parsedStatus = `⏱ ${diffMins}dk`;
        }
      }

      if (parsedStatus !== "NS" && parsedStatus !== "PST" && parsedStatus !== "CANC" && !parsedStatus.startsWith("⏱")) {
        const homeGoals = liveMatch.score?.fullTime?.home ?? liveMatch.score?.regularTime?.home ?? 0;
        const awayGoals = liveMatch.score?.fullTime?.away ?? liveMatch.score?.regularTime?.away ?? 0;
        newScore = `${homeGoals} - ${awayGoals}`;
        
        // Handle penalties if exist
        if (liveMatch.score?.penalties?.home !== null && liveMatch.score?.penalties?.home !== undefined) {
          newScore += ` (${liveMatch.score.penalties.home}-${liveMatch.score.penalties.away} P)`;
        }
      }
      
      // Map Referee
      let refereeName = null;
      if (liveMatch.referees && liveMatch.referees.length > 0) {
         refereeName = liveMatch.referees[0].name;
      }

      return {
        ...fixture,
        score: newScore,
        status: parsedStatus,
        elapsed: liveMatch.minute || 0, // Football-data might not provide minute in free tier for finished matches
        fixtureId: liveMatch.id,
        referee: refereeName
      };
    }

    return {
      ...fixture,
      status: "NS",
      elapsed: 0
    };
  });
}
