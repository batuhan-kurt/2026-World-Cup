const API_KEY = "4bf8d5a1a13f09c8ff5a2d975ddd5957";
const base_url = "https://v3.football.api-sports.io";

async function check(endpoint) {
    const res = await fetch(`${base_url}${endpoint}`, {
        headers: { 'x-apisports-key': API_KEY }
    });
    const data = await res.json();
    const arr = data.response || [];
    console.log(`${endpoint}: ${arr.length} results`);
    if (arr.length > 0) {
        console.log(`  Sample: ${JSON.stringify(arr[0]).substring(0, 200)}...`);
    }
}

async function run() {
    await check("/leagues?id=1");
    await check("/teams?league=1&season=2026");
    await check("/standings?league=1&season=2026");
    await check("/fixtures?league=1&season=2026");
    await check("/players/squads?team=16");
}
run();
