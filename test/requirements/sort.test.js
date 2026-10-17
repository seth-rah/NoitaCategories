import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { applyFilters } from '../../site/src/domain/filter.js';
import { NAME_KEY, sortEnemies } from '../../site/src/domain/sort.js';
import {
  INITIAL_STATE,
  cycleSort,
  setFilter,
  toggleBlockValue,
} from '../../site/src/state/actions.js';
import { ENEMIES, PIKKUMATO, names } from './fixtures.js';
/** @import { AppState } from '../../site/src/domain/types.js' */

/**
 * @param {string} key
 * @param {number} clicks  How many times the column header is clicked.
 * @returns {AppState}
 */
function clickColumn(key, clicks) {
  let state = INITIAL_STATE;
  for (let i = 0; i < clicks; i += 1) {
    state = cycleSort(state, key);
  }
  return state;
}

/**
 * @param {string} key
 * @param {number} clicks
 */
function sortedBy(key, clicks) {
  return names(sortEnemies(ENEMIES, clickColumn(key, clicks).sort));
}

describe('Sorting', () => {
  it('clicking a column sorts ascending, again descending, and a third time restores the default order', () => {
    assert.deepEqual(clickColumn('gold', 1).sort, { key: 'gold', direction: 'asc' });
    assert.deepEqual(clickColumn('gold', 2).sort, { key: 'gold', direction: 'desc' });
    assert.equal(clickColumn('gold', 3).sort, null);
    assert.deepEqual(sortedBy('gold', 3), names(ENEMIES));
  });

  it('clicking a different column starts it ascending', () => {
    const state = cycleSort(clickColumn('gold', 2), 'hp');
    assert.deepEqual(state.sort, { key: 'hp', direction: 'asc' });
  });

  it('numbers sort numerically, including decimals', () => {
    assert.deepEqual(sortedBy('hp', 1), [
      'Kummitus',
      'Suhiseva lammas',
      'Pikkumato',
      'Haulikkohiisi',
      'Hornahiisi',
      'Unknown enemy',
    ]);
    assert.deepEqual(sortedBy('hp', 2), [
      'Hornahiisi',
      'Haulikkohiisi',
      'Pikkumato',
      'Suhiseva lammas',
      'Kummitus',
      'Unknown enemy',
    ]);
  });

  it('height ties on the lowest value fall back to the highest', () => {
    const range = {
      ...PIKKUMATO,
      name: 'Ranged Pikkumato',
      values: { ...PIKKUMATO.values, height: { min: 8, max: 9 } },
    };
    const order = names(sortEnemies([range, PIKKUMATO], { key: 'height', direction: 'asc' }));
    assert.deepEqual(order, ['Pikkumato', 'Ranged Pikkumato']);
  });

  it('height sorts by its first (lowest) value', () => {
    assert.deepEqual(sortedBy('height', 1), [
      'Pikkumato',
      'Suhiseva lammas',
      'Haulikkohiisi',
      'Hornahiisi',
      'Kummitus',
      'Unknown enemy',
    ]);
  });

  it('lists sort alphabetically by what is shown, with "none" first when ascending', () => {
    assert.deepEqual(sortedBy('bleeds', 1), [
      'Kummitus',
      'Suhiseva lammas',
      'Haulikkohiisi',
      'Hornahiisi',
      'Pikkumato',
      'Unknown enemy',
    ]);
  });

  it('names sort alphabetically', () => {
    assert.deepEqual(sortedBy(NAME_KEY, 1), [
      'Haulikkohiisi',
      'Hornahiisi',
      'Kummitus',
      'Pikkumato',
      'Suhiseva lammas',
      'Unknown enemy',
    ]);
  });

  it('unknown values stay last in both directions', () => {
    for (const clicks of [1, 2]) {
      assert.equal(sortedBy('gold', clicks).at(-1), 'Unknown enemy');
    }
  });

  it('equal values keep noitadle order', () => {
    const tenGold = sortedBy('gold', 1).filter((name) =>
      ['Haulikkohiisi', 'Kummitus', 'Pikkumato'].includes(name),
    );
    assert.deepEqual(tenGold, ['Haulikkohiisi', 'Kummitus', 'Pikkumato']);
  });

  it('sorting keeps the active filters and the filters keep the sort', () => {
    let state = setFilter(INITIAL_STATE, 'gold', { op: '=', value: 10 });
    state = cycleSort(cycleSort(state, 'hp'), 'hp');
    state = toggleBlockValue(state, 'attacks', 'melee');

    assert.deepEqual(names(sortEnemies(applyFilters(ENEMIES, state.filters), state.sort)), [
      'Haulikkohiisi',
      'Pikkumato',
      'Kummitus',
    ]);
  });
});
