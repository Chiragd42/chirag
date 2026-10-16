/* ============================================
   LENIS SMOOTH SCROLL
   ============================================ */
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
});

lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

/* ============================================
   CUSTOM CURSOR
   ============================================ */
const cursor = document.querySelector('.cursor');
const follower = document.querySelector('.cursor-follower');

if (cursor && follower && window.innerWidth > 768) {
    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursor.style.left = mouseX - 4 + 'px';
        cursor.style.top = mouseY - 4 + 'px';
    });

    function animateFollower() {
        followerX += (mouseX - followerX) * 0.12;
        followerY += (mouseY - followerY) * 0.12;
        follower.style.left = followerX - 20 + 'px';
        follower.style.top = followerY - 20 + 'px';
        requestAnimationFrame(animateFollower);
    }
    animateFollower();

    // Expand cursor on interactive elements
    const interactives = document.querySelectorAll('a, button, .project-card, .skill-tag');
    interactives.forEach((el) => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('active');
            follower.classList.add('active');
        });
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('active');
            follower.classList.remove('active');
        });
    });
}

/* ============================================
   PAGE LOADER
   ============================================ */
window.addEventListener('load', () => {
    const tl = gsap.timeline();

    tl.to('.loader', {
        yPercent: -100,
        duration: 0.8,
        ease: 'power4.inOut',
        delay: 0.4,
    })
    .set('.loader', { display: 'none' })
    .call(initAnimations);
});

/* ============================================
   HERO TEXT SPLIT
   ============================================ */
function splitText(element) {
    const text = element.textContent;
    element.innerHTML = '';

    text.split('').forEach((char) => {
        const span = document.createElement('span');
        span.classList.add('char');
        span.textContent = char === ' ' ? '\u00A0' : char;
        element.appendChild(span);
    });
}

/* ============================================
   ENCRYPTED TEXT REVEAL
   ============================================ */
function encryptedTextReveal(element, options = {}) {
    const text = options.text || element.textContent;
    const revealDelayMs = options.revealDelayMs || 50;
    const scrambleSpeed = options.scrambleSpeed || 30;
    const onComplete = options.onComplete || null;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*<>[]{}~';

    const length = text.length;
    let revealed = 0;

    // Build span structure — start fully scrambled
    element.innerHTML = '';
    element.style.opacity = '1';
    element.style.transform = 'none';

    const spans = [];
    for (let i = 0; i < length; i++) {
        const span = document.createElement('span');
        span.style.display = 'inline-block';

        if (text[i] === ' ') {
            span.innerHTML = '&nbsp;';
            span.classList.add('revealed-char');
        } else {
            span.textContent = chars[Math.floor(Math.random() * chars.length)];
            span.classList.add('encrypted-char');
        }
        element.appendChild(span);
        spans.push(span);
    }

    // Continuously scramble unrevealed characters
    const scrambleInterval = setInterval(() => {
        for (let i = revealed; i < length; i++) {
            if (text[i] !== ' ') {
                spans[i].textContent = chars[Math.floor(Math.random() * chars.length)];
            }
        }
    }, scrambleSpeed);

    // Reveal characters one by one (left to right)
    const revealInterval = setInterval(() => {
        if (revealed >= length) {
            clearInterval(revealInterval);
            clearInterval(scrambleInterval);
            if (onComplete) onComplete();
            return;
        }

        if (text[revealed] !== ' ') {
            spans[revealed].textContent = text[revealed];
            spans[revealed].classList.remove('encrypted-char');
            spans[revealed].classList.add('revealed-char');
        }
        revealed++;
    }, revealDelayMs);

    return length * revealDelayMs; // total duration in ms
}

/* ============================================
   INIT ALL ANIMATIONS
   ============================================ */
function initAnimations() {
    // --- Navbar fade in ---
    gsap.to('.navbar', {
        opacity: 1,
        duration: 0.6,
        ease: 'power3.out',
    });

    // --- Hero entrance sequence ---
    const heroName = document.querySelector('.hero-name');

    gsap.to('.hero-portrait', {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.9,
        ease: 'back.out(1.45)',
    });

    // Greeting fades in first
    gsap.to('.hero-greeting', {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        delay: 0.12,
    });

    // Hero name decrypts character-by-character
    setTimeout(() => {
        if (heroName) {
            encryptedTextReveal(heroName, {
                revealDelayMs: 55,
                scrambleSpeed: 30,
            });
        }
    }, 400);

    // Role and tagline fade in while name is still revealing
    setTimeout(() => {
        gsap.to('.hero-role', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' });
    }, 1000);

    setTimeout(() => {
        gsap.to('.hero-tagline', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' });
    }, 1200);

    setTimeout(() => {
        gsap.to('.scroll-indicator', { opacity: 1, duration: 0.8, ease: 'power3.out' });
    }, 1400);

    // --- Parallax gradient orbs ---
    gsap.to('.orb-1', {
        y: -100,
        scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 1,
        },
    });

    gsap.to('.orb-2', {
        y: -150,
        x: 50,
        scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 1,
        },
    });

    gsap.to('.orb-3', {
        y: -80,
        scale: 1.3,
        scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 1,
        },
    });

    // --- Section header reveals ---
    document.querySelectorAll('.section-header').forEach((header) => {
        const number = header.querySelector('.section-number');
        const title = header.querySelector('.section-title');

        if (number) {
            gsap.from(number, {
                opacity: 0,
                x: -30,
                duration: 0.8,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: header,
                    start: 'top 80%',
                    toggleActions: 'play none none reverse',
                },
            });
        }

        if (title) {
            const titleText = title.textContent;
            title.style.opacity = '0';

            ScrollTrigger.create({
                trigger: header,
                start: 'top 80%',
                once: true,
                onEnter: () => {
                    encryptedTextReveal(title, {
                        text: titleText,
                        revealDelayMs: 30,
                        scrambleSpeed: 25,
                    });
                },
            });
        }
    });

    // --- Interactive project cards (staggered) ---
    gsap.from('.project-showcase-card', {
        opacity: 0,
        y: 45,
        duration: 0.8,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: '.project-showcase',
            start: 'top 75%',
            toggleActions: 'play none none reverse',
        },
    });

    // --- Open channel ---
    gsap.from('.open-channel-copy', {
        opacity: 0,
        y: 55,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: '.open-channel',
            start: 'top 70%',
            toggleActions: 'play none none reverse',
        },
    });
}

