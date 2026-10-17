import { SORTABLE_COLUMNS } from '../domain/sort.js';
import { setSort } from '../state/actions.js';
import { h, replaceChildren } from './dom.js';
/** @import { AppState } from '../domain/types.js' */
/** @import { Store } from './store.js' */

const DEFAULT_ORDER = '';

/**
 * Sorting for layouts without column headers (phones): a column picker and a
 * direction toggle, kept in sync with the header sort.
 * @param {HTMLElement} root
 * @param {Store} store
 */
export function mountSortControl(root, store) {
  const select = h(
    'select',
    {
      id: 'sort-key',
      class: 'sort-select',
      onChange: () => {
        const direction = store.get().sort?.direction ?? 'asc';
        store.dispatch(
          setSort,
          select.value === DEFAULT_ORDER ? null : { key: select.value, direction },
        );
      },
    },
    h('option', { value: DEFAULT_ORDER }, 'noitadle order'),
    SORTABLE_COLUMNS.map((column) => h('option', { value: column.key }, column.label)),
  );
  const direction = h('button', {
    type: 'button',
    class: 'text-button sort-direction',
    onClick: () => {
      const { sort } = store.get();
      if (sort) {
        store.dispatch(setSort, { ...sort, direction: sort.direction === 'asc' ? 'desc' : 'asc' });
      }
    },
  });

  /** @param {AppState} state */
  function update(state) {
    select.value = state.sort?.key ?? DEFAULT_ORDER;
    direction.disabled = state.sort === null;
    replaceChildren(direction, state.sort?.direction === 'desc' ? '▼ Descending' : '▲ Ascending');
  }

  replaceChildren(root, h('label', { for: 'sort-key' }, 'Sort by'), select, direction);
  store.subscribe((state, previous) => {
    if (state.sort !== previous.sort) {
      update(state);
    }
  });
  update(store.get());
}
