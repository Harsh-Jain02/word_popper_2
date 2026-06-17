function spawnWord() {
  if (!state.running) return;
  const activeTexts = new Set(state.words.map((w) => w.text.toLowerCase()));
  const available = WORDS.filter((w) => !activeTexts.has(w.toLowerCase()));
  if (!available.length) return;
  const word = available[Math.floor(Math.random() * available.length)];
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
  const { vx, vy } = randomVelocity();

  state.words.push({
    id,
    text: word,
    x,
    y,
    vx,
    vy,
    w: width,
    h: height,
    el,
    popped: false,
    angle: 0,
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
  renderCounts();
  word.el.addEventListener("animationend", () => {
    word.el.remove();
  });
  state.words = state.words.filter((w) => w.id !== word.id);
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
  hideIntro();
  resetGame();
  state.running = true;
  setLevel(state.level);
  state.timeLeft = 60;
  state.lastTick = performance.now();
  startBtn.disabled = true;
  overlay.classList.add("hidden");
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
  startAnimationLoop();
}

function stopGame() {
  resetGame();
  startBtn.disabled = false;
  overlay.classList.add("hidden");
}

function endGame() {
  state.running = false;
  clearInterval(state.spawnTimer);
  clearInterval(state.countdownTimer);
  stopThemeCycle();
  state.spawnTimer = null;
  state.countdownTimer = null;
  startBtn.disabled = false;
  overlayTitle.textContent = "Time!";
  overlayDetail.textContent = `Level ${state.level} | Words: ${state.popped} | Score: ${state.score} | Best streak: ${state.bestStreak}`;
  overlay.classList.remove("hidden");
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
  state.words.forEach((w) => w.el.remove());
  state.words = [];
  renderCounts();
}
