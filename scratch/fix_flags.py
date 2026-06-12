import re

iso_map = {
    "GER": "de", "ENG": "gb-eng", "AUT": "at", "BEL": "be", "BIH": "ba",
    "CRO": "hr", "SCO": "gb-sct", "ESP": "es", "FRA": "fr", "NOR": "no",
    "NED": "nl", "POR": "pt", "SWE": "se", "SUI": "ch", "CZE": "cz",
    "TUR": "tr", "ARG": "ar", "BRA": "br", "COL": "co", "ECU": "ec",
    "PAR": "py", "URU": "uy", "CAN": "ca", "USA": "us", "MEX": "mx",
    "CUW": "cw", "HAI": "ht", "PAN": "pa", "RSA": "za", "ALG": "dz",
    "CPV": "cv", "CIV": "ci", "EGY": "eg", "GHA": "gh", "MAR": "ma",
    "COD": "cd", "SEN": "sn", "TUN": "tn", "KSA": "sa", "AUS": "au",
    "IRQ": "iq", "JPN": "jp", "JOR": "jo", "UZB": "uz", "QAT": "qa",
    "KOR": "kr", "IRN": "ir", "NZL": "nz"
}

with open('lib/wc2026-config.ts', 'r', encoding='utf-8') as f:
    content = f.read()

def replace_logo(match):
    code = match.group(1)
    iso2 = iso_map.get(code, "un")
    return f'code: "{code}", logo: "https://flagcdn.com/w160/{iso2}.png"'

# Find code: "XXX", logo: "..."
new_content = re.sub(r'code:\s*"([A-Z]{3})",\s*logo:\s*"[^"]+"', replace_logo, content)

with open('lib/wc2026-config.ts', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Updated flags in wc2026-config.ts")
