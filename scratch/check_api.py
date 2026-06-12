import requests
import json

headers = {"x-apisports-key": "4bf8d5a1a13f09c8ff5a2d975ddd5957"}
base_url = "https://v3.football.api-sports.io"

def check(endpoint):
    url = f"{base_url}{endpoint}"
    r = requests.get(url, headers=headers)
    data = r.json().get('response', [])
    print(f"{endpoint}: {len(data)} results")
    if len(data) > 0:
        print("  Sample:", str(data[0])[:200])

check("/leagues?id=1")
check("/teams?league=1&season=2026")
check("/standings?league=1&season=2026")
check("/fixtures?league=1&season=2026")
check("/players/squads?team=16")
