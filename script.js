const playfield = document.getElementById('playfield');
const frame = document.getElementById('frame');
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const restartBtn = document.getElementById('restart-btn');
const scoreEl = document.getElementById('score');
const poppedEl = document.getElementById('popped-count');
const streakEl = document.getElementById('streak');
const timerEl = document.getElementById('timer');
const activeCountEl = document.getElementById('active-count');
const form = document.getElementById('entry-form');
const input = document.getElementById('word-input');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlayDetail = document.getElementById('overlay-detail');
const introOverlay = document.getElementById('intro-overlay');
const introClose = document.getElementById('intro-close');
const mobileOverlay = document.getElementById('mobile-overlay');
const mobileContinue = document.getElementById('mobile-continue');
const pinToggles = document.querySelectorAll('.pin-toggle input');
const themeButtons = document.querySelectorAll('[data-theme]');
const levelButtons = document.querySelectorAll('[data-level]');
const levelDetail = document.getElementById('level-detail');
const heroBox = document.querySelector('.hero');
const statsBox = document.querySelector('.stats');
const controlsBox = document.querySelector('.game-controls');
const THEMES = ['dark', 'light', 'neon', 'citrus', 'crt', 'mint'];
const LEVEL_GUTTER = 150;
const LEVEL_DESCRIPTIONS = {
  1: 'Static words',
  2: 'Words move',
  3: 'UI floats',
  4: 'Bounce rotation',
  5: 'Theme chaos',
};

const WORDS = [
  'orbit', 'pulse', 'flash', 'matrix', 'echo', 'slide', 'glow', 'spark', 'trace', 'drift',
  'storm', 'wave', 'pixel', 'shift', 'flare', 'bounce', 'swift', 'nova', 'comet', 'aura',
  'nexus', 'quark', 'vivid', 'sonic', 'lumen', 'prism', 'glyph', 'rally', 'sprint', 'prime',
  'chase', 'fleet', 'clear', 'bold', 'rapid', 'punch', 'blaze', 'ripple', 'bright', 'shine',
  'racer', 'quick', 'laser', 'hatch', 'tempo', 'rush', 'dodge', 'sparkle', 'tumble', 'sketch',
  'vector', 'cinder', 'ember', 'flick', 'rider', 'streak', 'swirl', 'hustle', 'snap', 'scale',
  'craft', 'thrive', 'climb', 'float', 'pilot', 'atlas', 'rover', 'drone', 'pioneer', 'zenith',
  'flashy', 'ready', 'punchy', 'burst', 'dart', 'fling', 'hover', 'jolt', 'leap', 'loom',
  'loop', 'nudge', 'quiver', 'scout', 'swoop', 'twist', 'vault', 'vortex', 'whirl', 'zip'
];

const state = {
  running: false,
  words: [],
  spawnTimer: null,
  countdownTimer: null,
  timeLeft: 60,
  score: 0,
  popped: 0,
  streak: 0,
  bestStreak: 0,
  nextId: 0,
  lastTick: 0,
  floaters: [],
  theme: 'dark',
  themeCycleTimer: null,
  level: 1,
  rotationEnabled: false,
  mobileDismissed: false,
};

