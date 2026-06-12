import re

line = "| 1 | ![](https://...)[ABD](https://...) | Ev sahibi | 14 Şubat 2023 | 12. | [2022](https://...) | Yarı final ( [1930](https://...)) |"
parts = [p.strip() for p in line.split('|')]
c_str = parts[2]
print("raw:", c_str)
c_str = re.sub(r'!\[.*?\]\(.*?\)', '', c_str)
print("no img:", c_str)
c_str = re.sub(r'\[(.*?)\]\(.*?\)', r'\1', c_str).strip()
print("c_str:", c_str)
