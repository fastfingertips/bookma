import { ITEM_TYPES, DOM_SELECTORS, UI_CONFIG, NOTIFICATION_TYPES } from '../core/constants.js';
import {
  getStats,
  findFirstFolder,
  applySort,
  findFolderById,
  findBookmarkById,
  searchBookmarks,
} from '../core/logic.js';
import { parseNetscapeBookmarks, generateDL, serializeBookmarks } from '../core/parser.js';
import {
  state,
  setBookmarkData,
  setFileMeta,
  setCurrentFolderId,
  setCurrentSort,
  setOriginalContent,
  markUpdated,
} from '../core/state.js';

import { renderDiff } from './diff-renderer.js';
import { showNotification } from './notifications.js';
import {
  renderSidebar,
  renderFolderContent,
  renderSearchResults,
  updateBreadcrumbs,
  updateSidebarTitle,
} from './renderers.js';
import { toggleTheme } from './utils.js';

export function setupFileEvents() {
  const dropZone = document.getElementById(DOM_SELECTORS.DROP_ZONE);
  const fileInput = document.getElementById(DOM_SELECTORS.FILE_INPUT);

  dropZone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length) handleFile(e.target.files[0]);
  });

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.background = '#f0f0f0';
  });
  dropZone.addEventListener('dragleave', () => (dropZone.style.background = 'transparent'));
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.background = 'transparent';
    if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
  });
}

export function handleFile(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const content = e.target.result;
    try {
      const parsed = parseNetscapeBookmarks(content);
      // Create a normalized baseline to avoid false diffs due to formatting differences
      const normalized = serializeBookmarks(parsed.items, parsed.title);
      setOriginalContent(normalized);

      setBookmarkData(parsed.items);
      state.originalBookmarkData = JSON.parse(JSON.stringify(parsed.items));
      setFileMeta(parsed.title);
      state.originalFileMeta = { title: parsed.title };

      document.getElementById(DOM_SELECTORS.UPLOAD_SECTION).style.display = 'none';
      document.getElementById(DOM_SELECTORS.APP_VIEW).style.display = 'block';

      const stats = getStats(state.bookmarkData);
      document.getElementById(DOM_SELECTORS.STAT_BOOKMARKS).textContent = stats.bookmarks;
      document.getElementById(DOM_SELECTORS.STAT_FOLDERS).textContent = stats.folders;
      document.getElementById(DOM_SELECTORS.META_TITLE).value = state.fileMeta.title;

      renderSidebar(state.bookmarkData);

      const rootFolders = state.bookmarkData.filter((i) => i.type === ITEM_TYPES.FOLDER);
      if (rootFolders.length === 1) {
        const firstWrap = document.querySelector('.sidebar-item-wrapper');
        if (firstWrap) firstWrap.classList.add('expanded');
      }

      if (state.bookmarkData.length) {
        const first = findFirstFolder(state.bookmarkData);
        if (first) selectFolder(first);
      }
    } catch (err) {
      console.error(err);
      showNotification('An error occurred while parsing the file.', NOTIFICATION_TYPES.ERROR);
    }
  };
  reader.readAsText(file);
}

export function selectFolder(folder) {
  setCurrentFolderId(folder.id);
  document.getElementById(DOM_SELECTORS.SELECTED_FOLDER_TITLE).textContent = folder.title;

  document.querySelectorAll('.sidebar-folder').forEach((el) => {
    const isActive = el.dataset.id === folder.id;
    el.classList.toggle('active', isActive);

    if (isActive) {
      let parent = el
        .closest('.sidebar-item-wrapper')
        .parentElement.closest('.sidebar-item-wrapper');
      while (parent) {
        parent.classList.add('expanded');
        parent = parent.parentElement.closest('.sidebar-item-wrapper');
      }
      el.scrollIntoView({ behavior: 'auto', block: 'nearest' });
    }
  });

  renderFolderContent(applySort(folder.children, state.currentSort));
  updateBreadcrumbs(folder.id);
}

