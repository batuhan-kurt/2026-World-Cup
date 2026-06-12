import PredictionsClient from "@/components/predictions/PredictionsClient";
import { getFixturesData, getGroupsData } from "@/lib/data-service";
import fs from "fs";
import path from "path";

export const revalidate = 300;

export default async function PredictionsPage() {
  const fixtures = getFixturesData();
  const groups = getGroupsData();
  
  let players: any[] = [];
  try {
    const squadsPath = path.join(process.cwd(), "data", "wc2026-squads.json");
    if (fs.existsSync(squadsPath)) {
      const squadsObj = JSON.parse(fs.readFileSync(squadsPath, "utf-8"));
      Object.keys(squadsObj).forEach(country => {
        const countryPlayers = squadsObj[country].players || [];
        countryPlayers.forEach((p: any) => {
          let pos = "Bilinmiyor";
          if (p.position === "1KL") pos = "Goalkeeper";
          if (p.position === "2DF") pos = "Centre-Back";
          if (p.position === "3OS") pos = "Central Midfield";
          if (p.position === "4FV") pos = "Centre-Forward";
          
          players.push({
            name: p.name,
            position: pos,
            club: p.club,
            country: country
          });
        });
      });
    }
  } catch (error) {
    console.error("Error loading players", error);
  }
  
  return (
    <PredictionsClient fixtures={fixtures} groups={groups} players={players} />
  );
}
