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
  const canvas = art.querySelector('canvas');
  const email = 'chiragdabhere@gmail.com';
  const links = [...document.querySelectorAll('header a, footer a')];

  // Each project plate is drawn in the same 400 × 240 coordinate system.
  function drawPlate() {
    const { width, height } = canvas.getBoundingClientRect();
    if (!width || !height) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const scale = Math.min(width / 400, height / 240);
    ctx.scale(ratio, ratio);
    ctx.translate((width - 400 * scale) / 2, (height - 240 * scale) / 2);
    ctx.scale(scale, scale);

    function line(points, weight = 2) {
      ctx.lineWidth = weight;
      ctx.beginPath();
      points.forEach(([x, y], index) => index ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
      ctx.stroke();
    }
    function dot(x, y, radius, hollow = false) {
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      if (hollow) { ctx.lineWidth = 1.3; ctx.stroke(); }
      else ctx.fill();
    }
    const key = art.dataset.art;
    ctx.strokeStyle = ctx.fillStyle = key === 'teleoperation' ? '#fff' : '#191918';
    ctx.globalAlpha = .29;
    for (let x = 20; x <= 380; x += 20) {
      for (let y = 20; y <= 220; y += 20) dot(x, y, .8);
    }
    ctx.globalAlpha = 1;
    if (key === 'teleoperation') {
      const arm = [[104,181],[144,85],[221,113],[272,65]];
      ctx.lineJoin = 'round';
      line(arm, 18);
      line([[75,194],[132,194]], 8);
      line([[264,56],[287,42],[302,52]]);
      line([[279,72],[301,61],[304,52]]);
      for (const [x,y] of arm) {
        dot(x,y,14);
        ctx.fillStyle = '#2943e6';
        dot(x,y,7);
        ctx.fillStyle = '#fff';
      }
      ctx.setLineDash([3,5]);
      line([[104,181],[104,65],[272,65]], 1);
      ctx.setLineDash([]);
    } else if (key === 'sign-language') {
      const fingers = [
        [[178,143],[147,131],[133,113],[118,105]],
        [[179,112],[161,82],[154,63],[148,47]],
        [[201,105],[195,73],[192,51],[190,34]],
        [[224,111],[225,81],[227,61],[228,47]],
        [[242,126],[253,105],[262,90],[271,78]]
      ];
      const wrist = [209,198];
      fingers.forEach(finger => {
        line([wrist,...finger],2.5);
        finger.forEach(([x,y]) => dot(x,y,3.5));
      });
      line(fingers.map(finger => finger[0]),2.5);
      dot(...wrist,5);
    } else {
      const point = (x,y) => [96 + x * 31 + y * 24, 135 - x * 12 + y * 18];
      for (let x = 0; x < 5; x++) {
        for (const y of [0,2]) {
          const bay = [point(x,y),point(x+.9,y),point(x+.9,y+.86),point(x,y+.86)];
          line([...bay,bay[0]],2);
          if ((x + y) % 3 !== 0) ctx.fill();
        }
      }
      ctx.setLineDash([5,5]);
      line([point(-.2,1.45),point(5.1,1.45)],1.5);
    }
  }

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
      drawPlate();
    }
    document.title = (name === 'work' ? projects[key].title : active.querySelector('h2')?.textContent || 'Portfolio') + ' — Chirag Dabhere';
    if (moveFocus) {
      const heading = active.querySelector('h1, h2');
      heading.tabIndex = -1;
      heading.focus({preventScroll:true});
    }
  }
  new ResizeObserver(drawPlate).observe(canvas);
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