export function setupAppEvents() {
  const sidebar = document.getElementById(DOM_SELECTORS.SIDEBAR);
  const searchInput = document.getElementById(DOM_SELECTORS.SEARCH_INPUT);
  const searchClear = document.getElementById(DOM_SELECTORS.SEARCH_CLEAR);
  const sortSelect = document.getElementById(DOM_SELECTORS.SORT_SELECT);
  const metaTitleInput = document.getElementById(DOM_SELECTORS.META_TITLE);
  const exportBtn = document.getElementById(DOM_SELECTORS.EXPORT_BTN);
  const breadcrumb = document.getElementById(DOM_SELECTORS.BREADCRUMB);
  const bookmarkList = document.getElementById(DOM_SELECTORS.BOOKMARK_LIST);
  const themeToggle = document.getElementById(DOM_SELECTORS.THEME_TOGGLE);

  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }

  sidebar.addEventListener('click', (e) => {
    const toggleIcon = e.target.closest('.toggle-icon');
    if (toggleIcon) {
      e.stopPropagation();
      toggleIcon.closest('.sidebar-item-wrapper')?.classList.toggle('expanded');
      return;
    }

    const folderEl = e.target.closest('.sidebar-folder');
    if (folderEl) {
      e.stopPropagation();
      const folderObj = findFolderById(state.bookmarkData, folderEl.dataset.id);
      if (folderObj) selectFolder(folderObj);
    }
  });

  breadcrumb.addEventListener('click', (e) => {
    const item = e.target.closest('.breadcrumb-item');
    if (item && item.dataset.id) {
      const folderObj = findFolderById(state.bookmarkData, item.dataset.id);
      if (folderObj) selectFolder(folderObj);
    }
  });

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    searchClear.style.display = query ? 'block' : 'none';

    if (query.length >= UI_CONFIG.SEARCH_MIN_LENGTH) {
      const results = searchBookmarks(state.bookmarkData, query);
      renderSearchResults(applySort(results, state.currentSort));
    } else if (query.length === 0) {
      refreshCurrentView();
    }
  });

  searchClear.addEventListener('click', () => {
    searchInput.value = '';
    searchClear.style.display = 'none';
    refreshCurrentView();
  });

  sortSelect.addEventListener('change', (e) => {
    setCurrentSort(e.target.value);
    refreshCurrentView();
  });

  function refreshCurrentView() {
    if (!state.bookmarkData) return;
    const query = searchInput.value.trim();
    if (query.length >= UI_CONFIG.SEARCH_MIN_LENGTH) {
      renderSearchResults(applySort(searchBookmarks(state.bookmarkData, query), state.currentSort));
    } else if (state.currentFolderId) {
      const folder = findFolderById(state.bookmarkData, state.currentFolderId);
      if (folder) selectFolder(folder);
    }
  }

  metaTitleInput.addEventListener('input', (e) => {
    setFileMeta(e.target.value);
  });

  exportBtn.addEventListener('click', () => {
    if (!state.bookmarkData) return;
    let html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>${state.fileMeta.title}</TITLE>
<H1>${state.fileMeta.title}</H1>
<DL><p>
${generateDL(state.bookmarkData, 1)}
</DL><p>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bookmarks_export.html';
    a.click();
  });

  const diffBtn = document.getElementById(DOM_SELECTORS.DIFF_BTN);
  const diffCloseBtn = document.getElementById(DOM_SELECTORS.DIFF_CLOSE_BTN);
  const appView = document.getElementById(DOM_SELECTORS.APP_VIEW);
  const diffView = document.getElementById(DOM_SELECTORS.DIFF_VIEW);

  if (diffBtn) {
    diffBtn.addEventListener('click', () => {
      if (!state.bookmarkData) return;

      const originalText = diffBtn.innerText;
      diffBtn.innerText = 'Calculating...';
      diffBtn.style.opacity = '0.7';
      diffBtn.disabled = true;

      // Use setTimeout to allow the UI to reflect the loading state
      setTimeout(() => {
        try {
          renderDiff();
          appView.style.display = 'none';
          diffView.style.display = 'block';
        } catch (err) {
          console.error('Diff rendering failed:', err);
        } finally {
          diffBtn.innerText = originalText;
          diffBtn.style.opacity = '1';
          diffBtn.disabled = false;
        }
      }, 50);
    });
  }

  diffCloseBtn.addEventListener('click', () => {
    diffView.style.display = 'none';
    appView.style.display = 'block';
  });

  const discardBtn = document.getElementById('diff-discard-btn');
  if (discardBtn) {
    discardBtn.addEventListener('click', () => {
      if (!state.originalBookmarkData) return;
      if (window.confirm('Are you sure you want to discard all changes? This cannot be undone.')) {
        setBookmarkData(JSON.parse(JSON.stringify(state.originalBookmarkData)));
        setFileMeta(state.originalFileMeta.title);
        markUpdated();

        // Refresh UI components
        renderSidebar(state.bookmarkData);

        // Synchronize breadcrumbs and list view
        if (state.currentFolderId) {
          const folder = findFolderById(state.bookmarkData, state.currentFolderId);
          if (folder) selectFolder(folder);
        }

        renderDiff();
        showNotification(
          'All changes have been successfully discarded.',
          NOTIFICATION_TYPES.SUCCESS
        );
      }
    });
  }

  bookmarkList.addEventListener('input', (e) => {
    const itemEl = e.target.closest('.bookmark-item');
    if (!itemEl) return;
    const id = itemEl.dataset.id;
    const original =
      findBookmarkById(state.bookmarkData, id) || findFolderById(state.bookmarkData, id);
    if (!original) return;

    if (e.target.classList.contains('bookmark-title-input')) {
      original.title = e.target.value;
      if (original.type === ITEM_TYPES.FOLDER) {
        updateSidebarTitle(id, original.title);
        if (id === state.currentFolderId) {
          document.getElementById(DOM_SELECTORS.SELECTED_FOLDER_TITLE).textContent = original.title;
          updateBreadcrumbs(id);
        }
      }
    } else if (e.target.classList.contains('bookmark-url-input')) {
      original.href = e.target.value;
    } else if (e.target.classList.contains('date-input')) {
      const newTimestamp = Math.floor(new Date(e.target.value).getTime() / 1000);
      original.add_date = newTimestamp.toString();
    }
    markUpdated();
  });

  bookmarkList.addEventListener('click', (e) => {
    const revertBtn = e.target.closest('.revert-btn');
    if (revertBtn) {
      e.stopPropagation();
      const itemEl = revertBtn.closest('.bookmark-item');
      const id = itemEl.dataset.id;
      const original = findBookmarkById(state.originalBookmarkData, id);
      const current = findBookmarkById(state.bookmarkData, id);

      if (original && current) {
        // Deep clone original properties back to current object
        const clone = JSON.parse(JSON.stringify(original));
        Object.assign(current, clone);
        markUpdated();

        // Refresh Explorer UI
        if (state.currentFolderId === current.id && current.type === ITEM_TYPES.FOLDER) {
          document.getElementById(DOM_SELECTORS.SELECTED_FOLDER_TITLE).textContent = current.title;
          updateSidebarTitle(id, current.title);
          updateBreadcrumbs(id);
        }

        // Find if it was a folder and update sidebar
        if (current.type === ITEM_TYPES.FOLDER) {
          updateSidebarTitle(id, current.title);
        }

        refreshCurrentView();
        showNotification(
          `${current.type === ITEM_TYPES.FOLDER ? 'Folder' : 'Bookmark'} restored to original state.`,
          NOTIFICATION_TYPES.SUCCESS
        );
      }
      return;
    }

    const itemEl = e.target.closest('.bookmark-item');
    if (!itemEl || e.target.tagName === 'INPUT') return;
    const id = itemEl.dataset.id;
    const item = findFolderById(state.bookmarkData, id);
    if (item) selectFolder(item);
  });
}

export function setupResizer() {
  const resizer = document.getElementById(DOM_SELECTORS.RESIZER);
  const sidebar = document.getElementById(DOM_SELECTORS.SIDEBAR);
  let isResizing = false;

  resizer.addEventListener('mousedown', () => {
    isResizing = true;
    resizer.classList.add('active');
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  });

  document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;
    const rect = document.querySelector('.container').getBoundingClientRect();
    const newWidth = e.clientX - rect.left - 20;
    if (newWidth >= UI_CONFIG.SIDEBAR_MIN_WIDTH && newWidth <= UI_CONFIG.SIDEBAR_MAX_WIDTH) {
      sidebar.style.width = `${newWidth}px`;
    }
  });

  document.addEventListener('mouseup', () => {
    isResizing = false;
    resizer.classList.remove('active');
    document.body.style.cursor = 'default';
    document.body.style.userSelect = 'auto';
  });
}
