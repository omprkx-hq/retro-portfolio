/* ═══════════════════════════════════════════════════════════════
   OMPRAKASH SAHOO — Retro Game Portfolio
   script.js — High-end Smooth Scroll & Interaction Engine
   ═══════════════════════════════════════════════════════════════ */
'use strict';

/* ── 1. THEME TOGGLE WITH SMOOTH WIPE ───────────────────────── */
const html        = document.documentElement;
const themeToggle = document.getElementById('themeToggle');

// Inject the pixel-wipe overlay into the DOM once
const wipeEl = document.createElement('div');
wipeEl.id = 'theme-wipe';
const COLS = 12, ROWS = 12;
for (let i = 0; i < COLS * ROWS; i++) {
  const cell = document.createElement('div');
  cell.className = 'wipe-cell';
  wipeEl.appendChild(cell);
}
document.body.appendChild(wipeEl);

const saved = localStorage.getItem('p1-theme') || 'dark';
html.setAttribute('data-theme', saved);

function spawnStars(x, y) {
  const count = 8;
  for (let i = 0; i < count; i++) {
    const s = document.createElement('span');
    s.className = 'star-burst';
    s.textContent = ['★','✦','✧','☆','·'][i % 5];
    const angle = (i / count) * 2 * Math.PI;
    const dist  = 60 + Math.random() * 40;
    s.style.cssText = `left:${x}px;top:${y}px;--tx:${Math.cos(angle)*dist}px;--ty:${Math.sin(angle)*dist}px;animation-delay:${i*0.03}s`;
    document.body.appendChild(s);
    s.addEventListener('animationend', () => s.remove());
  }
}

function spawnRays(x, y) {
  const count = 8;
  for (let i = 0; i < count; i++) {
    const r = document.createElement('div');
    r.className = 'ray-burst';
    const angle = (i / count) * 360;
    const len   = 24 + Math.random() * 16;
    r.style.cssText = `left:${x}px;top:${y}px;height:${len}px;--angle:${angle}deg;animation-delay:${i*0.02}s`;
    document.body.appendChild(r);
    r.addEventListener('animationend', () => r.remove());
  }
}

function pixelWipeIn(cells, onMid) {
  return new Promise(resolve => {
    const diag = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const d = c + r;
        if (!diag[d]) diag[d] = [];
        diag[d].push(cells[r * COLS + c]);
      }
    }
    const maxD   = (ROWS - 1) + (COLS - 1);
    const step   = 28;
    let midCalled = false;

    diag.forEach((group, d) => {
      setTimeout(() => {
        group.forEach(cell => {
          cell.style.animation = 'none';
          cell.style.transform = 'scale(1)';
          cell.style.borderRadius = '0';
        });
        if (d >= Math.floor(maxD / 2) && !midCalled) {
          midCalled = true;
          onMid();
        }
        if (d === maxD) {
          setTimeout(resolve, 80);
        }
      }, d * step);
    });
  });
}

function pixelWipeOut(cells) {
  return new Promise(resolve => {
    const diag = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const d = c + r;
        if (!diag[d]) diag[d] = [];
        diag[d].push(cells[r * COLS + c]);
      }
    }
    const maxD = (ROWS - 1) + (COLS - 1);
    const step = 20;
    diag.forEach((group, d) => {
      setTimeout(() => {
        group.forEach(cell => {
          cell.style.animation = 'cellHide 0.15s ease-in forwards';
        });
        if (d === maxD) setTimeout(resolve, 200);
      }, d * step);
    });
  });
}

let isAnimating = false;

