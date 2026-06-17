startBtn.addEventListener("click", startGame);
stopBtn.addEventListener("click", emergencyStopGame);
restartBtn.addEventListener("click", showConfigOverlay);

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

if (durationSlider) {
  durationSlider.addEventListener("input", () => {
    setDurationByIndex(durationSlider.value);
  });
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
