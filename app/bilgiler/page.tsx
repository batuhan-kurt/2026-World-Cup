import { InfoClient } from "@/components/info/InfoClient";
import fs from "fs";
import path from "path";
import { WC_2026_CONFIG } from "@/lib/wc2026-config";

export default async function InfoPage() {
  const tmTeamsPath = path.join(process.cwd(), "data", "tm_teams.json");
  const tmPlayersPath = path.join(process.cwd(), "data", "tm_players.json");
  
  let teams = [];
  let players = [];
  
  try {
    if (fs.existsSync(tmTeamsPath)) {
      const parsedTeams = JSON.parse(fs.readFileSync(tmTeamsPath, "utf-8"));
      teams = parsedTeams.map((team: any) => {
        const configTeam = WC_2026_CONFIG.teams.find(t => 
          (t as any).turkishName === team.name || 
          t.name === team.name ||
          (team.name.includes("Amerika") && t.code === "USA") ||
          (team.name.includes("Kongo") && t.code === "COD") ||
          (team.name.includes("Morocco") && t.code === "MAR")
        );
        return {
          ...team,
          englishName: team.name, // Keep the english name from tm_teams
          logo: configTeam?.logo || `https://ui-avatars.com/api/?name=${team.name}&background=1e293b&color=fff`
        };
      });
    }
    if (fs.existsSync(tmPlayersPath)) {
      players = JSON.parse(fs.readFileSync(tmPlayersPath, "utf-8"));
    }
  } catch (error) {
    console.error("Error loading transfermarkt data", error);
  }

  return (
    <main className="container max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-12 mb-20 md:mb-0">
      <InfoClient teams={teams} players={players} />
    </main>
  );
}
