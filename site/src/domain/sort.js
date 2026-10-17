import { CATEGORIES } from './categories.js';
import { formatValue } from './format.js';
import { isRange } from './values.js';
/** @import { Enemy, Sort } from './types.js' */

/** Sort key for the enemy name column. */
export const NAME_KEY = 'name';

/**
 * Every column the list can be sorted by, in display order.
 * @type {readonly { key: string, label: string }[]}
 */
export const SORTABLE_COLUMNS = Object.freeze([
  Object.freeze({ key: NAME_KEY, label: 'Enemy' }),
  ...CATEGORIES.map(({ key, label }) => Object.freeze({ key, label })),
]);

/** @typedef {number | string | readonly number[] | null} SortValue  `null` (unknown) always sorts last. */

/**
 * Orders enemies by one column. Numbers compare numerically, heights by their lowest
 * value (then their highest), and lists by their displayed text, with empty lists first.
 * Unknown values stay last in both directions, and ties keep noitadle's order.
 * @param {readonly Enemy[]} enemies
 * @param {Sort | null} sort  `null` keeps the given order.
 * @returns {Enemy[]}
 */
export function sortEnemies(enemies, sort) {
  if (sort === null) {
    return [...enemies];
  }
  const valueOf = sortValueFor(sort.key);
  const sign = sort.direction === 'asc' ? 1 : -1;
  return [...enemies].sort((a, b) => {
    const x = valueOf(a);
    const y = valueOf(b);
    if (x === null || y === null) {
      return Number(x === null) - Number(y === null);
    }
    return sign * compare(x, y);
  });
}

/**
 * @param {string} key
 * @returns {(enemy: Enemy) => SortValue}
 */
function sortValueFor(key) {
  if (key === NAME_KEY) {
    return (enemy) => enemy.name;
  }
  const category = CATEGORIES.find((c) => c.key === key);
  if (!category) {
    throw new Error(`Unknown sort key: ${key}`);
  }
  return (enemy) => {
    const value = enemy.values[category.key] ?? null;
    if (value === null || typeof value === 'number') {
      return value;
    }
    if (isRange(value)) {
      return [value.min, value.max];
    }
    return value.length === 0 ? '' : formatValue(category, value);
  };
}

/**
 * @param {Exclude<SortValue, null>} x
 * @param {Exclude<SortValue, null>} y
 * @returns {number}
 */
function compare(x, y) {
  if (typeof x === 'number' && typeof y === 'number') {
    return x - y;
  }
  if (Array.isArray(x) && Array.isArray(y)) {
    return x[0] - y[0] || x[1] - y[1];
  }
  return String(x).localeCompare(String(y), undefined, { numeric: true, sensitivity: 'base' });
}
