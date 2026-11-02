/**
 * @typedef {'decimal' | 'integer' | 'allOf' | 'oneOf'} Kind
 * How a category's values are filtered and edited. `decimal` and `integer` are numbers
 * (one decimal place or whole) compared by exactly / range / more than / less than;
 * `allOf` and `oneOf` are block lists taking many values or a single one.
 */

/**
 * @typedef {object} Category
 * @property {string} key        Stable identifier used in enemy values and filter state.
 * @property {string} label      Human-readable name shown in the UI.
 * @property {Kind} kind
 */

/**
 * A number that can vary, e.g. HP 25-50; a fixed number has `min` equal to `max`.
 * @typedef {object} Range
 * @property {number} min
 * @property {number} max
 */

/**
 * `Range` for HP, Height and Gold, a list for block categories, `null` when unknown.
 * @typedef {Range | string[] | null} Value
 */

/**
 * @typedef {object} Enemy
 * @property {string} name
 * @property {string[]} aliases
 * @property {string | null} wikiPage    Noita wiki page title, with `#Section` when the enemy
 *   has its own section; `null` when the wiki has no page for it.
 * @property {number} order                  noitadle's display order.
 * @property {string[]} images               Sprite paths relative to the site root.
 * @property {Record<string, Value>} values  Keyed by {@link Category.key}.
 */

/**
 * Exactly, more than or less than a value, or a lowest-highest range, all inclusive of
 * the bounds the user typed.
 * @typedef {{ mode: 'exact' | 'above' | 'below', value: number }
 *   | { mode: 'range', from: number, to: number }} NumberFilter
 */

/** @typedef {ReadonlySet<string>} BlockFilter */

/** @typedef {NumberFilter | BlockFilter} Filter */

/** @typedef {Readonly<Record<string, Filter>>} FilterState  Absent key = inactive. */

/** @typedef {'asc' | 'desc'} SortDirection */

/**
 * @typedef {object} Sort
 * @property {string} key  A category key, or `'name'` for the enemy name column.
 * @property {SortDirection} direction
 */

/**
 * How strongly a shown enemy's value satisfies its category's filter: `full` when the
 * filter equals the enemy's value exactly (e.g. exactly 10 for gold 10, range 25-50 for
 * HP 25-50, or every one of its attacks), `partial` for any other match.
 * @typedef {'full' | 'partial'} MatchStrength
 */

/**
 * @typedef {object} AppState
 * @property {FilterState} filters
 * @property {string | null} openKey  Category whose editor panel is expanded.
 * @property {Sort | null} sort       `null` keeps noitadle's order.
 */

export {};
