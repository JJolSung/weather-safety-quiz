// Decorative weather scenes, built from inline SVG and animated with CSS
// (see "Scenes" in css/styles.css). Themes: flood | heat | storm | sky.
// Everything here is purely visual and hidden from assistive technology.

const W = 400;
const H = 225;

// Small deterministic pseudo-random generator so every page load draws the
// same raindrops (keeps screenshots and visual checks stable).
function rng(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function rainLines(count, seed, { minDur = 0.9, maxDur = 1.5, length = 16 } = {}) {
  const rand = rng(seed);
  let out = '';
  for (let i = 0; i < count; i++) {
    const x = Math.round(rand() * W);
    const dur = (minDur + rand() * (maxDur - minDur)).toFixed(2);
    const delay = (-rand() * maxDur).toFixed(2);
    const opacity = (0.35 + rand() * 0.4).toFixed(2);
    out += `<line x1="${x}" y1="0" x2="${x}" y2="${length}" style="--dur:${dur}s;--delay:${delay}s;opacity:${opacity}"/>`;
  }
  return out;
}

function wavePath(baseY, amp, period = 200, repeats = 4) {
  let d = `M0 ${baseY}`;
  for (let i = 0; i < repeats; i++) {
    const x = i * period;
    d += ` C${x + period * 0.25} ${baseY - amp} ${x + period * 0.75} ${baseY + amp} ${x + period} ${baseY}`;
  }
  d += ` V${H + 40} H0 Z`;
  return d;
}

function cloud(cx, cy, scale, className, extraStyle = '') {
  return `
    <g class="cloud ${className}" style="${extraStyle}">
      <g transform="translate(${cx} ${cy}) scale(${scale})">
        <ellipse cx="0" cy="0" rx="46" ry="18"/>
        <ellipse cx="-22" cy="-8" rx="24" ry="16"/>
        <ellipse cx="12" cy="-12" rx="28" ry="20"/>
        <ellipse cx="34" cy="-2" rx="20" ry="14"/>
      </g>
    </g>`;
}

const SCENES = {
  flood: () => `
    <defs>
      <linearGradient id="flood-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#9fb6cf"/>
        <stop offset="1" stop-color="#6d8db1"/>
      </linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#flood-sky)"/>
    ${cloud(70, 48, 0.9, 'cloud-slow', '--from:-140px;--to:460px;--speed:70s;--delay:-20s')}
    ${cloud(300, 36, 0.7, 'cloud-slow', '--from:-140px;--to:460px;--speed:90s;--delay:-55s')}
    <g class="rain rain-straight anim-only" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round">
      ${rainLines(26, 7)}
    </g>
    <g class="water">
      <path class="wave wave-back" d="${wavePath(176, 7)}" fill="#4f7fb5" opacity="0.75"/>
      <path class="wave wave-front" d="${wavePath(186, 6)}" fill="#2f5f93"/>
    </g>`,

  heat: () => `
    <defs>
      <linearGradient id="heat-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#fde3b0"/>
        <stop offset="1" stop-color="#f4a261"/>
      </linearGradient>
      <linearGradient id="heat-ground" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#d97b3a"/>
        <stop offset="1" stop-color="#a84f1f"/>
      </linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#heat-sky)"/>
    <g class="sun">
      <circle class="sun-glow" cx="300" cy="78" r="60" fill="#fff3c4" opacity="0.55"/>
      <circle class="sun-core" cx="300" cy="78" r="30" fill="#ffd166"/>
    </g>
    <rect x="0" y="178" width="${W}" height="${H - 178}" fill="url(#heat-ground)"/>
    <g class="shimmer anim-only" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round">
      <path style="--delay:0s"    d="M20 176 q 20 -6 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0"/>
      <path style="--delay:-1s"   d="M0 180 q 20 -5 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0"/>
      <path style="--delay:-2s"   d="M30 184 q 20 -6 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0"/>
      <path style="--delay:-3s"   d="M10 178 q 20 -5 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0"/>
    </g>`,

  storm: () => `
    <defs>
      <linearGradient id="storm-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#3b4360"/>
        <stop offset="1" stop-color="#1f2538"/>
      </linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#storm-sky)"/>
    <path class="bolt anim-only" d="M222 34 L198 104 L226 98 L196 178" fill="none" stroke="#fff6c8" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>
    ${cloud(90, 56, 1.1, 'cloud-dark', '--from:-160px;--to:480px;--speed:60s;--delay:-15s')}
    ${cloud(260, 40, 0.9, 'cloud-dark', '--from:-160px;--to:480px;--speed:75s;--delay:-40s')}
    ${cloud(380, 70, 0.75, 'cloud-dark', '--from:-160px;--to:480px;--speed:50s;--delay:-30s')}
    <g class="rain rain-slanted anim-only" stroke="#c7d2e6" stroke-width="1.2" stroke-linecap="round">
      ${rainLines(30, 11, { minDur: 0.7, maxDur: 1.1, length: 20 })}
    </g>
    <rect class="flash anim-only" width="${W}" height="${H}" fill="#ffffff"/>
    <rect x="0" y="196" width="${W}" height="${H - 196}" fill="#2a3a2f"/>`,

  sky: () => `
    <defs>
      <linearGradient id="sky-grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#1f3a5f"/>
        <stop offset="0.6" stop-color="#2f5d8a"/>
        <stop offset="1" stop-color="#4a8ab8"/>
      </linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#sky-grad)"/>
    ${cloud(60, 60, 1.2, 'cloud-light', '--from:-200px;--to:520px;--speed:120s;--delay:-30s')}
    ${cloud(240, 130, 0.9, 'cloud-light', '--from:-200px;--to:520px;--speed:150s;--delay:-90s')}
    ${cloud(360, 50, 0.7, 'cloud-light', '--from:-200px;--to:520px;--speed:100s;--delay:-60s')}`,
};

export function createScene(theme) {
  const build = SCENES[theme];
  const el = document.createElement('div');
  el.className = `scene scene-${theme}`;
  el.setAttribute('aria-hidden', 'true');
  if (build) {
    el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" focusable="false">${build()}</svg>`;
  }
  return el;
}

// Fill every `.scene-slot[data-theme]` inside `root` with a scene.
export function mountScenes(root) {
  for (const slot of root.querySelectorAll('.scene-slot[data-theme]')) {
    slot.replaceChildren(createScene(slot.dataset.theme));
  }
}
