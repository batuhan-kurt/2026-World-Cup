import urllib.request
import ssl
from bs4 import BeautifulSoup

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = "https://tr.wikipedia.org/wiki/2026_FIFA_D%C3%BCnya_Kupas%C4%B1"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
response = urllib.request.urlopen(req, context=ctx)
html = response.read().decode('utf-8')

print("footballbox count:", html.count("footballbox"))
print("Grup A count:", html.count("A Grubu"))
