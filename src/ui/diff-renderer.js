import { createTwoFilesPatch } from 'diff';
import { Diff2HtmlUI } from 'diff2html/lib-esm/ui/js/diff2html-ui';
import 'diff2html/bundles/css/diff2html.min.css';

import { DOM_SELECTORS } from '../core/constants.js';
import { serializeBookmarks } from '../core/parser.js';
import { state } from '../core/state.js';

import { refreshIcons } from './utils.js';

let lastRenderedTimestamp = 0;

export function renderDiff() {
  const container = document.getElementById(DOM_SELECTORS.DIFF_CONTAINER);
  if (!container || !state.originalContent) return;

  // If state hasn't changed since last render, skip heavy calculation
  if (state.lastUpdate <= lastRenderedTimestamp && container.innerHTML !== '') {
    return;
  }

  const currentContent = serializeBookmarks(state.bookmarkData, state.fileMeta.title);

  // Generate Unified Diff (Patch)
  const diffString = createTwoFilesPatch(
    'bookmarks.html',
    'bookmarks.html',
    state.originalContent,
    currentContent,
    '',
    ''
  );

  // Check if there are actual changes (excluding diff headers)
  const lines = diffString.split('\n');
  const hasChanges = lines.some(
    (line) =>
      (line.startsWith('+') && !line.startsWith('+++')) ||
      (line.startsWith('-') && !line.startsWith('---'))
  );

  if (!hasChanges) {
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

  // Render using Diff2Html UI for a professional editor feel
  const configuration = {
    drawFileList: false,
    matching: 'lines',
    outputFormat: 'side-by-side',
    highlight: true,
    fileContentToggle: false,
    renderNothingWhenEmpty: false,
  };

  const diff2htmlUi = new Diff2HtmlUI(container, diffString, configuration);
  diff2htmlUi.draw();

  lastRenderedTimestamp = state.lastUpdate;
  refreshIcons();
}
