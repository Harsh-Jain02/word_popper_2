# Word Popper

Word Popper is a small browser typing game. Words appear in the arena, and the player types each word to pop it before the timer runs out.

## Run

Open `index.html` in a browser. No build step, package install, or dev server is required.

## Gameplay

1. Choose a theme.
2. Choose a gamified level.
3. Choose a word realm.
4. Choose a game length: 30s, 45s, 60s, or 90s.
5. Start the run.
6. Type visible words and press Enter or Pop.

Correct entries add points based on word length, combo multiplier, and active power-ups. Wrong entries subtract points based on typed characters and reset the combo.

## Levels

- `Training Grounds`: static targets.
- `Drift Dash`: moving words.
- `Ricochet Rush`: faster movement with bounce rotation.
- `Chaos Rift`: playable chaos with flicker, jitter, spin, and unstable movement.
- `Doom Spiral`: an intentionally hostile chaos mode with rapid flicker and extreme movement.

Normal words rotate through the selected pool before repeating. Duplicate active words are avoided when possible, but very small pools keep spawning instead of stalling.

## Extra Systems

- Combo scoring increases the multiplier at higher streaks.
- Power-up words can freeze, slow, double score, or clear active words.
- Post-game results show accuracy, misses, best streak, combo bonus, power-ups, average word length, and score per second.
- Accessibility Assist increases readability, reduces motion, and removes flicker effects.
- Focused word realms include 90 unique words each across programming, animals, space, finance, hard spelling, Hindi mix, kid science, kid math, and kind words. General combines all pools.

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
- `scripts/wordBank.js`: word pools for each realm.
- `ideas.txt`: feature backlog.
