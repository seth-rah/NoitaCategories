import { CATEGORIES, KIND, NONE, isBlockKind } from './categories.js';
import { isRange } from './values.js';
/** @import { BlockFilter, Category, Enemy, Filter, FilterState, MatchStrength, NumberFilter, Range, RangeFilter, Value } from './types.js' */

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
 * How strongly a value that passes its filter matches it. An exact height that
 * only falls inside an enemy's height range is partial; everything else is full.
 * @param {Category} category
 * @param {Value} value  A value that satisfies `filter`.
 * @param {Filter} filter
 * @returns {MatchStrength}
 */
export function matchStrength(category, value, filter) {
  const range = /** @type {RangeFilter} */ (filter);
  const isPartialHeight =
    category.kind === KIND.RANGE &&
    range.mode === 'exact' &&
    isRange(value) &&
    value.min !== value.max;
  return isPartialHeight ? 'partial' : 'full';
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
  if (value === null) {
    return false;
  }
  if (category.kind === KIND.RANGE) {
    return isRange(value) && satisfiesRange(value, /** @type {RangeFilter} */ (filter));
  }
  if (isBlockKind(category)) {
    return Array.isArray(value) && satisfiesBlocks(value, /** @type {BlockFilter} */ (filter));
  }
  return typeof value === 'number' && satisfiesNumber(value, /** @type {NumberFilter} */ (filter));
}

/**
 * @param {number} value
 * @param {NumberFilter} filter
 * @returns {boolean}
 */
function satisfiesNumber(value, filter) {
  const actual = toDisplayedPrecision(value);
  const target = toDisplayedPrecision(filter.value);
  switch (filter.op) {
    case '=':
      return actual === target;
    case '>':
      return actual > target;
    case '<':
      return actual < target;
  }
}

/**
 * @param {number} value
 * @returns {number} The value scaled to a whole number at the precision noitadle displays.
 */
function toDisplayedPrecision(value) {
  return Math.round(value * 10 ** DISPLAYED_DECIMAL_PLACES);
}

/**
 * Inclusive at both ends. An exact height must lie within the enemy's range; a
 * filter range (lowest to highest) must contain the enemy's whole range.
 * @param {Range} range
 * @param {RangeFilter} filter
 * @returns {boolean}
 */
function satisfiesRange(range, filter) {
  if (filter.mode === 'exact') {
    return range.min <= filter.value && filter.value <= range.max;
  }
  return filter.from <= range.min && range.max <= filter.to;
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
