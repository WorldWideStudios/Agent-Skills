"""Download the portraits listed in public/<folder>/SOURCES.txt from Wikimedia Commons.

usage: python3 tools/fetch-portraits.py marcus
Each SOURCES.txt line is `<local name> — File:<Commons title> — <licence>`. Files are fetched
at up to 1280px wide and saved as JPEG under the local name. Anything whose current Commons
licence isn't public domain / CC0 / "No restrictions" is skipped and reported. Files already
present are kept, so it is safe to re-run after Commons rate-limits it (HTTP 429).
"""
import json, os, subprocess, sys, tempfile, time, urllib.error, urllib.parse, urllib.request

UA = {"User-Agent": "quote-edit-video/1.0 (github.com/WorldWideStudios/Agent-Skills)"}
OK = ("public domain", "cc0", "no restrictions", "pd")
def get(url):
    for wait in (0, 5, 15, 45):
        time.sleep(wait or 1)
        try:
            return urllib.request.urlopen(urllib.request.Request(url, headers=UA)).read()
        except urllib.error.HTTPError as e:
            if e.code != 429: raise
    raise SystemExit("Commons keeps rate-limiting; wait a minute and re-run")

folder = os.path.join(os.path.dirname(__file__), "..", "public", sys.argv[1])
for line in open(os.path.join(folder, "SOURCES.txt"), encoding="utf8"):
    parts = [p.strip() for p in line.split(" — ")]
    if len(parts) < 3 or not parts[1].startswith("File:"):
        continue
    local, title = parts[0], parts[1]
    if os.path.exists(os.path.join(folder, local)):
        print("exists  ", local); continue
    q = urllib.parse.urlencode({"action": "query", "titles": title, "prop": "imageinfo", "iiprop": "url|extmetadata", "iiurlwidth": 1280, "format": "json"})
    d = json.loads(get("https://commons.wikimedia.org/w/api.php?" + q))
    page = next(iter(d["query"]["pages"].values()))
    if "imageinfo" not in page:
        print("MISSING ", local, title); continue
    ii = page["imageinfo"][0]
    lic = ii.get("extmetadata", {}).get("LicenseShortName", {}).get("value", "?")
    if not lic.lower().startswith(OK):
        print("SKIPPED ", local, "licence:", lic); continue
    url = ii.get("thumburl") or ii["url"]
    with tempfile.NamedTemporaryFile(suffix=os.path.splitext(url.split("?")[0])[1]) as tmp:
        tmp.write(get(url)); tmp.flush()
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", tmp.name, "-q:v", "2", os.path.join(folder, local)], check=True)
    print("ok      ", local, lic)
