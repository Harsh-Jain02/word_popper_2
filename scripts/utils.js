function randomVelocity() {
  const angle = Math.random() * Math.PI * 2;
  const speed = 60 + Math.random() * 140; // pixels per second
  return {
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
  };
}

function updateWordPosition(word) {
  word.el.style.transform = `translate(${word.x}px, ${word.y}px) rotate(${word.angle}deg)`;
}

function renderCounts() {
  scoreEl.textContent = state.score;
  poppedEl.textContent = state.popped;
  streakEl.textContent = state.streak;
  timerEl.textContent = `${state.timeLeft}s`;
  activeCountEl.textContent = state.words.length;
}
