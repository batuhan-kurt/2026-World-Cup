const fs = require('fs');

const ids = [16, 1531, 25, 12, 2384, 10, 13, 22, 5529, 26, 24, 20, 6, 2, 1530, 17, 9, 27, 7, 1504, 1, 3, 31, 23, 768, 1118, 8, 19, 15, 21, 2382, 1532, 5, 14, 2383, 1501, 11, 767, 30, 28, 1090, 775, 2380, 1500, 772, 770, 2379, 32];

const API_KEY = "4bf8d5a1a13f09c8ff5a2d975ddd5957";

async function run() {
  const wrong = [];
  for (const id of ids) {
    try {
      const res = await fetch(`https://v3.football.api-sports.io/teams?id=${id}`, {
        headers: { 'x-apisports-key': API_KEY }
      });
      const data = await res.json();
      if (data.response && data.response.length > 0) {
        const team = data.response[0].team;
        if (!team.national) {
            console.log(`WARNING: ${team.name} (ID: ${id}) is NOT a national team!`);
            wrong.push(id);
        } else {
            console.log(`OK: ${team.name} (ID: ${id})`);
        }
      }
    } catch(e) {}
    await new Promise(r => setTimeout(r, 6100));
  }
  console.log("Done checking.");
}
run();
