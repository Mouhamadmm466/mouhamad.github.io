/* Isca: a wireless network drawn beside the story. Each chapter, as it reaches the middle of the screen, moves
   the drawing to its stage:
     0  two devices, and a signal you cannot see
     1  the same two devices, with the waves drawn
     2  a network with every access point on one channel; orange dots mark where coverage collides
     3  channels chosen so that neighbours differ, and the collisions go
     4  a simulation: a measuring grid, and how much traffic each access point carries
     5  scale: thousands of access points working together
     6  back to the two devices, now connected
   Nothing loops. The drawing only moves while it changes from one stage to the next. */
(() => {
    const cv = document.getElementById("isca-net");
    if (!cv) return;
    const g = cv.getContext("2d");
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const INK = [28, 20, 16], TONES = [[28, 20, 16], [107, 62, 30], [190, 146, 101]], SAHEL = [232, 147, 90];
    const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${Math.max(0, Math.min(1, a))})`;
    const lerpC = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

    /* ---- the world: the same network every visit (seeded) ---- */
    let seed = 11;
    const rnd = () => { seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    const R = 0.13;                                   /* coverage radius */
    const A = { x: 0.455, y: 0.545 }, B = { x: 0.575, y: 0.455 };
    const mid = { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 };
    const aps = [];
    for (let k = 0; k < 6000 && aps.length < 34; k++) {
        const p = { x: 0.06 + rnd() * 0.88, y: 0.06 + rnd() * 0.88 };
        if (Math.hypot(p.x - A.x, p.y - A.y) < 0.07 || Math.hypot(p.x - B.x, p.y - B.y) < 0.07) continue;
        if (aps.every((q) => Math.hypot(p.x - q.x, p.y - q.y) > 0.135)) aps.push(p);
    }
    const nCluster = aps.length;
    const S = 0.15;                                   /* the wider field, seen when we zoom out */
    for (let gx = -4.2; gx <= 5.2; gx += S) for (let gy = -4.2; gy <= 5.2; gy += S) {
        const x = gx + (rnd() - 0.5) * S * 0.8, y = gy + (rnd() - 0.5) * S * 0.8;
        if (x > -0.04 && x < 1.04 && y > -0.04 && y < 1.04) continue;
        aps.push({ x, y });
    }
    /* neighbours: access points whose coverage overlaps (closer than two radii), found through a grid */
    const cell = 2 * R, hash = new Map(), key = (x, y) => `${Math.floor(x / cell)},${Math.floor(y / cell)}`;
    aps.forEach((p, i) => { const k = key(p.x, p.y); if (!hash.has(k)) hash.set(k, []); hash.get(k).push(i); });
    const near = (i) => {
        const p = aps[i], cx = Math.floor(p.x / cell), cy = Math.floor(p.y / cell), out = [];
        for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++)
            for (const j of hash.get(`${cx + dx},${cy + dy}`) || []) if (j !== i && Math.hypot(aps[j].x - p.x, aps[j].y - p.y) < 2 * R) out.push(j);
        return out;
    };
    /* channels: each access point takes the first of three channels its neighbours are not using */
    const ch = new Array(aps.length).fill(-1);
    aps.forEach((_, i) => {
        const used = [0, 0, 0];
        for (const j of near(i)) if (ch[j] >= 0) used[ch[j]]++;
        const free = used.indexOf(0);
        ch[i] = free >= 0 ? free : used.indexOf(Math.min(...used));
    });
    for (let round = 0; round < 8; round++) {
        let moved = 0;
        aps.forEach((_, i) => {
            const used = [0, 0, 0];
            for (const j of near(i)) used[ch[j]]++;
            const best = used.indexOf(Math.min(...used));
            if (used[best] < used[ch[i]]) { ch[i] = best; moved++; }
        });
        if (!moved) break;
    }
    /* collisions inside the first network: every overlapping pair; `same` pairs survive the channel plan */
    const pairs = [];
    for (let i = 0; i < nCluster; i++) for (const j of near(i)) if (j > i && j < nCluster)
        pairs.push({ x: (aps[i].x + aps[j].x) / 2, y: (aps[i].y + aps[j].y) / 2, same: ch[i] === ch[j] });
    /* people using the network, and how many each access point serves */
    const clients = [], load = new Array(nCluster).fill(0);
    for (let k = 0; k < 90; k++) {
        const c = { x: 0.04 + rnd() * 0.92, y: 0.04 + rnd() * 0.92 };
        let best = 0, bd = 9;
        for (let i = 0; i < nCluster; i++) { const d = Math.hypot(aps[i].x - c.x, aps[i].y - c.y); if (d < bd) { bd = d; best = i; } }
        clients.push(c); load[best]++;
    }
    const maxLoad = Math.max(...load);

    /* ---- stages ---- */
    const base = { z: 3.9, cx: mid.x, cy: mid.y, dev: 1, link: 0, rings: 0, net: 0, mix: 0, grid: 0, load: 0, field: 0, conn: 0, r: R, cov: 1 };
    const STAGES = [
        { ...base, link: 1 },
        { ...base, link: 0.25, rings: 1 },
        { ...base, z: 0.92, cx: 0.5, cy: 0.5, dev: 0.5, net: 1 },
        { ...base, z: 0.92, cx: 0.5, cy: 0.5, dev: 0.5, net: 1, mix: 1, r: R * 0.92 },
        { ...base, z: 0.92, cx: 0.5, cy: 0.5, dev: 0.5, net: 1, mix: 1, r: R * 0.92, grid: 1, load: 1 },
        { ...base, z: 0.16, cx: 0.5, cy: 0.5, dev: 0, net: 1, mix: 1, r: R * 0.92, field: 1 },
        { ...base, net: 0, mix: 1, r: R * 0.92, field: 1, conn: 1, cov: 0 },
    ];
    let cur = { ...STAGES[0] }, from = cur, to = cur, t0 = 0, stage = -1, raf = 0, pulse = null;
    const DASH = [[], [6, 4], [1.5, 3.5]];
    const DUR = 1500, ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

    /* ---- drawing ---- */
    let W = 0, H = 0, dpr = 1;
    const size = () => {
        dpr = Math.min(devicePixelRatio || 1, 2);
        W = cv.clientWidth; H = cv.clientHeight;
        cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    };
    const curve = (u, P, unit) => {          /* a gentle arc from A to B, as screen points */
        const ax = (A.x - P.cx) * unit + W / 2, ay = (A.y - P.cy) * unit + H / 2, bx = (B.x - P.cx) * unit + W / 2, by = (B.y - P.cy) * unit + H / 2;
        const qx = (ax + bx) / 2 + (ay - by) * 0.35, qy = (ay + by) / 2 + (bx - ax) * 0.35;
        return { ax, ay, bx, by, qx, qy, x: (1 - u) * (1 - u) * ax + 2 * (1 - u) * u * qx + u * u * bx, y: (1 - u) * (1 - u) * ay + 2 * (1 - u) * u * qy + u * u * by };
    };
    function draw(P, now) {
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
        g.clearRect(0, 0, W, H);
        const unit = Math.min(W, H, 560) * P.z, sx = (x) => (x - P.cx) * unit + W / 2, sy = (y) => (y - P.cy) * unit + H / 2;
        const inView = (x, y, m) => x > -m && x < W + m && y > -m && y < H + m;

        if (P.grid > 0.01) {                                  /* the simulation's measuring grid */
            g.strokeStyle = rgba(INK, 0.07 * P.grid); g.lineWidth = 1; g.beginPath();
            for (let v = 0; v <= 1.0001; v += 0.1) { g.moveTo(sx(v), sy(0)); g.lineTo(sx(v), sy(1)); g.moveTo(sx(0), sy(v)); g.lineTo(sx(1), sy(v)); }
            g.stroke();
        }
        if (P.net > 0.01) {
            const rp = P.r * unit, count = P.field > 0.01 ? aps.length : nCluster;
            const cover = Math.max(0, Math.min(1, (rp - 14) / 22)) * P.cov;   /* coverage is drawn only while it is large enough to read */
            for (let i = 0; i < count; i++) {
                const p = aps[i], x = sx(p.x), y = sy(p.y);
                if (!inView(x, y, rp + 4)) continue;
                const a = P.net * (i < nCluster ? 1 : P.field);
                if (a < 0.01) continue;
                const col = lerpC(INK, TONES[ch[i]], P.mix);
                if (cover > 0.01) {
                    g.beginPath(); g.arc(x, y, rp, 0, Math.PI * 2);
                    g.fillStyle = rgba(col, 0.04 * a * cover); g.fill();
                    g.setLineDash(P.mix > 0.5 ? DASH[ch[i]] : []);
                    g.strokeStyle = rgba(col, 0.32 * a * cover); g.lineWidth = 1; g.stroke(); g.setLineDash([]);
                }
                g.beginPath(); g.arc(x, y, Math.max(1.5, Math.min(3.4, rp * 0.05)), 0, Math.PI * 2);
                g.fillStyle = rgba(col, 0.9 * a); g.fill();
            }
            if (P.z > 0.5) {
                for (const c of clients) { g.beginPath(); g.arc(sx(c.x), sy(c.y), 1.3, 0, Math.PI * 2); g.fillStyle = rgba(INK, 0.28 * P.net * (1 - P.field)); g.fill(); }
                for (const q of pairs) {                      /* collisions, where coverage on the same channel overlaps */
                    const a = P.net * (q.same ? 1 : 1 - P.mix) * (1 - P.field);
                    if (a < 0.02) continue;
                    g.beginPath(); g.arc(sx(q.x), sy(q.y), 3.4, 0, Math.PI * 2); g.fillStyle = rgba(SAHEL, 0.95 * a); g.fill();
                }
            }
            if (P.load > 0.01) {                              /* how much each access point carries */
                g.lineWidth = 2; g.lineCap = "round";
                for (let i = 0; i < nCluster; i++) {
                    const x = sx(aps[i].x), y = sy(aps[i].y), k = load[i] / maxLoad;
                    g.beginPath(); g.arc(x, y, rp * 0.3, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k * P.load);
                    g.strokeStyle = rgba(TONES[ch[i]], 0.75 * P.load); g.stroke();
                }
                g.lineCap = "butt";
            }
        }
        if (P.rings > 0.01) {                                 /* the waves, drawn */
            for (const d of [A, B]) for (let k = 1; k <= 5; k++) {
                g.beginPath(); g.arc(sx(d.x), sy(d.y), k * 0.0115 * unit * (0.6 + 0.4 * P.rings), 0, Math.PI * 2);
                g.strokeStyle = rgba(INK, (0.42 - k * 0.07) * P.rings); g.lineWidth = 1; g.stroke();
            }
        }
        const c = curve(0, P, unit);
        if (P.link > 0.01) {                                  /* the signal you cannot see */
            g.setLineDash([2, 7]); g.lineWidth = 1.6; g.strokeStyle = rgba(INK, 0.6 * P.link);
            g.beginPath(); g.moveTo(c.ax, c.ay); g.quadraticCurveTo(c.qx, c.qy, c.bx, c.by); g.stroke(); g.setLineDash([]);
        }
        if (P.conn > 0.01) {                                  /* the same two devices, connected */
            g.lineWidth = 2; g.strokeStyle = rgba(SAHEL, P.conn);
            g.beginPath(); g.moveTo(c.ax, c.ay); g.quadraticCurveTo(c.qx, c.qy, c.bx, c.by); g.stroke();
        }
        if (P.dev > 0.01) {
            const col = lerpC(INK, SAHEL, P.conn);
            for (const d of [A, B]) {
                const x = sx(d.x), y = sy(d.y);
                g.beginPath(); g.arc(x, y, 9, 0, Math.PI * 2); g.fillStyle = rgba([255, 243, 232], P.dev); g.fill();
                g.lineWidth = 1.6; g.strokeStyle = rgba(col, P.dev); g.stroke();
                g.beginPath(); g.arc(x, y, 3.6, 0, Math.PI * 2); g.fillStyle = rgba(col, P.dev); g.fill();
            }
        }
        if (pulse) {                                          /* one message, sent once */
            const u = Math.min(1, (now - pulse.t0) / pulse.dur);
            if (u > 0) {
                const p = curve(ease(u), P, unit);
                g.beginPath(); g.arc(p.x, p.y, 4.2, 0, Math.PI * 2); g.fillStyle = rgba(SAHEL, Math.sin(Math.PI * u) * 1.4); g.fill();
            }
            if (u >= 1) pulse = null;
        }
    }

    /* ---- moving between stages: interpolate, zoom on a log scale, then stop ---- */
    function frame(now) {
        const t = reduce ? 1 : Math.min(1, (now - t0) / DUR), e = ease(t);
        const P = {};
        for (const k in to) P[k] = from[k] + (to[k] - from[k]) * e;
        P.z = Math.exp(Math.log(from.z) + (Math.log(to.z) - Math.log(from.z)) * e);
        cur = P; draw(P, now);
        raf = t < 1 || pulse ? requestAnimationFrame(frame) : 0;
    }
    const CAPTIONS = [
        "two devices, and a signal you cannot see",
        "the same signal, drawn as waves",
        "a network on one channel; orange marks interference",
        "three channels, chosen so neighbours differ; most interference clears",
        "in simulation: a grid, and the traffic each access point carries",
        "thousands of access points, working together",
        "the same two devices, connected",
    ];
    const cap = document.querySelector(".isca-fig figcaption"), capN = cap && cap.querySelector("b"), capT = cap && cap.querySelector("span");
    const chapters = [...document.querySelectorAll(".isca .chapter")];
    function go(n) {
        if (n === stage) return;
        stage = n; from = { ...cur }; to = STAGES[n]; t0 = performance.now();
        chapters.forEach((c) => c.classList.toggle("on", +c.dataset.stage === n));
        if (cap) {
            cap.classList.remove("in"); void cap.offsetWidth;
            capN.textContent = String(n + 1).padStart(2, "0"); capT.textContent = CAPTIONS[n]; cap.classList.add("in");
        }
        if (!reduce && (n === 0 || n === 6)) pulse = { t0: t0 + (n === 0 ? 300 : DUR * 0.8), dur: 1500 };
        if (!raf) raf = requestAnimationFrame(frame);
    }

    size();
    new ResizeObserver(() => { size(); draw(cur, performance.now()); }).observe(cv);
    /* a tap on the drawing sends one more message between the two devices, when they are in view */
    cv.addEventListener("click", () => {
        if (reduce || to.dev < 0.9 || pulse) return;
        pulse = { t0: performance.now(), dur: 1300 };
        if (!raf) raf = requestAnimationFrame(frame);
    });
    /* The drawing follows the last chapter whose top has passed a reading line: the middle of the screen, or on
       phones a little lower, below the drawing that covers the top of the screen there. Worked out from the
       scroll position, so reading back up, or jumping to the end, always lands on the right stage. */
    const phone = matchMedia("(max-width: 860px)");
    let ticking = false;
    const follow = () => {
        ticking = false;
        const line = innerHeight * (phone.matches ? 0.62 : 0.5);
        let n = 0;
        for (const c of chapters) if (c.getBoundingClientRect().top < line) n = +c.dataset.stage;
        go(n);
    };
    addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(follow); } }, { passive: true });
    addEventListener("resize", follow);
    cv.closest(".isca").classList.add("live");
    follow();
})();
