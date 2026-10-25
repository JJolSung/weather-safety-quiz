# Dependencies, third-party assets and licences

## Project licence

The source code in this repository is released under the MIT License (see
`LICENSE`).

## Runtime dependencies

**None.** The app is plain HTML, CSS and JavaScript (ES modules) and loads no
external scripts, stylesheets, fonts or services at runtime.

## Development dependencies

**None.** Tests run with the browser or with Node.js alone; no packages are
installed.

- Python 3 or Node.js is only needed to serve the files locally (any static
  web server works).

## Fonts

The app uses the operating system's default font stack
(`system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`).
No font files are shipped or downloaded.

## Images and animations

All visuals — the weather scenes (rain, water, sun, clouds, lightning) and the
check / cross icons — are inline SVG generated in `js/scenes.js` and
`js/app.js` and animated with CSS in `css/styles.css`. They were written for
this project and are covered by the project licence. No stock images, icon
packs or third-party graphics are used.

## Video (optional)

The repository ships **no video**. `assets/video/` is empty. If a background
video is added later, list its origin and licence here. Any video generated
with an AI tool (for example Higgsfield) must also be recorded in
`AI_DISCLOSURE.md`.

## External links

The quiz links to the public websites of Swiss federal services (MeteoSwiss,
Alertswiss, Natural Hazards Portal). The app does not embed or copy any of
their content; the links simply point users to further reading.
