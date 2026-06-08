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
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
TEMPLATE = ROOT / "tools" / "templates" / "essay.html"
CONTENT = ROOT / "tools" / "content" / "essays"
LIVE = ROOT / "essays"


def render(fragment: pathlib.Path, template: str) -> str:
    raw = fragment.read_text(encoding="utf-8")
    front, _, body = raw.partition("\n")
    if "title:" not in front:
        raise SystemExit(f"{fragment.name}: first line must be '<!-- title: ... -->'")
    title = front.split("title:", 1)[1].rsplit("-->", 1)[0].strip()
    body = body.strip("\n")
    return template.replace("{{TITLE}}", title).replace("{{BODY}}", body)


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

    where = "essays/" if apply else "tools/_out/"
    print(f"\nrendered {len(list(CONTENT.glob('*.html')))} file(s) -> {where} | mismatches: {mismatches}")
    return 1 if (mismatches and not apply) else 0


if __name__ == "__main__":
    raise SystemExit(main())
