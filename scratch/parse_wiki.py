from bs4 import BeautifulSoup
import json
import re

with open('scratch/wiki_squads.html', 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f.read(), 'html.parser')

data = {}
current_group = None
current_team = None

# Find all headings (h2, h3) and tables
for elem in soup.find_all(['h2', 'h3', 'table']):
    if elem.name == 'h2':
        span = elem.find('span', class_='mw-headline')
        if span and 'Grubu' in span.text:
            current_group = span.text.strip()
    elif elem.name == 'h3':
        span = elem.find('span', class_='mw-headline')
        if span:
            current_team = span.text.strip()
            data[current_team] = {'group': current_group, 'players': []}
    elif elem.name == 'table' and 'sortable' in elem.get('class', []) and current_team:
        # Parse player rows
        rows = elem.find('tbody').find_all('tr')
        for row in rows:
            cols = row.find_all(['th', 'td'])
            if len(cols) >= 6:
                try:
                    # No, Pos, Player, DOB, Caps, Goals, Club
                    no = cols[0].text.strip()
                    if not no.isdigit(): continue
                    pos_text = cols[1].text.strip()
                    pos_match = re.search(r'(KL|DF|OS|FV)', pos_text)
                    pos = pos_match.group(1) if pos_match else pos_text
                    
                    player_elem = cols[2].find('a')
                    player_name = player_elem.text.strip() if player_elem else cols[2].text.strip()
                    
                    club_elem = cols[6].find_all('a')
                    club_name = club_elem[-1].text.strip() if club_elem else cols[6].text.strip()
                    
                    data[current_team]['players'].append({
                        'number': int(no),
                        'position': pos,
                        'name': player_name,
                        'club': club_name
                    })
                except Exception as e:
                    pass

print(f"Extracted {len(data)} teams.")
with open('data/wc2026-squads.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
