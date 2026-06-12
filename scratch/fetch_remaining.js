const API_KEY = "4bf8d5a1a13f09c8ff5a2d975ddd5957";
const teams = ["Turkiye", "Bosnia", "Haiti", "Cape Verde", "DR Congo", "Jordan"];

async function run() {
  for (const name of teams) {
    try {
      const res = await fetch(`https://v3.football.api-sports.io/teams?name=${encodeURIComponent(name)}`, {
        headers: { 'x-apisports-key': API_KEY }
      });
      const data = await res.json();
      if (data.response && data.response.length > 0) {
        const national = data.response.find(t => t.team.national) || data.response[0];
        console.log(`Found ${name}: ${national.team.id}`);
      } else {
        console.log(`Not found: ${name}`);
      }
    } catch(e) {}
    await new Promise(r => setTimeout(r, 6100));
  }
}
run();
