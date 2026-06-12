from bs4 import BeautifulSoup

with open('scratch/wiki_squads.html', 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f.read(), 'html.parser')

for elem in soup.find_all(['h3', 'table'])[:10]:
    if elem.name == 'h3':
        span = elem.find('span', class_='mw-headline')
        print("H3:", span.text.strip() if span else "No span")
    else:
        print("TABLE")
