from bs4 import BeautifulSoup
import json
import re

with open('scratch/wiki_squads.html', 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f.read(), 'html.parser')

data = {}
current_team = None

for elem in soup.find_all(['h3', 'table']):
    if elem.name == 'h3':
        # team name is the text of h3, but strip out "[değiştir | kaynağı değiştir]"
        text = elem.text.strip()
        text = re.sub(r'\[.*?\]', '', text).strip()
        current_team = text
        data[current_team] = []
        print("Found team:", current_team)
    elif elem.name == 'table' and current_team and 'sortable' in elem.get('class', []):
        rows = elem.find('tbody').find_all('tr')
        for row in rows:
            try:
                cols = row.find_all(['th', 'td'])
                if len(cols) < 6: continue
                no = cols[0].text.strip()
                if not no.isdigit(): continue
                pos_text = cols[1].text.strip()
                
                # Player Name
                player_elem = cols[2].find('a')
                if player_elem:
                    name = player_elem.text.strip()
                else:
                    name = cols[2].text.strip()
                name = re.sub(r'\(.*?\)', '', name).strip()
                
                # Club Name
                club_links = cols[-1].find_all('a')
                if club_links:
                    club = club_links[-1].text.strip()
                else:
                    club = cols[-1].text.strip()
                
                data[current_team].append({
                    'number': int(no),
                    'position': pos_text,
                    'name': name,
                    'club': club
                })
            except Exception as e:
                pass

print(f"Extracted {len([k for k,v in data.items() if len(v) > 0])} teams with players.")
with open('data/wc2026-squads.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
