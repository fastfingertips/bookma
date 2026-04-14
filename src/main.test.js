import { describe, it, expect } from 'vitest';

import { ITEM_TYPES, SORT_CRITERIA } from './core/constants.js';
import { getStats, applySort } from './core/logic.js';
import { parseNetscapeBookmarks } from './core/parser.js';

describe('Bookma Core Logic', () => {
  describe('Netscape Parser', () => {
    it('should parse a basic Netscape HTML string correctly', () => {
      const html = `
        <!DOCTYPE NETSCAPE-Bookmark-file-1>
        <TITLE>Test Bookmarks</TITLE>
        <H1>Test Bookmarks</H1>
        <DL><p>
            <DT><H3 ADD_DATE="1600000000">Folder A</H3>
            <DL><p>
                <DT><A HREF="https://example.com" ADD_DATE="1600000001">Link A</A>
            </DL><p>
            <DT><A HREF="https://example2.com" ADD_DATE="1600000002">Link B</A>
        </DL><p>
      `;
      const result = parseNetscapeBookmarks(html);

      expect(result.title).toBe('Test Bookmarks');
      expect(result.items).toHaveLength(2);
      expect(result.items[0].type).toBe(ITEM_TYPES.FOLDER);
      expect(result.items[0].title).toBe('Folder A');
      expect(result.items[0].children).toHaveLength(1);
      expect(result.items[0].children[0].title).toBe('Link A');
      expect(result.items[1].type).toBe(ITEM_TYPES.BOOKMARK);
      expect(result.items[1].title).toBe('Link B');
    });

    it('should throw error if root DL is missing', () => {
      const html = `<html><body><h1>No DL Here</h1></body></html>`;
      expect(() => parseNetscapeBookmarks(html)).toThrow('Root <DL> not found');
    });
  });

  describe('Stats Calculator', () => {
    it('should calculate correct counts for nested structures', () => {
      const data = [
        {
          type: ITEM_TYPES.FOLDER,
          children: [
            { type: ITEM_TYPES.BOOKMARK },
            { type: ITEM_TYPES.FOLDER, children: [{ type: ITEM_TYPES.BOOKMARK }] },
          ],
        },
        { type: ITEM_TYPES.BOOKMARK },
      ];
      const stats = getStats(data);
      expect(stats.bookmarks).toBe(3);
      expect(stats.folders).toBe(2);
    });
  });

  describe('Sorting Logic', () => {
    it('should always prioritize folders at the top', () => {
      const items = [
        { type: ITEM_TYPES.BOOKMARK, title: 'A' },
        { type: ITEM_TYPES.FOLDER, title: 'Z' },
        { type: ITEM_TYPES.BOOKMARK, title: 'B' },
        { type: ITEM_TYPES.FOLDER, title: 'A' },
      ];
      const sorted = applySort(items, SORT_CRITERIA.NAME_ASC);
      expect(sorted[0].type).toBe(ITEM_TYPES.FOLDER);
      expect(sorted[1].type).toBe(ITEM_TYPES.FOLDER);
      expect(sorted[0].title).toBe('A');
      expect(sorted[1].title).toBe('Z');
    });

    it('should sort by date descending', () => {
      const items = [
        { type: ITEM_TYPES.BOOKMARK, title: 'Old', add_date: '1000' },
        { type: ITEM_TYPES.BOOKMARK, title: 'New', add_date: '2000' },
      ];
      const sorted = applySort(items, SORT_CRITERIA.DATE_DESC);
      expect(sorted[0].title).toBe('New');
      expect(sorted[1].title).toBe('Old');
    });
  });
});
