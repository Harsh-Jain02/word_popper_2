# Word Popper

Word Popper is a small browser typing game. Words appear in the arena, and the player types each word to pop it before the timer runs out.

## Run

Open `index.html` in a browser. No build step, package install, or dev server is required.

## Gameplay

1. Choose a theme.
2. Choose a gamified level.
3. Choose a word realm.
4. Choose word difficulty: Easy, Medium, or Hard.
5. Choose a game length: 30s, 45s, 60s, or 90s.
6. Start the run.
7. Type visible words and press Enter or Pop.

Correct entries add points based on word length, combo multiplier, and active power-ups. Wrong entries subtract points based on typed characters and reset the combo.

## Levels

- `Training Grounds`: static, shorter words.
- `Drift Dash`: moving words with a mixed easy/medium word bank.
- `Ricochet Rush`: faster movement, bounce rotation, and harder words.
- `Chaos Rift`: playable chaos with flicker, jitter, spin, and unstable movement.
- `Doom Spiral`: an intentionally hostile chaos mode with rapid flicker and extreme movement.

Words do not repeat within a single round.

## Extra Systems

- Combo scoring increases the multiplier at higher streaks.
- Power-up words can freeze, slow, double score, or clear active words.
- Post-game results show accuracy, misses, best streak, combo bonus, power-ups, average word length, and score per second.
- Accessibility Assist increases readability, reduces motion, and removes flicker effects.
- Word realms include general, programming, animals, space, finance, hard spelling, Hindi mix, kid science, kid math, and kind words.
- Word difficulty is separate from gameplay level, so `Animals + Hard` stays in the animal realm while using longer animal words.

## Controls

- `Enter`: submit the typed word.
- `Pop`: submit the typed word.
- `Pause`: pause/resume. Paused bubbles remain visible, but word text is hidden.
- `Emergency Stop`: end the current run and show the score immediately.

## Project Structure

- `index.html`: app markup and script loading order.
- `style.css`: stylesheet import manifest.
- `styles/`: focused CSS files for layout, HUD, levels, overlays, themes, and playfield effects.
- `script.js`: legacy pointer file.
- `scripts/`: focused game scripts.
- `scripts/wordBank.js`: per-level word pools.
- `ideas.txt`: feature backlog.