function pickWord() {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

function randomVelocity() {
  const angle = Math.random() * Math.PI * 2;
  const speed = 60 + Math.random() * 140; // pixels per second
  return {
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
  };
}

function setLevel(level) {
  const nextLevel = Math.min(5, Math.max(1, Number(level) || 1));
  state.level = nextLevel;
  state.rotationEnabled = nextLevel >= 4;
  levelButtons.forEach(btn => {
    btn.classList.toggle('active', Number(btn.dataset.level) === nextLevel);
  });
  if (levelDetail) {
    const desc = LEVEL_DESCRIPTIONS[nextLevel] || '';
    levelDetail.textContent = `Level ${nextLevel}: ${desc}`;
  }
  if (state.running) {
    updateThemeCycle();
  }
}

function stopThemeCycle() {
  if (state.themeCycleTimer) {
    clearInterval(state.themeCycleTimer);
    state.themeCycleTimer = null;
  }
}

function updateThemeCycle() {
  stopThemeCycle();
  if (state.running && state.level >= 5) {
    state.themeCycleTimer = setInterval(() => {
      const currentIndex = THEMES.indexOf(state.theme);
      const nextIndex = (currentIndex + 1) % THEMES.length;
      applyTheme(THEMES[nextIndex]);
    }, 1000);
  }
}

function spawnWord() {
  if (!state.running) return;
  const activeTexts = new Set(state.words.map(w => w.text.toLowerCase()));
  const available = WORDS.filter(w => !activeTexts.has(w.toLowerCase()));
  if (!available.length) return;
  const word = available[Math.floor(Math.random() * available.length)];
  const el = document.createElement('span');
  el.className = 'word spawn';
  el.textContent = word;
  const id = state.nextId++;
  el.dataset.id = String(id);
  playfield.appendChild(el);

  const rect = playfield.getBoundingClientRect();
  const { width, height } = el.getBoundingClientRect();
  const maxX = Math.max(0, rect.width - width);
  const maxY = Math.max(0, rect.height - height);
  const x = Math.random() * maxX;
  const y = Math.random() * maxY;
  const { vx, vy } = randomVelocity();

  state.words.push({ id, text: word, x, y, vx, vy, w: width, h: height, el, popped: false, angle: 0, lastBounce: 0 });
  updateWordPosition(state.words[state.words.length - 1]);
  requestAnimationFrame(() => el.classList.remove('spawn'));
  renderCounts();
}

function updateWordPosition(word) {
  word.el.style.transform = `translate(${word.x}px, ${word.y}px) rotate(${word.angle}deg)`;
}

function tick(now) {
  const delta = (now - state.lastTick) / 1000 || 0;
  state.lastTick = now;

  if (state.running && state.level >= 3) {
    updateFloaters(delta, now);
  }

  if (state.running && state.level >= 2) {
    const bounds = playfield.getBoundingClientRect();
    for (const word of state.words) {
      if (word.popped) continue;
      word.x += word.vx * delta;
      word.y += word.vy * delta;
      let bounced = false;

      if (word.x <= 0) {
        word.x = 0;
        word.vx = Math.abs(word.vx);
        bounced = true;
      } else if (word.x + word.w >= bounds.width) {
        word.x = bounds.width - word.w;
        word.vx = -Math.abs(word.vx);
        bounced = true;
      }

      if (word.y <= 0) {
        word.y = 0;
        word.vy = Math.abs(word.vy);
        bounced = true;
      } else if (word.y + word.h >= bounds.height) {
        word.y = bounds.height - word.h;
        word.vy = -Math.abs(word.vy);
        bounced = true;
      }

      if (state.rotationEnabled && bounced) {
        const since = now - (word.lastBounce || 0);
        if (since > 40) {
          word.angle = (word.angle + 90) % 360;
          word.lastBounce = now;
        }
      }

      updateWordPosition(word);
    }
  }

  requestAnimationFrame(tick);
}

function popWord(word) {
  if (!word || word.popped) return;
  word.popped = true;
  word.el.classList.add('popping');
  const gain = word.text.length;
  state.score += gain;
  state.popped += 1;
  state.streak += 1;
  state.bestStreak = Math.max(state.bestStreak, state.streak);
  renderCounts();
  word.el.addEventListener('animationend', () => {
    word.el.remove();
  });
  state.words = state.words.filter(w => w.id !== word.id);
}

function handleInput(value) {
  const target = value.trim().toLowerCase();
  if (!target) return;
  const match = state.words.find(w => w.text.toLowerCase() === target);
  if (match) {
    popWord(match);
  } else {
    state.score -= target.length;
    state.streak = 0;
    renderCounts();
    input.classList.add('shake');
    setTimeout(() => input.classList.remove('shake'), 180);
  }
  input.value = '';
}

function startGame() {
  if (state.running) return;
  hideIntro();
  resetGame();
  state.running = true;
  setLevel(state.level);
  state.timeLeft = 60;
  state.lastTick = performance.now();
  startBtn.disabled = true;
  overlay.classList.add('hidden');
  spawnWord();
  state.spawnTimer = setInterval(spawnWord, 1000);
  state.countdownTimer = setInterval(() => {
    state.timeLeft -= 1;
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      endGame();
    }
    renderCounts();
  }, 1000);
  updateThemeCycle();
  renderCounts();
  input.focus();
  requestAnimationFrame(tick);
}

