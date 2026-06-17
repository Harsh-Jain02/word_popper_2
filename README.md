# Word Popper

Word Popper is a small browser typing game. Words appear in the arena, and the player types each word to pop it before the timer runs out.

## Run

Open `index.html` in a browser. No build step, package install, or dev server is required.

## Gameplay

1. Choose a theme.
2. Choose a level.
3. Choose a game length: 30s, 45s, 60s, or 90s.
4. Start the run.
5. Type visible words and press Enter or Pop.

Correct entries add points based on word length. Wrong entries subtract points based on the number of typed characters and reset the streak.

## Levels

- `Warmup`: static, shorter words.
- `Drift`: moving words with a mixed easy/medium word bank.
- `Ricochet`: faster movement, bounce rotation, and harder words.
- `Chaos`: rapid spawning, flickering lights, unstable word movement, spin, scale pulses, and harder chaotic words.

Words do not repeat within a single round.

## Controls

- `Enter`: submit the typed word.
- `Pop`: submit the typed word.
- `Emergency Stop`: end the current run and show the score immediately.

## Project Structure

- `index.html`: app markup and script loading order.
- `style.css`: stylesheet import manifest.
- `styles/`: focused CSS files for layout, HUD, levels, overlays, themes, and playfield effects.
- `script.js`: legacy pointer file.
- `scripts/`: focused game scripts.
- `scripts/wordBank.js`: per-level word pools.
- `ideas.txt`: feature backlog.
