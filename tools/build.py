#!/usr/bin/env python3
"""Builds every page of the site from the content below.

"Giving form": the site is an exhibition in six rooms (home, about, initiatives, research, entries,
contact). Each room is its own page; the dock at the bottom of the screen, the arrow keys or a swipe walk
between them. Plain HTML, CSS and JS, so it runs the same on Vercel and on GitHub Pages (where it lives
under /mouhamad.github.io/, which is why every link is relative). Edit the content, then run:

    python3 tools/build.py

Hand edits to generated pages are overwritten on the next run.
"""
from pathlib import Path
from html import escape

ROOT = Path(__file__).resolve().parent.parent
EMAIL = "mouhamadhub@gmail.com"
SOCIALS = [
    ("GitHub", "https://github.com/Mouhamadmm466", "github"),
    ("LinkedIn", "https://www.linkedin.com/in/mouhamadmm", "linkedin"),
    ("X", "https://x.com/mouhamadma43098?s=21", "x"),
    ("Instagram", "https://www.instagram.com/mouhamad_mm", "instagram"),
]

# The floor plan: (key, path, room name shown in the corner)
ROOMS = [
    ("home", "", "Giving form"),
    ("build", "build/", "Build"),
    ("research", "research/", "Inquiry"),
    ("entries", "entries/", "Words"),
    ("contact", "contact/", "Say hello"),
]

# ---------------------------------------------------------------- icons (24 grid, 1.6 stroke, round caps)
ICON = {
    "arrow": '<path d="M5 12h14M13 6l6 6-6 6"/>',
    "back": '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    "left": '<path d="M14.5 6 8.5 12l6 6"/>',
    "right": '<path d="M9.5 6l6 6-6 6"/>',
    "out": '<path d="M7 17 17 7M8 7h9v9"/>',
    "play": '<path d="M8 5.5v13l11-6.5-11-6.5Z" fill="currentColor"/>',
    "copy": '<rect x="8" y="8" width="12" height="12" rx="3"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
    "github": '<path fill="currentColor" stroke="none" d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a10.9 10.9 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.09 0 4.42-2.7 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z"/>',
    "linkedin": '<path fill="currentColor" stroke="none" d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z"/>',
    "x": '<path fill="currentColor" stroke="none" d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82-5.97 6.82H1.67l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23Zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64Z"/>',
    "instagram": '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>',
}

def icon(name, cls=""):
    c = f' class="{cls}"' if cls else ""
    return f'<svg{c} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{ICON[name]}</svg>'

# ---------------------------------------------------------------- content (Mouhamad's words)
MANIFESTO = ("i create and build,", "therefore i am!")
THOUGHT = ("I create to discover if the things that only exist in my imagination can find a place in your reality; "
           "and perhaps, in giving form to what was not there before, I give form to myself.")

