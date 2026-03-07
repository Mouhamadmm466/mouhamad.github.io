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
