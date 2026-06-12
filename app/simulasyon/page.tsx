import { SimulationClient } from "@/components/simulation/SimulationClient";
import { WC_2026_CONFIG } from "@/lib/wc2026-config";
import mockData from "@/data/wc2026-mock-data.json";
import fs from "fs";
import path from "path";

export default async function SimulationPage() {
  const tmTeamsPath = path.join(process.cwd(), "data", "tm_teams.json");
  let tmTeams = [];
  
  try {
    if (fs.existsSync(tmTeamsPath)) {
      tmTeams = JSON.parse(fs.readFileSync(tmTeamsPath, "utf-8"));
    }
  } catch (e) {
    console.error(e);
  }

  // Merge FIFA ranking, TM value and group data
  const groups = Object.entries(mockData.groups).map(([groupName, teamNames]) => {
    return {
      name: groupName,
      teams: teamNames.map(teamName => {
        const configTeam = WC_2026_CONFIG.teams.find(t => (t as any).turkishName === teamName || t.name === teamName);
        const tmTeam = tmTeams.find((t: any) => t.name === teamName);
        
        let powerValue = 50; // default base power
        if ((configTeam as any)?.fifaRanking) {
          // FIFA Ranking 1 is best, max around 100
          powerValue += (100 - (configTeam as any).fifaRanking) * 0.4;
        }
        if (tmTeam?.total_value) {
          // Parse value like "1.52 milyar €" or "500 mil. €"
          let val = 0;
          if (tmTeam.total_value.includes("milyar")) {
            val = parseFloat(tmTeam.total_value) * 1000;
          } else {
            val = parseFloat(tmTeam.total_value);
          }
          if (!isNaN(val)) {
            // max value is around 1500 (1.5B)
            powerValue += (val / 1500) * 40; 
          }
        }
        
        return {
          id: configTeam?.id || teamName,
          name: teamName,
          logo: configTeam?.logo || `https://ui-avatars.com/api/?name=${teamName}&background=1e293b&color=fff`,
          power: Math.min(99, Math.round(powerValue)),
          points: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          played: 0,
          wins: 0,
          draws: 0,
          losses: 0
        };
      })
    };
  });

  return (
    <main className="container max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-12 mb-20 md:mb-0">
      <SimulationClient initialGroups={groups} />
    </main>
  );
}
