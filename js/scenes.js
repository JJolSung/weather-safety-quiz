// Decorative weather scenes for each scenario theme (flood | heat | storm).
// Step 5 replaces the placeholder gradient with CSS + inline SVG animation.

export function createScene(theme) {
  const el = document.createElement('div');
  el.className = `scene scene-${theme}`;
  el.setAttribute('aria-hidden', 'true');
  return el;
}

// Fill every `.scene-slot[data-theme]` inside `root` with a scene.
export function mountScenes(root) {
  for (const slot of root.querySelectorAll('.scene-slot[data-theme]')) {
    slot.replaceChildren(createScene(slot.dataset.theme));
  }
}
