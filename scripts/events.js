startBtn.addEventListener("click", startGame);
stopBtn.addEventListener("click", stopGame);
restartBtn.addEventListener("click", startGame);

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

pinToggles.forEach((toggle) => {
  toggle.addEventListener("change", () => {
    const key = toggle.dataset.floater;
    const floater = state.floaters.find((f) => f.key === key);
    if (floater) {
      floater.pinned = toggle.checked;
    }
  });
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

function checkMobileOverlay() {
  if (!mobileOverlay || state.mobileDismissed) return;
  const smallSide = Math.min(window.innerWidth, window.innerHeight);
  if (smallSide < 720) {
    mobileOverlay.classList.remove("hidden");
  } else {
    mobileOverlay.classList.add("hidden");
  }
}

function hideIntro() {
  if (introOverlay) {
    introOverlay.classList.add("hidden");
  }
}

if (mobileContinue) {
  mobileContinue.addEventListener("click", () => {
    state.mobileDismissed = true;
    mobileOverlay.classList.add("hidden");
  });
}

if (introClose) {
  introClose.addEventListener("click", hideIntro);
}
