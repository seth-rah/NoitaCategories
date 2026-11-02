import { CATEGORIES, KIND, NONE, isBlockKind } from './categories.js';
import { isRange } from './values.js';
/** @import { BlockFilter, Category, Enemy, Filter, FilterState, MatchStrength, NumberFilter, Range, Value } from './types.js' */

/** @type {BlockFilter} */
const NO_BLOCKS = new Set();

const DISPLAYED_DECIMAL_PLACES = 1;

/**
 * @typedef {object} Option
 * @property {string} value
 * @property {number} count  How many enemies have this value.
 */

/**
 * @param {FilterState} state
 * @param {string} key
 * @returns {boolean} Whether a filter is set for the category.
 */
export function isActive(state, key) {
  return Object.hasOwn(state, key);
}

/**
 * @param {FilterState} state
 * @param {string} key  A block category.
 * @returns {BlockFilter} The selected blocks, empty when none are.
 */
export function selectedBlocks(state, key) {
  const filter = state[key];
  return filter instanceof Set ? filter : NO_BLOCKS;
}

/**
 * @param {Enemy} enemy
 * @param {FilterState} state
 * @returns {boolean} Whether the enemy satisfies every active filter.
 */
export function matches(enemy, state) {
  return CATEGORIES.every(
    (category) =>
      !isActive(state, category.key) ||
      satisfies(category, enemy.values[category.key] ?? null, state[category.key]),
  );
}

/**
 * @param {readonly Enemy[]} enemies
 * @param {FilterState} state
 * @returns {Enemy[]} The enemies that satisfy every active filter, in their original order.
 */
export function applyFilters(enemies, state) {
  return enemies.filter((enemy) => matches(enemy, state));
}

/**
 * How strongly a value that passes its filter matches it: full only when the filter
 * equals the enemy's value exactly, partial otherwise.
 * @param {Category} category
 * @param {Value} value  A value that satisfies `filter`.
 * @param {Filter} filter
 * @returns {MatchStrength}
 */
export function matchStrength(category, value, filter) {
  const exact = isBlockKind(category)
    ? Array.isArray(value) && isExactSelection(category, value, /** @type {BlockFilter} */ (filter))
    : isRange(value) && isExactNumber(value, /** @type {NumberFilter} */ (filter));
  return exact ? 'full' : 'partial';
}

/**
 * The selectable values of a block category, alphabetical, with {@link NONE} last
 * when some enemies have no values in it.
 * @param {Category} category
 * @param {readonly Enemy[]} enemies
 * @returns {Option[]}
 */
export function optionsFor(category, enemies) {
  /** @type {Map<string, number>} */
  const counts = new Map();
  let noneCount = 0;
  for (const enemy of enemies) {
    const value = enemy.values[category.key];
    if (!Array.isArray(value)) {
      continue;
    }
    if (value.length === 0) {
      noneCount += 1;
    }
    for (const item of value) {
      counts.set(item, (counts.get(item) ?? 0) + 1);
    }
  }
  const options = [...counts]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => a.value.localeCompare(b.value, undefined, { sensitivity: 'base' }));
  return noneCount > 0 ? [...options, { value: NONE, count: noneCount }] : options;
}

/**
 * @param {Category} category
 * @param {Value} value
 * @param {Filter} filter
 * @returns {boolean}
 */
function satisfies(category, value, filter) {
  if (isBlockKind(category)) {
    return Array.isArray(value) && satisfiesBlocks(value, /** @type {BlockFilter} */ (filter));
  }
  return isRange(value) && satisfiesNumber(value, /** @type {NumberFilter} */ (filter));
}

/**
 * Whether the enemy's value can satisfy the filter: exactly when the value lies within
 * its range, more or less than when any part of its range does, and a range when its
 * whole range fits inside the bounds. All bounds are inclusive.
 * @param {Range} range
 * @param {NumberFilter} filter
 * @returns {boolean}
 */
function satisfiesNumber(range, filter) {
  const min = scaled(range.min);
  const max = scaled(range.max);
  switch (filter.mode) {
    case 'exact':
      return min <= scaled(filter.value) && scaled(filter.value) <= max;
    case 'above':
      return max > scaled(filter.value);
    case 'below':
      return min < scaled(filter.value);
    case 'range':
      return scaled(filter.from) <= min && max <= scaled(filter.to);
  }
}

/**
 * @param {Range} range
 * @param {NumberFilter} filter
 * @returns {boolean} Whether the filter names exactly the enemy's value.
 */
function isExactNumber(range, filter) {
  const min = scaled(range.min);
  const max = scaled(range.max);
  switch (filter.mode) {
    case 'exact':
      return min === scaled(filter.value) && max === scaled(filter.value);
    case 'range':
      return min === scaled(filter.from) && max === scaled(filter.to);
    case 'above':
    case 'below':
      return false;
  }
}

/**
 * @param {number} value
 * @returns {number} The value as a whole number at the precision noitadle displays.
 */
function scaled(value) {
  return Math.round(value * 10 ** DISPLAYED_DECIMAL_PLACES);
}

/**
 * The enemy must have every selected value (single-choice categories hold at most one).
 * {@link NONE} stands for an empty list.
 * @param {string[]} values
 * @param {BlockFilter} selected
 * @returns {boolean}
 */
function satisfiesBlocks(values, selected) {
  return [...selected].every((item) =>
    item === NONE ? values.length === 0 : values.includes(item),
  );
}

/**
 * @param {Category} category
 * @param {string[]} values
 * @param {BlockFilter} selected
 * @returns {boolean} Whether the selection is exactly the enemy's values.
 */
function isExactSelection(category, values, selected) {
  if (category.kind === KIND.ONE_OF) {
    return true;
  }
  if (selected.has(NONE)) {
    return selected.size === 1 && values.length === 0;
  }
  return selected.size === values.length && values.every((value) => selected.has(value));
}
