startBtn.addEventListener("click", startGame);
stopBtn.addEventListener("click", emergencyStopGame);
restartBtn.addEventListener("click", showConfigOverlay);
pauseBtn.addEventListener("click", togglePause);

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!state.running) return;
  handleInput(input.value);
});

input.addEventListener("focus", () => {
  if (!state.running) return;
  input.select();
});

window.addEventListener("resize", () => {
  const bounds = playfield.getBoundingClientRect();
  for (const word of state.words) {
    word.x = Math.min(word.x, Math.max(0, bounds.width - word.w));
    word.y = Math.min(word.y, Math.max(0, bounds.height - word.h));
    updateWordPosition(word);
  }

  checkMobileOverlay();
});

themeButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    applyTheme(btn.dataset.theme);
  });
});

levelButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    setLevel(btn.dataset.level);
  });
});

categoryButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    setCategory(btn.dataset.category);
  });
});

difficultyButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    setWordDifficulty(btn.dataset.wordDifficulty);
  });
});

if (durationSlider) {
  durationSlider.addEventListener("input", () => {
    setDurationByIndex(durationSlider.value);
  });
}

if (accessibilityToggle) {
  accessibilityToggle.addEventListener("change", () => {
    setAccessibility(accessibilityToggle.checked);
  });
}

window.addEventListener("keydown", (event) => {
  if (event.key.toLowerCase() !== "p") return;
  if (!state.running) return;
  if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
    return;
  }
  event.preventDefault();
  togglePause();
});

function setCategory(category) {
  state.category = WORD_CATEGORIES[category] ? category : "general";
  categoryButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.category === state.category);
  });
}

function setWordDifficulty(difficulty) {
  state.wordDifficulty = WORD_DIFFICULTY_LABELS[difficulty] ? difficulty : "easy";
  difficultyButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.wordDifficulty === state.wordDifficulty);
  });
  if (difficultyComment) {
    difficultyComment.textContent = WORD_DIFFICULTY_COMMENTS[state.wordDifficulty];
  }
}

function setAccessibility(enabled) {
  state.accessibility = Boolean(enabled);
  document.body.classList.toggle("accessibility-mode", state.accessibility);
  if (accessibilityToggle) {
    accessibilityToggle.checked = state.accessibility;
  }
  if (state.running && getLevelConfig().chaos) {
    stopChaosMode();
    startChaosMode();
  }
}

function showConfigOverlay() {
  overlay.classList.add("hidden");
  configOverlay.classList.remove("hidden");
  resetGame();
}

function hideConfigOverlay() {
  configOverlay.classList.add("hidden");
}

function checkMobileOverlay() {
  if (!mobileOverlay || state.mobileDismissed) return;
  const smallSide = Math.min(window.innerWidth, window.innerHeight);
  if (smallSide < 720) {
    mobileOverlay.classList.remove("hidden");
  } else {
    mobileOverlay.classList.add("hidden");
  }
}

if (mobileContinue) {
  mobileContinue.addEventListener("click", () => {
    state.mobileDismissed = true;
    mobileOverlay.classList.add("hidden");
  });
}
