---
name: codex-fm
description: Launch the Codex FM lo-fi radio website in the browser. Use when the user asks for Codex FM, Codex lo-fi radio, focus music, a Claude-FM-style Codex radio, or a pixel-art YouTube-like radio page.
---

# Codex FM

Use this skill to open the Codex FM lo-fi radio website styled like a YouTube music video with pixel-art/dot-matrix visuals.

## Workflow

1. Run `scripts/open-codex-fm.sh`.
2. Always reply with the URL: `https://codex-fm.vercel.app/`.
3. If the browser did not visibly open, tell the user to open that URL manually.

## Notes

- The radio is hosted as a static site and does not embed YouTube or external audio.
- Audio starts only after the user presses Play, because browsers block autoplay audio.
- The web app lives at the repository root: `index.html`, `styles.css`, `script.js`, and `favicon.svg`.
- The launcher opens the public website, so users do not need to clone the repo.
