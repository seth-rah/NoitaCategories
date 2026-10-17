import { KIND, NONE, UNKNOWN, isBlockKind } from './categories.js';
import { isRange } from './values.js';
/** @import { BlockFilter, Category, Filter, NumberFilter, RangeFilter, Value } from './types.js' */

const LIST_SEPARATOR = ', ';

/**
 * Item labels that noitadle words differently from its raw data, per category.
 * @type {Readonly<Record<string, Readonly<Record<string, string>>>>}
 */
const ITEM_LABELS = Object.freeze({
  movement: Object.freeze({ burrow: 'burrow / phasing' }),
});

/**
 * A single block value as noitadle shows it.
 * @param {Category} category
 * @param {string} item
 * @returns {string}
 */
export function formatItem(category, item) {
  return ITEM_LABELS[category.key]?.[item] ?? item;
}

/**
 * An enemy's value as noitadle shows it in a guess row.
 * @param {Category} category
 * @param {Value} value
 * @returns {string}
 */
export function formatValue(category, value) {
  if (value === null) {
    return UNKNOWN;
  }
  if (Array.isArray(value)) {
    return value.length === 0
      ? NONE
      : value.map((item) => formatItem(category, item)).join(LIST_SEPARATOR);
  }
  if (isRange(value)) {
    return value.min === value.max ? String(value.min) : `${value.min}-${value.max}`;
  }
  return String(value);
}

/**
 * A compact description of an active filter, for the sidebar.
 * @param {Category} category
 * @param {Filter} filter
 * @returns {string} e.g. `'> 10'`, `'12–18'`, `'blood +2'`.
 */
export function summarizeFilter(category, filter) {
  if (isBlockKind(category)) {
    const [first, ...rest] = /** @type {BlockFilter} */ (filter);
    const label = first === undefined ? '' : formatItem(category, first);
    return rest.length > 0 ? `${label} +${rest.length}` : label;
  }
  if (category.kind === KIND.RANGE) {
    const range = /** @type {RangeFilter} */ (filter);
    return range.mode === 'exact' ? String(range.value) : `${range.from}–${range.to}`;
  }
  const number = /** @type {NumberFilter} */ (filter);
  return `${number.op} ${number.value}`;
}
