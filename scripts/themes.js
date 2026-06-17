function setLevel(level) {
  const nextLevel = Math.min(4, Math.max(1, Number(level) || 1));
  const config = getLevelConfig(nextLevel);
  state.level = nextLevel;
  state.rotationEnabled = config.rotates;

  levelButtons.forEach((btn) => {
    btn.classList.toggle("active", Number(btn.dataset.level) === nextLevel);
  });

  if (levelComment) {
    levelComment.textContent = config.comment;
  }
}

function paintTheme(theme) {
  THEMES.forEach((t) => document.body.classList.remove(`theme-${t}`));
  if (THEMES.includes(theme)) {
    document.body.classList.add(`theme-${theme}`);
  }
}

function applyTheme(theme) {
  if (THEMES.includes(theme)) {
    paintTheme(theme);
    state.theme = theme;
  }
  themeButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.theme === theme);
  });
}