CURRENTLY = [  # (name, url, shown domain, description)
    ("namuai*lab", "https://www.namu-ai.org", "namu-ai.org", "Building voice AI in the languages of Africa."),
    # Ex Libris: Latin for "from the library of", the bookplate that marks a book as yours. Personal AGI project.
    ("Ex Libris", "https://www.x-libris.xyz/", "x-libris.xyz", "Building personal AGI that anyone can own. An intelligent library of you that lives on your device and grows with you."),
    ("dot*WTF", "https://cwru.wtf/", "cwru.wtf", "A collective of student builders, researchers, artists and hackers, encouraging interdisciplinary collaboration."),
    ("Isca", "isca/", "the story", "Exploring how AI and software can build smarter wireless networks that are easier to manage, more reliable, and optimize at scale."),
]
# Isca, a personal exploration: AI and software for wireless networks. One story, told beside a drawing of a
# network that grows and organises itself as you read (Assets/isca.js). Each chapter: (stage of the drawing,
# a small scene label, paragraphs); a paragraph starting with "!" is set large.
ISCA_LEDE = "Exploring how AI and software can help us build smarter, more reliable wireless networks."
ISCA = [  # (stage, scene label, paragraphs)
    (0, "age eight", ["I was eight when I first wondered how two devices could talk without a wire between them. So I started a small project to find out how information could travel through something I couldn't even see.",
         "I didn't know about protocols or radio frequencies. I didn't know how the internet worked. I was just curious, and like most things I built at that age, I ended up with more questions than answers."]),
    (1, "going back", ["One thing I have come to love about learning is going back to something you once tried to build, this time knowing how it works. The idea often stays the same. What changes is what you know, and what you can do with it."]),
    (2, "this summer", ["This summer I spent time on research in AI and wireless networking. I learned how wireless networks behave: how they handle interference and traffic, and how software and machine learning can help them perform better.",
         "Somewhere along the way, I started thinking about that little project again."]),
    (3, "the question", ["!So I am picking it up again, with a much bigger goal.",
         "I want to find out whether AI and software can design, run and improve wireless networks. Can a network learn from its own conditions, see a problem before it happens, and make better decisions about how it should work?"]),
    (4, "the plan", ["I am starting with a simulated wireless network, where I can try different setups, traffic patterns and interference.",
         "Next, I want to build software that watches how the network performs, and test AI models that help choose channels, ease congestion and share resources. Then I want to take what works in simulation and try it on real wireless hardware."]),
    (5, "scale", ["What interests me most is scale: hundreds or thousands of access points working together, without someone adjusting them by hand."]),
    (6, "still exploring", ["This is still an exploration. I don't know exactly where it will lead, and that is part of what makes it interesting.",
         "!The question that got me started hasn't changed. I just know more now, I have better tools, and I get to explore it further."]),
]

ROLES = [  # the two lines under the manifesto: (role, @place, url, note)
    ("Co-founder", "Namu", "https://www.namu-ai.org", "speech AI for the languages of Africa"),
    ("Student", "CWRU", "https://case.edu", "Computer Science & Applied Math"),
]

ABOUT = [
    "I am passionate about building useful systems and software that primarily benefit underserved communities.",
    "Lately I have been drawn to storytelling and the power of language. Language is more than a way to communicate: it carries history, culture, identity and knowledge. Today it has also become a barrier, keeping many people from knowledge, information and what modern AI systems have to offer.",
    "So I am co-founding an African AI research and technology startup, building speech-native models, datasets and products that make technology accessible through natural conversation, in every language and every community.",
]

INITIATIVES = [
    dict(title="Namu", role="Co-founder", obj="obj-namu", href="https://www.namu-ai.org", link="namu-ai.org",
         body="An African AI research and technology company building speech-native models, datasets and products that make technology accessible through natural conversation, in every language and every community."),
    dict(title="tekSafari", role="Software engineer", obj="obj-teksafari", href="https://teksafari.com/", link="teksafari.com",
         body="Building a Common App-style admissions platform in Haiti."),
    dict(title="Claude Ambassador", role="Community lead, Cleveland", obj="obj-claude", href=None, link=None,
         body="Leading a community of builders in Cleveland."),
    dict(title="Science Week", role="Organiser, Niger", obj="obj-science", href=None, link=None,
         body="Organised a Science Focus Week in Niger. Raised $10,000 and gathered 1,000+ people in Niamey to discuss technology's role in peacebuilding in the Sahel."),
    dict(title="UwcNiger", role="Builder", obj="obj-uwc", href="https://uwc-niger.com", link="uwc-niger.com",
         body="A centralised platform for the UwcNiger community, where current students find guidance and connect with alumni, so we stay connected and help each other."),
]

RESEARCH = [
    dict(n="I", title="Hausa text-to-speech", role="Open source", obj="obj-tts", href="https://github.com/Mouhamadmm466/VITS_namu_fine_tuning", link="github",
         body="A fine-tuning pipeline for Hausa speech synthesis: a single-speaker dataset, Meta's MMS Hausa checkpoint, and the original VITS training modules, with targeted pronunciation overrides."),
    dict(n="II", title="Compressing language models", role="Research assistant", obj="obj-pruning", href=None, link=None,
         body="With a PhD student, applied pruning and compression to transformer LLMs in PyTorch, measuring model size, memory and inference speed across sparsity levels."),
    dict(n="III", title="NSRI", role="Collaborative research", obj="obj-nsri", href="https://divine-set-544592.framer.app", link="website",
         body="Research with 1,000+ students worldwide, mentored by faculty affiliated with MIT, Georgia Tech, UGA, Emory and others, toward papers for global publication."),
    dict(n="IV", title="Predicting financial stress", role="1st place · Zindi", obj="obj-hackathon", href="https://github.com/Mouhamadmm466/FinancialStress_Solution_Zindi", link="github",
         body="Won first place ($3k) by predicting which mobile money customers will face liquidity stress in the next 30 days, from six months of behaviour."),
]

