function getComboMultiplier(streak = state.streak) {
  let multiplier = 1;
  for (const step of COMBO_STEPS) {
    if (streak >= step.streak) {
      multiplier = step.multiplier;
    }
  }
  return multiplier;
}

function awardWordScore(word) {
  const basePoints = word.text.length;
  const powerMultiplier = state.activePower === "double" ? 2 : 1;
  const comboMultiplier = getComboMultiplier(state.streak + 1);
  const total = basePoints * comboMultiplier * powerMultiplier;
  state.baseScore += basePoints;
  state.comboBonus += total - basePoints;
  state.score += total;
  state.streak += 1;
  state.comboMultiplier = comboMultiplier;
  state.bestStreak = Math.max(state.bestStreak, state.streak);
  state.popped += 1;
  state.poppedChars += word.text.length;
}

function registerMiss(target) {
  state.score -= target.length;
  state.misses += 1;
  state.streak = 0;
  state.comboMultiplier = 1;
}

function clearActivePower() {
  if (state.powerTimer) {
    clearTimeout(state.powerTimer);
    state.powerTimer = null;
  }
  state.activePower = null;
  state.powerEndsAt = 0;
  state.powerRemainingMs = 0;
  renderCounts();
}

function activatePowerUp(type) {
  const power = POWER_UPS[type];
  if (!power) return;
  state.powerUpsCollected += 1;

  if (type === "clear") {
    const cleared = state.words.filter((word) => !word.powerType);
    for (const word of cleared) {
      word.popped = true;
      word.el.classList.add("popping");
      removeWordElement(word);
    }
    state.score += cleared.length * 4;
    state.words = state.words.filter((word) => word.powerType);
    renderCounts();
    return;
  }

  clearActivePower();
  state.activePower = type;
  state.powerEndsAt = performance.now() + power.durationMs;
  state.powerTimer = setTimeout(clearActivePower, power.durationMs);
  renderCounts();
}

function getPowerLabel() {
  if (!state.activePower) return "Ready";
  const power = POWER_UPS[state.activePower];
  if (!power) return "Ready";
  const remainingMs =
    state.paused && state.powerRemainingMs > 0
      ? state.powerRemainingMs
      : state.powerEndsAt - performance.now();
  const remaining = Math.max(0, Math.ceil(remainingMs / 1000));
  return `${power.label} ${remaining}s`;
}

function getRunBreakdown() {
  const accuracy = state.attempts
    ? Math.round((state.popped / state.attempts) * 100)
    : 0;
  const averageWordLength = state.popped
    ? (state.poppedChars / state.popped).toFixed(1)
    : "0.0";
  const scorePerSecond = state.duration
    ? (state.score / state.duration).toFixed(1)
    : "0.0";
  return [
    ["Accuracy", `${accuracy}%`],
    ["Words popped", state.popped],
    ["Misses", state.misses],
    ["Best streak", state.bestStreak],
    ["Combo bonus", state.comboBonus],
    ["Power-ups", state.powerUpsCollected],
    ["Avg length", averageWordLength],
    ["Score/sec", scorePerSecond],
  ];
}

function renderBreakdown() {
  if (!breakdownEl) return;
  breakdownEl.innerHTML = "";
  for (const [label, value] of getRunBreakdown()) {
    const item = document.createElement("div");
    item.className = "breakdown-item";
    item.innerHTML = `<span>${label}</span><strong>${value}</strong>`;
    breakdownEl.appendChild(item);
  }
}
