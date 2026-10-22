/* Walking between pages, the dock, and small details. */

const root = document.documentElement;
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---- direction of travel, so rooms slide the right way (cross-document view transitions) ---- */
const DIR = "room-dir";
window.addEventListener("pagereveal", () => {
    try { root.dataset.dir = sessionStorage.getItem(DIR) || "forward"; sessionStorage.removeItem(DIR); } catch (e) { /* private mode */ }
});
const currentIndex = () => {
    const a = document.querySelector('.dock .links a[aria-current="page"]');
    return a ? Number(a.dataset.i) : -1;
};
const go = (href, dir) => {
    if (!href) return;
    try { sessionStorage.setItem(DIR, dir); } catch (e) { /* ignore */ }
    location.href = href;
};
document.querySelectorAll(".dock a[data-i]").forEach((a) => {
    a.addEventListener("click", () => {
        try { sessionStorage.setItem(DIR, Number(a.dataset.i) < currentIndex() ? "back" : "forward"); } catch (e) { /* ignore */ }
    });
});
document.querySelectorAll(".dock [data-step]").forEach((a) => {
    a.addEventListener("click", () => { try { sessionStorage.setItem(DIR, a.dataset.step === "prev" ? "back" : "forward"); } catch (e) { /* ignore */ } });
});
const prevHref = () => document.querySelector('.dock [data-step="prev"]')?.getAttribute("href");
const nextHref = () => document.querySelector('.dock [data-step="next"]')?.getAttribute("href");

/* arrow keys walk between rooms (up and down are kept for lists) */
document.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
    const t = e.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    if (e.key === "ArrowRight") { e.preventDefault(); go(nextHref(), "forward"); }
    if (e.key === "ArrowLeft") { e.preventDefault(); go(prevHref(), "back"); }
});

/* a horizontal swipe walks too */
let touch = null;
document.addEventListener("touchstart", (e) => { if (e.touches.length === 1) touch = { x: e.touches[0].clientX, y: e.touches[0].clientY, t: Date.now() }; }, { passive: true });
document.addEventListener("touchend", (e) => {
    if (!touch) return;
    const dx = e.changedTouches[0].clientX - touch.x, dy = e.changedTouches[0].clientY - touch.y, dt = Date.now() - touch.t;
    touch = null;
    if (dt > 700 || Math.abs(dx) < 70 || Math.abs(dx) < Math.abs(dy) * 1.6) return;
    if (dx < 0) go(nextHref(), "forward"); else go(prevHref(), "back");
}, { passive: true });

/* ---- the dock's ink pill sits under the current room ---- */
const pill = document.querySelector(".dock .pill");
const placePill = () => {
    const a = document.querySelector('.dock .links a[aria-current="page"]');
    if (!pill) return;
    if (!a) { pill.style.opacity = "0"; return; }
    pill.style.left = a.offsetLeft + "px";
    pill.style.width = a.offsetWidth + "px";
};
placePill();
requestAnimationFrame(() => pill && pill.classList.add("ready"));
document.fonts && document.fonts.ready.then(placePill);
window.addEventListener("resize", placePill);
document.querySelectorAll(".dock .links a").forEach((a) => {
    a.addEventListener("mouseenter", () => { if (!pill) return; pill.style.left = a.offsetLeft + "px"; pill.style.width = a.offsetWidth + "px"; });
});
document.querySelector(".dock .links")?.addEventListener("mouseleave", placePill);

/* ---- the time in Cleveland ---- */
const clock = document.querySelector(".clock");
if (clock) {
    const fmt = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", hour: "numeric", minute: "2-digit" });
    const tick = () => { clock.textContent = fmt.format(new Date()); };
    tick(); setInterval(tick, 20000);
}

/* ---- Haptics, like Duolingo: a light tick when Momo leaves the ground, a firmer one when it lands.
   Android browsers have the Vibration API. iPhones (Safari 18 and later) have none, but tapping the label of a
   native switch plays the system haptic, so a hidden one stands in. Browsers only allow either after the
   visitor has touched the page, so the backflip on arrival buzzes only if they already have; a tap always does. */
