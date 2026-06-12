const fs = require('fs');

const moreTeams = [
  "Uzbekistan", "Nigeria", "Colombia", "Sweden", "Serbia", "Chile", "Algeria", "Mali",
  "Honduras", "Peru", "Ivory Coast", "Iraq", "Paraguay", "Egypt", "New Zealand", "Turkey", "Jamaica"
];

const API_KEY = "4bf8d5a1a13f09c8ff5a2d975ddd5957";

async function run() {
  const results = [];
  for (const name of moreTeams) {
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
    await new Promise(r => setTimeout(r, 6100));
  }
  fs.writeFileSync('scratch/more_ids.txt', results.join('\n'));
}
run();
