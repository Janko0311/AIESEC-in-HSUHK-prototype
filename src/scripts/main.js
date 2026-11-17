import { initFlightScene } from './flight3D.js';

document.addEventListener('DOMContentLoaded', () => {
  initFlightScene();
  initNavDropdowns();
});

function initNavDropdowns() {
  document.querySelectorAll('.nav-dropdown').forEach((dropdown) => {
    const trigger = dropdown.querySelector('.nav-dropdown-trigger');
    if (!trigger) return;

    const setExpanded = (expanded) => {
      trigger.setAttribute('aria-expanded', String(expanded));
    };

    dropdown.addEventListener('mouseenter', () => setExpanded(true));
    dropdown.addEventListener('mouseleave', () => setExpanded(false));
    dropdown.addEventListener('focusin', () => setExpanded(true));
    dropdown.addEventListener('focusout', (event) => {
      if (!dropdown.contains(event.relatedTarget)) setExpanded(false);
    });
  });
}