const haptic = (() => {
    if (reduced) return () => {};
    if (typeof navigator.vibrate === "function") return (ms) => {
        if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return; /* blocked until a first touch */
        try { navigator.vibrate(ms); } catch (e) {}
    };
    const iOS = /iP(hone|ad|od)/.test(navigator.userAgent) || (/Mac/.test(navigator.userAgent) && "ontouchend" in document);
    if (!iOS) return () => {};
    return () => {
        const label = document.createElement("label"), input = document.createElement("input");
        label.setAttribute("aria-hidden", "true"); label.style.display = "none";
        input.type = "checkbox"; input.setAttribute("switch", "");
        label.appendChild(input); document.head.appendChild(label);
        label.click(); label.remove();
    };
})();
/* Two buzzes timed to a jump: a light one at take-off, a firmer one at landing (fractions of `duration` ms). */
const jumpHaptics = (duration, takeoff, landing) => {
    setTimeout(() => haptic(10), duration * takeoff);
    setTimeout(() => haptic(24), duration * landing);
};

/* ---- Momo the penguin: eyes follow the cursor; a click makes it hop and say hi ---- */
const penguin = document.querySelector(".penguin");
if (penguin) {
    /* The arrival backflip (style.css): crouch, take off at 14%, land at 84% of 1.15 s. */
    const svg = penguin.querySelector("svg");
    if (svg) svg.addEventListener("animationstart", (e) => { if (e.animationName === "backflip") jumpHaptics(1150, .14, .84); });
    const pupils = penguin.querySelector(".pupils");
    if (!reduced && matchMedia("(hover: hover)").matches && pupils) {
        let raf = 0, px = 0, py = 0;
        window.addEventListener("pointermove", (e) => {
            px = e.clientX; py = e.clientY;
            if (raf) return;
            raf = requestAnimationFrame(() => {
                raf = 0;
                const r = penguin.getBoundingClientRect();
                const cx = r.left + r.width / 2, cy = r.top + r.height * .4;
                const dx = px - cx, dy = py - cy, len = Math.hypot(dx, dy) || 1, k = Math.min(1, len / 140);
                pupils.style.transform = `translate(${(dx / len * 1.7 * k).toFixed(2)}px, ${(dy / len * 1.5 * k).toFixed(2)}px)`;
            });
        }, { passive: true });
    }
    penguin.addEventListener("click", () => {
        penguin.classList.remove("hop"); void penguin.offsetWidth; penguin.classList.add("hop");
        jumpHaptics(700, .18, .75); /* the hop: off the ground at 18%, down at 75% of 0.7 s */
        clearTimeout(penguin._t); penguin._t = setTimeout(() => penguin.classList.remove("hop"), 1400);
    });
}

/* ---- copy the email ---- */
document.querySelectorAll("[data-copy]").forEach((b) => {
    b.addEventListener("click", async () => {
        const label = b.querySelector("span");
        try { await navigator.clipboard.writeText(b.dataset.copy); if (label) label.textContent = "copied"; }
        catch (e) { if (label) label.textContent = "press ⌘C"; }
        setTimeout(() => { if (label) label.textContent = "copy"; }, 1800);
    });
});

/* ---- contact: the booking and the message form open over the page instead of a new tab.
   Cal.com's and Tally's scripts load only when a visitor reaches for a link (hover, focus or touch); if they
   cannot load, the link opens the page itself. */