ENTRIES = [  # (number, title, date, file, listed)
    ("01", "Why writing?", "03/2026", "entry-01.html", True),
    ("02", "I want to be like…", "03/2026", "entry-02.html", True),
    ("03", "I had a dream", "", "entry-03.html", False),
]

VIDEOS = [
    ("Late Night Build Session", "Ship mode, tunnel vision, and one more commit before sleep."),
    ("Whiteboard Sprint", "Thinking in public, sketching systems, and turning ideas into structure."),
    ("Deep Work Flow", "The quiet hours where output compounds and the craft sharpens."),
    ("Reading and Notes", "Reading slowly, taking notes, and trying to understand one idea a little better."),
    ("Coding Sprint", "A focused burst of building, debugging, and getting one more piece to work."),
    ("Early Morning Routine", "Starting before the noise, when the work feels quiet and honest."),
    ("Problem Solving Session", "Staying with a hard problem long enough for the pattern to finally reveal itself."),
    ("Revision and Iteration", "Going back, tightening the details, and making the work cleaner than the first draft."),
    ("Late Review Session", "The final pass at the end of the day, when small improvements still matter."),
]
VIDEO_URLS = [""] * len(VIDEOS)   # paste a YouTube link per video, in the same order

# ---------------------------------------------------------------- building blocks
def words(text, start=0):
    """Wraps each word so it can arrive out of a blur, one after another."""
    out = []
    for k, w in enumerate(text.split()):
        out.append(f'<span class="w" style="--i:{start + k}">{escape(w)}</span>')
    return " ".join(out)

def soft(t):
    """Lowercases only the first letter, so place names keep their capitals (\"organiser, Niger\")."""
    return t[:1].lower() + t[1:]

# Momo the penguin (the favicon), drawn inline so its eyes can follow the cursor. Sits right after "(momo)" in the greeting.
PENGUIN = """<button class="penguin" type="button" aria-label="Momo the penguin. Click to say hi.">
  <span class="say" aria-hidden="true">hi!</span>
  <svg viewBox="9 5 46 53" aria-hidden="true">
    <g class="body">
      <ellipse cx="22" cy="54.5" rx="6" ry="2.6" fill="#E8935A"/><ellipse cx="42" cy="54.5" rx="6" ry="2.6" fill="#E8935A"/>
      <path d="M32 7 C46 7 52 20 52 34 C52 47 44 55 32 55 C20 55 12 47 12 34 C12 20 18 7 32 7 Z" fill="#1C1410"/>
      <path d="M32 17 C41 17 45 25 45 34 C45 44 40 50 32 50 C24 50 19 44 19 34 C19 25 23 17 32 17 Z" fill="#FFFAF1"/>
      <g class="eyes"><g class="pupils"><circle cx="26.5" cy="26" r="2.4" fill="#1C1410"/><circle cx="37.5" cy="26" r="2.4" fill="#1C1410"/></g></g>
      <path d="M28.5 30.5 L35.5 30.5 L32 35.5 Z" fill="#E8935A" stroke="#E8935A" stroke-width="1.5" stroke-linejoin="round"/>
    </g>
  </svg>
</button>"""

def item_list(label, items):
    """A quiet list: name (with an optional muted note), a link or note on the right, and one line of description."""
    rows = []
    for name, note, url, right, desc in items:
        nm = f'<span class="nm">{escape(name)}{f" <em>{escape(note)}</em>" if note else ""}</span>'
        outside = bool(url) and url.startswith("http")
        rt = f'<span class="dom">{escape(right)}{icon("out" if outside else "arrow") if url else ""}</span>' if right else ""
        ds = f'<span class="ds">{escape(desc)}</span>' if desc else ""
        inner = nm + rt + ds
        if not url: rows.append(f'<li><div class="row">{inner}</div></li>')
        elif outside: rows.append(f'<li><a href="{url}" target="_blank" rel="noopener">{inner}</a></li>')
        else: rows.append(f'<li><a href="{url}">{inner}</a></li>')
    head = f'<p class="mono">{escape(label)}</p>' if label else ""
    return f'<div class="now">{head}<ul>{"".join(rows)}</ul></div>'

