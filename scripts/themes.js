function setLevel(level) {
  const nextLevel = Math.min(6, Math.max(1, Number(level) || 1));
  state.level = nextLevel;
  state.rotationEnabled = nextLevel >= 4;
  levelButtons.forEach((btn) => {
    btn.classList.toggle("active", Number(btn.dataset.level) === nextLevel);
  });
  if (levelDetail) {
    const desc = LEVEL_DESCRIPTIONS[nextLevel] || "";
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
    const interval = state.level >= 6 ? 75 : 1000;
    state.themeCycleTimer = setInterval(() => {
      const currentIndex = THEMES.indexOf(state.theme);
      const nextIndex = (currentIndex + 1) % THEMES.length;
      applyTheme(THEMES[nextIndex]);
    }, interval);
  }
}

function applyTheme(theme) {
  THEMES.forEach((t) => document.body.classList.remove(`theme-${t}`));
  if (THEMES.includes(theme)) {
    document.body.classList.add(`theme-${theme}`);
    state.theme = theme;
  }
  themeButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.theme === theme);
  });
}
