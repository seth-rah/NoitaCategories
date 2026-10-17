import { KIND, categoryByKey } from '../domain/categories.js';
import { selectedBlocks } from '../domain/filter.js';
/** @import { AppState, Filter, FilterState, Sort } from '../domain/types.js' */

/** @type {AppState} */
export const INITIAL_STATE = Object.freeze({
  filters: Object.freeze({}),
  openKey: null,
  sort: null,
});

/**
 * Expands a category's editor, or collapses it when it is already expanded.
 * Expanding one category replaces any other; filters are kept either way.
 * @param {AppState} state
 * @param {string} key
 * @returns {AppState}
 */
export function toggleCategory(state, key) {
  return Object.freeze({ ...state, openKey: state.openKey === key ? null : key });
}

/**
 * @param {AppState} state
 * @returns {AppState}
 */
export function closePanel(state) {
  return state.openKey === null ? state : Object.freeze({ ...state, openKey: null });
}

/**
 * @param {AppState} state
 * @param {string} key
 * @param {Filter | undefined} filter  `undefined` clears the category.
 * @returns {AppState}
 */
export function setFilter(state, key, filter) {
  const filters = { ...state.filters };
  if (filter === undefined) {
    delete filters[key];
  } else {
    filters[key] = filter;
  }
  return withFilters(state, filters);
}

/**
 * Selects a block value, or deselects it when already selected. In single-choice
 * categories a new value replaces the current one.
 * @param {AppState} state
 * @param {string} key
 * @param {string} value
 * @returns {AppState}
 */
export function toggleBlockValue(state, key, value) {
  const current = selectedBlocks(state.filters, key);
  const singleChoice = categoryByKey(key).kind === KIND.ONE_OF;
  const selected = new Set(singleChoice ? [] : current);
  if (current.has(value)) {
    selected.delete(value);
  } else {
    selected.add(value);
  }
  return setFilter(state, key, selected.size === 0 ? undefined : selected);
}

/**
 * @param {AppState} state
 * @param {string} key
 * @returns {AppState}
 */
export function clearFilter(state, key) {
  return setFilter(state, key, undefined);
}

/**
 * @param {AppState} state
 * @returns {AppState}
 */
export function clearAll(state) {
  return withFilters(state, {});
}

/**
 * Clicking a column: ascending first, then descending, then back to noitadle's order.
 * Clicking a different column starts it ascending.
 * @param {AppState} state
 * @param {string} key
 * @returns {AppState}
 */
export function cycleSort(state, key) {
  const { sort } = state;
  if (sort?.key !== key) {
    return setSort(state, { key, direction: 'asc' });
  }
  return setSort(state, sort.direction === 'asc' ? { key, direction: 'desc' } : null);
}

/**
 * @param {AppState} state
 * @param {Sort | null} sort  `null` restores noitadle's order.
 * @returns {AppState}
 */
export function setSort(state, sort) {
  return Object.freeze({ ...state, sort: sort && Object.freeze({ ...sort }) });
}

/**
 * @param {AppState} state
 * @param {FilterState} filters
 * @returns {AppState}
 */
function withFilters(state, filters) {
  return Object.freeze({ ...state, filters: Object.freeze(filters) });
}