BOOT = "document.documentElement.classList.add('js');"

def shell(key, depth, title, description, main, head_extra="", extra=""):
    p = "../" * depth
    home = p or "./"
    href = lambda path: (p + path) if path else home
    idx = next((i for i, r in enumerate(ROOMS) if r[0] == key), None)
    cur = ' aria-current="page"'
    links = "".join(f'<a href="{href(path)}" data-i="{i}"{cur if i == idx else ""}>{name}</a>' for i, (name, path, _) in enumerate(ROOMS))
    if idx is None:
        corner, here_label = '', escape(title.split(" · ")[0])
        prev_ = next_ = None
    else:
        corner = f'<b>{idx + 1:02d}</b><span>/ {len(ROOMS):02d}</span>'
        here_label = f'{idx + 1:02d} · {ROOMS[idx][0]}'
        prev_ = href(ROOMS[idx - 1][1]) if idx > 0 else None
        next_ = href(ROOMS[idx + 1][1]) if idx < len(ROOMS) - 1 else None
    step = lambda h, name, rel: (f'<a class="step" href="{h}" rel="{rel}" data-step="{rel}" aria-label="{name} room">{icon("left" if rel == "prev" else "right")}</a>' if h
                                 else f'<a class="step" aria-disabled="true" aria-label="{name} room">{icon("left" if rel == "prev" else "right")}</a>')
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{escape(title)}</title>
<meta name="description" content="{escape(description)}">
<meta name="theme-color" content="#FFF3E8">
<meta property="og:title" content="{escape(title)}">
<meta property="og:description" content="{escape(description)}">
<meta property="og:type" content="website">
<meta property="og:image" content="https://mouhamad-github-io.vercel.app/Assets/og.png">
<meta name="twitter:card" content="summary_large_image">
<script>{BOOT}</script>
{head_extra}<link rel="icon" type="image/png" sizes="32x32" href="{p}Assets/images/favicon-32.png">
<link rel="icon" type="image/svg+xml" href="{p}Assets/images/favicon.svg">
<link rel="apple-touch-icon" href="{p}Assets/images/apple-touch-icon.png">
<link rel="preload" href="{p}Assets/fonts/dmsans-lab.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="{p}style.css">
</head>
<body data-room="{key}">
<a class="skip" href="#main">Skip to content</a>
<div class="haze" aria-hidden="true"></div>
<div class="corner right" aria-hidden="true"><span class="dot"></span><span class="where">Cleveland, OH ·</span><time class="clock">—</time></div>
<main id="main" class="room">
<div class="room-inner">
{main}
</div>
</main>
{extra}
<nav class="dock" aria-label="Rooms">
  {step(prev_, "Previous", "prev")}
  <div class="links"><span class="pill" aria-hidden="true"></span>{links}</div>
  {step(next_, "Next", "next")}
</nav>
<script src="{p}script.js" defer></script>
</body>
</html>
"""

def write(rel, html):
    path = ROOT / rel
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(html)
    print("wrote", rel)

def socials_list():
    return "".join(f'<li><a href="{u}" target="_blank" rel="noopener">{icon(k)}{n}</a></li>' for n, u, k in SOCIALS)

# ---------------------------------------------------------------- rooms
def home():
    g = "Hey, I'm Mouhamad (momo)"
    n0 = len(g.split()); n1 = n0 + len(MANIFESTO[0].split())
    roles = "".join(f'<p class="role-line">{escape(r)} <a href="{u}" target="_blank" rel="noopener">@{escape(at)}</a> <span>— {escape(note)}</span></p>' for r, at, u, note in ROLES)
    now = item_list("Currently;", [(name, None, u, dom, desc) for name, u, dom, desc in CURRENTLY])
    main = f"""<section class="home" aria-label="Home">
  <div class="home-col">
    <p class="greet">{words(g)} {PENGUIN}</p>
    <h1 class="manifesto">{words(MANIFESTO[0], n0)} {words(MANIFESTO[1], n1)}</h1>
    <p class="thought">{words(THOUGHT)}</p>
    <div class="roles">{roles}</div>
    {now}
  </div>
