from bs4 import BeautifulSoup
import json
import re

with open('scratch/wiki_squads.html', 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f.read(), 'html.parser')

data = {}
current_team = None

for elem in soup.find_all(['h3', 'table']):
    if elem.name == 'h3':
        span = elem.find('span', class_='mw-headline')
        if span:
            current_team = span.text.strip()
            data[current_team] = []
    elif elem.name == 'table' and current_team and 'sortable' in elem.get('class', []):
        rows = elem.find('tbody').find_all('tr')
        for row in rows:
            th = row.find('th')
            tds = row.find_all('td')
            # Example: <th>Player Name</th> <td>Age</td> <td>Caps</td> <td>Goals</td> <td>Club</td>
            # Wait, column layout: No, Pos, Player, DOB, Caps, Goals, Club
            # Check if th is Player or No?
            # From earlier grep: 
            # <th scope="row"><a href="...">Matěj Kovář</a></th>
            # <td style="border:0">17 Mayıs...</td>
            # So th is actually the player name!
            
            # Let's just grab all text from th and tds
            cells = [th] + tds if th else tds
            if len(cells) >= 6:
                try:
                    # Let's extract raw text for now
                    raw_texts = [c.text.strip() for c in cells]
                    
                    # If th was player name, it's at index 0?
                    # The wikipedia structure:
                    # td: No, td: Pos, th: Player, td: DOB, td: Caps, td: Goals, td: Club
                    # Wait! In the grep output, Matěj Kovář was th, but what about No and Pos?
                    # Ah! The previous rows might have th for No? No, th scope="row" is usually the primary key (Player Name).
                    # Let's find the position of the club (last column usually).
                    club = raw_texts[-1]
                    name = raw_texts[0] # If th is the first one in the list, wait.
                    
                    # Let's be smart: find all 'a' tags in the row.
                    a_tags = row.find_all('a')
                    links = [a.text.strip() for a in a_tags if a.text.strip() != '']
                    
                    if len(links) >= 2:
                        name = links[0]
                        club = links[-1]
                        data[current_team].append({
                            'name': name,
                            'club': club,
                            'raw': raw_texts
                        })
                except Exception as e:
                    pass

print(f"Extracted {len([k for k,v in data.items() if len(v) > 0])} teams with players.")
with open('data/wc2026-squads.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
