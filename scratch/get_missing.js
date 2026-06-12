const fs = require('fs');

const missingTeams = [
  "South Africa", "Italy", "Colombia", "Nigeria", "Algeria",
  "Sweden", "Chile", "Ivory Coast", "Turkey", "Peru",
  "Norway", "Austria", "Paraguay", "Mali", "Ukraine",
  "Czech Republic", "Venezuela", "Egypt"
];

const API_KEY = "4bf8d5a1a13f09c8ff5a2d975ddd5957";

async function run() {
  const results = [];
  for (const name of missingTeams) {
    try {
      const res = await fetch(`https://v3.football.api-sports.io/teams?name=${name}`, {
        headers: { 'x-apisports-key': API_KEY }
      });
      const data = await res.json();
      if (data.response && data.response.length > 0) {
        const national = data.response.find(t => t.team.national) || data.response[0];
        results.push(`${name}: ${national.team.id}`);
        console.log(`Found ${name}: ${national.team.id}`);
      } else {
        console.log(`Not found: ${name}`);
      }
    } catch(e) { console.log("Error on", name); }
    
    // Sleep 6.1s to avoid 10 req/min limit
    await new Promise(r => setTimeout(r, 6100));
  }
  fs.writeFileSync('scratch/missing_ids.txt', results.join('\n'));
  console.log("Done");
}

run();
