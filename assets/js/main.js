(() => {
    'use strict';

    const email = 'chiragdabhere@gmail.com';
    const body = document.body;
    const header = document.getElementById('site-header');
    const menuToggle = document.getElementById('menu-toggle');
    const navigation = document.getElementById('primary-nav');
    const dialog = document.getElementById('project-dialog');
    const dialogClose = document.getElementById('dialog-close');
    const scrollLocks = new Set();
    let previousOverflow = '';
    let lastProjectTrigger = null;

    function setScrollLock(source, locked) {
        if (locked && !scrollLocks.size) previousOverflow = body.style.overflow;
        if (locked) scrollLocks.add(source);
        else scrollLocks.delete(source);
        body.style.overflow = scrollLocks.size ? 'hidden' : previousOverflow;
    }

    function setMenu(open, returnFocus = false) {
        if (!menuToggle || !navigation) return;
        menuToggle.setAttribute('aria-expanded', String(open));
        menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
        navigation.classList.toggle('is-open', open);
        body.classList.toggle('menu-open', open);
        setScrollLock('menu', open);
        if (returnFocus) menuToggle.focus({ preventScroll: true });
    }

    if (menuToggle && navigation) {
        menuToggle.addEventListener('click', () => {
            setMenu(menuToggle.getAttribute('aria-expanded') !== 'true');
        });

        navigation.querySelectorAll('a[href^="#"]').forEach((link) => {
            link.addEventListener('click', () => setMenu(false));
        });

        navigation.addEventListener('focusout', (event) => {
            if (event.relatedTarget && !navigation.contains(event.relatedTarget) &&
                event.relatedTarget !== menuToggle) setMenu(false);
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && body.classList.contains('menu-open')) {
                setMenu(false, true);
            }
        });

        document.addEventListener('click', (event) => {
            if (body.classList.contains('menu-open') &&
                !navigation.contains(event.target) && !menuToggle.contains(event.target)) {
                setMenu(false);
            }
        });

        window.addEventListener('resize', () => {
            if (window.getComputedStyle(menuToggle).display === 'none') setMenu(false);
        }, { passive: true });
    }

    let scrollFrame = false;
    function updateHeader() {
        if (header) header.classList.toggle('is-scrolled', window.scrollY > 24);
        scrollFrame = false;
    }
    updateHeader();
    window.addEventListener('scroll', () => {
        if (!scrollFrame) {
            scrollFrame = true;
            window.requestAnimationFrame(updateHeader);
        }
    }, { passive: true });

    const navLinks = Array.from(document.querySelectorAll('.nav-link[href^="#"]'));
    const sections = navLinks.map((link) => document.getElementById(link.hash.slice(1))).filter(Boolean);

    function setCurrentSection(id) {
        navLinks.forEach((link) => {
            if (link.hash === `#${id}`) link.setAttribute('aria-current', 'location');
            else link.removeAttribute('aria-current');
        });
    }

    if ('IntersectionObserver' in window && sections.length) {
        const visibleSections = new Set();
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) visibleSections.add(entry.target);
                else visibleSections.delete(entry.target);
            });
            const current = Array.from(visibleSections).sort((a, b) =>
                Math.abs(a.getBoundingClientRect().top) - Math.abs(b.getBoundingClientRect().top)
            )[0];
            setCurrentSection(current ? current.id : '');
        }, { rootMargin: '-15% 0px -45% 0px', threshold: 0 });
        sections.forEach((section) => sectionObserver.observe(section));
    }

    const projects = {
        teleoperation: {
            index: 'I',
            category: 'Robotics',
            title: 'Human–Robot Teleoperation',
            intro: 'Robot control using live human motion-capture data.',
            tags: ['ROS 2', 'C++', 'Xsens'],
            sections: [
                ['What it does', 'Connects Xsens motion capture to a robot through ROS 2.'],
                ['Technical work', 'Calibration, coordinate transforms, and C++ communication between the motion-capture and robot-control systems.'],
            ],
        },
        'sign-language': {
            index: 'II',
            category: 'Computer vision',
            title: 'Sign Language Assistive System',
            intro: 'Hand-gesture recognition with speech and text output.',
            tags: ['OpenCV', 'MediaPipe', 'Machine learning'],
            sections: [
                ['What it does', 'Recognizes hand gestures and converts the results to speech and text.'],
                ['Technical work', 'Hand-landmark tracking with OpenCV and MediaPipe, gesture classification, and an output interface.'],
            ],
        },
        parking: {
            index: 'III',
            category: 'Internet of things',
            title: 'Parking Digital Twin',
            intro: 'A digital model of parking occupancy, updated by sensors.',
            tags: ['ESP8266', 'MQTT', 'AWS'],
            sections: [
                ['What it does', 'Shows parking-space availability using live occupancy data.'],
                ['Technical work', 'ESP8266 sensors send occupancy updates over MQTT to an AWS-backed digital twin.'],
            ],
        },
    };

    function setDialogText(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    }

    function openProject(key, trigger) {
        const project = projects[key];
        if (!dialog || !project || typeof dialog.showModal !== 'function') return;
        const dialogBody = document.getElementById('dialog-body');
        if (!dialogBody) return;

        setDialogText('dialog-index', project.index);
        setDialogText('dialog-category', project.category);
        setDialogText('dialog-title', project.title);
        setDialogText('dialog-intro', project.intro);
        dialogBody.replaceChildren();

        project.sections.forEach(([title, content]) => {
            const section = document.createElement('section');
            section.className = 'dialog-section';
            const heading = document.createElement('h3');
            heading.textContent = title;
            const paragraph = document.createElement('p');
            paragraph.textContent = content;
            section.append(heading, paragraph);
            dialogBody.append(section);
        });

        const tags = document.createElement('div');
        tags.className = 'dialog-tags';
        tags.setAttribute('aria-label', 'Technologies');
        project.tags.forEach((tag) => {
            const item = document.createElement('span');
            item.textContent = tag;
            tags.append(item);
        });
        dialogBody.append(tags);

        const contact = document.getElementById('dialog-contact');
        if (contact) contact.href = `mailto:${email}?subject=${encodeURIComponent(`Let's talk about ${project.title}`)}`;

        lastProjectTrigger = trigger;
        setMenu(false);
        dialog.showModal();
        dialog.scrollTop = 0;
        setScrollLock('dialog', true);
        if (dialogClose) dialogClose.focus({ preventScroll: true });
    }

    document.querySelectorAll('[data-project]').forEach((trigger) => {
        trigger.addEventListener('click', (event) => {
            if (!projects[trigger.dataset.project]) return;
            event.preventDefault();
            openProject(trigger.dataset.project, trigger);
        });
    });

    if (dialog) {
        if (dialogClose) dialogClose.addEventListener('click', () => dialog.close());

        dialog.addEventListener('click', (event) => {
            if (event.target !== dialog) return;
            const bounds = dialog.getBoundingClientRect();
            const outside = event.clientX < bounds.left || event.clientX > bounds.right ||
                event.clientY < bounds.top || event.clientY > bounds.bottom;
            if (outside) dialog.close();
        });

        dialog.addEventListener('close', () => {
            setScrollLock('dialog', false);
            if (lastProjectTrigger && lastProjectTrigger.isConnected) {
                lastProjectTrigger.focus({ preventScroll: true });
            }
            lastProjectTrigger = null;
        });
    }

    document.querySelectorAll('[data-copy-email]').forEach((button) => {
        const label = button.querySelector('[data-copy-label]') || button;
        const initialLabel = label.textContent;
        const status = document.getElementById('copy-status');
        let resetTimer;

        button.addEventListener('click', async () => {
            window.clearTimeout(resetTimer);
            try {
                if (!navigator.clipboard || typeof navigator.clipboard.writeText !== 'function') {
                    throw new Error('Clipboard unavailable');
                }
                await navigator.clipboard.writeText(email);
                label.textContent = 'Email copied';
                if (status) status.textContent = 'Email address copied to clipboard.';
                resetTimer = window.setTimeout(() => {
                    label.textContent = initialLabel;
                    if (status) status.textContent = '';
                }, 3000);
            } catch {
                label.textContent = email;
                if (status) status.textContent = `Copy is unavailable here. Email: ${email}`;
            }
        });
    });

    const revealElements = document.querySelectorAll('.reveal');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if ('IntersectionObserver' in window && !reducedMotion.matches) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            });
        }, { rootMargin: '0px 0px 30px 0px', threshold: 0.08 });
        revealElements.forEach((element) => revealObserver.observe(element));
    } else {
        revealElements.forEach((element) => element.classList.add('is-visible'));
    }

    const year = document.getElementById('year');
    if (year) year.textContent = String(new Date().getFullYear());
})();
