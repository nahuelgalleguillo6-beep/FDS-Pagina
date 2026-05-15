/* ============================================================
   Flor de Sauco — main.js
   ============================================================ */

(function () {
    'use strict';

    const header     = document.getElementById('header');
    const hamburger  = document.getElementById('hamburger');
    const nav        = document.getElementById('nav');
    const backToTop  = document.getElementById('backToTop');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ── Mobile menu ── */
    hamburger.addEventListener('click', function () {
        const isOpen = nav.classList.toggle('open');
        hamburger.classList.toggle('open', isOpen);
        hamburger.setAttribute('aria-expanded', String(isOpen));
        document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    nav.querySelectorAll('.nav__link').forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('open');
            hamburger.classList.remove('open');
            hamburger.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        });
    });

    /* ── Scroll: header shadow + back-to-top ── */
    function onScroll() {
        const y = window.scrollY;
        header.classList.toggle('scrolled', y > 50);
        backToTop.classList.toggle('visible', y > 400);
    }
    window.addEventListener('scroll', onScroll, { passive: true });

    /* ── Back to top ── */
    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    /* ── Menu tabs ── */
    const tabs   = document.querySelectorAll('.menu-tab');
    const panels = document.querySelectorAll('.menu-panel');

    tabs.forEach(tab => {
        tab.addEventListener('click', function () {
            const target = this.dataset.tab;

            tabs.forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            });
            panels.forEach(p => p.classList.remove('active'));

            this.classList.add('active');
            this.setAttribute('aria-selected', 'true');

            const panel = document.getElementById('tab-' + target);
            if (panel) panel.classList.add('active');

            this.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        });
    });

    /* ── Smooth scroll for anchor links ── */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const id = this.getAttribute('href').slice(1);
            if (!id) return;
            const target = document.getElementById(id);
            if (!target) return;
            e.preventDefault();
            const headerH = header.offsetHeight;
            const top = target.getBoundingClientRect().top + window.scrollY - headerH - 16;
            window.scrollTo({ top, behavior: 'smooth' });
        });
    });

    /* ── Intersection Observer: fade-up animations ── */
    const fadeEls = document.querySelectorAll('.fade-up');
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
        );
        fadeEls.forEach(el => observer.observe(el));
    } else {
        fadeEls.forEach(el => el.classList.add('visible'));
    }

    /* ── Active nav link on scroll ── */
    const sections = document.querySelectorAll('main section[id], footer[id]');
    const navLinks = document.querySelectorAll('.nav__link[href^="#"]');

    function updateActiveNav() {
        const scrollMid = window.scrollY + window.innerHeight / 3;
        let current = '';
        sections.forEach(sec => {
            if (sec.offsetTop <= scrollMid) current = sec.id;
        });
        navLinks.forEach(link => {
            const href = link.getAttribute('href').slice(1);
            link.classList.toggle('active', href === current);
        });
    }
    window.addEventListener('scroll', updateActiveNav, { passive: true });

    /* ── Hero Slider ── */
    const slides  = document.querySelectorAll('.hero__slide');
    const dots    = document.querySelectorAll('.hero__dot');
    const prevBtn = document.querySelector('.hero__nav--prev');
    const nextBtn = document.querySelector('.hero__nav--next');

    let currentSlide  = 0;
    let slideInterval = null;
    const SLIDE_DURATION = 6000;

    function goToSlide(idx) {
        slides[currentSlide].classList.remove('is-active');
        dots[currentSlide].classList.remove('is-active');
        dots[currentSlide].setAttribute('aria-selected', 'false');

        currentSlide = (idx + slides.length) % slides.length;

        slides[currentSlide].classList.add('is-active');
        dots[currentSlide].classList.add('is-active');
        dots[currentSlide].setAttribute('aria-selected', 'true');
    }

    function startAutoplay() {
        if (reducedMotion) return; /* respetar prefers-reduced-motion */
        stopAutoplay();
        slideInterval = setInterval(() => goToSlide(currentSlide + 1), SLIDE_DURATION);
    }

    function stopAutoplay() {
        if (slideInterval) { clearInterval(slideInterval); slideInterval = null; }
    }

    if (slides.length) {
        dots.forEach((dot, i) => {
            dot.addEventListener('click', () => { goToSlide(i); startAutoplay(); });
        });

        if (prevBtn) prevBtn.addEventListener('click', () => { goToSlide(currentSlide - 1); startAutoplay(); });
        if (nextBtn) nextBtn.addEventListener('click', () => { goToSlide(currentSlide + 1); startAutoplay(); });

        const heroEl = document.querySelector('.hero');
        heroEl.addEventListener('mouseenter', stopAutoplay);
        heroEl.addEventListener('mouseleave', startAutoplay);

        startAutoplay();
    }

    /* ── Stats counter ── */
    function animateCounter(el) {
        if (reducedMotion) return; /* mostrar valor final directo, ya está en el HTML */

        const target   = parseInt(el.dataset.counter, 10);
        const prefix   = el.dataset.prefix  || '';
        const suffix   = el.dataset.suffix  || '';
        const duration = 1500;
        const start    = performance.now();

        function step(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased    = 1 - Math.pow(1 - progress, 3); /* easeOutCubic */
            const current  = Math.round(target * eased);
            el.textContent = prefix + current + suffix;
            if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }

    const counterEls = document.querySelectorAll('[data-counter]');

    if ('IntersectionObserver' in window && counterEls.length) {
        const counterObs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    counterObs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.4 });

        counterEls.forEach(el => counterObs.observe(el));
    } else {
        /* Sin IntersectionObserver: animar al cargar si no hay reduced-motion */
        counterEls.forEach(el => animateCounter(el));
    }

}());
