function getLevelConfig(level = state.level) {
  return LEVELS[level] || LEVELS[1];
}

function getWordPool() {
  const categoryWords = WORD_CATEGORIES[state.category] || WORD_CATEGORIES.general;
  return Array.from(new Set(categoryWords));
}

function setDurationByIndex(index) {
  const nextIndex = Math.min(
    GAME_DURATIONS.length - 1,
    Math.max(0, Number(index) || 0)
  );
  state.duration = GAME_DURATIONS[nextIndex];
  if (!state.running) {
    state.timeLeft = state.duration;
    renderCounts();
  }
  if (durationSlider) {
    durationSlider.value = String(nextIndex);
  }
  if (durationValue) {
    durationValue.textContent = `${state.duration}s`;
  }
}

function randomVelocity(speedMin = 60, speedMax = 200) {
  const angle = Math.random() * Math.PI * 2;
  const speed = speedMin + Math.random() * (speedMax - speedMin);
  return {
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
  };
}

function updateWordPosition(word) {
  const scale = word.scale || 1;
  const mirror = word.mirror || 1;
  word.el.style.transform = `translate(${word.x}px, ${word.y}px) rotate(${word.angle}deg) scale(${scale}) scaleX(${mirror})`;
}

function removeWordElement(word, fallbackMs = 280) {
  let removed = false;
  const remove = () => {
    if (removed) return;
    removed = true;
    word.el.remove();
  };

  if (state.accessibility) {
    remove();
    return;
  }

  word.el.addEventListener("animationend", remove, { once: true });
  setTimeout(remove, fallbackMs);
}

function renderCounts() {
  scoreEl.textContent = state.score;
  poppedEl.textContent = state.popped;
  streakEl.textContent = state.streak;
  comboEl.textContent = `x${state.comboMultiplier}`;
  timerEl.textContent = `${state.timeLeft}s`;
  powerStatusEl.textContent = getPowerLabel();
}
