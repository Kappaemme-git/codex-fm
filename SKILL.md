---
name: codex-fm
description: Launch the Codex FM lo-fi radio website in the browser. Use when the user asks for Codex FM, Codex lo-fi radio, focus music, a Claude-FM-style Codex radio, or a pixel-art YouTube-like radio page.
---

# Codex FM

Use this skill to open the Codex FM lo-fi radio website styled like a YouTube music video with pixel-art/dot-matrix visuals.

## Workflow

1. Run `scripts/open-codex-fm.sh`.
2. The script opens `https://kappaemme-git.github.io/codex-fm/` automatically in Google Chrome on macOS, with fallback to the default browser.
3. Only tell the user the URL if the browser did not open.

## Notes

- The radio is hosted as a static site and does not embed YouTube or external audio.
- Audio starts only after the user presses Play, because browsers block autoplay audio.
- The web app lives at the repository root: `index.html`, `styles.css`, `script.js`, and `favicon.svg`.
- The launcher opens the public website, so users do not need to clone the repo.