function stopGame() {
  resetGame();
  startBtn.disabled = false;
  overlay.classList.add('hidden');
}

function endGame() {
  state.running = false;
  clearInterval(state.spawnTimer);
  clearInterval(state.countdownTimer);
  stopThemeCycle();
  state.spawnTimer = null;
  state.countdownTimer = null;
  startBtn.disabled = false;
  overlayTitle.textContent = 'Time!';
  overlayDetail.textContent = `Level ${state.level} | Words: ${state.popped} | Score: ${state.score} | Best streak: ${state.bestStreak}`;
  overlay.classList.remove('hidden');
}

function resetGame() {
  state.running = false;
  clearInterval(state.spawnTimer);
  clearInterval(state.countdownTimer);
  stopThemeCycle();
  state.spawnTimer = null;
  state.countdownTimer = null;
  state.score = 0;
  state.popped = 0;
  state.streak = 0;
  state.bestStreak = 0;
  state.timeLeft = 60;
  state.words.forEach(w => w.el.remove());
  state.words = [];
  renderCounts();
}

function renderCounts() {
  scoreEl.textContent = state.score;
  poppedEl.textContent = state.popped;
  streakEl.textContent = state.streak;
  timerEl.textContent = `${state.timeLeft}s`;
  activeCountEl.textContent = state.words.length;
}

startBtn.addEventListener('click', startGame);
stopBtn.addEventListener('click', stopGame);
restartBtn.addEventListener('click', startGame);

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!state.running) return;
  handleInput(input.value);
});

input.addEventListener('focus', () => {
  if (!state.running) return;
  input.select();
});

window.addEventListener('resize', () => {
  // Keep words within bounds if window shrinks.
  const bounds = playfield.getBoundingClientRect();
  for (const word of state.words) {
    word.x = Math.min(word.x, Math.max(0, bounds.width - word.w));
    word.y = Math.min(word.y, Math.max(0, bounds.height - word.h));
    updateWordPosition(word);
  }

  const vw = Math.max(LEVEL_GUTTER, frame.clientWidth - LEVEL_GUTTER);
  const vh = frame.clientHeight;
  for (const floater of state.floaters) {
    floater.w = floater.el.offsetWidth;
    floater.h = floater.el.offsetHeight;
    floater.x = Math.min(floater.x, Math.max(0, vw - floater.w));
    floater.y = Math.min(floater.y, Math.max(0, vh - floater.h));
    floater.el.style.transform = `translate(${floater.x}px, ${floater.y}px)`;
  }

  checkMobileOverlay();
});

function applyTheme(theme) {
  THEMES.forEach(t => document.body.classList.remove(`theme-${t}`));
  if (THEMES.includes(theme)) {
    document.body.classList.add(`theme-${theme}`);
    state.theme = theme;
  }
  themeButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === theme);
  });
}

