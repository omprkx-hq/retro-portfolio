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

/* ── 2. SCROLLED HUD ─────────────────────────────────────────── */
const hud = document.getElementById('hud');
const onScroll = () => hud.classList.toggle('scrolled', window.scrollY > 40);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ── 3. SCORE COUNTER (cosmetic) ─────────────────────────────── */
const scoreEl = document.getElementById('scoreDisplay');
let score = 0;
const targetScore = 142857; // EDIT: your "score"
const dur = 2200;
const start = performance.now();

function animScore(ts) {
  const p = Math.min((ts - start) / dur, 1);
  // ease-out cubic
  const e = 1 - Math.pow(1 - p, 3);
  score = Math.round(targetScore * e);
  scoreEl.textContent = String(score).padStart(6, '0');
  if (p < 1) requestAnimationFrame(animScore);
}
requestAnimationFrame(animScore);

/* ── 4. HAMBURGER ────────────────────────────────────────────── */
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

/* ── 5. SCROLL REVEAL ────────────────────────────────────────── */
const reveals = document.querySelectorAll('.reveal');
const revealObs = new IntersectionObserver(
  entries => entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObs.unobserve(e.target);
    }
  }),
  { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
);
reveals.forEach(el => revealObs.observe(el));

/* ── 6. HP/XP BAR ANIMATE ON REVEAL ─────────────────────────── */
// Bars start at 0 and fill to their --w value when visible
document.querySelectorAll('.bar-fill').forEach(bar => {
  const target = bar.style.getPropertyValue('--w');
  bar.style.setProperty('--w', '0%');

  const barObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        setTimeout(() => bar.style.setProperty('--w', target), 150);
        barObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });
  barObs.observe(bar);
});

/* ── 7. ACTIVE NAV LINK ──────────────────────────────────────── */
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
  { rootMargin: '-40% 0px -50% 0px' }
);
sections.forEach(s => navObs.observe(s));

/* ── 8. CONTACT FORM ─────────────────────────────────────────── */
const form     = document.getElementById('contactForm');
const formNote = document.getElementById('formNote');

form.addEventListener('submit', e => {
  e.preventDefault();
  const btn = form.querySelector('button[type="submit"] span');
  btn.textContent = '▶ SENDING…';
  form.querySelector('button').disabled = true;

  // Simulate send — replace with fetch/Formspree/EmailJS call
  setTimeout(() => {
    formNote.textContent = '✔ MESSAGE SENT! QUEST ACCEPTED.';
    form.reset();
    btn.textContent = '▶ SEND MESSAGE';
    form.querySelector('button').disabled = false;
    setTimeout(() => { formNote.textContent = ''; }, 5000);
  }, 1300);
});

/* ── 9. RETRO CURSOR TRAIL ───────────────────────────────────── */
// Tiny pixel squares follow the cursor
const trail = [];
const TRAIL_LEN = 8;

for (let i = 0; i < TRAIL_LEN; i++) {
  const dot = document.createElement('div');
  dot.style.cssText = `
    position: fixed; pointer-events: none; z-index: 9999;
    width: 4px; height: 4px;
    background: var(--fg);
    opacity: 0;
    transition: opacity .2s;
    image-rendering: pixelated;
  `;
  document.body.appendChild(dot);
  trail.push({ el: dot, x: 0, y: 0 });
}

let mouseX = 0, mouseY = 0;
document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

let trailFrame;
function animTrail() {
  let x = mouseX, y = mouseY;
  trail.forEach((t, i) => {
    const prev = i === 0 ? { x: mouseX, y: mouseY } : trail[i - 1];
    t.x += (prev.x - t.x) * 0.5;
    t.y += (prev.y - t.y) * 0.5;
    t.el.style.left = `${Math.round(t.x / 4) * 4}px`;
    t.el.style.top  = `${Math.round(t.y / 4) * 4}px`;
    t.el.style.opacity = String(1 - i / TRAIL_LEN);
  });
  trailFrame = requestAnimationFrame(animTrail);
}
animTrail();

// Hide trail on touch devices
if (window.matchMedia('(hover: none)').matches) {
  trail.forEach(t => t.el.remove());
  cancelAnimationFrame(trailFrame);
}

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
    animation: blink .8s step-end 6;
    border: 4px solid var(--fg-muted);
    box-shadow: 8px 8px 0 var(--fg-muted);
  `;
  msg.innerHTML = '★ CHEAT CODE ACTIVATED ★<br>+30 LIVES ADDED<br>ALL LEVELS UNLOCKED';
  document.body.appendChild(msg);
  setTimeout(() => msg.remove(), 4000);
}