const loadScript = (src) => new Promise((ok, fail) => {
    const s = document.createElement("script");
    s.src = src; s.async = true; s.onload = ok; s.onerror = fail;
    document.head.appendChild(s);
});
const once = (fn) => { let p; return () => p || (p = fn()); };
const tallyReady = once(() => loadScript("https://tally.so/widgets/embed.js"));
const calReady = once(() => {
    /* Cal.com's loader: calls queue up on window.Cal until embed.js arrives and plays them */
    const Cal = window.Cal = function () { Cal.q.push(arguments); };
    Cal.q = []; Cal.ns = {}; Cal.loaded = true;
    const ns = Cal.ns.meeting = function () { ns.q.push(arguments); };
    ns.q = [["init", "meeting", { origin: "https://cal.com" }]];
    Cal.q.push(["initNamespace", "meeting"]);
    ns("ui", { theme: "light", layout: "month_view", cssVarsPerTheme: { light: { "cal-brand": "#1c1410" } } });
    return loadScript("https://app.cal.com/embed/embed.js");
});
const popups = [
    ["[data-tally]", tallyReady, (a) => window.Tally.openPopup(a.dataset.tally, { layout: "modal", width: 560, overlay: true })],
    ["[data-cal]", calReady, (a) => window.Cal.ns.meeting("modal", { calLink: a.dataset.cal, config: { layout: "month_view", theme: "light" } })],
];
popups.forEach(([sel, ready, open]) => document.querySelectorAll(sel).forEach((a) => {
    ["pointerenter", "focus", "touchstart"].forEach((t) => a.addEventListener(t, () => { ready().catch(() => {}); }, { once: true, passive: true }));
    a.addEventListener("click", (e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button) return; /* a new tab, on purpose */
        e.preventDefault();
        ready().then(() => open(a)).catch(() => { location.href = a.href; });
    });
}));

/* ---- 10000+: paste a YouTube link into data-youtube-url and the card comes alive ---- */
const youTubeId = (input) => {
    const value = (input || "").trim();
    if (!value) return null;
    if (/^[\w-]{11}$/.test(value)) return value;
    const m = value.match(/(?:v=|youtu\.be\/|embed\/|shorts\/|live\/)([\w-]{11})/);
    return m ? m[1] : null;
};
const embed = (id, mode) => {
    const p = new URLSearchParams({ autoplay: "1", playsinline: "1", rel: "0", modestbranding: "1" });
    if (mode === "preview") { p.set("mute", "1"); p.set("controls", "0"); p.set("loop", "1"); p.set("playlist", id); }
    return `https://www.youtube-nocookie.com/embed/${id}?${p.toString()}`;
};
document.querySelectorAll(".video-frame").forEach((frame) => {
    const id = youTubeId(frame.dataset.youtubeUrl);
    if (!id) {
        frame.classList.add("is-placeholder");
        frame.removeAttribute("role"); frame.removeAttribute("tabindex");
        const badge = frame.querySelector(".video-badge"); if (badge) badge.textContent = "coming soon";
        frame.querySelector(".video-action")?.remove();
        return;
    }
    const media = frame.querySelector(".video-media");
    const poster = frame.querySelector(".video-poster");
    if (poster) { poster.style.background = `url("https://i.ytimg.com/vi/${id}/hqdefault.jpg") center / cover`; poster.style.opacity = "1"; }
    const mount = (mode) => {
        if (frame.dataset.state === (mode === "play" ? "playing" : "preview")) return;
        media.querySelector(".video-embed")?.remove();
        const f = document.createElement("iframe");
        f.className = "video-embed"; f.src = embed(id, mode); f.title = frame.dataset.videoTitle || "Video";
        f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen"; f.allowFullscreen = true;
        media.appendChild(f);
        frame.dataset.state = mode === "play" ? "playing" : "preview";
        frame.classList.toggle("is-playing", mode === "play"); frame.classList.toggle("is-previewing", mode === "preview");
    };
    if (matchMedia("(hover: hover)").matches && !reduced) {
        frame.addEventListener("mouseenter", () => { if (frame.dataset.state !== "playing") mount("preview"); });
        frame.addEventListener("mouseleave", () => { if (frame.dataset.state === "preview") { media.querySelector(".video-embed")?.remove(); frame.dataset.state = ""; frame.classList.remove("is-previewing"); } });
    }
    frame.addEventListener("click", () => mount("play"));
    frame.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); mount("play"); } });
});
