import { KIND } from '../domain/categories.js';
import { optionsFor } from '../domain/filter.js';
import { formatItem } from '../domain/format.js';
import { sanitizeNumber, toNumber } from '../domain/sanitize.js';
import { h, replaceChildren } from './dom.js';
/** @import { BlockFilter, Category, Enemy, Filter, NumberFilter } from '../domain/types.js' */

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

/** @type {readonly Choice<NumberFilter['mode']>[]} */
const NUMBER_MODES = Object.freeze([
  { value: 'exact', label: 'Exactly' },
  { value: 'range', label: 'Range' },
  { value: 'above', label: 'More than' },
  { value: 'below', label: 'Less than' },
]);

/** @type {Readonly<Record<NumberFilter['mode'], string>>} */
const NUMBER_HINTS = Object.freeze({
  exact: 'Matches enemies whose value can be this. Green only when it is exactly this.',
  range:
    'Matches enemies whose whole value fits between lowest and highest, inclusive. Green only for that exact range.',
  above: 'Matches enemies whose value can be higher. Always yellow, as it is never exact.',
  below: 'Matches enemies whose value can be lower. Always yellow, as it is never exact.',
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
    case KIND.ALL_OF:
    case KIND.ONE_OF:
      return blockEditor(context);
  }
}

/**
 * Exactly, more than or less than a value, or a lowest-highest range, with inputs
 * masked to the category's precision. Typed numbers survive switching between modes.
 * @param {EditorContext} context
 * @returns {HTMLElement}
 */
function numberEditor({ category, filter, setFilter }) {
  const current = /** @type {NumberFilter | undefined} */ (filter);
  const decimals = category.kind === KIND.DECIMAL ? 1 : 0;
  let mode = current?.mode ?? 'exact';

  const value = numberInput({
    decimals,
    value: current && current.mode !== 'range' ? current.value : undefined,
    label: `${category.label} value`,
    placeholder: decimals > 0 ? 'e.g. 2.5' : 'e.g. 10',
    onChange: commit,
  });
  const lowest = numberInput({
    decimals,
    value: current?.mode === 'range' ? current.from : undefined,
    label: `Lowest ${category.label}`,
    placeholder: 'Lowest',
    onChange: commit,
  });
  const highest = numberInput({
    decimals,
    value: current?.mode === 'range' ? current.to : undefined,
    label: `Highest ${category.label}`,
    placeholder: 'Highest',
    onChange: commit,
  });
  const valueRow = h('div', { class: 'field-row' }, value);
  const rangeRow = h(
    'div',
    { class: 'field-row' },
    lowest,
    h('span', { class: 'dash' }, '–'),
    highest,
  );
  const hint = h('p', { class: 'hint' });

  function render() {
    valueRow.hidden = mode === 'range';
    rangeRow.hidden = mode !== 'range';
    replaceChildren(hint, NUMBER_HINTS[mode]);
  }

  function commit() {
    if (mode !== 'range') {
      const number = toNumber(value.value);
      setFilter(number === undefined ? undefined : { mode, value: number });
      return;
    }
    const from = toNumber(lowest.value);
    const to = toNumber(highest.value);
    setFilter(from === undefined || to === undefined ? undefined : { mode, from, to });
  }

  render();
  return h(
    'div',
    { class: 'editor' },
    segmented('Comparison', NUMBER_MODES, mode, (selected) => {
      mode = selected;
      render();
      commit();
    }),
    valueRow,
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
