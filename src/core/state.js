/**
 * Bookma - Centralized State Management
 */

export const state = {
  bookmarkData: null,
  fileMeta: { title: 'Bookmarks' },
  currentFolderId: null,
  currentSort: 'name-asc',
  originalContent: null,
};

export const setBookmarkData = (data) => {
  state.bookmarkData = data;
};

export const setFileMeta = (title) => {
  state.fileMeta.title = title;
};

export const setCurrentFolderId = (id) => {
  state.currentFolderId = id;
};

export const setCurrentSort = (sort) => {
  state.currentSort = sort;
};

export const setOriginalContent = (content) => {
  state.originalContent = content;
};
