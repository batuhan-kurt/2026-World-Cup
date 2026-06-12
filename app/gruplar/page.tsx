import GroupsClient from "@/components/groups/GroupsClient";
import { getGroupsData, getFixturesData } from "@/lib/data-service";
import fs from 'fs';
import path from 'path';

export const revalidate = 300;

export default async function GroupsPage() {
  const groups = getGroupsData();
  const fixtures = getFixturesData();
  
  // Get full squads
  const dataPath = path.join(process.cwd(), "data", "wc2026-squads.json");
  let fullSquads = {};
  if (fs.existsSync(dataPath)) {
    const fileContent = fs.readFileSync(dataPath, "utf-8");
    fullSquads = JSON.parse(fileContent);
  }

  return (
    <GroupsClient 
      groups={groups} 
      fixtures={fixtures} 
      fullSquads={fullSquads} 
    />
  );
}
