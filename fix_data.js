const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'data', 'wc2026-mock-data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const stadiums = [
  "Aztek Stadyumu, Meksiko", "NRG Stadyumu, Houston", "Lincoln Financial Field, Philadelphia", 
  "MetLife Stadyumu, New Jersey", "SoFi Stadyumu, Los Angeles", "AT&T Stadyumu, Dallas", 
  "BMO Field, Toronto", "BC Place, Vancouver", "Lumen Field, Seattle", 
  "Levi's Stadyumu, Santa Clara", "Arrowhead Stadyumu, Kansas City", 
  "Mercedes-Benz Stadyumu, Atlanta", "Gillette Stadyumu, Boston", 
  "Hard Rock Stadyumu, Miami", "Akron Stadyumu, Guadalajara", "BBVA Stadyumu, Monterrey"
];

// 1. Add Quarter Final matches
const qfMatches = [
  {
    "stage": "Çeyrek Final",
    "date": "10 Temmuz 2026",
    "time": "03.00",
    "team1": "89. Maç Kazananı",
    "team2": "90. Maç Kazananı",
    "score": "VS",
    "venue": "SoFi Stadyumu, Los Angeles"
  },
  {
    "stage": "Çeyrek Final",
    "date": "11 Temmuz 2026",
    "time": "03.00",
    "team1": "91. Maç Kazananı",
    "team2": "92. Maç Kazananı",
    "score": "VS",
    "venue": "Gillette Stadyumu, Boston"
  },
  {
    "stage": "Çeyrek Final",
    "date": "11 Temmuz 2026",
    "time": "23.00",
    "team1": "93. Maç Kazananı",
    "team2": "94. Maç Kazananı",
    "score": "VS",
    "venue": "Hard Rock Stadyumu, Miami"
  },
  {
    "stage": "Çeyrek Final",
    "date": "12 Temmuz 2026",
    "time": "04.00",
    "team1": "95. Maç Kazananı",
    "team2": "96. Maç Kazananı",
    "score": "VS",
    "venue": "Arrowhead Stadyumu, Kansas City"
  }
];

// Ensure they aren't already there
if (!data.fixtures.find(f => f.stage === "Çeyrek Final")) {
  // insert before Yarı Final or just append
  const semiFinalIndex = data.fixtures.findIndex(f => f.stage === "Yarı Final");
  if (semiFinalIndex !== -1) {
    data.fixtures.splice(semiFinalIndex, 0, ...qfMatches);
  } else {
    data.fixtures.push(...qfMatches);
  }
}

// 2. Replace "?" venues
let randIndex = 0;
data.fixtures.forEach(f => {
  if (f.venue === "?") {
    f.venue = stadiums[randIndex % stadiums.length];
    randIndex++;
  }
});

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
console.log("Mock data fixed successfully.");
