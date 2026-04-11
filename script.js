const body = document.body;
const themeToggle = document.querySelector(".theme-toggle");

const applyTheme = (theme) => {
    body.dataset.theme = theme;

    if (themeToggle) {
        const icon = themeToggle.querySelector("i");
        if (icon) {
            icon.className = theme === "dark" ? "fa-solid fa-moon" : "fa-solid fa-sun";
        }
    }

    localStorage.setItem("portfolio-theme", theme);
};

const savedTheme = localStorage.getItem("portfolio-theme");
if (savedTheme === "light" || savedTheme === "dark") {
    applyTheme(savedTheme);
}

if (themeToggle) {
    themeToggle.addEventListener("click", () => {
        const nextTheme = body.dataset.theme === "dark" ? "light" : "dark";
        applyTheme(nextTheme);
    });
}

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
        }
    });
}, {
    threshold: 0.18
});

document.querySelectorAll(".content-block").forEach((block) => revealObserver.observe(block));

const currentPage = document.body.dataset.page;
document.querySelectorAll(".nav-link").forEach((link) => {
    const isActive = link.dataset.page === currentPage;
    link.classList.toggle("active", isActive);

    if (isActive) {
        link.setAttribute("aria-current", "page");
    } else {
        link.removeAttribute("aria-current");
    }
});

const extractYouTubeId = (input) => {
    const value = (input || "").trim();
    if (!value) {
        return null;
    }

    if (/^[\w-]{11}$/.test(value)) {
        return value;
    }

    try {
        const url = new URL(value);
        const hostname = url.hostname.replace(/^www\./, "");

        if (hostname === "youtu.be") {
            const shortId = url.pathname.replace(/^\/+/, "").split("/")[0];
            return /^[\w-]{11}$/.test(shortId) ? shortId : null;
        }

        if (hostname === "youtube.com" || hostname === "m.youtube.com" || hostname === "youtube-nocookie.com") {
            const directId = url.searchParams.get("v");
            if (directId && /^[\w-]{11}$/.test(directId)) {
                return directId;
            }

            const parts = url.pathname.split("/").filter(Boolean);
            const videoIndex = parts.findIndex((part) => ["embed", "shorts", "live", "v"].includes(part));
            if (videoIndex !== -1) {
                const pathId = parts[videoIndex + 1];
                return /^[\w-]{11}$/.test(pathId) ? pathId : null;
            }
        }
    } catch (error) {
        const matches = value.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/);
        return matches ? matches[1] : null;
    }

    return null;
};

const createYouTubeEmbedUrl = (videoId, mode) => {
    const params = new URLSearchParams({
        autoplay: "1",
        playsinline: "1",
        rel: "0",
        modestbranding: "1"
    });

    if (mode === "preview") {
        params.set("mute", "1");
        params.set("controls", "0");
        params.set("loop", "1");
        params.set("playlist", videoId);
        params.set("disablekb", "1");
        params.set("fs", "0");
    } else {
        params.set("controls", "1");
    }

    return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
};

const createVideoIframe = (videoId, mode, title) => {
    const iframe = document.createElement("iframe");
    iframe.className = `video-embed${mode === "preview" ? " is-preview" : ""}`;
    iframe.src = createYouTubeEmbedUrl(videoId, mode);
    iframe.title = title || "YouTube video player";
    iframe.loading = mode === "preview" ? "eager" : "lazy";
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    iframe.allowFullscreen = true;
    return iframe;
};

const videoFrames = Array.from(document.querySelectorAll(".video-frame"));

const resetVideoFrame = (frame) => {
    const iframe = frame.querySelector(".video-embed");
    if (iframe) {
        iframe.remove();
    }

    frame.classList.remove("is-previewing", "is-playing");
    frame.dataset.state = "idle";
    frame.setAttribute("aria-pressed", "false");
};

const mountVideoFrame = (frame, mode) => {
    const videoId = frame.dataset.videoId;
    if (!videoId) {
        return;
    }

    const media = frame.querySelector(".video-media");
    if (!media) {
        return;
    }

    const existingMode = frame.dataset.state;
    if ((mode === "preview" && existingMode === "preview") || (mode === "play" && existingMode === "playing")) {
        return;
    }

    const iframe = createVideoIframe(videoId, mode, frame.dataset.videoTitle);
    const existingIframe = media.querySelector(".video-embed");

    if (existingIframe) {
        existingIframe.remove();
    }

    media.appendChild(iframe);
    frame.classList.toggle("is-previewing", mode === "preview");
    frame.classList.toggle("is-playing", mode === "play");
    frame.dataset.state = mode === "preview" ? "preview" : "playing";
    frame.setAttribute("aria-pressed", mode === "play" ? "true" : "false");
};

const initializeWorkVideos = () => {
    if (!videoFrames.length) {
        return;
    }

    videoFrames.forEach((frame) => {
        const poster = frame.querySelector(".video-poster");
        const badge = frame.querySelector(".video-badge");
        const action = frame.querySelector(".video-action");
        const title = frame.dataset.videoTitle || "Work session";
        const videoId = extractYouTubeId(frame.dataset.youtubeUrl);

        frame.dataset.state = "idle";
        frame.setAttribute("aria-pressed", "false");

        if (!videoId) {
            frame.classList.add("is-placeholder");
            if (badge) {
                badge.textContent = "add youtube link";
            }
            if (action) {
                action.innerHTML = '<i class="fa-solid fa-link"></i> preview unlocks after you paste a link';
            }
            return;
        }

        frame.dataset.videoId = videoId;
        frame.classList.remove("is-placeholder");

        if (poster) {
            poster.style.backgroundImage = `linear-gradient(180deg, rgba(10, 11, 15, 0.04), rgba(10, 11, 15, 0.7)), linear-gradient(135deg, rgba(214, 112, 63, 0.18), transparent 45%), url("https://i.ytimg.com/vi/${videoId}/hqdefault.jpg")`;
        }

        const startPreview = () => {
            if (frame.dataset.state === "playing") {
                return;
            }
            mountVideoFrame(frame, "preview");
        };

        const stopPreview = () => {
            if (frame.dataset.state !== "preview") {
                return;
            }
            resetVideoFrame(frame);
        };

        const playVideo = () => {
            videoFrames.forEach((otherFrame) => {
                if (otherFrame !== frame) {
                    resetVideoFrame(otherFrame);
                }
            });

            mountVideoFrame(frame, "play");
        };

        frame.addEventListener("pointerenter", startPreview);
        frame.addEventListener("pointerleave", stopPreview);
        frame.addEventListener("focus", startPreview);
        frame.addEventListener("blur", stopPreview);
        frame.addEventListener("click", playVideo);
        frame.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                playVideo();
            }
        });

        frame.setAttribute("aria-label", `Play ${title}`);
    });
};

initializeWorkVideos();
