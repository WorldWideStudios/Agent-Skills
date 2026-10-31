# List files in Commons categories with licence + size + thumb URL. usage: commons.py Cat1 Cat2 ...
import json, sys, urllib.parse, urllib.request
UA = {"User-Agent": "quote-edit-video/1.0 (github.com/WorldWideStudios/Agent-Skills)"}
def get(params):
    q = urllib.parse.urlencode({**params, "format": "json"})
    return json.load(urllib.request.urlopen(urllib.request.Request("https://commons.wikimedia.org/w/api.php?" + q, headers=UA)))
for cat in sys.argv[1:]:
    cont = {}
    while True:
      d = get({"action": "query", "generator": "categorymembers", "gcmtitle": "Category:" + cat, "gcmtype": "file", "gcmlimit": 20,
             "prop": "imageinfo", "iiprop": "url|size|extmetadata", "iiurlwidth": 1080, **cont})
      for p in (d.get("query", {}).get("pages", {}) or {}).values():
        if "imageinfo" not in p: continue
        ii = p["imageinfo"][0]; m = ii.get("extmetadata", {})
        lic = m.get("LicenseShortName", {}).get("value", "?")
        print(f"{lic[:18]:18} {ii['width']}x{ii['height']} {p['title'][5:90]} | {ii.get('thumburl','')}")
      if "continue" not in d: break
      cont = d["continue"]
