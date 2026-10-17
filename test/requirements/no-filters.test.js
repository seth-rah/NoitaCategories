import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { applyFilters } from '../../site/src/domain/filter.js';
import {
  INITIAL_STATE,
  clearAll,
  clearFilter,
  setFilter,
  toggleBlockValue,
} from '../../site/src/state/actions.js';
import { ENEMIES, names } from './fixtures.js';

describe('Unfiltered list', () => {
  it('shows every enemy when no filters are set', () => {
    assert.deepEqual(names(applyFilters(ENEMIES, INITIAL_STATE.filters)), names(ENEMIES));
  });

  it('shows every enemy again after "clear all"', () => {
    let state = setFilter(INITIAL_STATE, 'gold', { op: '>', value: 10 });
    state = toggleBlockValue(state, 'faction', 'orcs');
    state = clearAll(state);

    assert.deepEqual(names(applyFilters(ENEMIES, state.filters)), names(ENEMIES));
  });

  it('clearing one category removes only that filter', () => {
    let state = setFilter(INITIAL_STATE, 'gold', { op: '=', value: 10 });
    state = toggleBlockValue(state, 'faction', 'orcs');
    state = clearFilter(state, 'gold');

    assert.deepEqual(Object.keys(state.filters), ['faction']);
    assert.deepEqual(names(applyFilters(ENEMIES, state.filters)), ['Haulikkohiisi', 'Hornahiisi']);
  });
});
