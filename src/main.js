import { setupFileEvents, setupAppEvents, setupResizer } from './ui/events.js';
import { toggleStickyHeader, setupScrollTop, refreshIcons, initTheme } from './ui/utils.js';

document.addEventListener('DOMContentLoaded', () => {
  const tasks = [
    { name: 'initTheme', fn: initTheme },
    { name: 'toggleStickyHeader', fn: toggleStickyHeader },
    { name: 'setupScrollTop', fn: setupScrollTop },
    { name: 'setupFileEvents', fn: setupFileEvents },
    { name: 'setupAppEvents', fn: setupAppEvents },
    { name: 'setupResizer', fn: setupResizer },
    { name: 'refreshIcons', fn: refreshIcons },
  ];

  tasks.forEach((task) => {
    try {
      task.fn();
    } catch (err) {
      console.error(`Error during ${task.name}:`, err);
    }
  });

  console.log('Bookma initialized.');
});
