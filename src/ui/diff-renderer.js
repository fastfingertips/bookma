import { diffLines } from 'diff';

import { DOM_SELECTORS } from '../core/constants.js';
import { serializeBookmarks } from '../core/parser.js';
import { state } from '../core/state.js';

export function renderDiff() {
  const container = document.getElementById(DOM_SELECTORS.DIFF_CONTAINER);
  if (!container || !state.originalContent) return;

  const currentContent = serializeBookmarks(state.bookmarkData, state.fileMeta.title);
  const diff = diffLines(state.originalContent, currentContent);

  container.innerHTML = '';
  const pre = document.createElement('pre');
  pre.className = 'diff-content';

  diff.forEach((part) => {
    const colorClass = part.added ? 'diff-added' : part.removed ? 'diff-removed' : 'diff-unchanged';
    const prefix = part.added ? '+' : part.removed ? '-' : ' ';

    const lines = part.value.split('\n');
    if (lines[lines.length - 1] === '') lines.pop();

    lines.forEach((line) => {
      const span = document.createElement('div');
      span.className = `diff-line ${colorClass}`;
      span.textContent = `${prefix}${line}`;
      pre.appendChild(span);
    });
  });

  container.appendChild(pre);
}
