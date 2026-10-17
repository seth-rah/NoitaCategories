import { categoryByKey } from '../domain/categories.js';
import { selectedBlocks } from '../domain/filter.js';
import { closePanel, setFilter, toggleBlockValue } from '../state/actions.js';
import { h, replaceChildren } from './dom.js';
import { createEditor } from './editors.js';
/** @import { AppState, Enemy } from '../domain/types.js' */
/** @import { Store } from './store.js' */

/**
 * The expanded editor for the selected category. It stays open while values are
 * chosen and closes only on its close button, Escape, the same sidebar button,
 * or a click outside the sidebar and panel.
 * @param {HTMLElement} panel
 * @param {Store} store
 * @param {readonly Enemy[]} enemies
 */
export function mountPanel(panel, store, enemies) {
  let isApplyingEditorChange = false;

  /** @param {() => void} change */
  function applyEditorChange(change) {
    isApplyingEditorChange = true;
    try {
      change();
    } finally {
      isApplyingEditorChange = false;
    }
  }

  /** @param {MouseEvent} event */
  function closeWhenClickedOutside(event) {
    const target = /** @type {Element} */ (event.target);
    if (!target.closest('.sidebar, .panel')) {
      store.dispatch(closePanel);
    }
  }

  /** @param {KeyboardEvent} event */
  function closeOnEscape(event) {
    const { openKey } = store.get();
    if (event.key === 'Escape' && openKey !== null) {
      store.dispatch(closePanel);
      document.getElementById(categoryButtonId(openKey))?.focus();
    }
  }

  /** @param {AppState} state */
  function render(state) {
    panel.hidden = state.openKey === null;
    if (state.openKey === null) {
      replaceChildren(panel);
      return;
    }
    const category = categoryByKey(state.openKey);
    const key = category.key;
    replaceChildren(
      panel,
      h(
        'header',
        { class: 'panel-header' },
        h('h2', { id: 'panel-title' }, category.label),
        h(
          'button',
          {
            type: 'button',
            class: 'icon-button',
            'aria-label': `Close ${category.label}`,
            onClick: () => store.dispatch(closePanel),
          },
          '×',
        ),
      ),
      createEditor({
        category,
        filter: state.filters[key],
        enemies,
        setFilter: (filter) => applyEditorChange(() => store.dispatch(setFilter, key, filter)),
        toggleBlock: (value) => {
          applyEditorChange(() => store.dispatch(toggleBlockValue, key, value));
          return selectedBlocks(store.get().filters, key);
        },
      }),
    );
  }

  store.subscribe((state, previous) => {
    const openChanged = state.openKey !== previous.openKey;
    const openFilterChangedOutsideEditor =
      state.openKey !== null &&
      !isApplyingEditorChange &&
      state.filters[state.openKey] !== previous.filters[state.openKey];
    if (openChanged || openFilterChangedOutsideEditor) {
      render(state);
    }
  });

  document.addEventListener('click', closeWhenClickedOutside);
  document.addEventListener('keydown', closeOnEscape);

  render(store.get());
}

/**
 * @param {string} key
 * @returns {string} The id of the sidebar button that expands the category.
 */
export function categoryButtonId(key) {
  return `category-${key}`;
}
