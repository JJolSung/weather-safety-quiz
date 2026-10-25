# Use of generative AI

This document records where generative AI was used in this project and how the
results were checked, as requested in the project brief.

## What was generated with AI

| Area | Tool | How it was used |
|------|------|-----------------|
| Source code (`index.html`, `css/`, `js/`, `tests/`) | Claude Code (Anthropic) | Code was written with AI assistance, following a written specification and step-by-step review by the developer. |
| Sample quiz content (`content/quiz.json`) | Claude Code | Placeholder questions were drafted by AI and edited by the developer. They are **sample content for demo purposes** and will be replaced with the client's own content. |
| Documentation (`README.md`, `LICENSES.md`, this file) | Claude Code | Drafted with AI assistance and reviewed by the developer. |
| Background video (`assets/video/`) | — | No video is included at this time. If one is added later and was generated with an AI tool (for example Higgsfield), it will be listed here with the tool and prompt used. |

No AI-generated images, icons, fonts or third-party code are included. The
weather scenes are hand-tuned inline SVG + CSS (see `LICENSES.md`).

## How the output was verified

### Automated checks

- `tests/quiz.test.js` — 20 tests covering scoring, answer locking, moving
  between questions, restarting, variable question counts, state immutability
  and content validation. Runs in the browser (`tests/quiz.test.html`) and in
  Node.js (`node tests/quiz.test.js`). All pass.
- Content validation at start-up: `js/quiz.js#validateContent` checks the
  JSON structure and reports mistakes in a readable error screen.

### Checks performed during development (with browser automation)

- Full flow Home → Question → Feedback → Result → Try again / Choose another
  scenario, for all three scenarios, with mouse and with keyboard only.
- Browser back button returns to the home screen; direct links such as
  `#/scenario/thunderstorms` open the right scenario.
- Layout checked at 360 px, 768 px and ~1500 px widths.
- Browser console: no errors or warnings.
- All CSS animations confirmed running; lightning limited to two low-opacity
  flashes per 11 s cycle; `prefers-reduced-motion` rules reviewed in code.
- Behaviour with a missing video file: video element removed, CSS scene shown.

### Checks to be completed by the developer before delivery

The following were **not** performed by AI and must be done by a person. Tick
each item once done.

- [ ] Walk through every scenario manually on a real phone (iOS Safari and/or
      Android Chrome) and on a desktop browser.
- [ ] Enable "reduce motion" in the operating system and confirm the scenes are
      static and no lightning flash appears.
- [ ] Test with a screen reader (VoiceOver, NVDA or TalkBack): headings,
      progress, answer feedback and links are announced sensibly.
- [ ] Fact-check every question, answer and explanation against the linked
      official sources, and replace the sample content with the client's
      content.
- [ ] Confirm that every `learnMoreUrl` opens the intended page.
- [ ] Run `node tests/quiz.test.js` and open `tests/quiz.test.html` one more
      time after the final content is in place.

## Principles followed

- The developer remains responsible for every line delivered; AI output was
  treated as a draft, not as a finished product.
- No client data, personal data or credentials were shared with the AI tool.
- Safety advice in the sample content is limited to widely published,
  general guidance; specific figures are avoided except where a rule of thumb
  is clearly labelled as such.
