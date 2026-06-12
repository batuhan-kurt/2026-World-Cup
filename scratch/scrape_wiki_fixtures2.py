import urllib.request
from bs4 import BeautifulSoup
import json
import re

url = "https://tr.wikipedia.org/wiki/2026_FIFA_D%C3%BCnya_Kupas%C4%B1"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
response = urllib.request.urlopen(req)
html_content = response.read().decode('utf-8')
soup = BeautifulSoup(html_content, 'html.parser')

data = {
    "groups": {},
    "fixtures": [],
    "teams_info": {}
}

# Fix missing groups extraction
tables = soup.find_all('table', class_='wikitable')
for table in tables:
    headers = [th.text.strip() for th in table.find_all('th')]
    
    # 1. Participating teams info
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
                    
    # 2. Groups extraction
    # A standard group table has columns: Sıra, Takım, O, G, B, M, AG, YG, Av, P
    if "Takım" in headers and "P" in headers and "Sıra" in headers:
        # We need to find the group name. It's usually preceding the table in an h3 or h4
        prev_elem = table.find_previous_sibling(['h3', 'h4'])
        if prev_elem:
            group_name = prev_elem.text.strip().replace('[değiştir | kaynağı değiştir]', '').strip()
            data["groups"][group_name] = []
            
            rows = table.find_all('tr')[1:] # skip header
            for row in rows:
                cols = row.find_all(['td', 'th'])
                if len(cols) >= 2:
                    try:
                        team_elem = cols[1].find('a')
                        team_name = team_elem.text.strip() if team_elem else cols[1].text.strip()
                        if team_name:
                            data["groups"][group_name].append(team_name)
                    except:
                        pass

# 3. Fixtures Extraction
for box in soup.find_all('div', class_='footballbox'):
    try:
        fdate_elem = box.find('div', class_='fdate')
        ftime_elem = box.find('div', class_='ftime')
        
        date_text = fdate_elem.text.strip() if fdate_elem else ""
        time_text = ftime_elem.text.strip() if ftime_elem else ""
        
        # Sometime date/time is together in fdate
        if time_text:
            date_time = f"{date_text} {time_text}"
        else:
            date_time = date_text
            
        team1 = box.find('th', class_='fhome').text.strip()
        score = box.find('th', class_='fscore').text.strip()
        team2 = box.find('th', class_='faway').text.strip()
        venue_elem = box.find('div', itemprop='location')
        venue = venue_elem.text.strip() if venue_elem else "Bilinmiyor"
        
        # Clean up
        date_time = date_time.replace('\xa0', ' ')
        team1 = re.sub(r'\[.*?\]', '', team1).strip()
        team2 = re.sub(r'\[.*?\]', '', team2).strip()
        
        # Determine stage based on previous headings
        stage_elem = box.find_previous_sibling(['h3', 'h4', 'h5'])
        stage = stage_elem.text.strip().replace('[değiştir | kaynağı değiştir]', '').strip() if stage_elem else "Bilinmiyor"
        
        data["fixtures"].append({
            "stage": stage,
            "date_time": date_time,
            "team1": team1,
            "team2": team2,
            "score": score,
            "venue": venue
        })
    except Exception as e:
        pass

with open('data/wc2026-wiki-data.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Extracted {len(data['groups'])} groups, {len(data['fixtures'])} fixtures and {len(data['teams_info'])} teams info!")
