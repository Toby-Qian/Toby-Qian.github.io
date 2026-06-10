#!/usr/bin/env python3
"""Build essay pages from a shared template + per-essay content fragments.

The repo's essay pages share an identical <head>, top bar and footer; only the
<title> and the inner <article> differ. To stop maintaining that chrome in 7
places, each essay keeps just its body in tools/content/essays/<name>.html:

    <!-- title: Some Title -->
    <figure class="essay-hero"> ... </figure>
    <header> ... </header>
    <div class="essay-body"> ... </div>

The first line is front matter (the document title, sans " · Toby Qian").
Everything after it is dropped verbatim inside <article class="essay-article">
in tools/templates/essay.html, where {{TITLE}} and {{BODY}} are substituted.

Usage:
    python tools/build_essays.py          # render to tools/_out/, verify vs essays/
    python tools/build_essays.py --apply  # render straight into essays/
"""
from __future__ import annotations
import json
import pathlib
import sys
from datetime import datetime
from email.utils import format_datetime
from xml.sax.saxutils import escape

ROOT = pathlib.Path(__file__).resolve().parents[1]
TEMPLATE = ROOT / "tools" / "templates" / "essay.html"
CONTENT = ROOT / "tools" / "content" / "essays"
MANIFEST = CONTENT / "_manifest.json"
LIVE = ROOT / "essays"
INDEX = ROOT / "index.html"
FEED = ROOT / "feed.xml"
SITE = "https://toby-qian.github.io"

JOURNAL_START = "<!-- JOURNAL:AUTO START -->"
JOURNAL_END = "<!-- JOURNAL:AUTO END -->"
COVER_SIZES = "(max-width: 760px) 92vw, 45vw"


def render(fragment: pathlib.Path, template: str) -> str:
    raw = fragment.read_text(encoding="utf-8")
    front, _, body = raw.partition("\n")
    if "title:" not in front:
        raise SystemExit(f"{fragment.name}: first line must be '<!-- title: ... -->'")
    title = front.split("title:", 1)[1].rsplit("-->", 1)[0].strip()
    body = body.strip("\n")
    return (template.replace("{{TITLE}}", title)
                    .replace("{{SLUG}}", fragment.name)
                    .replace("{{BODY}}", body))


def cover_html(entry: dict) -> str:
    c = entry["cover"]
    if entry.get("coverType") == "svg":
        return (f'<img class="essay__photo" src="assets/{c}.svg" alt="" '
                f'loading="lazy" decoding="async" />')
    return (
        f'<picture>'
        f'<source type="image/avif" srcset="assets/{c}-sm.avif 700w, assets/{c}.avif 1400w" sizes="{COVER_SIZES}" />'
        f'<source type="image/webp" srcset="assets/{c}-sm.webp 700w, assets/{c}.webp 1400w" sizes="{COVER_SIZES}" />'
        f'<img class="essay__photo" src="assets/{c}.webp" alt="" loading="lazy" decoding="async" />'
        f'</picture>'
    )


def journal_html(entries: list[dict]) -> str:
    featured = [e for e in entries if e.get("featured")]
    rest = [e for e in entries if not e.get("featured")]
    out = []
    for e in featured:
        out.append(f'''      <!-- Featured essay -->
      <a class="essay essay--feature reveal" href="essays/{e["file"]}" data-hoverable>
        <div class="essay__cover">
          {cover_html(e)}
          <span class="essay__pin">Featured</span>
        </div>
        <div class="essay__body">
          <span class="essay__meta">{e["meta"]}</span>
          <h3>{e["heading"]}</h3>
          <p class="essay__lede">{e.get("lede", e["blurb"])}</p>
          <span class="essay__cta">Read the essay →</span>
        </div>
      </a>''')
    cards = []
    for e in rest:
        cards.append(f'''        <a class="essay essay--card reveal" href="essays/{e["file"]}" data-hoverable>
          <div class="essay__cover">
            {cover_html(e)}
          </div>
          <div class="essay__body">
            <span class="essay__meta">{e["meta"]}</span>
            <h3>{e["heading"]}</h3>
            <p>{e["blurb"]}</p>
            <span class="essay__cta">Read →</span>
          </div>
        </a>''')
    out.append('      <!-- Grid of recent essays -->\n      <div class="essay-grid">\n'
               + "\n".join(cards) + "\n      </div>")
    return "\n\n".join(out)


