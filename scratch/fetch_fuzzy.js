const API_KEY = "4bf8d5a1a13f09c8ff5a2d975ddd5957";
const searches = ["Turk", "Bosnia", "Cape", "Congo"];

async function run() {
  for (const s of searches) {
    try {
      const res = await fetch(`https://v3.football.api-sports.io/teams?search=${encodeURIComponent(s)}`, {
        headers: { 'x-apisports-key': API_KEY }
      });
      const data = await res.json();
      if (data.response && data.response.length > 0) {
        const national = data.response.filter(t => t.team.national);
        console.log(`Search ${s}:`);
        for (const t of national) {
            console.log(`  -> ${t.team.name}: ${t.team.id}`);
        }
      }
    } catch(e) {}
    await new Promise(r => setTimeout(r, 6100));
  }
}
run();
