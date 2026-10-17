import { CATEGORIES } from '../domain/categories.js';
import { isActive } from '../domain/filter.js';
import { summarizeFilter } from '../domain/format.js';
import { clearAll, clearFilter, toggleCategory } from '../state/actions.js';
import { h, replaceChildren } from './dom.js';
import { categoryButtonId } from './panel.js';
/** @import { AppState } from '../domain/types.js' */
/** @import { Store } from './store.js' */

/**
 * The category list. Each category shows its active filter and can be cleared on its own.
 * @param {HTMLElement} sidebar
 * @param {Store} store
 */
export function mountSidebar(sidebar, store) {
  const clearAllButton = h(
    'button',
    { type: 'button', class: 'text-button', onClick: () => store.dispatch(clearAll) },
    'Clear all',
  );

  const items = CATEGORIES.map((category) => {
    const summary = h('span', { class: 'category-summary' });
    const toggle = h(
      'button',
      {
        type: 'button',
        id: categoryButtonId(category.key),
        class: 'category-button',
        'aria-controls': 'panel',
        'aria-expanded': 'false',
        onClick: () => store.dispatch(toggleCategory, category.key),
      },
      h('span', { class: 'category-label' }, category.label),
      summary,
    );
    const clear = h(
      'button',
      {
        type: 'button',
        class: 'icon-button category-clear',
        'aria-label': `Clear ${category.label}`,
        onClick: () => store.dispatch(clearFilter, category.key),
      },
      '×',
    );
    const item = h('li', { class: 'category' }, toggle, clear);

    /** @param {AppState} state */
    function update(state) {
      const active = isActive(state.filters, category.key);
      item.classList.toggle('is-active', active);
      item.classList.toggle('is-open', state.openKey === category.key);
      toggle.setAttribute('aria-expanded', String(state.openKey === category.key));
      replaceChildren(
        summary,
        active ? summarizeFilter(category, state.filters[category.key]) : '',
      );
      clear.hidden = !active;
    }
    return { item, update };
  });

  /** @param {AppState} state */
  function update(state) {
    clearAllButton.disabled = Object.keys(state.filters).length === 0;
    items.forEach((entry) => entry.update(state));
  }

  replaceChildren(
    sidebar,
    h(
      'header',
      { class: 'sidebar-header' },
      h('h1', { class: 'title' }, 'Noita Categories'),
      clearAllButton,
    ),
    h(
      'ul',
      { class: 'categories' },
      items.map((entry) => entry.item),
    ),
  );
  store.subscribe(update);
  update(store.get());
}