</section>"""
    write("index.html", shell("home", 0, "Mouhamad Mamane", "Hey, I'm Mouhamad. I create and build, therefore I am. Co-founder of Namu; Computer Science & Applied Math at Case Western Reserve University.", main))

def about():
    ledes = "".join(f'<p class="lede">{escape(t)}</p>' for t in ABOUT)
    main = f"""<section class="col" aria-labelledby="t">
  <h1 id="t" class="title">Hi there, I'm Mouhamad.</h1>
  {ledes}
</section>"""
    write("about/index.html", shell("about", 1, "About · Mouhamad Mamane", "About Mouhamad Mamane: building useful systems and software that benefit underserved communities.", main))

def initiatives():
    items = [(it["title"], soft(it["role"]), it["href"], it["link"], it["body"]) for it in INITIATIVES]
    main = f"""<section class="col" aria-labelledby="t">
  <h1 id="t" class="sr-only">Build</h1>
  {item_list("Build;", items)}
</section>"""
    write("build/index.html", shell("build", 1, "Build · Mouhamad Mamane", "Namu, tekSafari, Claude Ambassador, Science Week in Niger and UwcNiger.", main))

def research():
    items = [(r["title"], soft(r["role"]), r["href"], r["link"], r["body"]) for r in RESEARCH]
    main = f"""<section class="col" aria-labelledby="t">
  <h1 id="t" class="sr-only">Research</h1>
  <div class="quote"><p class="greet">i am a scientist!</p><p class="thought">i invent, transform and destroy for a living.</p></div>
  {item_list("Research;", items)}
</section>"""
    write("research/index.html", shell("research", 1, "Research · Mouhamad Mamane", "Hausa text-to-speech, compressing language models, NSRI and a first-place Zindi solution.", main))

def entries():
    toc = "".join(f'<li><a href="{f}"><span class="n">{n}</span><span class="t">{escape(t)}</span><span class="mono">{d} · coming soon</span></a></li>'
                  for n, t, d, f, listed in ENTRIES if listed)
    main = f"""<section class="col" aria-labelledby="t">
  <h1 id="t" class="sr-only">Entries</h1>
  <p class="mono">ps: I do not use any generative AI to help me write these entries.</p>
  <ul class="toc">{toc}</ul>
</section>"""
    write("entries/index.html", shell("entries", 1, "Entries · Mouhamad Mamane", "Writing by Mouhamad Mamane, without generative AI.", main))
    for n, t, d, f, _ in ENTRIES:
        art = f"""<article class="col" aria-labelledby="t">
  <a class="back" href="./">← all entries</a>
  <p class="mono">Entry {n}{" · " + d if d else ""}</p>
  <h1 id="t" class="title">{escape(t)}</h1>
  <p class="lede">Coming soon…</p>
</article>"""
        write(f"entries/{f}", shell("entries", 1, f"{t} · Mouhamad Mamane", f"Entry {n}: {t}", art))

def isca():
    chapters = []
    for stage, label, paras in ISCA:
        ps = "".join(f'<p class="big">{escape(t[1:])}</p>' if t.startswith("!") else f"<p>{escape(t)}</p>" for t in paras)
        chapters.append(f'<section class="chapter" data-stage="{stage}"><p class="mono"><b>{stage + 1:02d}</b> {escape(label)}</p>{ps}</section>')
    title = "Isca"
    main = f"""<article class="isca" aria-labelledby="t">
  <header class="isca-head">
    <a class="back" href="../">{icon("back")}home</a>
    <p class="mono">a personal exploration</p>
    <h1 id="t" class="isca-title">{words(title)}</h1>
    <p class="lede">{words(ISCA_LEDE, 1)}</p>
  </header>
  <figure class="isca-fig" aria-hidden="true"><canvas id="isca-net"></canvas><figcaption class="mono"><b>01</b> <span>two devices, and a signal you cannot see</span></figcaption></figure>
  <div class="isca-story">{"".join(chapters)}
    <a class="back isca-end" href="../">{icon("back")}home</a>
  </div>
