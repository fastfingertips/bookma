import { setupFileEvents, setupAppEvents, setupResizer } from './ui/events.js';
import { toggleStickyHeader, setupScrollTop, refreshIcons } from './ui/utils.js';

document.addEventListener('DOMContentLoaded', () => {
  toggleStickyHeader();
  setupScrollTop();

  setupFileEvents();
  setupAppEvents();
  setupResizer();

  refreshIcons();

  console.log('Bookma initialized.');
});
