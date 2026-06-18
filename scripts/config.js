const THEMES = ["dark", "light", "neon", "citrus", "crt", "mint"];
const GAME_DURATIONS = [30, 45, 60, 90];
const CATEGORY_LABELS = {
  general: "General",
  programming: "Programming",
  animals: "Animals",
  space: "Space",
  finance: "Finance",
  spelling: "Hard spelling",
  hindiMix: "Hindi mix",
  kidsScience: "Kid science",
  kidsMath: "Kid math",
  kidsValues: "Kind words",
};
const WORD_DIFFICULTY_LABELS = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};
const WORD_DIFFICULTY_COMMENTS = {
  easy: "Easy words loaded. Quick pops, shorter targets, cleaner streaks.",
  medium: "Medium words loaded. Bigger targets for sharper typing hands.",
  hard: "Hard words loaded. Long words, spicy spelling, serious score potential.",
};
const POWER_UP_CHANCE = 0.12;
const COMBO_STEPS = [
  { streak: 5, multiplier: 2 },
  { streak: 10, multiplier: 3 },
  { streak: 18, multiplier: 4 },
];

const POWER_UPS = {
  freeze: {
    label: "Freeze",
    word: "freeze",
    durationMs: 3500,
  },
  slow: {
    label: "Slow",
    word: "slowmo",
    durationMs: 6000,
  },
  double: {
    label: "Double",
    word: "double",
    durationMs: 7000,
  },
  clear: {
    label: "Clear",
    word: "clearout",
    durationMs: 0,
  },
};

const LEVELS = {
  1: {
    name: "Training Grounds",
    spawnMs: 1100,
    moves: false,
    rotates: false,
    speedMin: 0,
    speedMax: 0,
    comment: "Training Grounds selected. Calm targets, clean pops, heroic fundamentals.",
  },
  2: {
    name: "Drift Dash",
    spawnMs: 850,
    moves: true,
    rotates: false,
    speedMin: 55,
    speedMax: 145,
    comment: "Drift Dash selected. The word sprites start skating across your screen.",
  },
  3: {
    name: "Ricochet Rush",
    spawnMs: 700,
    moves: true,
    rotates: true,
    speedMin: 95,
    speedMax: 220,
    comment: "Ricochet Rush selected. Bouncing targets enter the arena. Word danger is your call.",
  },
  4: {
    name: "Chaos Rift",
    spawnMs: 550,
    moves: true,
    rotates: true,
    chaos: true,
    chaosTier: 1,
    speedMin: 135,
    speedMax: 320,
    jitterChance: 3.4,
    spinRate: 110,
    comment: "Chaos Rift selected. Playable madness: flicker, feints, and twitchy words.",
  },
  5: {
    name: "Doom Spiral",
    spawnMs: 420,
    moves: true,
    rotates: true,
    chaos: true,
    chaosTier: 2,
    speedMin: 190,
    speedMax: 460,
    jitterChance: 6.5,
    spinRate: 220,
    comment: "Doom Spiral selected. This is the torturous arena. The game is allowed to be rude.",
  },
};
