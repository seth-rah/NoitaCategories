import { KIND } from '../domain/categories.js';
import { optionsFor } from '../domain/filter.js';
import { formatItem } from '../domain/format.js';
import { sanitizeNumber, toNumber } from '../domain/sanitize.js';
import { h, replaceChildren } from './dom.js';
/** @import { BlockFilter, Category, Enemy, Filter, NumberFilter, RangeFilter } from '../domain/types.js' */

/**
 * @typedef {object} EditorContext
 * @property {Category} category
 * @property {Filter | undefined} filter        The filter when the editor opened.
 * @property {readonly Enemy[]} enemies
 * @property {(filter: Filter | undefined) => void} setFilter
 * @property {(value: string) => BlockFilter} toggleBlock  Returns the resulting selection.
 */

/**
 * @template {string} T
 * @typedef {{ value: T, label: string }} Choice
 */

/** @type {readonly Choice<NumberFilter['op']>[]} */
const OPERATORS = Object.freeze([
  { value: '=', label: 'Exactly' },
  { value: '>', label: 'More than' },
  { value: '<', label: 'Less than' },
]);

/** @type {readonly Choice<RangeFilter['mode']>[]} */
const HEIGHT_MODES = Object.freeze([
  { value: 'exact', label: 'Exact' },
  { value: 'range', label: 'Range' },
]);

/** @type {Readonly<Record<RangeFilter['mode'], string>>} */
const HEIGHT_HINTS = Object.freeze({
  exact: 'Whole pixels. Green is an exact height; yellow means it falls within the enemy’s range.',
  range: 'Shows enemies whose whole height fits between lowest and highest, inclusive.',
});

/**
 * Builds the input for a category. Editors own their controls while open:
 * they commit through the context and never rebuild themselves.
 * @param {EditorContext} context
 * @returns {HTMLElement}
 */
export function createEditor(context) {
  switch (context.category.kind) {
    case KIND.DECIMAL:
    case KIND.INTEGER:
      return numberEditor(context);
    case KIND.RANGE:
      return heightEditor(context);
    case KIND.ALL_OF:
    case KIND.ONE_OF:
      return blockEditor(context);
  }
}

/**
 * Comparison buttons plus a number input masked to the category's precision.
 * @param {EditorContext} context
 * @returns {HTMLElement}
 */
function numberEditor({ category, filter, setFilter }) {
  const current = /** @type {NumberFilter | undefined} */ (filter);
  const decimals = category.kind === KIND.DECIMAL ? 1 : 0;
  let op = current?.op ?? '=';

  const input = numberInput({
    decimals,
    value: current?.value,
    label: `${category.label} value`,
    placeholder: decimals > 0 ? 'e.g. 2.5' : 'e.g. 10',
    onChange: commit,
  });

  function commit() {
    const value = toNumber(input.value);
    setFilter(value === undefined ? undefined : { op, value });
  }

  return h(
    'div',
    { class: 'editor' },
    segmented('Comparison', OPERATORS, op, (value) => {
      op = value;
      commit();
    }),
    input,
    h(
      'p',
      { class: 'hint' },
      decimals > 0 ? '0 or higher, one decimal place' : 'Whole number, 0 or higher',
    ),
  );
}

/**
 * An exact height, or the lowest and highest heights an enemy may span; both inclusive.
 * @param {EditorContext} context
 * @returns {HTMLElement}
 */
