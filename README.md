# Extreme Weather Safety Quiz

A small educational web app that helps students in Switzerland learn how to
stay safe during extreme weather. Pick one of three scenarios — **Flooding**,
**Heatwaves** or **Severe thunderstorms** — answer three multiple-choice
questions, get instant feedback with a link to official guidance, and see
your score and a short summary at the end.

Built with plain HTML, CSS and JavaScript. No frameworks, no build step, no
accounts, no database — all quiz content lives in one editable JSON file.

> **Sample content for demo purposes — will be replaced with client-supplied
> content.** The questions currently in `content/quiz.json` are placeholders
> that illustrate the format.

## Features

- Home screen with the three scenarios, each with a calm animated weather scene
- Three multiple-choice questions per scenario (any number works — see below)
- Immediate feedback after each answer: correct/incorrect, explanation and a
  "Learn more" link to an official source (opens in a new tab)
- Result screen with score, key takeaways, a review of every question, and
  **Try again** / **Choose another scenario** buttons
- Works on phones (360 px and up) and desktops
- Keyboard accessible, screen-reader friendly, honours `prefers-reduced-motion`
- Optional hero background video (see [Optional video](#optional-video))

## Run it locally

The app loads `content/quiz.json` with `fetch()`, which browsers block when a
page is opened directly from disk (`file://`). Serve the folder with any
local web server instead:

```bash
# Option A — Python 3 (preinstalled on macOS and most Linux systems)
python -m http.server 8000
# then open http://localhost:8000

# Option B — Node.js
npx serve .
# then open the URL it prints (usually http://localhost:3000)
```

No installation step is needed beyond having Python or Node.js available.

## Edit the quiz content

Everything the user sees comes from **`content/quiz.json`**. You can change
texts, add or remove questions, or add whole scenarios without touching any
code. Keep the file valid JSON (commas between items, double quotes).

```jsonc
{
  "appTitle": "Extreme Weather Safety Quiz",   // header and home title
  "appIntro": "One or two sentences shown on the home screen.",
  "demoNotice": "Shown in the footer. Set to \"\" to hide.",
  "learnMoreLabel": "Learn more",              // prefix before each source link
  "heroVideo": "",                             // optional, see "Optional video"
  "heroPoster": "",
  "scenarios": [
    {
      "id": "flooding",            // used in the URL: #/scenario/flooding
      "title": "Flooding",
      "intro": "One sentence shown on the scenario card.",
      "theme": "flood",            // picks the animation: flood | heat | storm
      "questions": [
        {
          "question": "The question text?",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctIndex": 1,       // 0-based: 0 = A, 1 = B, 2 = C, 3 = D
          "explanation": "Why this is the safe choice.",
          "learnMoreLabel": "MeteoSwiss",
          "learnMoreUrl": "https://www.meteoswiss.admin.ch"
        }
      ],
      "summary": "Key takeaways shown on the result screen."
    }
  ]
}
```

Notes:

- A scenario can have any number of questions, and a question any number of
  options (two or more). The progress bar and result screen adapt.
- `learnMoreLabel` / `learnMoreUrl` on a question are optional; leave them out
  to show no link.
- If the file contains a mistake (for example a `correctIndex` that does not
  exist), the app shows a readable error message instead of a blank page.

## Optional video

The home hero can play a short looping background video on desktop screens.

1. Put an MP4 (H.264, ideally under 2 MB, 16:9, no sound) in `assets/video/`.
2. Set `"heroVideo": "assets/video/hero.mp4"` in `content/quiz.json`.
   Optionally add a still image as `"heroPoster"`.

The video is skipped on small screens (to save data) and for users who prefer
reduced motion; if it fails to load, the animated CSS scene is shown instead.
The app works exactly the same with no video at all.

## Tests

The scoring logic (`js/quiz.js`) is covered by small dependency-free tests:

- In the browser: open `http://localhost:8000/tests/quiz.test.html`
- From the command line: `node tests/quiz.test.js`

## Deploy to GitHub Pages

1. Push the repository to GitHub.
2. In the repository, open **Settings → Pages**.
3. Under *Build and deployment*, choose **Deploy from a branch**, select the
   `main` branch and the `/ (root)` folder, then save.
4. After a minute the site is live at `https://<user>.github.io/<repository>/`.

Nothing else is required — the site is static files only.

## Project structure

```
index.html            entry page
css/styles.css        all styles, including the scene animations
js/app.js             screens, routing and state
js/quiz.js            quiz rules (pure functions, no DOM)
js/scenes.js          inline-SVG weather scenes
content/quiz.json     editable quiz content
assets/video/         optional background video
tests/                quiz logic tests (browser + Node)
LICENSES.md           dependencies and third-party assets
AI_DISCLOSURE.md      use of generative AI and how the output was verified
```

## Accessibility

- The whole quiz can be completed with the keyboard; focus is moved to the
  new heading or the *Next* button after each step.
- Correct and incorrect answers are marked with icons and text, not colour alone.
- Decorative scenes are hidden from assistive technology.
- With `prefers-reduced-motion` enabled, scenes are static and lightning
  flashes are removed. Flashes are otherwise limited to two gentle, low-opacity
  flashes per 11 seconds (well below the WCAG 2.3.1 threshold of three per second).

## Scope

Out of scope by design: user accounts, payments, real-time weather alerts,
a database and app-store distribution.