def splice_index(entries: list[dict]) -> str:
    html = INDEX.read_text(encoding="utf-8")
    if JOURNAL_START not in html or JOURNAL_END not in html:
        raise SystemExit("index.html: JOURNAL:AUTO markers not found")
    head, _, tail = html.partition(JOURNAL_START)
    _, _, tail = tail.partition(JOURNAL_END)
    return f"{head}{JOURNAL_START}\n{journal_html(entries)}\n      {JOURNAL_END}{tail}"


def feed_xml(entries: list[dict]) -> str:
    items = []
    for e in sorted(entries, key=lambda x: (x["date"], x["file"]), reverse=True):
        pub = format_datetime(datetime.fromisoformat(e["date"]))
        url = f"{SITE}/essays/{e['file']}"
        items.append(
            "  <item>\n"
            f"    <title>{escape(e['heading'])}</title>\n"
            f"    <link>{url}</link>\n"
            f"    <guid>{url}</guid>\n"
            f"    <pubDate>{pub}</pubDate>\n"
            f"    <description>{escape(e.get('lede', e['blurb']))}</description>\n"
            "  </item>"
        )
    body = "\n".join(items)
    return (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<rss version="2.0">\n<channel>\n'
        "  <title>Toby Qian — Journal</title>\n"
        f"  <link>{SITE}/</link>\n"
        "  <description>Essays from desk, screen and street.</description>\n"
        "  <language>en</language>\n"
        f"{body}\n"
        "</channel>\n</rss>\n"
    )


def main() -> int:
    apply = "--apply" in sys.argv
    out_dir = LIVE if apply else ROOT / "tools" / "_out"
    out_dir.mkdir(parents=True, exist_ok=True)
    template = TEMPLATE.read_text(encoding="utf-8")

    mismatches = 0
    for fragment in sorted(CONTENT.glob("*.html")):
        html = render(fragment, template)
        (out_dir / fragment.name).write_text(html, encoding="utf-8", newline="")

        live = LIVE / fragment.name
        if live.exists():
            same = live.read_text(encoding="utf-8") == html
            print(f"  [{'OK' if same else '!!':>2}] {fragment.name}  byte-identical to live: {same}")
            mismatches += 0 if same else 1
        else:
            print(f"  [NEW] {fragment.name}  (no live file to compare)")

    entries = json.loads(MANIFEST.read_text(encoding="utf-8"))
    new_index = splice_index(entries)
    new_feed = feed_xml(entries)
    if apply:
        INDEX.write_text(new_index, encoding="utf-8", newline="")
        FEED.write_text(new_feed, encoding="utf-8", newline="")
        print("  [OK] index.html journal section + feed.xml written")
    else:
        idx_same = INDEX.read_text(encoding="utf-8") == new_index
        feed_same = FEED.exists() and FEED.read_text(encoding="utf-8") == new_feed
        print(f"  [{'OK' if idx_same else '!!':>2}] index.html journal section up to date: {idx_same}")
        print(f"  [{'OK' if feed_same else '!!':>2}] feed.xml up to date: {feed_same}")
        mismatches += (0 if idx_same else 1) + (0 if feed_same else 1)

    where = "essays/" if apply else "tools/_out/"
    print(f"\nrendered {len(list(CONTENT.glob('*.html')))} file(s) -> {where} | mismatches: {mismatches}")
    return 1 if (mismatches and not apply) else 0


if __name__ == "__main__":
    raise SystemExit(main())
