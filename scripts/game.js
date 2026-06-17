function spawnWord() {
  if (!state.running) return;
  const available = getWordPool().filter(
    (word) => !state.usedWords.has(word.toLowerCase())
  );
  if (!available.length) return;

  const config = getLevelConfig();
  const word = available[Math.floor(Math.random() * available.length)];
  state.usedWords.add(word.toLowerCase());
  const el = document.createElement("span");
  el.className = "word spawn";
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
  const velocity = config.moves
    ? randomVelocity(config.speedMin, config.speedMax)
    : { vx: 0, vy: 0 };

  state.words.push({
    id,
    text: word,
    x,
    y,
    vx: velocity.vx,
    vy: velocity.vy,
    w: width,
    h: height,
    el,
    popped: false,
    angle: 0,
    scale: 1,
    lastBounce: 0,
  });
  updateWordPosition(state.words[state.words.length - 1]);
  requestAnimationFrame(() => el.classList.remove("spawn"));
  renderCounts();
}

function startAnimationLoop() {
  if (state.animationFrameId !== null) return;
  state.lastTick = performance.now();
  state.animationFrameId = requestAnimationFrame(tick);
}

function tick(now) {
  const delta = (now - state.lastTick) / 1000 || 0;
  state.lastTick = now;
  const config = getLevelConfig();

  if (state.running && config.moves) {
    const bounds = playfield.getBoundingClientRect();
    for (const word of state.words) {
      if (word.popped) continue;
      if (config.chaos) {
        word.angle = (word.angle + config.spinRate * delta) % 360;
        if (Math.random() < config.jitterChance * delta) {
          const velocity = randomVelocity(config.speedMin, config.speedMax);
          word.vx = velocity.vx;
          word.vy = velocity.vy;
          word.scale = 0.86 + Math.random() * 0.34;
        }
      }

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

  state.animationFrameId = requestAnimationFrame(tick);
}

function popWord(word) {
  if (!word || word.popped) return;
  word.popped = true;
  word.el.classList.add("popping");
  const gain = word.text.length;
  state.score += gain;
  state.popped += 1;
  state.streak += 1;
  state.bestStreak = Math.max(state.bestStreak, state.streak);
  word.el.addEventListener("animationend", () => {
    word.el.remove();
  });
  state.words = state.words.filter((w) => w.id !== word.id);
  renderCounts();
}

function handleInput(value) {
  const target = value.trim().toLowerCase();
  if (!target) return;
  const match = state.words.find((w) => w.text.toLowerCase() === target);
  if (match) {
    popWord(match);
  } else {
    state.score -= target.length;
    state.streak = 0;
    renderCounts();
    input.classList.add("shake");
    setTimeout(() => input.classList.remove("shake"), 180);
  }
  input.value = "";
}

function startGame() {
  if (state.running) return;
  const config = getLevelConfig();
  hideConfigOverlay();
  resetGame();
  state.running = true;
  state.rotationEnabled = config.rotates;
  state.timeLeft = state.duration;
  state.lastTick = performance.now();
  stopBtn.disabled = false;
  overlay.classList.add("hidden");
  if (config.chaos) {
    startChaosMode();
  }
  spawnWord();
  state.spawnTimer = setInterval(spawnWord, config.spawnMs);
  state.countdownTimer = setInterval(() => {
    state.timeLeft -= 1;
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      endGame("Time!");
    }
    renderCounts();
  }, 1000);
  renderCounts();
  input.focus();
  startAnimationLoop();
}

function emergencyStopGame() {
  if (!state.running) return;
  endGame("Emergency stop!");
}

function endGame(title) {
  const config = getLevelConfig();
  state.running = false;
  clearInterval(state.spawnTimer);
  clearInterval(state.countdownTimer);
  stopChaosMode();
  state.spawnTimer = null;
  state.countdownTimer = null;
  stopBtn.disabled = true;
  overlayTitle.textContent = title;
  overlayDetail.textContent = `${config.name} run | ${state.duration}s | Score: ${state.score} | Words: ${state.popped} | Best streak: ${state.bestStreak}`;
  overlay.classList.remove("hidden");
  renderCounts();
}

function resetGame() {
  state.running = false;
  clearInterval(state.spawnTimer);
  clearInterval(state.countdownTimer);
  stopChaosMode();
  state.spawnTimer = null;
  state.countdownTimer = null;
  state.score = 0;
  state.popped = 0;
  state.streak = 0;
  state.bestStreak = 0;
  state.timeLeft = state.duration;
  state.words.forEach((w) => w.el.remove());
  state.words = [];
  state.usedWords.clear();
  stopBtn.disabled = true;
  renderCounts();
}

function startChaosMode() {
  document.body.classList.add("chaos-mode");
  state.chaosThemeTimer = setInterval(() => {
    const nextTheme = THEMES[Math.floor(Math.random() * THEMES.length)];
    paintTheme(nextTheme);
  }, 140);
}

function stopChaosMode() {
  if (state.chaosThemeTimer) {
    clearInterval(state.chaosThemeTimer);
    state.chaosThemeTimer = null;
  }
  document.body.classList.remove("chaos-mode");
  applyTheme(state.theme);
}
