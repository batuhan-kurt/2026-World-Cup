import json
import re

with open('tr-wikipedia-org-wiki-2026-FIFA-D-nya-Kupas.md', 'r', encoding='utf-8') as f:
    text = f.read()

data = {
    "groups": {},
    "fixtures": [],
    "teams_info": {}
}

# 1. Parse Groups
group_blocks = re.split(r'###\s+([A-L])\s+Grubu', text)
for i in range(1, len(group_blocks), 2):
    group_letter = group_blocks[i]
    group_content = group_blocks[i+1]
    
    group_name = f"Grup {group_letter}"
    data["groups"][group_name] = []
    
    for line in group_content.split('\n'):
        line = line.strip()
        if line.startswith('|') and re.match(r'\|\s*\d+\s*\|', line):
            parts = [p.strip() for p in line.split('|')]
            if len(parts) >= 4:
                team_str = parts[2]
                team_str = re.sub(r'!\[.*?\]\(.*?\)', '', team_str)
                team_str = re.sub(r'\[(.*?)\]\(.*?\)', r'\1', team_str)
                team_str = team_str.replace('(H)', '').strip()
                data["groups"][group_name].append(team_str)

# 2. Parse Fixtures
# Pattern to capture Date/Time table, Teams table, and Venue table
# We look for:
# | <date and time info> |
# (optional spaces/newlines)
# | <team1> | <score or match_number> | <team2> |
# |  | Rapor... |  |
# (optional spaces/newlines)
# | <venue info> |

# Let's break text into lines and parse sequentially.
lines = text.split('\n')
current_stage = "Grup Aşaması"

i = 0
while i < len(lines):
    line = lines[i].strip()
    
    # Track stage
    if "### Son 32" in line: current_stage = "Son 32"
    elif "### Son 16" in line: current_stage = "Son 16"
    elif "### Çeyrek final" in line: current_stage = "Çeyrek Final"
    elif "### Yarı final" in line: current_stage = "Yarı Final"
    elif "### Üçüncülük maçı" in line: current_stage = "Üçüncülük Maçı"
    elif "### Final" in line: current_stage = "Final"
    elif re.search(r'###\s+[A-L]\s+Grubu', line):
        group_match = re.search(r'###\s+([A-L])\s+Grubu', line)
        current_stage = f"Grup {group_match.group(1)}"
        
    # Check if line is a Date/Time table row
    if line.startswith('|') and ("Haziran 2026" in line or "Temmuz 2026" in line) and "TSİ" in line:
        dt_clean = re.sub(r'\[(.*?)\]\(.*?\)', r'\1', line)
        
        tsi_match = re.search(r'(\d{2}\.\d{2})\s*\(\s*TSİ\s*\)', dt_clean)
        tsi_time = tsi_match.group(1) if tsi_match else "?"
        
        date_match = re.search(r'(\d{1,2}\s+(?:Haziran|Temmuz)\s+2026)', dt_clean)
        date_val = date_match.group(1) if date_match else "?"
        
        # Now find the next line that starts with | and has at least 3 | chars (Teams line)
        j = i + 1
        team_line = None
        while j < len(lines) and j < i + 10:
            if lines[j].strip().startswith('|') and lines[j].count('|') >= 3 and "Rapor" not in lines[j] and "---" not in lines[j]:
                team_line = lines[j].strip()
                break
            j += 1
            
        if team_line:
            t_parts = [p.strip() for p in team_line.split('|')]
            team1 = re.sub(r'\[(.*?)\]\(.*?\)', r'\1', t_parts[1])
            team1 = re.sub(r'!\[.*?\]\(.*?\)', '', team1).replace('(H)', '').strip()
            
            score = t_parts[2].replace('v', 'VS').strip()
            score = re.sub(r'\[(.*?)\]\(.*?\)', r'\1', score) # remove link from score like [1. Maç]
            if "Maç" in score: score = "VS" # if it says 1. Maç, just use VS
            
            team2 = re.sub(r'\[(.*?)\]\(.*?\)', r'\1', t_parts[3])
            team2 = re.sub(r'!\[.*?\]\(.*?\)', '', team2).replace('(H)', '').strip()
            
            # Now find venue line
            k = j + 1
            venue = "?"
            while k < len(lines) and k < j + 10:
                l_strip = lines[k].strip()
                # the venue line is usually the first | ... | line after the | | Rapor | | line
                if l_strip.startswith('|') and "Stadyum" in l_strip or "Park" in l_strip or "Field" in l_strip or "Arena" in l_strip or "Hakem" in l_strip:
                    v_clean = re.sub(r'\[(.*?)\]\(.*?\)', r'\1', l_strip)
                    venue = v_clean.split('<br>')[0].replace('|', '').strip()
                    break
                k += 1

            data["fixtures"].append({
                "stage": current_stage,
                "date": date_val,
                "time": tsi_time,
                "team1": team1,
                "team2": team2,
                "score": score,
                "venue": venue
            })
            i = k # jump
    i += 1
    
# 3. Teams Info
table_started = False
for line in lines:
    if "En iyi derece" in line: table_started = True
    elif table_started and line.startswith('##'): table_started = False
    
    if table_started and line.startswith('|') and "Sıra" not in line and "En iyi" not in line and "---" not in line:
        parts = [p.strip() for p in line.split('|')]
        if len(parts) >= 8:
            try:
                c_str = re.sub(r'!\[.*?\]\(.*?\)', '', parts[2])
                c_str = re.sub(r'\[(.*?)\]\(.*?\)', r'\1', c_str).strip()
                
                how = re.sub(r'\[(.*?)\]\(.*?\)', r'\1', parts[3]).strip()
                app = parts[5].strip()
                last = re.sub(r'\[(.*?)\]\(.*?\)', r'\1', parts[6]).strip()
                best = re.sub(r'\[(.*?)\]\(.*?\)', r'\1', parts[7]).strip()
                
                if c_str and len(app) > 0:
                    data["teams_info"][c_str] = {
                        "how_qualified": how,
                        "appearances": app,
                        "last_app": last,
                        "best_result": best
                    }
            except Exception as e:
                pass


with open('data/wc2026-mock-data.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Parsed {len(data['fixtures'])} fixtures, {len(data['groups'])} groups, {len(data['teams_info'])} teams info.")
