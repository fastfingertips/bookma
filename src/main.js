import { setupFileEvents, setupAppEvents, setupResizer } from './ui/events.js';
import { toggleStickyHeader, setupScrollTop, refreshIcons, initTheme } from './ui/utils.js';

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  toggleStickyHeader();
  setupScrollTop();

  setupFileEvents();
  setupAppEvents();
  setupResizer();

  refreshIcons();

  console.log('Bookma initialized.');
});
