import { diffLines } from 'diff';

import { DOM_SELECTORS } from '../core/constants.js';
import { serializeBookmarks } from '../core/parser.js';
import { state } from '../core/state.js';

export function renderDiff() {
  const container = document.getElementById(DOM_SELECTORS.DIFF_CONTAINER);
  if (!container || !state.originalContent) return;

  const currentContent = serializeBookmarks(state.bookmarkData, state.fileMeta.title);
  const diffParts = diffLines(state.originalContent, currentContent);

  // Flatten diff parts into lines with line numbers
  const allLines = [];
  let addedCount = 0;
  let removedCount = 0;
  let oldLineNum = 1;
  let newLineNum = 1;

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
        oldNum: part.added ? '' : oldLineNum++,
        newNum: part.removed ? '' : newLineNum++,
      });
    });
  });

  if (addedCount === 0 && removedCount === 0) {
    container.innerHTML = `
      <div class="diff-empty">
        <i data-lucide="check-circle" style="color: #10b981; opacity: 0.5;"></i>
        <p>Your workspace matches the original file.</p>
        <span style="font-size: 12px;">No modifications detected.</span>
      </div>
    `;
    refreshIcons();
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

  // Add Premium Header Bar
  const headerBar = document.createElement('div');
  headerBar.className = 'diff-header-bar';
  headerBar.innerHTML = `
    <div class="diff-file-info">
      <i data-lucide="file-code" style="width:16px; height:16px; opacity:0.6;"></i>
      <span>bookmarks.html</span>
    </div>
    <div class="diff-stats">
      <span class="stat-plus">+${addedCount}</span>
      <span class="stat-minus">-${removedCount}</span>
      <span style="opacity:0.5; margin-left:4px;">changes</span>
    </div>
  `;
  container.appendChild(headerBar);

  const pre = document.createElement('pre');
  pre.className = 'diff-content';

  let lastIndex = -1;
  const sortedIndices = Array.from(linesToShow).sort((a, b) => a - b);

  sortedIndices.forEach((index) => {
    // Show separator if there's a gap
    if (lastIndex !== -1 && index > lastIndex + 1) {
      const skip = document.createElement('div');
      skip.className = 'diff-skipped';
      skip.textContent = `@@ ... SKIPPED ${index - lastIndex - 1} LINES ... @@`;
      pre.appendChild(skip);
    }

    const line = allLines[index];
    const colorClass = line.added ? 'diff-added' : line.removed ? 'diff-removed' : 'diff-unchanged';
    const prefix = line.added ? '+' : line.removed ? '-' : ' ';

    const row = document.createElement('div');
    row.className = `diff-line ${colorClass}`;
    row.innerHTML = `
      <div class="line-num">${line.oldNum}</div>
      <div class="line-num">${line.newNum}</div>
      <div class="line-prefix">${prefix}</div>
      <div class="line-text">${line.text}</div>
    `;
    pre.appendChild(row);

    lastIndex = index;
  });

  container.appendChild(pre);
  refreshIcons();
}

import { refreshIcons } from './utils.js';
