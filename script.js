var typed = new Typed('.changingtxt', {
    strings: ['Web Developer', 'Designer'],
    typeSpeed: 100,
    backSpeed: 100,
    backDelay: 1000,
    loop: true
});

// Smooth-scroll to section title (if present) and manage active nav glow
document.addEventListener('DOMContentLoaded', function () {
    const header = document.querySelector('.header');
    const headerHeight = header ? header.offsetHeight : 0;
    const navLinks = document.querySelectorAll('.header .navbar a[href^="#"]');

    // create nav indicator
    const navbar = document.querySelector('.header .navbar');
    let indicator = document.createElement('span');
    indicator.className = 'nav-indicator';
    navbar.appendChild(indicator);

    function setActive(link) {
        navLinks.forEach(l => l.classList.remove('active'));
        if (link) link.classList.add('active');

    // move indicator
    if (link) moveIndicator(link);
    }

    function scrollToTarget(hash) {
        if (!hash) return;
        const id = hash.replace('#', '');
        const section = document.getElementById(id);
        if (!section) return;

        // If there's a section-title directly before the section, scroll to it so the heading is visible
        const prev = section.previousElementSibling;
        const target = (prev && prev.classList.contains('section-title')) ? prev : section;

        // Smooth scroll, account for fixed header by scrolling slightly above
        const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 10;
        window.scrollTo({ top, behavior: 'smooth' });

        // reveal the section-title if present
        if (prev && prev.classList.contains('section-title')) {
            prev.classList.add('visible');
        }

        // update url without jumping
        history.replaceState(null, '', hash);
    }

    function moveIndicator(link) {
        const rect = link.getBoundingClientRect();
        const parentRect = navbar.getBoundingClientRect();
        const left = rect.left - parentRect.left;
        const width = rect.width;
        indicator.style.left = left + 'px';
        indicator.style.width = width + 'px';
    }

    // Click handlers for nav links
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            setActive(this);
            scrollToTarget(this.getAttribute('href'));
        });
    });

    // Make sure 'Home' is active on initial load if nothing else matches
    const homeLink = document.querySelector('.header .navbar a[href="#home"]') || document.querySelector('.header .navbar a[href="#"]');
    if (homeLink && !location.hash) {
        setActive(homeLink);
        moveIndicator(homeLink);
    }

        // Use IntersectionObserver to activate nav when a section covers >= 60% of the viewport
        const sections = Array.from(document.querySelectorAll('section[id]'));

        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: buildThresholdList(0.01, 0.01, 1.0) // fine-grained thresholds
        };

        function buildThresholdList(start, step, end) {
            const thresholds = [];
            for (let t = start; t <= end; t += step) thresholds.push(parseFloat(t.toFixed(2)));
            return thresholds;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const ratio = entry.intersectionRatio;

                // If section is at least 60% visible, make its nav link active
                if (ratio >= 0.6) {
                    const id = entry.target.id;
                    const activeLink = document.querySelector('.header .navbar a[href="#' + id + '"]');
                    setActive(activeLink);

                    // reveal section-title if it exists
                    const prev = entry.target.previousElementSibling;
                    if (prev && prev.classList.contains('section-title')) prev.classList.add('visible');
                }
            });
        }, observerOptions);

        sections.forEach(sec => observer.observe(sec));

        // initial check (in case page loaded with a hash)
        if (location.hash) scrollToTarget(location.hash);
});



