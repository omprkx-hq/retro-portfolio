/* ═══════════════════════════════════════════════════════════════
   PLAYER ONE — Retro Game Portfolio
   script.js
   ═══════════════════════════════════════════════════════════════ */
'use strict';

/* ── 1. THEME TOGGLE WITH ANIMATION ─────────────────────────── */
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
  // Staggered diagonal wave reveal
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
    const step   = 28; // ms per diagonal wave
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

  // Ripple ring on button
  themeToggle.classList.remove('ripple');
  void themeToggle.offsetWidth; // reflow
  themeToggle.classList.add('ripple');

  // Icon burst animation
  const icon = themeToggle.querySelector(isDark ? '.icon-sun' : '.icon-moon');
  icon.classList.remove('animate');
  void icon.offsetWidth;
  icon.classList.add('animate');
  icon.addEventListener('animationend', () => icon.classList.remove('animate'), { once: true });

  // Particle burst
  if (next === 'dark') spawnStars(cx, cy);
  else                 spawnRays(cx, cy);

  // Prepare wipe
  const cells = Array.from(wipeEl.querySelectorAll('.wipe-cell'));
  wipeEl.style.opacity = '1';
  wipeEl.style.visibility = 'visible';
  cells.forEach(c => { c.style.transform = 'scale(0)'; c.style.animation = 'none'; });

  await pixelWipeIn(cells, () => {
    // Mid-wipe: switch theme while screen is covered
    html.setAttribute('data-theme', next);
    localStorage.setItem('p1-theme', next);
  });

  // Wipe out
  await pixelWipeOut(cells);

  wipeEl.style.opacity = '0';
  wipeEl.style.visibility = 'hidden';
  cells.forEach(c => { c.style.transform = 'scale(0)'; c.style.animation = 'none'; });

  themeToggle.classList.remove('ripple');
  isAnimating = false;
});

/* ── 2. LENIS SMOOTH MOMENTUM SCROLL (KSEN PANCHENKO SYSTEM) ─── */
let lenis = null;
if (typeof Lenis !== 'undefined') {
  lenis = new Lenis({
    duration: 1.25,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    touchMultiplier: 1.2,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
}

/* ── 3. SCROLL PROGRESS & SUBTLE PARALLAX ────────────────────── */
const progressBar = document.getElementById('scrollProgressBar');
const hud = document.getElementById('hud');
const heroWrap = document.querySelector('.hero-wrap');
const secHeads = document.querySelectorAll('.sec-head');

function handleScroll(scrollPos) {
  // Update hairline reading bar
  const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = totalHeight > 0 ? (scrollPos / totalHeight) * 100 : 0;
  if (progressBar) {
    progressBar.style.width = `${progress}%`;
  }

  // Scrolled navbar blur state
  if (hud) {
    hud.classList.toggle('scrolled', scrollPos > 40);
  }

  // Subtle spatial parallax on hero (gentle drift like ksenpanchenko.com)
  if (heroWrap && scrollPos < window.innerHeight * 1.2) {
    heroWrap.style.transform = `translate3d(0, ${(scrollPos * 0.15).toFixed(1)}px, 0)`;
    heroWrap.style.opacity = String(Math.max(0, 1 - (scrollPos / (window.innerHeight * 0.85))));
  }
}

if (lenis) {
  lenis.on('scroll', (e) => {
    handleScroll(e.scroll);
  });
} else {
  window.addEventListener('scroll', () => handleScroll(window.scrollY), { passive: true });
}

/* ── 4. SMOOTH SCROLL ANCHORS ────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (!href || href === '#') return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      if (lenis) {
        lenis.scrollTo(target, { offset: -70, duration: 1.2 });
      } else {
        target.scrollIntoView({ behavior: 'smooth' });
      }
      if (typeof mobileMenu !== 'undefined') {
        mobileMenu.classList.remove('open');
        hamburger.classList.remove('open');
      }
    }
  });
});

/* ── 5. SCORE COUNTER (cosmetic) ─────────────────────────────── */
const scoreEl = document.getElementById('scoreDisplay');
let score = 0;
const targetScore = 142857;
const dur = 2200;
const start = performance.now();

function animScore(ts) {
  const p = Math.min((ts - start) / dur, 1);
  const e = 1 - Math.pow(1 - p, 3);
  score = Math.round(targetScore * e);
  if (scoreEl) scoreEl.textContent = String(score).padStart(6, '0');
  if (p < 1) requestAnimationFrame(animScore);
}
requestAnimationFrame(animScore);

/* ── 6. HAMBURGER & MOBILE NAV ───────────────────────────────── */
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

if (hamburger && mobileMenu) {
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
}

/* ── 7. STAGGERED SCROLL REVEAL (KSEN PANCHENKO SYSTEM) ───────── */
// Assign staggered delays to child items in grids for cascading entry
document.querySelectorAll('.powerup-grid .powerup').forEach((el, i) => {
  el.style.setProperty('--delay', `${(i * 0.05).toFixed(2)}s`);
});

document.querySelectorAll('.levels-grid .level-card').forEach((el, i) => {
  el.style.setProperty('--delay', `${(i * 0.08).toFixed(2)}s`);
});

const reveals = document.querySelectorAll('.reveal');
const revealObs = new IntersectionObserver(
  entries => entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObs.unobserve(e.target);
    }
  }),
  { threshold: 0.12, rootMargin: '0px 0px -50px 0px' }
);
reveals.forEach(el => revealObs.observe(el));

/* ── 8. HP/XP BAR ANIMATE ON REVEAL ─────────────────────────── */
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

/* ── 9. ACTIVE NAV LINK ON SCROLL ────────────────────────────── */
const sections = document.querySelectorAll('section[id]');
const navObs = new IntersectionObserver(
  entries => entries.forEach(e => {
    if (e.isIntersecting) {
      document.querySelectorAll('.hud-links a').forEach(a =>
        a.classList.toggle(
          'nav-active',
          a.getAttribute('href') === `#${e.target.id}`
        )
      );
    }
  }),
  { rootMargin: '-35% 0px -45% 0px' }
);
sections.forEach(s => navObs.observe(s));

/* ── 10. CONTACT FORM ────────────────────────────────────────── */
const form     = document.getElementById('contactForm');
const formNote = document.getElementById('formNote');

if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"] span');
    if (btn) btn.textContent = '▶ SENDING…';
    const subBtn = form.querySelector('button[type="submit"]');
    if (subBtn) subBtn.disabled = true;

    setTimeout(() => {
      if (formNote) formNote.textContent = '✔ MESSAGE SENT! QUEST ACCEPTED.';
      form.reset();
      if (btn) btn.textContent = '▶ SEND MESSAGE';
      if (subBtn) subBtn.disabled = false;
      setTimeout(() => { if (formNote) formNote.textContent = ''; }, 5000);
    }, 1200);
  });
}

/* ── 11. KONAMI CODE EASTER EGG ──────────────────────────────── */
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
    border: 2px solid var(--border);
    box-shadow: 0 16px 40px rgba(0,0,0,0.5);
  `;
  msg.innerHTML = '★ CHEAT CODE ACTIVATED ★<br>+30 LIVES ADDED<br>ALL LEVELS UNLOCKED';
  document.body.appendChild(msg);
  setTimeout(() => msg.remove(), 4000);
}