themeToggle.addEventListener('click', async () => {
  if (isAnimating) return;
  isAnimating = true;

  const isDark  = html.getAttribute('data-theme') === 'dark';
  const next    = isDark ? 'light' : 'dark';
  const rect    = themeToggle.getBoundingClientRect();
  const cx      = rect.left + rect.width  / 2;
  const cy      = rect.top  + rect.height / 2;

  themeToggle.classList.remove('ripple');
  void themeToggle.offsetWidth;
  themeToggle.classList.add('ripple');

  const icon = themeToggle.querySelector(isDark ? '.icon-sun' : '.icon-moon');
  icon.classList.remove('animate');
  void icon.offsetWidth;
  icon.classList.add('animate');
  icon.addEventListener('animationend', () => icon.classList.remove('animate'), { once: true });

  if (next === 'dark') spawnStars(cx, cy);
  else                 spawnRays(cx, cy);

  const cells = Array.from(wipeEl.querySelectorAll('.wipe-cell'));
  wipeEl.style.opacity = '1';
  wipeEl.style.visibility = 'visible';
  cells.forEach(c => { c.style.transform = 'scale(0)'; c.style.animation = 'none'; });

  await pixelWipeIn(cells, () => {
    html.setAttribute('data-theme', next);
    localStorage.setItem('p1-theme', next);
  });

  await pixelWipeOut(cells);

  wipeEl.style.opacity = '0';
  wipeEl.style.visibility = 'hidden';
  cells.forEach(c => { c.style.transform = 'scale(0)'; c.style.animation = 'none'; });

  themeToggle.classList.remove('ripple');
  isAnimating = false;
});

/* ── 2. BUTTER-SMOOTH INERTIAL SCROLL (Lenis Engine) ─────────── */
let lenis = null;
if (typeof Lenis !== 'undefined') {
  lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    touchMultiplier: 1.5,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
}

// Smooth scroll on anchor link clicks
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const targetId = anchor.getAttribute('href');
    if (!targetId || targetId === '#') return;
    const targetEl = document.querySelector(targetId);
    if (targetEl) {
      e.preventDefault();
      if (lenis) {
        lenis.scrollTo(targetEl, { offset: -60, duration: 1.2 });
      } else {
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });
});

/* ── 3. SCROLL-DRIVEN PARALLAX & HUD PROGRESS ────────────────── */
const hud = document.getElementById('hud');
const hudChapter = document.getElementById('hudChapter');
const hudProgressLine = document.getElementById('hudProgressLine');
const heroWrap = document.querySelector('.hero-wrap');
const heroScrollCue = document.getElementById('heroScrollCue');
const watermarks = document.querySelectorAll('.section-watermark');

const chapterNames = {
  hero:     'LVL 01 // INTRO',
  about:    'LVL 02 // PROFILE',
  skills:   'LVL 03 // POWER-UPS',
  projects: 'LVL 04 // LEVELS',
  contact:  'LVL 05 // TRANSMIT'
};

function onScrollFrame(scrollY) {
  // Scrolled HUD styling
  hud.classList.toggle('scrolled', scrollY > 30);

  // Top progress line (0% to 100%)
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  if (maxScroll > 0 && hudProgressLine) {
    const pct = Math.min(100, Math.max(0, (scrollY / maxScroll) * 100));
    hudProgressLine.style.width = `${pct}%`;
  }

  // Hero parallax drift and fade
  if (heroWrap) {
    if (scrollY < 600) {
      const heroY = scrollY * 0.32;
      const heroOpacity = Math.max(0, 1 - (scrollY / 450));
      heroWrap.style.transform = `translate3d(0, ${heroY.toFixed(1)}px, 0)`;
      heroWrap.style.opacity = heroOpacity.toFixed(2);
    }
  }

  // Fade out hero scroll cue
  if (heroScrollCue) {
    if (scrollY > 40) {
      heroScrollCue.style.opacity = '0';
      heroScrollCue.style.pointerEvents = 'none';
    } else {
      heroScrollCue.style.opacity = '0.8';
      heroScrollCue.style.pointerEvents = 'auto';
    }
  }

  // Section watermarks subtle parallax
  watermarks.forEach(wm => {
    const parent = wm.closest('section');
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      const speed = parseFloat(wm.getAttribute('data-speed') || '0.12');
      const offset = (window.innerHeight - rect.top) * speed;
      wm.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
    }
  });
}

// Hook into Lenis or native scroll
if (lenis) {
  lenis.on('scroll', ({ scroll }) => onScrollFrame(scroll));
} else {
  window.addEventListener('scroll', () => onScrollFrame(window.scrollY), { passive: true });
}
onScrollFrame(window.scrollY);

