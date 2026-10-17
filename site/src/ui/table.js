import { CATEGORIES } from '../domain/categories.js';
import { isActive, matchStrength, matches } from '../domain/filter.js';
import { formatValue } from '../domain/format.js';
import { SORTABLE_COLUMNS, sortEnemies } from '../domain/sort.js';
import { wikiUrl } from '../domain/wiki.js';
import { cycleSort } from '../state/actions.js';
import { h, replaceChildren } from './dom.js';
/** @import { AppState, Category, Enemy, Sort } from '../domain/types.js' */
/** @import { Store } from './store.js' */

const SPRITE_SIZE = 48;

/** @type {Readonly<Record<'asc' | 'desc' | 'none', { aria: string, indicator: string }>>} */
const SORT_STATES = Object.freeze({
  asc: { aria: 'ascending', indicator: '▲' },
  desc: { aria: 'descending', indicator: '▼' },
  none: { aria: 'none', indicator: '↕' },
});

/**
 * The enemy list, laid out like noitadle's guess rows. Rows are built once;
 * filtering hides rows and highlights the filtered cells, sorting reorders them.
 * @param {HTMLElement} table
 * @param {HTMLElement} count  Live region announcing how many enemies match.
 * @param {Store} store
 * @param {readonly Enemy[]} enemies
 */
export function mountTable(table, count, store, enemies) {
  const rows = new Map(enemies.map((enemy) => [enemy, createRow(enemy)]));
  const body = h('div', { class: 'rows', role: 'rowgroup' });
  const empty = h('p', { class: 'empty', hidden: true }, 'No enemies match — clear a filter.');
  const headers = SORTABLE_COLUMNS.map((column) => {
    const indicator = h('span', { class: 'sort-indicator', 'aria-hidden': 'true' });
    const header = h(
      'div',
      { class: 'cell', role: 'columnheader' },
      h(
        'button',
        {
          type: 'button',
          class: 'sort-button',
          onClick: () => store.dispatch(cycleSort, column.key),
        },
        column.label,
        indicator,
      ),
    );
    return { column, header, indicator };
  });

  /**
   * @param {Enemy} enemy
   * @returns {HTMLElement}
   */
  function rowOf(enemy) {
    const entry = rows.get(enemy);
    if (!entry) {
      throw new Error(`No row for ${enemy.name}`);
    }
    return entry.row;
  }

  /** @param {AppState} state */
  function renderFilters(state) {
    let shown = 0;
    for (const [enemy, { row, cells }] of rows) {
      const visible = matches(enemy, state.filters);
      row.hidden = !visible;
      shown += Number(visible);
      CATEGORIES.forEach((category, i) => {
        const strength =
          visible && isActive(state.filters, category.key)
            ? matchStrength(category, enemy.values[category.key], state.filters[category.key])
            : null;
        cells[i].classList.toggle('hit', strength === 'full');
        cells[i].classList.toggle('partial', strength === 'partial');
      });
    }
    empty.hidden = shown > 0;
    replaceChildren(count, `${shown} / ${enemies.length} enemies`);
  }

  /** @param {Sort | null} sort */
  function renderSort(sort) {
    body.append(...sortEnemies(enemies, sort).map(rowOf));
    for (const { column, header, indicator } of headers) {
      const state = SORT_STATES[sort?.key === column.key ? sort.direction : 'none'];
      header.setAttribute('aria-sort', state.aria);
      header.classList.toggle('is-sorted', sort?.key === column.key);
      replaceChildren(indicator, state.indicator);
    }
  }

  replaceChildren(
    table,
    h(
      'div',
      { class: 'row header', role: 'row' },
      h(
        'div',
        { class: 'cell', role: 'columnheader' },
        h('span', { class: 'visually-hidden' }, 'Sprite'),
      ),
      headers.map((entry) => entry.header),
    ),
    body,
    empty,
  );
  store.subscribe((state, previous) => {
    if (state.filters !== previous.filters) {
      renderFilters(state);
    }
    if (state.sort !== previous.sort) {
      renderSort(state.sort);
    }
  });
  renderFilters(store.get());
  renderSort(store.get().sort);
}

/**
 * The enemy's sprites, linking to its Noita wiki page when it has one.
 * @param {Enemy} enemy
 * @returns {HTMLElement[]}
 */
function spriteOf(enemy) {
  const images = enemy.images.map((src) =>
    h('img', { src, alt: '', width: SPRITE_SIZE, height: SPRITE_SIZE, loading: 'lazy' }),
  );
  const href = wikiUrl(enemy);
  if (href === null) {
    return images;
  }
  return [
    h(
      'a',
      {
        class: 'sprite-link',
        href,
        target: '_blank',
        rel: 'noopener',
        'aria-label': `${enemy.name} on the Noita wiki`,
      },
      images,
    ),
  ];
}

/**
 * A "?" that reveals what the Noita wiki states where it differs from noitadle.
 * @param {Category} category
 * @param {string | undefined} note
 * @returns {HTMLButtonElement | null}
 */
function wikiNoteButton(category, note) {
  if (note === undefined) {
    return null;
  }
  return h(
    'button',
    {
      type: 'button',
      class: 'wiki-note',
      'aria-label': `What the Noita wiki says about ${category.label}`,
      dataset: { tooltip: note },
    },
    '?',
  );
}

/**
 * @param {Enemy} enemy
 * @returns {{ row: HTMLElement, cells: HTMLElement[] }}
 */
function createRow(enemy) {
  const cells = CATEGORIES.map((category) =>
    h(
      'div',
      { class: 'cell value', role: 'cell', dataset: { label: category.label } },
      h('span', { class: 'value-text' }, formatValue(category, enemy.values[category.key])),
      wikiNoteButton(category, enemy.wikiNotes[category.key]),
    ),
  );
  const row = h(
    'div',
    { class: 'row', role: 'row' },
    h('div', { class: 'cell sprite', role: 'cell' }, spriteOf(enemy)),
    h(
      'div',
      { class: 'cell name', role: 'rowheader' },
      h('span', { class: 'name-primary' }, enemy.name),
      enemy.aliases.length > 0 && h('span', { class: 'name-aliases' }, enemy.aliases.join(', ')),
    ),
    h('div', { class: 'values', role: 'none' }, cells),
  );
  return { row, cells };
}
