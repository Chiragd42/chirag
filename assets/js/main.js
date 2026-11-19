(() => {
  'use strict';

  const projects = {
    teleoperation: {
      count: '01 / 03',
      area: 'Robotics',
      title: 'Human–Robot Teleoperation',
      note: 'I connect Xsens motion capture to a robot through ROS 2. Calibration and coordinate transforms turn a person’s movements into commands the robot can follow.',
      tools: 'Xsens / ROS 2 / C++'
    },
    'sign-language': {
      count: '02 / 03',
      area: 'Computer vision',
      title: 'Sign Language Assistive System',
      note: 'The system tracks landmarks on a hand, classifies the gesture and converts it into speech or text.',
      tools: 'OpenCV / MediaPipe / Machine learning'
    },
    parking: {
      count: '03 / 03',
      area: 'Connected devices',
      title: 'Parking Digital Twin',
      note: 'Parking sensors report which spaces are occupied. An ESP8266 sends those readings over MQTT to a digital model on AWS.',
      tools: 'ESP8266 / MQTT / AWS'
    }
  };

  const pages = [...document.querySelectorAll('[data-page]')];
  const art = document.querySelector('.project-art');
  const email = 'chiragdabhere@gmail.com';
  const links = [...document.querySelectorAll('header a, footer a')];

  function renderPage(moveFocus = false) {
    const [section, slug] = location.hash.slice(1).split('/');
    const active = pages.find(page => page.dataset.page === section) || pages[0];
    const key = Object.hasOwn(projects, slug) ? slug : 'teleoperation';
    const name = active.dataset.page;
    pages.forEach(page => { page.hidden = page !== active; });
    links.forEach(link => {
      const current = link.hash === '#' + name ||
        (name === 'work' && link.hash === '#work/' + key);
      if (current) link.setAttribute('aria-current','page');
      else link.removeAttribute('aria-current');
    });
    if (name === 'work') {
      const project = projects[key];
      for (const field of ['count','area','title','note','tools']) {
        document.getElementById('project-' + field).textContent = project[field];
      }
      document.getElementById('project-mail').href = 'mailto:' + email + '?subject=' + encodeURIComponent(project.title);
      art.dataset.art = key;
    }
    document.title = (name === 'work' ? projects[key].title : active.querySelector('h2')?.textContent || 'Portfolio') + ' — Chirag Dabhere';
    if (moveFocus) {
      const heading = active.querySelector('h1, h2');
      heading.tabIndex = -1;
      heading.focus({preventScroll:true});
    }
  }
  window.addEventListener('hashchange', () => renderPage(true));
  renderPage();

  let clearStatus;
  document.getElementById('copy').addEventListener('click', async () => {
    const status = document.getElementById('copy-status');
    clearTimeout(clearStatus);
    try {
      await navigator.clipboard.writeText(email);
      status.textContent = 'Email copied.';
    } catch {
      status.textContent = 'Select the email address above to copy it.';
    }
    clearStatus = setTimeout(() => { status.textContent = ''; }, 3500);
  });
})();
