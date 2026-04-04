document.addEventListener('DOMContentLoaded', () => {
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());

    const progressBar = document.getElementById('scroll-bar');
    const topbar = document.getElementById('navbar');
    const mobileToggle = document.getElementById('mobile-toggle');
    const navLinks = document.getElementById('nav-links');

    const onScroll = () => {
        const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = height > 0 ? winScroll / height : 0;
        if (progressBar) {
            progressBar.style.transform = `scaleX(${scrolled})`;
        }
        if (topbar) {
            topbar.classList.toggle('is-scrolled', winScroll > 32);
        }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (mobileToggle && navLinks && topbar) {
        const closeMenu = () => {
            topbar.classList.remove('is-open');
            mobileToggle.setAttribute('aria-expanded', 'false');
            mobileToggle.setAttribute('aria-label', 'Open menu');
        };

        mobileToggle.addEventListener('click', () => {
            const open = !topbar.classList.contains('is-open');
            topbar.classList.toggle('is-open', open);
            mobileToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
            mobileToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        });

        navLinks.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', closeMenu);
        });
    }

    const sectionsToReveal = document.querySelectorAll('.section-reveal');
    const revealObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        },
        { threshold: 0.08, rootMargin: '0px 0px -48px 0px' }
    );
    sectionsToReveal.forEach((s) => revealObserver.observe(s));

    const intro = document.getElementById('intro');
    if (intro) {
        intro.classList.add('active');
    }
});
