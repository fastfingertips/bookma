/**
 * Bookma - Netscape Bookmark Parser & Serializer
 */

import { ITEM_TYPES, ID_PREFIXES } from './constants.js';

export function parseNetscapeBookmarks(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const dl = doc.querySelector('dl');
  if (!dl) throw new Error('Root <DL> not found');

  const title =
    doc.querySelector('title')?.textContent || doc.querySelector('h1')?.textContent || 'Bookmarks';

  return {
    title,
    items: parseDL(dl),
  };
}

export function parseDL(dlElement) {
  const items = [];
  const dts = dlElement.children;

  for (let dt of dts) {
    if (dt.tagName !== 'DT') continue;

    const h3 = dt.querySelector('h3');
    const a = dt.querySelector('a');

    if (h3) {
      const subDL = dt.querySelector('dl');
      items.push({
        id: ID_PREFIXES.FOLDER + Math.random().toString(36).substr(2, 9),
        type: ITEM_TYPES.FOLDER,
        title: h3.textContent,
        add_date: h3.getAttribute('ADD_DATE'),
        last_modified: h3.getAttribute('LAST_MODIFIED'),
        children: subDL ? parseDL(subDL) : [],
      });
    } else if (a) {
      items.push({
        id: ID_PREFIXES.BOOKMARK + Math.random().toString(36).substr(2, 9),
        type: ITEM_TYPES.BOOKMARK,
        title: a.textContent,
        href: a.getAttribute('HREF'),
        add_date: a.getAttribute('ADD_DATE'),
        icon: a.getAttribute('ICON'),
      });
    }
  }
  return items;
}

export function generateDL(items, indent, includeIds = false) {
  const space = '    '.repeat(indent);
  const idAttr = (item) => (includeIds ? ` DATA-ID="${item.id}"` : '');

  return items
    .map((item) => {
      if (item.type === ITEM_TYPES.FOLDER) {
        return `${space}<DT><H3${idAttr(item)} ADD_DATE="${item.add_date || ''}" LAST_MODIFIED="${
          item.last_modified || ''
        }">${item.title}</H3>
${space}<DL><p>
${generateDL(item.children, indent + 1, includeIds)}
${space}</DL><p>`;
      } else {
        return `${space}<DT><A${idAttr(item)} HREF="${item.href}" ADD_DATE="${item.add_date || ''}" ${
          item.icon ? `ICON="${item.icon}"` : ''
        }>${item.title}</A>`;
      }
    })
    .join('\n');
}

export function serializeBookmarks(items, title, includeIds = false) {
  const header = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<TITLE>${title || 'Bookmarks'}</TITLE>
<H1>${title || 'Bookmarks'}</H1>
<DL><p>
`;
  const footer = `\n</DL><p>`;
  return header + generateDL(items, 1, includeIds) + footer;
}
