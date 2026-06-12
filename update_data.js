const fs = require('fs');

const mockData = JSON.parse(fs.readFileSync('data/wc2026-mock-data.json', 'utf8'));
const parsedMatches = JSON.parse(fs.readFileSync('parsed_matches.json', 'utf8'));

const cleanVenue = (v) => {
  if (!v) return "?";
  let str = v.split('<br>')[0].trim();
  // If there are lingering markdown things, remove them
  str = str.replace(/\*\*/g, '');
  return str;
};

// Group H teams
const groupH = mockData.groups['Grup H']; // ["İspanya", "Yeşil Burun Adaları", "Suudi Arabistan", "Uruguay"]

// 1. Add missing Group H matches
// We filter parsedMatches that contain these teams
const groupHMatches = parsedMatches.filter(m => groupH.includes(m.team1) && groupH.includes(m.team2));

console.log("Found Group H matches:", groupHMatches.length);
groupHMatches.forEach((m, idx) => {
  // Check if it already exists
  const exists = mockData.fixtures.find(f => f.team1 === m.team1 && f.team2 === m.team2);
  if (!exists) {
    mockData.fixtures.push({
      stage: "Grup H",
      date: m.date,
      time: "22.00", // Default if not parsed
      team1: m.team1,
      team2: m.team2,
      score: "VS",
      venue: cleanVenue(m.venue)
    });
  }
});

// 2. Update venues for all existing matches
let updatedCount = 0;
mockData.fixtures.forEach(f => {
  // Find matching parsed match
  // We can try to match by team1 and team2, or just team1/team2 if knockouts
  const match = parsedMatches.find(pm => {
    // Exact match for group games
    if (pm.team1 === f.team1 && pm.team2 === f.team2) return true;
    // For knockouts, our mockData has things like "89. Maç Kazananı", parsed might have "89. Maç kazananı"
    if (pm.team1.toLowerCase() === f.team1.toLowerCase() && pm.team2.toLowerCase() === f.team2.toLowerCase()) return true;
    return false;
  });
  
  if (match) {
    f.venue = cleanVenue(match.venue);
    updatedCount++;
  }
});

console.log(`Updated venues for ${updatedCount} matches.`);

fs.writeFileSync('data/wc2026-mock-data.json', JSON.stringify(mockData, null, 2));
