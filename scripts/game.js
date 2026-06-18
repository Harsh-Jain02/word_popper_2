function spawnWord() {
  if (!state.running || state.paused) return;
  const available = getWordPool().filter(
    (word) => !state.usedWords.has(word.toLowerCase())
  );
  const powerChoice = pickPowerUp();
  if (!available.length && !powerChoice) return;

  const config = getLevelConfig();
  const word = powerChoice
    ? powerChoice.word
    : available[Math.floor(Math.random() * available.length)];
  state.usedWords.add(word.toLowerCase());
  const el = document.createElement("span");
  el.className = powerChoice
    ? `word spawn power-word power-${powerChoice.type}`
    : "word spawn";
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
  const speedFactor = state.accessibility ? 0.55 : 1;
  const velocity = config.moves
    ? randomVelocity(config.speedMin * speedFactor, config.speedMax * speedFactor)
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
    powerType: powerChoice ? powerChoice.type : null,
    angle: 0,
    scale: 1,
    mirror: 1,
    lastBounce: 0,
  });
  updateWordPosition(state.words[state.words.length - 1]);
  requestAnimationFrame(() => el.classList.remove("spawn"));
  renderCounts();
}

function pickPowerUp() {
  if (Math.random() > POWER_UP_CHANCE) return null;
  const options = Object.entries(POWER_UPS)
    .filter(([, power]) => !state.usedWords.has(power.word.toLowerCase()));
  if (!options.length) return null;
  const [type, power] = options[Math.floor(Math.random() * options.length)];
  return { type, word: power.word };
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

  if (state.running && !state.paused && config.moves && state.activePower !== "freeze") {
    const bounds = playfield.getBoundingClientRect();
    const movementDelta = state.activePower === "slow" ? delta * 0.42 : delta;
    for (const word of state.words) {
      if (word.popped) continue;
      if (config.chaos) {
        const chaosFactor = state.accessibility ? 0.38 : 1;
        word.angle = (word.angle + config.spinRate * chaosFactor * movementDelta) % 360;
        if (Math.random() < config.jitterChance * chaosFactor * movementDelta) {
          const velocity = randomVelocity(
            config.speedMin * chaosFactor,
            config.speedMax * chaosFactor
          );
          word.vx = velocity.vx;
          word.vy = velocity.vy;
          word.scale = state.accessibility ? 1 : 0.78 + Math.random() * 0.5;
          if (config.chaosTier >= 2 && !state.accessibility) {
            word.mirror = Math.random() > 0.55 ? -1 : 1;
          }
        }
      }

      word.x += word.vx * movementDelta;
      word.y += word.vy * movementDelta;
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
  if (word.powerType) {
    activatePowerUp(word.powerType);
  } else {
    awardWordScore(word);
  }
  removeWordElement(word);
  state.words = state.words.filter((w) => w.id !== word.id);
  renderCounts();
}

function handleInput(value) {
  if (state.paused) return;
  const target = value.trim().toLowerCase();
  if (!target) return;
  state.attempts += 1;
  state.typedChars += target.length;
  const match = state.words.find((w) => w.text.toLowerCase() === target);
  if (match) {
    popWord(match);
  } else {
    registerMiss(target);
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
  pauseBtn.disabled = false;
  pauseBtn.textContent = "Pause";
  overlay.classList.add("hidden");
  if (config.chaos) {
    startChaosMode();
  }
  spawnWord();
  const spawnMs = state.accessibility ? config.spawnMs + 250 : config.spawnMs;
  state.spawnTimer = setInterval(spawnWord, spawnMs);
  state.countdownTimer = setInterval(() => {
    if (state.paused) return;
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

function togglePause() {
  if (!state.running) return;
  state.paused = !state.paused;
  document.body.classList.toggle("paused-mode", state.paused);
  pauseBtn.textContent = state.paused ? "Resume" : "Pause";
  if (state.paused && state.activePower && state.powerTimer) {
    state.powerRemainingMs = Math.max(0, state.powerEndsAt - performance.now());
    clearTimeout(state.powerTimer);
    state.powerTimer = null;
  }
  if (!state.paused) {
    if (state.activePower && state.powerRemainingMs > 0) {
      state.powerEndsAt = performance.now() + state.powerRemainingMs;
      state.powerTimer = setTimeout(clearActivePower, state.powerRemainingMs);
      state.powerRemainingMs = 0;
    }
    state.lastTick = performance.now();
    input.focus();
  }
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
  pauseBtn.disabled = true;
  pauseBtn.textContent = "Pause";
  state.paused = false;
  document.body.classList.remove("paused-mode");
  overlayTitle.textContent = title;
  const categoryLabel = CATEGORY_LABELS[state.category] || "General";
  const difficultyLabel = WORD_DIFFICULTY_LABELS[state.wordDifficulty] || "Easy";
  overlayDetail.textContent = `${config.name} | ${difficultyLabel} words | ${state.duration}s | ${categoryLabel} realm | Final score ${state.score}`;
  renderBreakdown();
  overlay.classList.remove("hidden");
  renderCounts();
}

function resetGame() {
  state.running = false;
  clearInterval(state.spawnTimer);
  clearInterval(state.countdownTimer);
  stopChaosMode();
  clearActivePower();
  state.spawnTimer = null;
  state.countdownTimer = null;
  state.score = 0;
  state.baseScore = 0;
  state.comboBonus = 0;
  state.popped = 0;
  state.attempts = 0;
  state.misses = 0;
  state.typedChars = 0;
  state.poppedChars = 0;
  state.powerUpsCollected = 0;
  state.streak = 0;
  state.bestStreak = 0;
  state.comboMultiplier = 1;
  state.activePower = null;
  state.powerEndsAt = 0;
  state.powerRemainingMs = 0;
  state.paused = false;
  document.body.classList.remove("paused-mode");
  state.timeLeft = state.duration;
  state.words.forEach((w) => w.el.remove());
  state.words = [];
  state.usedWords.clear();
  stopBtn.disabled = true;
  pauseBtn.disabled = true;
  pauseBtn.textContent = "Pause";
  renderCounts();
}

function startChaosMode() {
  const config = getLevelConfig();
  document.body.classList.add("chaos-mode");
  document.body.classList.toggle("doom-mode", config.chaosTier >= 2);
  if (state.accessibility || config.chaosTier < 2) return;
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
  document.body.classList.remove("doom-mode");
  applyTheme(state.theme);
}
