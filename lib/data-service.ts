import mockData from '../data/wc2026-mock-data.json';
import { WC_2026_CONFIG } from './wc2026-config';

export function getGroupsData() {
  const groups = [];
  
  for (const [groupName, teamNames] of Object.entries(mockData.groups)) {
    const groupTeams = teamNames.map(teamName => {
      // Find the team in config by turkishName or name
      const teamConfig = WC_2026_CONFIG.teams.find(t => 
        (t as any).turkishName === teamName || 
        t.name === teamName ||
        t.name.includes(teamName)
      );
      
      return {
        name: teamName,
        logo: teamConfig ? teamConfig.logo : 'https://media.api-sports.io/football/leagues/1.png',
        id: teamConfig ? teamConfig.id : Math.random(),
        config: teamConfig
      };
    });
    
    groups.push({
      name: groupName,
      teams: groupTeams
    });
  }
  
  return groups;
}

export function getFixturesData() {
  const fixtures = mockData.fixtures;
  
  // Attach logos
  return fixtures.map(f => {
    const team1Config = WC_2026_CONFIG.teams.find(t => 
      (t as any).turkishName === f.team1 || t.name === f.team1 || t.name.includes(f.team1)
    );
    const team2Config = WC_2026_CONFIG.teams.find(t => 
      (t as any).turkishName === f.team2 || t.name === f.team2 || t.name.includes(f.team2)
    );
    
    return {
      ...f,
      team1Logo: team1Config ? team1Config.logo : 'https://media.api-sports.io/football/leagues/1.png',
      team2Logo: team2Config ? team2Config.logo : 'https://media.api-sports.io/football/leagues/1.png',
      team1Config,
      team2Config,
    };
  });
}

export function getTeamsInfoData() {
  return mockData.teams_info;
}
