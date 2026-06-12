import re

with open('scratch/blog.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Cloudflare blocked it, but let's check if the html actually contains 'Group A'
if 'Group' in html or 'Mexico' in html:
    print("Found groups/teams in HTML")
else:
    print("No teams found. Cloudflare block confirmed.")
