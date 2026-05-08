---
name: codex-fm
description: Launch a local Codex-themed lo-fi radio experience in the browser. Use when the user asks for Codex FM, Codex lo-fi radio, focus music, a Claude-FM-style Codex radio, or a pixel-art YouTube-like radio page that opens locally.
---

# Codex FM

Use this skill to open a local Codex lo-fi radio page styled like a YouTube music video with pixel-art/dot-matrix visuals.

## Workflow

1. Run `scripts/open-codex-fm.sh`.
2. The script should open the radio automatically in Google Chrome on macOS, with fallback to the default browser.
3. Only tell the user the printed `file://` URL if the browser did not open.

## Notes

- The radio is fully local and does not embed YouTube or external audio.
- Audio starts only after the user presses Play, because browsers block autoplay audio.
- The web app lives in `assets/codex-fm/`.
- The page opens from disk, so no dev server or background process is required.
