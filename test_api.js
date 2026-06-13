const https = require('https');

const options = {
  hostname: 'v3.football.api-sports.io',
  path: '/fixtures?league=1&season=2026',
  headers: {
    'x-apisports-key': process.env.API_FOOTBALL_KEY || '296065eaab8bb279e89b21696da991de'
  }
};

https.get(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    const mxMatch = json.response.find(m => 
      m.teams.home.name.toLowerCase().includes("mexico") || 
      m.teams.away.name.toLowerCase().includes("mexico")
    );
    console.log("Found:", mxMatch ? mxMatch.fixture.id : "None");
  });
}).on("error", console.error);
