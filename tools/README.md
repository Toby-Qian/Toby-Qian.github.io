# Essay build

Every page under `essays/` shares the same chrome — `<head>`, top bar, footer.
Rather than maintain that in seven files, each essay keeps **only its body** in
`tools/content/essays/<name>.html`, and `build_essays.py` wraps it with the one
shared shell in `tools/templates/essay.html`.

The build also generates the home-page journal section and the RSS feed from
`tools/content/essays/_manifest.json`.

```
tools/
  templates/essay.html        # the shared shell ({{TITLE}}, {{SLUG}}, {{BODY}})
  content/essays/*.html        # per-essay body fragments (the source of truth)
  content/essays/_manifest.json# card metadata: heading, blurb, cover, date...
  build_essays.py              # fragment + template -> essays/<name>.html
                               # manifest -> index.html journal + feed.xml
```

## Write a new essay

1. Create `tools/content/essays/00X-slug.html`. First line is front matter,
   the rest is the article body, indented 6 spaces (as it sits inside
   `<article class="essay-article">`):

   ```html
   <!-- title: Your Title -->
         <figure class="essay-hero"> ... </figure>

         <header> ... </header>

         <div class="essay-body"> ... </div>
   ```

   The footer (`← Back to Journal` / `— T.`) comes from the template — don't
   repeat it here.

2. Generate the page:

   ```
   python tools/build_essays.py --apply
   ```

   That writes `essays/00X-slug.html`.

3. Add an entry to `tools/content/essays/_manifest.json` (heading, blurb,
   cover name, date). The `--apply` run rewrites the journal cards between the
   `JOURNAL:AUTO` markers in `index.html` and regenerates `feed.xml` — no hand
   editing of the home page.

## Verify without writing anything

```
python tools/build_essays.py
```

Renders to `tools/_out/` and reports, per file, whether it is byte-for-byte
identical to the live page in `essays/`. Exits non-zero on any mismatch — handy
as a sanity check that the template still reproduces every page exactly.

## Change the shared chrome

Edit `tools/templates/essay.html` once, then run `--apply` to regenerate all
pages at the current `?v=` asset version.
