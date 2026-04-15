import { diffLines } from 'diff';

import { DOM_SELECTORS } from '../core/constants.js';
import { serializeBookmarks } from '../core/parser.js';
import { state } from '../core/state.js';

export function renderDiff() {
  const container = document.getElementById(DOM_SELECTORS.DIFF_CONTAINER);
  if (!container || !state.originalContent) return;

  const currentContent = serializeBookmarks(state.bookmarkData, state.fileMeta.title);
  const diffParts = diffLines(state.originalContent, currentContent);

  // Flatten diff parts into lines
  const allLines = [];
  let addedCount = 0;
  let removedCount = 0;

  diffParts.forEach((part) => {
    const lines = part.value.split('\n');
    if (lines[lines.length - 1] === '') lines.pop();

    lines.forEach((line) => {
      if (part.added) addedCount++;
      if (part.removed) removedCount++;
      allLines.push({
        text: line,
        added: part.added,
        removed: part.removed,
      });
    });
  });

  if (addedCount === 0 && removedCount === 0) {
    container.innerHTML = '<div class="diff-empty">No changes detected.</div>';
    return;
  }

  // Decide which lines to show (changes + context)
  const contextSize = 3;
  const linesToShow = new Set();

  allLines.forEach((line, index) => {
    if (line.added || line.removed) {
      for (let i = index - contextSize; i <= index + contextSize; i++) {
        if (i >= 0 && i < allLines.length) {
          linesToShow.add(i);
        }
      }
    }
  });

  container.innerHTML = '';

  // Add summary header
  const stats = document.createElement('div');
  stats.className = 'diff-stats';
  stats.innerHTML = `<span class="stat-plus">+${addedCount}</span> <span class="stat-minus">-${removedCount}</span> lines changed`;
  container.appendChild(stats);

  const pre = document.createElement('pre');
  pre.className = 'diff-content';

  let lastIndex = -1;
  const sortedIndices = Array.from(linesToShow).sort((a, b) => a - b);

  sortedIndices.forEach((index) => {
    // Show separator if there's a gap
    if (lastIndex !== -1 && index > lastIndex + 1) {
      const skip = document.createElement('div');
      skip.className = 'diff-line diff-skipped';
      skip.textContent = `@@ ... skipped ${index - lastIndex - 1} lines ... @@`;
      pre.appendChild(skip);
    }

    const line = allLines[index];
    const colorClass = line.added ? 'diff-added' : line.removed ? 'diff-removed' : 'diff-unchanged';
    const prefix = line.added ? '+' : line.removed ? '-' : ' ';

    const span = document.createElement('div');
    span.className = `diff-line ${colorClass}`;
    span.textContent = `${prefix}${line.text}`;
    pre.appendChild(span);

    lastIndex = index;
  });

  container.appendChild(pre);
}
