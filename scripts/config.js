const THEMES = ["dark", "light", "neon", "citrus", "crt", "mint"];
const GAME_DURATIONS = [30, 45, 60, 90];

const LEVELS = {
  1: {
    name: "Warmup",
    spawnMs: 1100,
    moves: false,
    rotates: false,
    speedMin: 0,
    speedMax: 0,
    comment: "Warmup selected. A clean arena for precision popping.",
  },
  2: {
    name: "Drift",
    spawnMs: 850,
    moves: true,
    rotates: false,
    speedMin: 55,
    speedMax: 145,
    comment: "Drift selected. The words are warming up their engines.",
  },
  3: {
    name: "Ricochet",
    spawnMs: 700,
    moves: true,
    rotates: true,
    speedMin: 95,
    speedMax: 220,
    comment: "Ricochet selected. Sharp reflexes only from here.",
  },
  4: {
    name: "Chaos",
    spawnMs: 550,
    moves: true,
    rotates: true,
    chaos: true,
    speedMin: 135,
    speedMax: 320,
    jitterChance: 3.4,
    spinRate: 110,
    comment: "Chaos selected. Lights flicker, words lurch, and the arena stops playing fair.",
  },
};