/* ── 4. DYNAMIC CHAPTER TRACKER (Intersection Observer) ──────── */
const sectionElements = document.querySelectorAll('section[id]');
const chapterObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        if (hudChapter && chapterNames[id]) {
          hudChapter.textContent = chapterNames[id];
        }
        document.querySelectorAll('.hud-links a').forEach(a => {
          a.classList.toggle('nav-active', a.getAttribute('href') === `#${id}`);
        });
      }
    });
  },
  { rootMargin: '-30% 0px -40% 0px' }
);
sectionElements.forEach(sec => chapterObserver.observe(sec));

/* ── 5. SCORE COUNTER (Game HUD effect) ──────────────────────── */
const scoreEl = document.getElementById('scoreDisplay');
let score = 0;
const targetScore = 142857;
const dur = 2000;
const start = performance.now();

function animScore(ts) {
  const p = Math.min((ts - start) / dur, 1);
  const e = 1 - Math.pow(1 - p, 3);
  score = Math.round(targetScore * e);
  scoreEl.textContent = String(score).padStart(6, '0');
  if (p < 1) requestAnimationFrame(animScore);
}
requestAnimationFrame(animScore);

/* ── 6. MOBILE HAMBURGER ─────────────────────────────────────── */
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger.addEventListener('click', () => {
  const open = mobileMenu.classList.toggle('open');
  hamburger.classList.toggle('open', open);
  hamburger.setAttribute('aria-expanded', String(open));
});

document.querySelectorAll('.mob-link').forEach(link =>
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    hamburger.classList.remove('open');
  })
);

/* ── 7. SCROLL REVEALS ───────────────────────────────────────── */
const reveals = document.querySelectorAll('.reveal');
const revealObs = new IntersectionObserver(
  entries => entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObs.unobserve(e.target);
    }
  }),
  { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
);
reveals.forEach(el => revealObs.observe(el));

/* ── 8. HP/XP BAR FILL ANIMATION ────────────────────────────── */
document.querySelectorAll('.bar-fill').forEach(bar => {
  const target = bar.style.getPropertyValue('--w');
  bar.style.setProperty('--w', '0%');

  const barObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        setTimeout(() => bar.style.setProperty('--w', target), 160);
        barObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.4 });
  barObs.observe(bar);
});

/* ── 9. CONTACT FORM ─────────────────────────────────────────── */
const form     = document.getElementById('contactForm');
const formNote = document.getElementById('formNote');

form.addEventListener('submit', e => {
  e.preventDefault();
  const btn = form.querySelector('button[type="submit"] span');
  btn.textContent = '▶ SENDING…';
  form.querySelector('button').disabled = true;

  setTimeout(() => {
    formNote.textContent = '✔ MESSAGE SENT! QUEST ACCEPTED.';
    form.reset();
    btn.textContent = '▶ SEND MESSAGE';
    form.querySelector('button').disabled = false;
    setTimeout(() => { formNote.textContent = ''; }, 5000);
  }, 1200);
});

/* ── 10. KONAMI CODE EASTER EGG ──────────────────────────────── */
const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown',
                'ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
let konamiIdx = 0;

document.addEventListener('keydown', e => {
  if (e.key === KONAMI[konamiIdx]) {
    konamiIdx++;
    if (konamiIdx === KONAMI.length) {
      konamiIdx = 0;
      triggerKonami();
    }
  } else {
    konamiIdx = 0;
  }
});

function triggerKonami() {
  const msg = document.createElement('div');
  msg.style.cssText = `
    position: fixed; top: 50%; left: 50%;
    transform: translate(-50%,-50%);
    font-family: 'Press Start 2P', monospace;
    font-size: clamp(.6rem, 2vw, 1rem);
    background: var(--fg); color: var(--accent-inv);
    padding: 2rem 2.5rem;
    z-index: 9999;
    text-align: center;
    line-height: 2.2;
    border: 3px solid var(--fg-muted);
    box-shadow: 8px 8px 0 var(--fg-muted);
  `;
  msg.innerHTML = '★ CHEAT CODE ACTIVATED ★<br>+30 LIVES ADDED<br>ALL LEVELS UNLOCKED';
  document.body.appendChild(msg);
  setTimeout(() => msg.remove(), 4000);
}
