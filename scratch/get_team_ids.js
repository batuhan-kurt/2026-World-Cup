const fs = require('fs');

const teamsByGroup = {
  "Group A": ["Mexico", "South Africa", "Germany", "Japan"],
  "Group B": ["USA", "England", "Senegal", "Iran"],
  "Group C": ["Canada", "Argentina", "Poland", "Australia"],
  "Group D": ["Brazil", "France", "Cameroon", "South Korea"],
  "Group E": ["Spain", "Portugal", "Uruguay", "Ghana"],
  "Group F": ["Belgium", "Croatia", "Morocco", "Saudi Arabia"],
  "Group G": ["Italy", "Netherlands", "Colombia", "Nigeria"],
  "Group H": ["Switzerland", "Denmark", "Ecuador", "Algeria"],
  "Group I": ["Sweden", "Serbia", "Chile", "Ivory Coast"],
  "Group J": ["Turkey", "Wales", "Peru", "Tunisia"],
  "Group K": ["Norway", "Austria", "Paraguay", "Mali"],
  "Group L": ["Ukraine", "Czech Republic", "Venezuela", "Egypt"]
};

const API_KEY = "4bf8d5a1a13f09c8ff5a2d975ddd5957";

async function fetchTeamId(name) {
  const res = await fetch(`https://v3.football.api-sports.io/teams?name=${name}`, {
    headers: { 'x-apisports-key': API_KEY }
  });
  const data = await res.json();
  if (data.response && data.response.length > 0) {
    // Return national team if multiple, else the first one
    const national = data.response.find(t => t.team.national);
    if (national) return national.team.id;
    return data.response[0].team.id;
  }
  console.log(`Team not found: ${name}`);
  return null;
}

async function run() {
  const config = { groups: {}, teams: [] };
  
  for (const [groupName, teamNames] of Object.entries(teamsByGroup)) {
    config.groups[groupName] = [];
    for (const name of teamNames) {
      console.log(`Fetching ${name}...`);
      const id = await fetchTeamId(name);
      if (id) {
        config.groups[groupName].push(id);
        config.teams.push({ id, name, group: groupName });
      }
      // slight delay to avoid rate limit (10 req/sec)
      await new Promise(r => setTimeout(r, 200));
    }
  }
  
  fs.writeFileSync('../lib/wc2026-config.json', JSON.stringify(config, null, 2));
  console.log("Done! Config saved.");
}

run();
