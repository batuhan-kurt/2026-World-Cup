import json
import re

with open('data/wc2026-mock-data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# 1. Fix "!" in teams
def clean_team_name(name):
    name = name.replace('!', '').replace('[', '').replace(']', '').replace('(H)', '').strip()
    if name == "Çek Cumhuriyeti":
        name = "Çekya"
    return name

for g in data['groups']:
    data['groups'][g] = [clean_team_name(t) for t in data['groups'][g]]
    # Fix Grup L too many teams: ensure max 4 teams per group (by removing duplicates or truncating)
    # The groups should have 4 teams each.
    seen = set()
    dedup = []
    for t in data['groups'][g]:
        if t and t not in seen:
            seen.add(t)
            dedup.append(t)
    data['groups'][g] = dedup[:4]

for f in data['fixtures']:
    f['team1'] = clean_team_name(f['team1'])
    f['team2'] = clean_team_name(f['team2'])

# Fix teams_info
new_teams_info = {}
for k, v in data['teams_info'].items():
    cleaned_k = clean_team_name(k)
    new_teams_info[cleaned_k] = v
data['teams_info'] = new_teams_info

with open('data/wc2026-mock-data.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Mock data cleaned.")
