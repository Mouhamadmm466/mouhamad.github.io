// This script is optional, but adds a nice smooth-scroll effect

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault(); // Prevent the default jump-to-anchor behavior

        // Get the target element
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
            // Scroll smoothly to the target element
            targetElement.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});
