var typed = new Typed('.changingtxt', {
    strings: [
        '<span style="font-family: Arial, sans-serif;">Web Developer</span>',
        '<span style="font-family: "Courier New", Courier, monospace;">3D- Designer</span>',
        '<span style="font-family: "Times New Roman", Times, serif;">Machine Learning Engineer</span>',
        '<span style="font-family: "Comic Sans MS", cursive, sans-serif;">Data Scientist</span>'
    ],
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

        // Use IntersectionObserver to activate nav when a section covers >= 20% of the viewport
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

        // Mark and pause animated elements initially so animations only play while their section is visible
        function markAnimatedElements() {
            sections.forEach(sec => {
                sec.querySelectorAll('*').forEach(el => {
                    const cs = window.getComputedStyle(el);
                    if (cs && cs.animationName && cs.animationName !== 'none' && cs.animationDuration && cs.animationDuration !== '0s') {
                        el.dataset.hasAnim = '1';
                        el.style.animationPlayState = 'paused';
                    }
                });

                const prev = sec.previousElementSibling;
                if (prev) {
                    const csPrev = window.getComputedStyle(prev);
                    if (csPrev && csPrev.animationName && csPrev.animationName !== 'none' && csPrev.animationDuration && csPrev.animationDuration !== '0s') {
                        prev.dataset.hasAnim = '1';
                        prev.style.animationPlayState = 'paused';
                    }
                    prev.querySelectorAll('*').forEach(el => {
                        const cs2 = window.getComputedStyle(el);
                        if (cs2 && cs2.animationName && cs2.animationName !== 'none' && cs2.animationDuration && cs2.animationDuration !== '0s') {
                            el.dataset.hasAnim = '1';
                            el.style.animationPlayState = 'paused';
                        }
                    });
                }
            });
        }

        // run the marking step once
        markAnimatedElements();

        // Collect progress bars (skills) and store their intended widths, then collapse them to 0
        function markProgressBars() {
            const bars = Array.from(document.querySelectorAll('.progress-bar'));
            bars.forEach(bar => {
                // store original inline width (index.html uses inline widths like "95%")
                const orig = bar.style.width && bar.style.width.trim() ? bar.style.width.trim() : '';
                bar.dataset.origWidth = orig;
                // collapse by default so transition only occurs when we set it later
                bar.style.width = '0%';
            });
        }

        markProgressBars();

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const ratio = entry.intersectionRatio;

                // If section is at least 20% visible, make its nav link active and resume animations
                const prev = entry.target.previousElementSibling;
                if (ratio >= 0.2) {
                    const id = entry.target.id;
                    const activeLink = document.querySelector('.header .navbar a[href="#' + id + '"]');
                    setActive(activeLink);

                    // reveal section-title if it exists
                    if (prev && prev.classList.contains('section-title')) prev.classList.add('visible');

                    // mark section as in-view for CSS-based transitions
                    entry.target.classList.add('in-view');

                    // resume animations that were paused
                    Array.from(entry.target.querySelectorAll('[data-has-anim]')).forEach(el => el.style.animationPlayState = 'running');
                    if (prev) {
                        if (prev.dataset.hasAnim) prev.style.animationPlayState = 'running';
                        Array.from(prev.querySelectorAll('[data-has-anim]')).forEach(el => el.style.animationPlayState = 'running');
                    }

                    // For skills/progress bars inside this section, restore their widths to trigger transition
                    Array.from(entry.target.querySelectorAll('.progress-bar')).forEach(bar => {
                        const w = bar.dataset.origWidth || '';
                        if (w) bar.style.width = w; // triggers CSS transition
                    });
                } else {
                    // not sufficiently visible: pause animations and remove in-view
                    entry.target.classList.remove('in-view');
                    Array.from(entry.target.querySelectorAll('[data-has-anim]')).forEach(el => el.style.animationPlayState = 'paused');
                    if (prev) {
                        if (prev.dataset.hasAnim) prev.style.animationPlayState = 'paused';
                        Array.from(prev.querySelectorAll('[data-has-anim]')).forEach(el => el.style.animationPlayState = 'paused');
                    }

                    // collapse progress bars when section is out of view so they animate again on re-entry
                    Array.from(entry.target.querySelectorAll('.progress-bar')).forEach(bar => {
                        bar.style.width = '0%';
                    });
                }
            });
        }, observerOptions);

        sections.forEach(sec => observer.observe(sec));

        // initial check (in case page loaded with a hash)
        if (location.hash) scrollToTarget(location.hash);
});


