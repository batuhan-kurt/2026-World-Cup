import json
import re

with open('data/wc2026-squads.json', 'r', encoding='utf-8') as f:
    squads_data = json.load(f)

# Hardcoded turkish names mapped from earlier script
team_id_to_turkish = {
    25: "Almanya", 10: "İngiltere", 775: "Avusturya", 1: "Belçika",
    9991: "Bosna-Hersek", 3: "Hırvatistan", 1108: "İskoçya", 9: "İspanya",
    2: "Fransa", 1090: "Norveç", 1118: "Hollanda", 27: "Portekiz",
    5: "İsveç", 15: "İsviçre", 770: "Çek Cumhuriyeti", 9992: "Türkiye",
    26: "Arjantin", 6: "Brezilya", 8: "Kolombiya", 2382: "Ekvador",
    2380: "Paraguay", 7: "Uruguay", 5529: "Kanada", 2384: "ABD",
    16: "Meksika", 5530: "Curaçao", 2386: "Haiti", 11: "Panama",
    1531: "Güney Afrika", 1532: "Cezayir", 9993: "Yeşil Burun Adaları", 1501: "Fildişi Sahili",
    32: "Mısır", 1504: "Gana", 31: "Fas", 9994: "Kongo DC",
    13: "Senegal", 28: "Tunus", 23: "Suudi Arabistan", 20: "Avustralya",
    1567: "Irak", 12: "Japonya", 1548: "Ürdün", 1568: "Özbekistan",
    1569: "Katar", 17: "Güney Kore", 22: "İran", 4673: "Yeni Zelanda"
}

# Parse camps
camps_map = {}
with open('scratch/camps.txt', 'r', encoding='utf-8') as f:
    lines = [l.strip() for l in f.readlines() if l.strip()]

current_location = ""
for line in lines:
    if '-' in line:
        parts = line.split('-', 1)
        team_en = parts[0].strip()
        camp = parts[1].strip()
        if team_en.startswith("Canada"): team_en = "Canada"
        if team_en.startswith("Turkiye"): team_en = "Turkey"
        if team_en.startswith("Bosnia"): team_en = "Bosnia & Herzegovina"
        camps_map[team_en] = f"{camp}, {current_location}"
    else:
        current_location = line

with open('lib/wc2026-config.ts', 'r', encoding='utf-8') as f:
    config_content = f.read()

def replace_team(match):
    full_str = match.group(0)
    id_match = re.search(r'id:\s*(\d+)', full_str)
    name_match = re.search(r'name:\s*"([^"]+)"', full_str)
    if not id_match or not name_match: return full_str
    
    tid = int(id_match.group(1))
    tname = name_match.group(1)
    
    turkish_name = team_id_to_turkish.get(tid, tname)
    coach = squads_data.get(turkish_name, {}).get('coach', 'Bilinmiyor')
    camp = camps_map.get(tname, 'Bilinmiyor')
    
    # insert turkishName, coach, camp before closing brace
    new_str = full_str.replace(' }', f', turkishName: "{turkish_name}", coach: "{coach}", camp: "{camp}" }}')
    return new_str

new_config = re.sub(r'\{\s*id:\s*\d+[^}]+\}', replace_team, config_content)

with open('lib/wc2026-config.ts', 'w', encoding='utf-8') as f:
    f.write(new_config)

print("Updated wc2026-config.ts")
