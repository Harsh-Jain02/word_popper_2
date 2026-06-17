function getLevelConfig(level = state.level) {
  return LEVELS[level] || LEVELS[1];
}

function getWordPool() {
  return LEVEL_WORDS[state.level] || LEVEL_WORDS[1];
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
  word.el.style.transform = `translate(${word.x}px, ${word.y}px) rotate(${word.angle}deg) scale(${scale})`;
}

function renderCounts() {
  scoreEl.textContent = state.score;
  poppedEl.textContent = state.popped;
  streakEl.textContent = state.streak;
  timerEl.textContent = `${state.timeLeft}s`;
  activeCountEl.textContent = state.words.length;
}
