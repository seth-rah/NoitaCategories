/** @import { Category } from './types.js' */

/** The ways a category can be parsed, filtered and edited. */
export const KIND = Object.freeze(
  /** @type {const} */ ({
    DECIMAL: 'decimal',
    INTEGER: 'integer',
    RANGE: 'range',
    ALL_OF: 'allOf',
    ONE_OF: 'oneOf',
  }),
);

/** Block value that stands for "this enemy has no values in the category". */
export const NONE = 'none';

/** What noitadle shows when a value is unknown. */
export const UNKNOWN = '?';

/**
 * Every category noitadle compares, in noitadle's column order.
 * The single source of truth for parsing, filtering, editors and table columns.
 * @type {readonly Category[]}
 */
export const CATEGORIES = Object.freeze(
  [
    { key: 'hp', label: 'HP', kind: KIND.DECIMAL },
    { key: 'height', label: 'Height px', kind: KIND.RANGE },
    { key: 'attacks', label: 'Attacks', kind: KIND.ALL_OF },
    { key: 'spawn', label: 'Spawn', kind: KIND.ALL_OF },
    { key: 'faction', label: 'Faction', kind: KIND.ONE_OF },
    { key: 'movement', label: 'Movement', kind: KIND.ALL_OF },
    { key: 'immunities', label: 'Immunities', kind: KIND.ALL_OF },
    { key: 'gold', label: 'Gold', kind: KIND.INTEGER },
    { key: 'bleeds', label: 'Bleeds', kind: KIND.ONE_OF },
    { key: 'corpse', label: 'Corpse', kind: KIND.ONE_OF },
  ].map((category) => Object.freeze(category)),
);

/**
 * @param {string} key
 * @returns {Category}
 */
export function categoryByKey(key) {
  const category = CATEGORIES.find((c) => c.key === key);
  if (!category) {
    throw new Error(`Unknown category: ${key}`);
  }
  return category;
}

/**
 * @param {Category} category
 * @returns {boolean} Whether the category is edited as selectable blocks.
 */
export function isBlockKind(category) {
  return category.kind === KIND.ALL_OF || category.kind === KIND.ONE_OF;
}
