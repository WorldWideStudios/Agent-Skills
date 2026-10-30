"""Fetches each philosopher's public-domain portrait from Wikimedia Commons and
makes the two images the build uses, in the side's duotone:
  assets/img/<id>.jpg        1296x912 card for the speaker scenes
  assets/img/<id>-medal.png  360x360 round medal for the balance and panels
Face position and height are in the source image's pixels (open it once and
read them off). Side A is the winner (cobalt), side B the loser (vermilion).
  python3 tools/portraits.py            (reads portraits.json)
"""
import io, json, os, urllib.parse, urllib.request
from PIL import Image, ImageDraw, ImageOps

DUO = {'A': ((8, 18, 79), (229, 237, 255)), 'B': ((59, 10, 3), (254, 222, 211))}
UA = {'User-Agent': 'philosophy-debate-video/1.0 (agent skill)'}
root = os.path.join(os.path.dirname(__file__), '..')


def fetch(title):
    q = urllib.parse.urlencode({'action': 'query', 'format': 'json', 'prop': 'imageinfo', 'iiprop': 'url|extmetadata', 'iiurlwidth': 1600, 'titles': 'File:' + title})
    page = next(iter(json.load(urllib.request.urlopen(urllib.request.Request('https://commons.wikimedia.org/w/api.php?' + q, headers=UA)))['query']['pages'].values()))
    info = page['imageinfo'][0]
    print(f"{title}: {info['extmetadata'].get('LicenseShortName', {}).get('value')}")
    return Image.open(io.BytesIO(urllib.request.urlopen(urllib.request.Request(info['thumburl'], headers=UA)).read())).convert('RGB')


def duo(im, side):
    return ImageOps.colorize(ImageOps.autocontrast(ImageOps.grayscale(im), cutoff=1), *DUO[side])


os.makedirs(os.path.join(root, 'assets/img'), exist_ok=True)
for p in json.load(open(os.path.join(root, 'portraits.json'))):
    im = fetch(p['commons'])
    s = im.width / p['sourceWidth'] if p.get('sourceWidth') else 1
    cx, cy, fh = p['face'][0] * s, p['face'][1] * s, p['faceHeight'] * s
    # card: face 55% across, 41% down, about 45% of the height
    h = min(fh / 0.45, im.height, im.width * 912 / 1296); w = h * 1296 / 912
    x0 = min(max(cx - 0.546 * w, 0), im.width - w); y0 = min(max(cy - 0.406 * h, 0), im.height - h)
    duo(im.crop((int(x0), int(y0), int(x0 + w), int(y0 + h))).resize((1296, 912), Image.LANCZOS), p['side']).save(os.path.join(root, f"assets/img/{p['id']}.jpg"), quality=88)
    m = min(fh * 1.35, im.width, im.height)
    mx = min(max(cx - m / 2, 0), im.width - m); my = min(max(cy - m / 2, 0), im.height - m)
    med = duo(im.crop((int(mx), int(my), int(mx + m), int(my + m))).resize((360, 360), Image.LANCZOS), p['side']).convert('RGBA')
    mask = Image.new('L', (360, 360), 0); ImageDraw.Draw(mask).ellipse((0, 0, 359, 359), fill=255)
    med.putalpha(mask); med.save(os.path.join(root, f"assets/img/{p['id']}-medal.png"))
    print('  wrote', p['id'])
