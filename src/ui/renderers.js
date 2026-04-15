import { ITEM_TYPES, DOM_SELECTORS } from '../core/constants.js';
import { findPath } from '../core/logic.js';
import { state } from '../core/state.js';

import { refreshIcons } from './utils.js';

export function renderSidebar(data, container = document.getElementById(DOM_SELECTORS.SIDEBAR)) {
  if (!data) return;
  container.innerHTML = '';
  const frag = document.createDocumentFragment();

  function createSidebarItem(folder) {
    const hasSubfolders = folder.children.some((c) => c.type === ITEM_TYPES.FOLDER);
    const isEmpty = folder.children.length === 0;
    const itemWrap = document.createElement('div');
    itemWrap.className = 'sidebar-item-wrapper' + (hasSubfolders ? ' has-children' : '');

    const div = document.createElement('div');
    div.className = `sidebar-folder ${isEmpty ? 'is-empty' : ''}`;
    div.dataset.id = folder.id;

    const toggleIcon = hasSubfolders
      ? `<i data-lucide="chevron-right" class="toggle-icon"></i>`
      : `<span style="width:16px;"></span>`;

    const itemCount = folder.children.length;

    div.innerHTML = `
            ${toggleIcon}
            <i data-lucide="folder" class="folder-icon" style="color:var(--folder-color);"></i>
            <span class="folder-title">${folder.title}</span>
            <span class="folder-count" style="color:var(--text-dim); font-size:10px; margin-left:auto;">${itemCount}</span>
        `;

    const subContainer = document.createElement('div');
    subContainer.className = 'sidebar-subfolders';

    if (hasSubfolders) {
      folder.children
        .filter((c) => c.type === ITEM_TYPES.FOLDER)
        .forEach((sub) => {
          subContainer.appendChild(createSidebarItem(sub));
        });
    }

    itemWrap.appendChild(div);
    itemWrap.appendChild(subContainer);
    return itemWrap;
  }

  data
    .filter((i) => i.type === ITEM_TYPES.FOLDER)
    .forEach((folder) => {
      frag.appendChild(createSidebarItem(folder));
    });

  container.appendChild(frag);
  refreshIcons();
}

export function updateSidebarTitle(id, newTitle) {
  const sidebarItem = document.querySelector(`.sidebar-folder[data-id="${id}"] span`);
  if (sidebarItem) sidebarItem.textContent = newTitle;
}

export function updateBreadcrumbs(targetId) {
  const breadcrumb = document.getElementById(DOM_SELECTORS.BREADCRUMB);
  const path = findPath(state.bookmarkData, targetId);
  if (!path) return;

  breadcrumb.innerHTML = '';
  const frag = document.createDocumentFragment();

  path.forEach((folder, index) => {
    const span = document.createElement('span');
    span.className = 'breadcrumb-item';
    span.textContent = folder.title;
    span.dataset.id = folder.id;
    frag.appendChild(span);

    if (index < path.length - 1) {
      const sep = document.createElement('span');
      sep.className = 'breadcrumb-separator';
      sep.textContent = '/';
      frag.appendChild(sep);
    }
  });

  breadcrumb.appendChild(frag);
}

export function renderFolderContent(items) {
  const bookmarkList = document.getElementById(DOM_SELECTORS.BOOKMARK_LIST);
  bookmarkList.innerHTML = '';
  const frag = document.createDocumentFragment();

  items.forEach((item) => {
    const itemDiv = renderBookmarkListItem(item);
    frag.appendChild(itemDiv);
  });

  bookmarkList.appendChild(frag);
  refreshIcons();
}

export function renderSearchResults(results) {
  const bookmarkList = document.getElementById(DOM_SELECTORS.BOOKMARK_LIST);
  const breadcrumb = document.getElementById(DOM_SELECTORS.BREADCRUMB);
  const selectedFolderTitle = document.getElementById(DOM_SELECTORS.SELECTED_FOLDER_TITLE);

  bookmarkList.innerHTML = '';
  selectedFolderTitle.textContent = `Search Results (${results.length})`;
  breadcrumb.innerHTML = '<span class="breadcrumb-item">Search Results</span>';

  if (results.length === 0) {
    bookmarkList.innerHTML =
      '<div style="text-align:center; padding: 40px; color:var(--text-dim);">No results found.</div>';
    return;
  }

  const frag = document.createDocumentFragment();
  results.forEach((item) => {
    const itemDiv = renderBookmarkListItem(item, true);
    frag.appendChild(itemDiv);
  });

  bookmarkList.appendChild(frag);
  refreshIcons();
}
function renderBookmarkListItem(item, showPath = false) {
  const itemDiv = document.createElement('div');
  itemDiv.className = `bookmark-item ${item.type === ITEM_TYPES.FOLDER ? 'is-folder' : 'is-bookmark'}`;
  itemDiv.dataset.id = item.id;

  const dateObj = item.add_date ? new Date(parseInt(item.add_date) * 1000) : new Date();
  const isoDate = dateObj.toISOString().split('T')[0];

  if (item.type === ITEM_TYPES.FOLDER) {
    const isEmpty = item.children.length === 0;
    itemDiv.innerHTML = `
            <i data-lucide="folder" class="${
              isEmpty ? 'icon-empty' : ''
            }" style="width:14px; height:14px; color:var(--folder-color);"></i>
            <div style="flex-grow:1; display:flex; flex-direction:column; gap:2px;">
                <input type="text" class="bookmark-title-input ${
                  isEmpty ? 'is-empty' : ''
                }" value="${item.title || ''}" placeholder="Folder Name">
                ${
                  showPath
                    ? `<span style="color:var(--text-dim); font-size:10px;">${item.path || ''}</span>`
                    : `<span style="color:var(--text-dim); font-size:12px;">${
                        isEmpty ? 'Empty Folder' : `${item.children.length} items`
                      }</span>`
                }
            </div>
            <div></div>
            <input type="date" class="date-input" value="${isoDate}">
        `;
  } else {
    itemDiv.innerHTML = `
            <i data-lucide="bookmark" style="width:14px; height:14px; color:var(--item-color);"></i>
            <div style="flex-grow:1; display:flex; flex-direction:column; gap:2px;">
                <input type="text" class="bookmark-title-input" value="${
                  item.title || ''
                }" placeholder="Title" ${showPath ? 'style="padding:0; border:none; height:auto;"' : ''}>
                ${showPath ? `<span style="color:var(--text-dim); font-size:10px;">${item.path || ''}</span>` : ''}
            </div>
            <input type="url" class="bookmark-url-input" value="${item.href || ''}" placeholder="URL">
            <input type="date" class="date-input" value="${isoDate}">
        `;
  }
  return itemDiv;
}
