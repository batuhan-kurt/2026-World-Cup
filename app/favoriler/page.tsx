import { FavoritesClient } from "@/components/favorites/FavoritesClient";
import { WC_2026_CONFIG } from "@/lib/wc2026-config";
import { getFixturesData, getGroupsData } from "@/lib/data-service";
import fs from "fs";
import path from "path";

export default async function FavoritesPage() {
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
          (team.name.includes("Kongo") && t.code === "COD")
        );
        return {
          ...team,
          englishName: configTeam?.name || team.name,
          logo: configTeam?.logo || `https://ui-avatars.com/api/?name=${team.name}&background=1e293b&color=fff`,
          coach: configTeam?.coach,
          camp: configTeam?.camp,
          group: configTeam?.group
        };
      });
    }
    if (fs.existsSync(tmPlayersPath)) {
      players = JSON.parse(fs.readFileSync(tmPlayersPath, "utf-8"));
    }
  } catch (error) {
    console.error(error);
  }

  return (
    <main className="container max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-12 mb-20 md:mb-0">
      <FavoritesClient 
        teams={teams} 
        players={players} 
        fixtures={getFixturesData()} 
        groups={getGroupsData()} 
      />
    </main>
  );
}
