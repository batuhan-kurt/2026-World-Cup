import re
import json

def parse_kadro():
    with open('transfermarkt-kadro-degerleri.md', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # We need to extract teams. Format:
    # * wappen: 
    #   * Kulüp: Fransa
    #   * Oyuncu: 26
    #   * ø-Yaş: 27.0
    #   * Dünya kupası katılımları: 17
    #   * Lejyoner: 73.1 %
    #   * Piyasa değeri: 1.52 milyar €
    #   * ø-Piyasa değeri: 58.58 mil. €
    
    blocks = content.split('* wappen:')[1:]
    teams = []
    for b in blocks:
        lines = [l.strip() for l in b.split('\n') if l.strip()]
        team_data = {}
        for l in lines:
            if l.startswith('* Kulüp:'): team_data['name'] = l.split(':')[1].strip()
            elif l.startswith('* Oyuncu:'): team_data['squad_size'] = l.split(':')[1].strip()
            elif l.startswith('* ø-Yaş:'): team_data['avg_age'] = l.split(':')[1].strip()
            elif l.startswith('* Piyasa değeri:'): team_data['total_value'] = l.split(':')[1].strip()
            elif l.startswith('* ø-Piyasa değeri:'): team_data['avg_value'] = l.split(':')[1].strip()
        
        if 'name' in team_data:
            teams.append(team_data)
            
    with open('data/tm_teams.json', 'w', encoding='utf-8') as f:
        json.dump(teams, f, ensure_ascii=False, indent=2)
    print(f"Parsed {len(teams)} teams.")

def parse_oyuncu():
    with open('transfermarkt-oyuncu-degerleri.md', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Format:
    # 1	
    # Erling Haaland	Erling Haaland
    # Centre-Forward
    # Norway	25	Manchester City	€200.00m  
    
    lines = [l.strip() for l in content.split('\n')]
    players = []
    
    i = 0
    while i < len(lines):
        if lines[i].isdigit() and i + 3 < len(lines):
            try:
                name_line = lines[i+1]
                pos_line = lines[i+2]
                details_line = lines[i+3]
                
                name = name_line.split('\t')[0].strip()
                pos = pos_line.strip()
                
                # Norway	25	Manchester City	€200.00m
                parts = details_line.split('\t')
                if len(parts) >= 4:
                    country = parts[0].strip()
                    age = parts[1].strip()
                    club = parts[2].strip()
                    value = parts[3].strip()
                    
                    players.append({
                        "name": name,
                        "position": pos,
                        "country": country,
                        "age": age,
                        "club": club,
                        "value": value
                    })
            except:
                pass
            i += 4
        else:
            i += 1
            
    with open('data/tm_players.json', 'w', encoding='utf-8') as f:
        json.dump(players, f, ensure_ascii=False, indent=2)
    print(f"Parsed {len(players)} players.")

parse_kadro()
parse_oyuncu()
