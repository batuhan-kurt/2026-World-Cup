from bs4 import BeautifulSoup
import json
import re

with open('scratch/wiki_squads.html', 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f.read(), 'html.parser')

data = {}
current_team = None

# Extract coaches first
coaches = {}
for p in soup.find_all('p'):
    text = p.text.strip()
    if text.startswith('Teknik direktör:'):
        # find the preceding team? Or just look at the order.
        # Actually it's easier to link it by the closest h3 tag.
        # Let's iterate elements linearly
        pass

for elem in soup.find_all(['h3', 'p', 'table']):
    if elem.name == 'h3':
        text = elem.text.strip()
        text = re.sub(r'\[.*?\]', '', text).strip()
        current_team = text
        data[current_team] = {'coach': 'Bilinmiyor', 'players': []}
    elif elem.name == 'p' and current_team:
        text = elem.text.strip()
        if text.startswith('Teknik direktör:'):
            # remove the prefix
            coach_text = text.replace('Teknik direktör:', '').strip()
            data[current_team]['coach'] = coach_text
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
                
                # Age from DOB
                dob_text = cols[3].text.strip()
                age_match = re.search(r'\((\d+)\s+yaşında\)', dob_text)
                age = age_match.group(1) if age_match else '?'
                
                # Club Name
                club_links = cols[-1].find_all('a')
                if club_links:
                    club = club_links[-1].text.strip()
                else:
                    club = cols[-1].text.strip()
                
                data[current_team]['players'].append({
                    'number': int(no),
                    'position': pos_text,
                    'name': name,
                    'age': age,
                    'club': club
                })
            except Exception as e:
                pass

with open('data/wc2026-squads.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Updated squads JSON with age and coach!")
