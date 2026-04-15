import { createTwoFilesPatch } from 'diff';
import { Diff2HtmlUI } from 'diff2html/lib-esm/ui/js/diff2html-ui';
import 'diff2html/bundles/css/diff2html.min.css';

import { DOM_SELECTORS, NOTIFICATION_TYPES } from '../core/constants.js';
import { findBookmarkById } from '../core/logic.js';
import { serializeBookmarks } from '../core/parser.js';
import { state, markUpdated } from '../core/state.js';

import { showNotification } from './notifications.js';
import { renderSidebar } from './renderers.js';
import { refreshIcons } from './utils.js';

let lastRenderedTimestamp = 0;

export function renderDiff() {
  const container = document.getElementById(DOM_SELECTORS.DIFF_CONTAINER);
  if (!container || !state.originalContent) return;

  // If state hasn't changed since last render, skip heavy calculation
  if (state.lastUpdate <= lastRenderedTimestamp && container.innerHTML !== '') {
    return;
  }

  const originalContent = serializeBookmarks(
    state.originalBookmarkData,
    state.originalFileMeta.title,
    true
  );
  const currentContent = serializeBookmarks(state.bookmarkData, state.fileMeta.title, true);

  // Generate Unified Diff (Patch)
  const diffString = createTwoFilesPatch(
    'bookmarks.html',
    'bookmarks.html',
    originalContent,
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

  const discardBtn = document.getElementById('diff-discard-btn');
  if (discardBtn) {
    discardBtn.disabled = !hasChanges;
    discardBtn.style.opacity = hasChanges ? '1' : '0.5';
    discardBtn.style.pointerEvents = hasChanges ? 'auto' : 'none';
  }

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

  attachRevertButtons(container);

  lastRenderedTimestamp = state.lastUpdate;
  refreshIcons();
}

/**
 * Makes the diff margin (+/- indicators) clickable for reverting changes.
 */
function attachRevertButtons(container) {
  const rows = container.querySelectorAll('tr');

  rows.forEach((row) => {
    const codeCtn = row.querySelector('.d2h-code-line-ctn');
    if (!codeCtn) return;

    const html = codeCtn.innerHTML;
    const match =
      html.match(/DATA-ID(?:&quot;|")=([^&"\s]+)(?:&quot;|")/) ||
      codeCtn.textContent.match(/DATA-ID="([^"]+)"/);

    if (match) {
      const id = match[1].replace(/&quot;/g, '');
      const marginCells = row.querySelectorAll('.d2h-code-side-linenumber');

      marginCells.forEach((cell) => {
        const isChanged = cell.classList.contains('d2h-ins') || cell.classList.contains('d2h-del');
        if (isChanged) {
          cell.classList.add('clickable-margin');
          cell.title = 'Click to revert this change';
          cell.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            revertItemById(id);
          };
        }
      });
    }
  });
}

function revertItemById(id) {
  const original = findBookmarkById(state.originalBookmarkData, id);
  const current = findBookmarkById(state.bookmarkData, id);

  if (original && current) {
    // Modified item: Restore properties
    Object.assign(current, JSON.parse(JSON.stringify(original)));
    showNotification('Line reverted to original state.', NOTIFICATION_TYPES.SUCCESS);
  } else if (original && !current) {
    // Deleted item: Restore it (Complexity: requires parent info)
    // For now, Discard All is the way for structural reverts,
    // but property reverts are most common and handled here.
    showNotification(
      'To restore deleted items, please use "Discard All Changes".',
      NOTIFICATION_TYPES.INFO
    );
    return;
  } else if (!original && current) {
    // New item: Reverting means removing it?
    // This is also structural.
    showNotification(
      'To remove new items, please use "Discard All Changes".',
      NOTIFICATION_TYPES.INFO
    );
    return;
  }

  markUpdated();
  renderSidebar(state.bookmarkData);
  renderDiff();
}