function initFloaters() {
  const innerW = Math.max(LEVEL_GUTTER, frame.clientWidth - LEVEL_GUTTER);
  const innerH = frame.clientHeight;
  const entries = [
    { key: 'hero', el: heroBox, anchor: () => ({ x: 20, y: 20 }) },
    {
      key: 'stats',
      el: statsBox,
      anchor: () => {
        const rect = statsBox.getBoundingClientRect();
        return { x: Math.max(20, innerW - rect.width - 20), y: 20 };
      },
    },
    {
      key: 'controls',
      el: controlsBox,
      anchor: () => {
        const rect = controlsBox.getBoundingClientRect();
        return { x: Math.max(20, (innerW - rect.width) / 2), y: innerH - rect.height - 20 };
      },
    },
  ];

  state.floaters = entries.map(entry => {
    const rect = { width: entry.el.offsetWidth, height: entry.el.offsetHeight };
    const { x, y } = entry.anchor();
    const { vx, vy } = randomVelocity();
    return {
      key: entry.key,
      el: entry.el,
      x,
      y,
      w: rect.width,
      h: rect.height,
      vx,
      vy,
      pinned: false,
      angle: 0,
      lastBounce: 0,
    };
  });

  for (const floater of state.floaters) {
    floater.el.style.transform = `translate(${floater.x}px, ${floater.y}px)`;
  }
}

function updateFloaters(delta, now = performance.now()) {
  const bounds = { w: Math.max(LEVEL_GUTTER, frame.clientWidth - LEVEL_GUTTER), h: frame.clientHeight };
  for (const floater of state.floaters) {
    if (floater.pinned) continue;
    floater.w = floater.el.offsetWidth;
    floater.h = floater.el.offsetHeight;

    floater.x += floater.vx * delta;
    floater.y += floater.vy * delta;
    let bounced = false;

    if (floater.x <= 0) {
      floater.x = 0;
      floater.vx = Math.abs(floater.vx);
      bounced = true;
    } else if (floater.x + floater.w >= bounds.w) {
      floater.x = bounds.w - floater.w;
      floater.vx = -Math.abs(floater.vx);
      bounced = true;
    }

    if (floater.y <= 0) {
      floater.y = 0;
      floater.vy = Math.abs(floater.vy);
      bounced = true;
    } else if (floater.y + floater.h >= bounds.h) {
      floater.y = bounds.h - floater.h;
      floater.vy = -Math.abs(floater.vy);
      bounced = true;
    }

    floater.x = Math.min(floater.x, Math.max(0, bounds.w - floater.w));
    floater.y = Math.min(floater.y, Math.max(0, bounds.h - floater.h));

    if (state.rotationEnabled && bounced) {
      const since = now - (floater.lastBounce || 0);
      if (since > 40) {
        floater.angle = (floater.angle + 90) % 360;
        floater.lastBounce = now;
      }
    }

    floater.el.style.transform = `translate(${floater.x}px, ${floater.y}px) rotate(${floater.angle}deg)`;
  }
}

pinToggles.forEach(toggle => {
  toggle.addEventListener('change', () => {
    const key = toggle.dataset.floater;
    const floater = state.floaters.find(f => f.key === key);
    if (floater) {
      floater.pinned = toggle.checked;
    }
  });
});

themeButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    applyTheme(btn.dataset.theme);
  });
});

levelButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    setLevel(btn.dataset.level);
  });
});

function checkMobileOverlay() {
  if (!mobileOverlay || state.mobileDismissed) return;
  const smallSide = Math.min(window.innerWidth, window.innerHeight);
  if (smallSide < 720) {
    mobileOverlay.classList.remove('hidden');
  } else {
    mobileOverlay.classList.add('hidden');
  }
}

if (mobileContinue) {
  mobileContinue.addEventListener('click', () => {
    state.mobileDismissed = true;
    mobileOverlay.classList.add('hidden');
  });
}

initFloaters();
applyTheme(state.theme);
setLevel(state.level);
checkMobileOverlay();
state.lastTick = performance.now();
requestAnimationFrame(tick);

function hideIntro() {
  if (introOverlay) {
    introOverlay.classList.add('hidden');
  }
}

if (introClose) {
  introClose.addEventListener('click', hideIntro);
}
