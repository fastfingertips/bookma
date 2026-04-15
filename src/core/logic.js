import { ITEM_TYPES, SORT_CRITERIA } from './constants.js';

export function getStats(items) {
  let stats = { bookmarks: 0, folders: 0 };
  items.forEach((item) => {
    if (item.type === ITEM_TYPES.FOLDER) {
      stats.folders++;
      const subStats = getStats(item.children);
      stats.bookmarks += subStats.bookmarks;
      stats.folders += subStats.folders;
    } else {
      stats.bookmarks++;
    }
  });
  return stats;
}

export function findFolderById(data, id) {
  for (let item of data) {
    if (item.type === ITEM_TYPES.FOLDER) {
      if (item.id === id) return item;
      const found = findFolderById(item.children, id);
      if (found) return found;
    }
  }
  return null;
}

export function findFirstFolder(data) {
  if (!data) return null;
  for (let item of data) {
    if (item.type === ITEM_TYPES.FOLDER) return item;
  }
  return null;
}

export function findPath(data, targetId, currentPath = []) {
  if (!data) return null;
  for (let item of data) {
    if (item.type === ITEM_TYPES.FOLDER) {
      const newPath = [...currentPath, item];
      if (item.id === targetId) return newPath;
      const found = findPath(item.children, targetId, newPath);
      if (found) return found;
    }
  }
  return null;
}

export function searchBookmarks(data, query) {
  if (!data) return [];
  let results = [];
  const lowerQuery = query.toLowerCase();

  function traverse(items, currentPath = []) {
    items.forEach((item) => {
      if (item.title && item.title.toLowerCase().includes(lowerQuery)) {
        if (item.type === ITEM_TYPES.BOOKMARK) {
          results.push({ ...item, path: currentPath.map((f) => f.title).join(' / ') });
        } else {
          results.push({ ...item, path: currentPath.map((f) => f.title).join(' / ') });
        }
      }
      if (item.type === ITEM_TYPES.FOLDER) {
        traverse(item.children, [...currentPath, item]);
      }
    });
  }

  traverse(data);
  return results;
}

export function findBookmarkById(data, id) {
  if (!data) return null;
  for (const item of data) {
    if (item.id === id) return item;
    if (item.type === ITEM_TYPES.FOLDER) {
      const found = findBookmarkById(item.children, id);
      if (found) return found;
    }
  }
  return null;
}

export function applySort(items, criteria) {
  if (!items) return [];
  const sorted = [...items];

  sorted.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === ITEM_TYPES.FOLDER ? -1 : 1;
    }

    switch (criteria) {
      case SORT_CRITERIA.NAME_ASC:
        return a.title.localeCompare(b.title);
      case SORT_CRITERIA.NAME_DESC:
        return b.title.localeCompare(a.title);
      case SORT_CRITERIA.DATE_DESC:
        return (parseInt(b.add_date) || 0) - (parseInt(a.add_date) || 0);
      case SORT_CRITERIA.DATE_ASC:
        return (parseInt(a.add_date) || 0) - (parseInt(b.add_date) || 0);
      default:
        return 0;
    }
  });

  return sorted;
}

export function isItemChanged(item, originalData) {
  if (!originalData) return false;
  const original = findBookmarkById(originalData, item.id);
  if (!original) return false;

  const isTitleChanged = (item.title || '') !== (original.title || '');
  if (item.type === ITEM_TYPES.FOLDER) {
    return isTitleChanged;
  }

  const isHrefChanged = (item.href || '') !== (original.href || '');
  const isDateChanged = (item.add_date || '') !== (original.add_date || '');

  return isTitleChanged || isHrefChanged || isDateChanged;
}