function heightEditor({ category, filter, setFilter }) {
  const current = /** @type {RangeFilter | undefined} */ (filter);
  let mode = current?.mode ?? 'exact';

  const exact = numberInput({
    decimals: 0,
    value: current?.mode === 'exact' ? current.value : undefined,
    label: `Exact ${category.label}`,
    placeholder: 'e.g. 12',
    onChange: commit,
  });
  const from = numberInput({
    decimals: 0,
    value: current?.mode === 'range' ? current.from : undefined,
    label: 'Lowest',
    placeholder: 'Lowest',
    onChange: commit,
  });
  const to = numberInput({
    decimals: 0,
    value: current?.mode === 'range' ? current.to : undefined,
    label: 'Highest',
    placeholder: 'Highest',
    onChange: commit,
  });
  const exactRow = h('div', { class: 'field-row' }, exact);
  const rangeRow = h('div', { class: 'field-row' }, from, h('span', { class: 'dash' }, '–'), to);

  const hint = h('p', { class: 'hint' });

  function render() {
    exactRow.hidden = mode !== 'exact';
    rangeRow.hidden = mode !== 'range';
    replaceChildren(hint, HEIGHT_HINTS[mode]);
  }

  function commit() {
    if (mode === 'exact') {
      const value = toNumber(exact.value);
      setFilter(value === undefined ? undefined : { mode, value });
      return;
    }
    const lowest = toNumber(from.value);
    const highest = toNumber(to.value);
    setFilter(
      lowest === undefined || highest === undefined
        ? undefined
        : { mode, from: lowest, to: highest },
    );
  }

  render();
  return h(
    'div',
    { class: 'editor' },
    segmented('Height mode', HEIGHT_MODES, mode, (value) => {
      mode = value;
      render();
      commit();
    }),
    exactRow,
    rangeRow,
    hint,
  );
}

/** @type {Readonly<Record<string, string>>} */
const BLOCK_HINTS = Object.freeze({
  [KIND.ALL_OF]: 'Select any number; shows enemies with every selected value.',
  [KIND.ONE_OF]: 'Enemies have one value here; selecting another replaces it.',
});

/**
 * Every value the category takes, as toggleable blocks. Selecting never closes the panel.
 * @param {EditorContext} context
 * @returns {HTMLElement}
 */
function blockEditor({ category, filter, enemies, toggleBlock }) {
  const initial = /** @type {BlockFilter | undefined} */ (filter) ?? new Set();
  const options = optionsFor(category, enemies);
  /** @type {HTMLButtonElement[]} */
  const buttons = [];

  /** @param {BlockFilter} selected */
  function sync(selected) {
    buttons.forEach((button, i) =>
      button.setAttribute('aria-pressed', String(selected.has(options[i].value))),
    );
  }

  return h(
    'div',
    { class: 'editor' },
    h('p', { class: 'hint' }, BLOCK_HINTS[category.kind]),
    h(
      'div',
      { class: 'blocks', role: 'group', 'aria-label': category.label },
      options.map((option) => {
        const button = h(
          'button',
          {
            type: 'button',
            class: 'block',
            'aria-pressed': String(initial.has(option.value)),
            onClick: () => sync(toggleBlock(option.value)),
          },
          h('span', { class: 'block-label' }, formatItem(category, option.value)),
          h(
            'span',
            { class: 'block-count', 'aria-label': `${option.count} enemies` },
            option.count,
          ),
        );
        buttons.push(button);
        return button;
      }),
    ),
  );
}

/**
 * A row of mutually exclusive toggle buttons.
 * @template {string} T
 * @param {string} label
 * @param {readonly Choice<T>[]} choices
 * @param {T} initial
 * @param {(value: T) => void} onSelect
 * @returns {HTMLElement}
 */
function segmented(label, choices, initial, onSelect) {
  const buttons = choices.map((choice) =>
    h(
      'button',
      {
        type: 'button',
        class: 'segment',
        'aria-pressed': String(choice.value === initial),
        onClick: () => {
          buttons.forEach((button, i) =>
            button.setAttribute('aria-pressed', String(choices[i] === choice)),
          );
          onSelect(choice.value);
        },
      },
      choice.label,
    ),
  );
  return h('div', { class: 'segmented', role: 'group', 'aria-label': label }, buttons);
}

/**
 * A text input that only ever holds a non-negative number of the given precision.
 * @param {object} options
 * @param {number} options.decimals
 * @param {number | undefined} options.value
 * @param {string} options.label
 * @param {string} options.placeholder
 * @param {() => void} options.onChange
 * @returns {HTMLInputElement}
 */
function numberInput({ decimals, value, label, placeholder, onChange }) {
  const input = h('input', {
    type: 'text',
    class: 'number-input',
    inputmode: decimals > 0 ? 'decimal' : 'numeric',
    autocomplete: 'off',
    'aria-label': label,
    placeholder,
    value: value === undefined ? '' : String(value),
    onInput: () => {
      const clean = sanitizeNumber(input.value, { decimals });
      if (clean !== input.value) {
        input.value = clean;
      }
      onChange();
    },
  });
  return input;
}
