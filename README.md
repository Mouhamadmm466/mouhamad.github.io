# mouhamad.github.io

My personal website: five pages (home, build, research, entries, contact). Each is its own page; you walk between them with the dock at the bottom of the
screen, the ← → arrow keys, or a swipe on a phone. Calm and text-first: Namu's warm palette, DM Sans,
small mono labels, one still warm background, light by default.

Plain HTML, CSS and JavaScript, no framework, so it runs as-is on Vercel and on GitHub Pages (where it lives
under `/mouhamad.github.io/`; every link is relative so both work).

## Editing

All the words and links live in `tools/build.py`. Change them there, then run:

```bash
python3 tools/build.py
```

That rewrites every page. Edits made directly to the generated HTML are overwritten on the next run.

- **Styles:** `style.css`. **Behaviour** (walking between rooms, dock, theme, copy email, videos): `script.js`.
- **10000+ videos:** paste YouTube links into `VIDEO_URLS` in `tools/build.py`.
- **Writing:** entries are listed in `ENTRIES`.

## Preview locally

```bash
python3 -m http.server 8810
```

then open http://localhost:8810.
