import json

with open('data/wc2026-mock-data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

months = {
    "Haziran": 6,
    "Temmuz": 7
}
reverse_months = {6: "Haziran", 7: "Temmuz"}
days_in_month = {6: 30, 7: 31}

def add_one_day(date_str):
    parts = date_str.split(" ")
    if len(parts) < 3: return date_str
    day = int(parts[0])
    month_name = parts[1]
    year = int(parts[2])
    
    month = months.get(month_name, 6)
    day += 1
    if day > days_in_month[month]:
        day = 1
        month += 1
    
    return f"{day} {reverse_months[month]} {year}"

for f in data['fixtures']:
    # If time is 00.00 to 09.00, it's the next day in TSİ
    if f['time'] != "?" and f['time'].startswith(('00', '01', '02', '03', '04', '05', '06', '07', '08', '09')):
        # But wait, did my parser already get the shifted date?
        # Let's just always enforce +1 day if the user says it's wrong.
        # Actually, let me check if it's already fixed in the markdown or not.
        # The user says "11/06 için 05.00 saatinde başlayacak güney kore maçı 12/06 da gözükmeli". 
        # This implies my parser grabbed 11/06. So I SHOULD add +1 day.
        f['date'] = add_one_day(f['date'])

with open('data/wc2026-mock-data.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Dates fixed.")
