const fs = require('fs');

const mdLines = fs.readFileSync('tr-wikipedia-org-wiki-2026-FIFA-D-nya-Kupas.md', 'utf8').split('\n');

const matches = [];

for (let i = 0; i < mdLines.length; i++) {
  const line = mdLines[i];
  if (line.includes('. Maç]') && line.startsWith('|')) {
    // Attempt to extract team1 and team2
    // Format: | [Team1](link)![flag] | [Match N\. Maç] | ![flag][Team2](link) |
    // Sometimes it's | Team1 | ...
    let team1 = "";
    let team2 = "";
    
    const parts = line.split('|').map(s => s.trim()).filter(s => s.length > 0);
    if (parts.length >= 3) {
       // parts[0] is team1, parts[1] is match, parts[2] is team2
       const t1Match = parts[0].match(/\[(.*?)\]/);
       team1 = t1Match ? t1Match[1] : parts[0].replace(/!\[.*?\]\(.*?\)/g, '').trim();
       
       const t2Match = parts[2].match(/\[(.*?)\]/);
       // The second team might have multiple brackets due to flags, the LAST text bracket is usually the team name
       // Or we can just strip images and brackets
       let t2Str = parts[2].replace(/!\[.*?\]\(.*?\)/g, '').trim(); // Remove image tags
       const t2StrMatch = t2Str.match(/\[(.*?)\]/);
       team2 = t2StrMatch ? t2StrMatch[1] : t2Str;
    }
    
    // Find date (scan up to 10 lines)
    let dateStr = "Bilinmiyor";
    for (let j = i - 1; j >= Math.max(0, i - 10); j--) {
      if (mdLines[j].match(/[0-9]+\s+[A-Za-z]+\s+2026/)) {
        dateStr = mdLines[j].match(/([0-9]+\s+[A-Za-z]+\s+2026)/)[1];
        break;
      }
    }
    
    // Find venue (scan down up to 10 lines)
    let venueStr = "Bilinmiyor";
    for (let j = i + 1; j <= Math.min(mdLines.length - 1, i + 10); j++) {
      if (mdLines[j].startsWith('| [') && !mdLines[j].includes('Rapor')) {
        // e.g. | [Lumen Field](...), [Seattle]... |
        let vLine = mdLines[j].replace(/^\|\s*/, '').replace(/\s*\|$/, '');
        // strip links
        vLine = vLine.replace(/\[(.*?)\]\(.*?\)/g, '$1');
        venueStr = vLine;
        break;
      }
    }
    
    matches.push({ team1, team2, date: dateStr, venue: venueStr, lineIdx: i });
  }
}

fs.writeFileSync('parsed_matches.json', JSON.stringify(matches, null, 2));
console.log(`Parsed ${matches.length} matches.`);