</article>"""
    extra = '<script src="../Assets/isca.js" defer></script>'
    write("isca/index.html", shell("isca", 1, "Isca · Mouhamad Mamane", ISCA_LEDE, main, extra=extra))

def contact():
    logos = "".join(f'<a href="{u}" target="_blank" rel="noopener" aria-label="{n}" title="{n}">{icon(k)}</a>' for n, u, k in SOCIALS)
    main = f"""<section class="col center" aria-labelledby="t">
  <h1 id="t" class="title">Let's stay in touch.</h1>
  <div class="email"><a href="mailto:{EMAIL}">{EMAIL}</a><button class="copy" type="button" data-copy="{EMAIL}"><span>copy</span></button></div>
  <nav class="socials" aria-label="Elsewhere">{logos}</nav>
</section>"""
    write("contact/index.html", shell("contact", 1, "Contact · Mouhamad Mamane", "How to reach Mouhamad Mamane.", main))

def ten_thousand():
    cards = []
    for (t, c), u in zip(VIDEOS, VIDEO_URLS):
        cards.append(f"""<div class="video-card">
  <div class="video-frame" tabindex="0" role="button" aria-label="Play {escape(t.lower())} video" data-youtube-url="{escape(u)}" data-video-title="{escape(t)}">
    <div class="video-media"><div class="video-poster" aria-hidden="true"></div></div>
    <div class="video-overlay"><span class="video-badge">hover to preview</span><span class="video-action">click to play</span></div>
  </div>
  <h3>{escape(t)}</h3><p>{escape(c)}</p>
</div>""")
    main = f"""<section aria-labelledby="t">
  <h1 id="t" class="title">10000+</h1>
  <p class="lede">Can I become a genius if I was not born one?</p>
  <div class="videos">{"".join(cards)}</div>
</section>"""
    write("10000-plus/index.html", shell("10000", 1, "10000+ · Mouhamad Mamane", "Can I become a genius if I was not born one? Work sessions on the way to 10,000 hours.", main))

def not_found():
    # Served for any missing path at any depth: works out the site's base at runtime (GitHub Pages serves
    # this site under /mouhamad.github.io/, Vercel at /) and redirects old routes, including the retired
    # momo, sports and photography pages.
    head = """<script>
(function () {
  var path = location.pathname, base = path.indexOf("/mouhamad.github.io/") === 0 ? "/mouhamad.github.io/" : "/";
  document.write('<base href="' + base + '">');
  var route = path.slice(base.length - 1).replace(/\\/+$/, "") || "/";
  var map = { "/10000h": "10000-plus/", "/10000+": "10000-plus/", "/writings": "entries/", "/momo": "", "/sports": "", "/photography": "", "/about": "", "/initiatives": "build/",
    "/entry-01": "entries/entry-01.html", "/entry-02": "entries/entry-02.html", "/entry-03": "entries/entry-03.html",
    "/writing-01": "entries/entry-01.html", "/writing-02": "entries/entry-02.html", "/writing-03": "entries/entry-03.html",
    "/writings/writing-01.html": "entries/entry-01.html", "/writings/writing-02.html": "entries/entry-02.html", "/writings/writing-03.html": "entries/entry-03.html" };
  if (route in map) location.replace(base + map[route] + location.search + location.hash);
})();
</script>
"""
    main = f"""<section class="col" aria-labelledby="t">
  <p class="mono">404</p>
  <h1 id="t" class="title">This room doesn't exist. Not yet, anyway.</h1>
  <p class="lede">Everything else is one step away, in the bar below.</p>
</section>"""
    write("404.html", shell("404", 0, "Not found · Mouhamad Mamane", "Page not found.", main, head_extra=head))

if __name__ == "__main__":
    home(); initiatives(); research(); entries(); isca(); contact(); ten_thousand(); not_found()