/* ============================================
   EXPANDABLE PROJECT CARDS
   ============================================ */
const projectData = [
    {
        title: 'Human–Robot Teleoperation',
        description: 'Turning human movement into intuitive, real-time robot control',
        tag: 'ROS 2 · C++ · Xsens',
        link: '#',
        content: 'A research system for human–robot teleoperation built around real-time motion capture, calibration, coordinate transforms, and ROS 2 communication. The work focuses on making robot control feel direct and understandable while keeping the underlying pipeline reliable enough for live experiments.',
    },
    {
        title: 'Sign Language Assistive System',
        description: 'Gesture recognition connected with speech and text in one pipeline',
        tag: 'OpenCV · MediaPipe · ML',
        link: '#',
        content: 'A computer-vision assistive system that recognizes hand gestures and connects the result to speech and text output. The project combines landmark tracking, gesture classification, and interface design into a responsive workflow intended to make communication more accessible.',
    },
    {
        title: 'Parking Digital Twin',
        description: 'A live cloud model for parking occupancy and predictive insight',
        tag: 'ESP8266 · MQTT · AWS',
        link: '#',
        content: 'An IoT parking system that streams occupancy signals from connected sensors through MQTT into an AWS-backed digital twin. It provides a live view of space availability and creates a foundation for monitoring patterns and predicting demand.',
    },
];

const cardOverlay = document.getElementById('card-overlay');
const cardModalWrapper = document.getElementById('card-modal-wrapper');
const cardModal = document.getElementById('card-modal');
const cardModalClose = document.getElementById('card-modal-close');

function openCardModal(index) {
    const project = projectData[index];
    if (!project) return;

    document.getElementById('card-modal-tag').textContent = project.tag;
    document.getElementById('card-modal-title').textContent = project.title;
    document.getElementById('card-modal-desc').textContent = project.description;
    document.getElementById('card-modal-content').textContent = project.content;

    const cta = document.getElementById('card-modal-cta');
    cta.href = project.link;
    cta.style.display = project.link === '#' ? 'none' : 'inline-block';

    cardOverlay.classList.add('active');
    cardModalWrapper.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCardModal() {
    cardOverlay.classList.remove('active');
    cardModalWrapper.classList.remove('active');
    document.body.style.overflow = '';
}

// Open on card click
document.querySelectorAll('.project-showcase-card').forEach((card) => {
    card.addEventListener('click', () => {
        openCardModal(parseInt(card.dataset.index, 10));
    });
});

// Close on overlay click, close button, or Escape
if (cardOverlay) cardOverlay.addEventListener('click', closeCardModal);
if (cardModalClose) cardModalClose.addEventListener('click', closeCardModal);

// Prevent clicks inside modal from closing it
if (cardModal) cardModal.addEventListener('click', (e) => e.stopPropagation());
if (cardModalWrapper) {
    cardModalWrapper.addEventListener('click', closeCardModal);
}

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeCardModal();
});

/* ============================================
   MOBILE MENU TOGGLE
   ============================================ */
const navToggle = document.querySelector('.nav-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
const mobileLinks = document.querySelectorAll('.mobile-link');

if (navToggle) {
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });
}

mobileLinks.forEach((link) => {
    link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
    });
});

/* ============================================
   SMOOTH SCROLL FOR NAV LINKS
   ============================================ */
document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href === '#') return;
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
            lenis.scrollTo(target, { offset: -80 });
        }
    });
});

/* ============================================
   TECHNOLOGY DOCK — macOS Magnification
   ============================================ */
(function () {
    const icons = document.querySelectorAll('.dock-item');
    const dock = document.getElementById('skill-dock');
    if (!dock || !icons.length) return;

    const min = 60;
    const max = 120;
    const bound = min * Math.PI;

    gsap.set(icons, { transformOrigin: '50% 100%', height: 48 });
    gsap.set(dock, { position: 'relative', height: 60 });

    dock.addEventListener('mousemove', function (event) {
        const offset = dock.getBoundingClientRect().left + icons[0].offsetLeft;
        const pointer = event.clientX - offset;

        icons.forEach((icon, index) => {
            const distance = (index * min + min / 2) - pointer;
            let x = 0;
            let scale = 1;

            if (-bound < distance && distance < bound) {
                const radians = distance / min * 0.5;
                scale = 1 + (max / min - 1) * Math.cos(radians);
                x = 2 * (max - min) * Math.sin(radians);
            } else {
                x = (distance > 0 ? 2 : -2) * (max - min);
            }

            gsap.to(icon, { duration: 0.3, x, scale });
        });
    });

    dock.addEventListener('mouseleave', function () {
        gsap.to(icons, { duration: 0.3, scale: 1, x: 0 });
    });
})();
