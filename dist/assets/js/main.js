const body = document.body;
body.classList.add('js');
const menuButton = document.querySelector('.menu-button');
const navigation = document.querySelector('#primary-nav');
const closeMenu = () => {
  menuButton.setAttribute('aria-expanded', 'false');
  navigation.classList.remove('open');
};
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  navigation.classList.toggle('open', open);
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && navigation.classList.contains('open')) {
    closeMenu();
    menuButton.focus();
  }
});
document.addEventListener('click', event => {
  if (!event.target.closest('.site-header')) closeMenu();
});

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const motionButton = document.querySelector('.motion-toggle');
let paused = reducedMotion.matches;
try {
  const savedMotion = localStorage.getItem('portfolio-motion');
  if (savedMotion === 'paused') paused = true;
} catch { /* The page also works when browser storage is unavailable. */ }
const applyMotion = () => {
  body.classList.toggle('motion-paused', paused);
  motionButton.setAttribute('aria-pressed', String(paused));
  motionButton.textContent = paused ? 'Motion paused' : 'Pause motion';
};
motionButton.addEventListener('click', () => {
  paused = !paused;
  applyMotion();
  try { localStorage.setItem('portfolio-motion', paused ? 'paused' : 'running'); } catch {}
});
reducedMotion.addEventListener('change', event => { paused = event.matches; applyMotion(); });
applyMotion();

if ('IntersectionObserver' in window) {
  const artObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => entry.target.classList.toggle('in-view', entry.isIntersecting));
  });
  document.querySelectorAll('.work-art').forEach(art => artObserver.observe(art));
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: .07 });
  document.querySelectorAll('.section-top, .section h2, .work-item, .experience-row, .about-grid, .education').forEach(item => {
    // Leave above-the-fold content visible; reveal only sections farther down.
    if (item.getBoundingClientRect().top > window.innerHeight && !paused) {
      item.classList.add('reveal-ready');
      revealObserver.observe(item);
    }
  });
}

const poseControl = document.querySelector('#pose-control');
poseControl.addEventListener('input', () => {
  const illustration = document.querySelector('.motion-art');
  illustration.classList.add('interacting');
  illustration.style.setProperty('--pose', poseControl.value + 'deg');
  poseControl.setAttribute('aria-valuetext', poseControl.value + ' degrees');
});

const progress = document.querySelector('.reading-progress');
const sections = [...document.querySelectorAll('main > section[id]')];
const navLinks = [...navigation.querySelectorAll('a')];
let framePending = false;
function updateScroll() {
  const total = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.transform = 'scaleX(' + (total > 0 ? window.scrollY / total : 0) + ')';
  let current = 'home';
  sections.forEach(section => { if (section.getBoundingClientRect().top <= 160) current = section.id; });
  navLinks.forEach(link => {
    if (link.hash === '#' + current) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  framePending = false;
}
window.addEventListener('scroll', () => {
  if (!framePending) { framePending = true; requestAnimationFrame(updateScroll); }
}, { passive: true });
window.addEventListener('resize', updateScroll);
document.querySelectorAll('details').forEach(detail => detail.addEventListener('toggle', updateScroll));
updateScroll();

const visual = document.querySelector('.hero-visual');
visual.addEventListener('pointermove', event => {
  if (paused || event.pointerType !== 'mouse') return;
  const rect = visual.getBoundingClientRect();
  visual.style.setProperty('--px', ((event.clientX - rect.left) / rect.width - .5) * 8 + 'px');
  visual.style.setProperty('--py', ((event.clientY - rect.top) / rect.height - .5) * 8 + 'px');
});
visual.addEventListener('pointerleave', () => {
  visual.style.setProperty('--px', '0px');
  visual.style.setProperty('--py', '0px');
});
document.querySelector('.copy-email').addEventListener('click', async () => {
  const status = document.querySelector('.copy-status');
  try {
    await navigator.clipboard.writeText('chiragdabhere@gmail.com');
    status.textContent = 'Email copied.';
  } catch {
    status.textContent = 'Select the email address below to copy it.';
  }
});
document.querySelector('#year').textContent = new Date().getFullYear();
