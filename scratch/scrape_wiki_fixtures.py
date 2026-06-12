import requests
from bs4 import BeautifulSoup
import json
import re

url = "https://tr.wikipedia.org/wiki/2026_FIFA_D%C3%BCnya_Kupas%C4%B1"
response = requests.get(url)
soup = BeautifulSoup(response.content, 'html.parser')

data = {
    "groups": {},
    "fixtures": [],
    "teams_info": {}
}

# Find all groups (A to L)
# They are usually in tables.
tables = soup.find_all('table', class_='wikitable')

# Example format for fixtures:
# <div class="footballbox">
for box in soup.find_all('div', class_='footballbox'):
    try:
        date_time = box.find('div', class_='fdate').text.strip()
        team1 = box.find('th', class_='fhome').text.strip()
        score = box.find('th', class_='fscore').text.strip()
        team2 = box.find('th', class_='faway').text.strip()
        venue_elem = box.find('div', itemprop='location')
        venue = venue_elem.text.strip() if venue_elem else "Bilinmiyor"
        
        # Clean up
        date_time = date_time.replace('\xa0', ' ')
        team1 = re.sub(r'\[.*?\]', '', team1).strip()
        team2 = re.sub(r'\[.*?\]', '', team2).strip()
        
        data["fixtures"].append({
            "date_time": date_time,
            "team1": team1,
            "team2": team2,
            "score": score,
            "venue": venue
        })
    except:
        pass

# The participating teams info table
for table in tables:
    headers = [th.text.strip() for th in table.find_all('th')]
    if "En iyi derece" in headers or "Son katılımı" in headers:
        rows = table.find_all('tr')[1:] # skip header
        for row in rows:
            cols = row.find_all(['td', 'th'])
            if len(cols) >= 6:
                try:
                    country_elem = cols[1].find('a')
                    country = country_elem.text.strip() if country_elem else cols[1].text.strip()
                    how_qualified = cols[2].text.strip()
                    appearances = cols[4].text.strip()
                    last_app = cols[5].text.strip()
                    best_result = cols[6].text.strip()
                    
                    data["teams_info"][country] = {
                        "how_qualified": how_qualified,
                        "appearances": appearances,
                        "last_app": last_app,
                        "best_result": best_result
                    }
                except:
                    pass

with open('data/wc2026-wiki-data.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Extracted {len(data['fixtures'])} fixtures and {len(data['teams_info'])} teams info!")
