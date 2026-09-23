#!/usr/bin/env python3
"""
Pull brand tokens off a live website: CSS custom properties, hex colours by
frequency, font families, and the typographic settings of every selector that
sets letter-spacing / line-height / text-transform.

    python3 scrape_tokens.py https://example.org [https://example.org/page ...]

Stdlib only. Reads the page's inline <style> blocks, style="" attributes and
every linked stylesheet (one level of @import is followed).
"""
import collections
import re
import sys
import urllib.parse
import urllib.request

UA = {"User-Agent": "Mozilla/5.0 (brand-token-scraper)"}


def fetch(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=20) as r:
        return r.read().decode("utf-8", "replace")


def stylesheets(url, html):
    css = []
    for m in re.finditer(r"<link[^>]+>", html, re.I):
        tag = m.group(0)
        if "stylesheet" not in tag.lower():
            continue
        href = re.search(r'href=["\']([^"\']+)', tag)
        if href:
            css.append(urllib.parse.urljoin(url, href.group(1)))
    return css


def gather(url):
    html = fetch(url)
    chunks = [("inline <style>", s) for s in re.findall(r"<style[^>]*>(.*?)</style>", html, re.S | re.I)]
    attrs = " ; ".join(re.findall(r'style="([^"]*)"', html))
    if attrs:
        chunks.append(("style= attributes", "x{" + attrs + "}"))
    for href in stylesheets(url, html):
        if "fonts.googleapis.com" in href:
            chunks.append((href, ""))
            continue
        try:
            body = fetch(href)
        except Exception as e:  # noqa: BLE001
            print(f"  ! could not fetch {href}: {e}", file=sys.stderr)
            continue
        chunks.append((href, body))
        for imp in re.findall(r'@import\s+(?:url\()?["\']?([^"\')\s;]+)', body):
            try:
                chunks.append((imp, fetch(urllib.parse.urljoin(href, imp))))
            except Exception:  # noqa: BLE001
                pass
    logos = sorted(set(
        urllib.parse.urljoin(url, u)
        for u in re.findall(r'(?:src|href)=["\']([^"\']*logo[^"\']*)', html, re.I)
    ))
    return chunks, logos


def rules(css):
    css = re.sub(r"/\*.*?\*/", "", css, flags=re.S)
    for m in re.finditer(r"([^{}@]+)\{([^{}]*)\}", css):
        yield m.group(1).strip(), m.group(2)


def main(urls):
    custom = collections.OrderedDict()
    hexes = collections.Counter()
    families = collections.Counter()
    typo = []
    fonts_links = []
    logos_all = []

    for url in urls:
        chunks, logos = gather(url)
        logos_all += logos
        for src, css in chunks:
            if "fonts.googleapis.com" in src:
                fonts_links.append(src)
            for h in re.findall(r"#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b", css):
                hexes[h.lower()] += 1
            for sel, body in rules(css):
                decls = dict(
                    (k.strip().lower(), v.strip())
                    for k, v in (d.split(":", 1) for d in body.split(";") if ":" in d)
                )
                for k, v in decls.items():
                    if k.startswith("--"):
                        custom.setdefault(k, (v, sel[:60]))
                    if k == "font-family":
                        families[v] += 1
                picked = {k: decls[k] for k in ("font-family", "font-size", "font-weight",
                                                  "letter-spacing", "line-height", "text-transform")
                          if k in decls}
                if any(k in picked for k in ("letter-spacing", "text-transform")):
                    typo.append((sel[:70], picked))

    print("# Brand tokens\n")
    print("Sources:", ", ".join(urls), "\n")

    print("## CSS custom properties\n")
    for k, (v, sel) in custom.items():
        print(f"{k:34} {v:40} ({sel})")

    print("\n## Hex colours by frequency\n")
    for h, n in hexes.most_common(30):
        print(f"{h:9} x{n}")

    print("\n## Font families\n")
    for f, n in families.most_common():
        print(f"x{n:<4} {f}")
    for link in fonts_links:
        print("google fonts:", link)

    print("\n## Typographic selectors (tracking / case)\n")
    seen = set()
    for sel, p in typo:
        key = (sel, tuple(sorted(p.items())))
        if key in seen:
            continue
        seen.add(key)
        print(f"{sel}\n    " + "; ".join(f"{k}: {v}" for k, v in p.items()))

    print("\n## Logo candidates\n")
    for u in sorted(set(logos_all)):
        print(u)
    print("\nCheck the logo's background: an opaque white box will not invert cleanly on dark.")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    main(sys.argv[1:])
