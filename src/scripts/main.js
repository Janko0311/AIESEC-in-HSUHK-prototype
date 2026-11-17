import { initFlightScene } from './flight3D.js';

document.addEventListener('DOMContentLoaded', () => {
  initFlightScene();
  initUniversityDropdown();
});

function initUniversityDropdown() {
  const dropdown = document.querySelector('.nav-dropdown');
  const trigger = dropdown?.querySelector('.nav-dropdown-trigger');

  if (!dropdown || !trigger) return;

  const setExpanded = (expanded) => {
    trigger.setAttribute('aria-expanded', String(expanded));
  };

  dropdown.addEventListener('mouseenter', () => setExpanded(true));
  dropdown.addEventListener('mouseleave', () => setExpanded(false));
  dropdown.addEventListener('focusin', () => setExpanded(true));
  dropdown.addEventListener('focusout', (event) => {
    if (!dropdown.contains(event.relatedTarget)) setExpanded(false);
  });
}
