/**
 * @typedef {'decimal' | 'integer' | 'range' | 'allOf' | 'oneOf'} Kind
 * How a category's values are parsed, filtered and edited.
 */

/**
 * @typedef {object} Category
 * @property {string} key        Stable identifier used in enemy values and filter state.
 * @property {string} label      Human-readable name shown in the UI.
 * @property {Kind} kind
 */

/**
 * @typedef {object} Range
 * @property {number} min
 * @property {number} max
 */

/** @typedef {number | Range | string[] | null} Value  `null` means unknown. */

/**
 * @typedef {object} Enemy
 * @property {string} name
 * @property {string[]} aliases
 * @property {string | null} wikiPage    Noita wiki page title, with `#Section` when the enemy
 *   has its own section; `null` when the wiki has no page for it.
 * @property {Readonly<Record<string, string>>} wikiNotes  Keyed by category key: what the
 *   Noita wiki states where it differs from noitadle.
 * @property {number} order                  noitadle's display order.
 * @property {string[]} images               Sprite paths relative to the site root.
 * @property {Record<string, Value>} values  Keyed by {@link Category.key}.
 */

/**
 * @typedef {object} NumberFilter
 * @property {'=' | '>' | '<'} op
 * @property {number} value
 */

/**
 * @typedef {{ mode: 'exact', value: number } | { mode: 'range', from: number, to: number }} RangeFilter
 */

/** @typedef {ReadonlySet<string>} BlockFilter */

/** @typedef {NumberFilter | RangeFilter | BlockFilter} Filter */

/** @typedef {Readonly<Record<string, Filter>>} FilterState  Absent key = inactive. */

/** @typedef {'asc' | 'desc'} SortDirection */

/**
 * @typedef {object} Sort
 * @property {string} key  A category key, or `'name'` for the enemy name column.
 * @property {SortDirection} direction
 */

/**
 * How strongly a shown enemy's value satisfies its category's filter:
 * `full` is an exact answer, `partial` an answer that only covers the filter
 * (e.g. a 12-18 height for an exact height of 14).
 * @typedef {'full' | 'partial'} MatchStrength
 */

/**
 * @typedef {object} AppState
 * @property {FilterState} filters
 * @property {string | null} openKey  Category whose editor panel is expanded.
 * @property {Sort | null} sort       `null` keeps noitadle's order.
 */

export {};
