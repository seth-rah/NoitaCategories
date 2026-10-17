import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { selectedBlocks } from '../../site/src/domain/filter.js';
import {
  INITIAL_STATE,
  closePanel,
  setFilter,
  toggleBlockValue,
  toggleCategory,
} from '../../site/src/state/actions.js';

describe('Category panel', () => {
  it('clicking a category expands it', () => {
    assert.equal(toggleCategory(INITIAL_STATE, 'spawn').openKey, 'spawn');
  });

  it('clicking another category replaces the expanded one and keeps earlier selections', () => {
    let state = toggleCategory(INITIAL_STATE, 'spawn');
    state = toggleBlockValue(state, 'spawn', 'Mines');
    state = toggleCategory(state, 'faction');

    assert.equal(state.openKey, 'faction');
    assert.deepEqual([...selectedBlocks(state.filters, 'spawn')], ['Mines']);

    state = toggleCategory(state, 'spawn');
    assert.deepEqual([...selectedBlocks(state.filters, 'spawn')], ['Mines']);
  });

  it('selecting values does not dismiss the panel', () => {
    let state = toggleCategory(INITIAL_STATE, 'immunities');
    state = toggleBlockValue(state, 'immunities', 'fire');
    state = toggleBlockValue(state, 'immunities', 'melee');
    state = setFilter(state, 'gold', { op: '>', value: 10 });

    assert.equal(state.openKey, 'immunities');
  });

  it('clicking the open category again dismisses it', () => {
    const state = toggleCategory(toggleCategory(INITIAL_STATE, 'gold'), 'gold');
    assert.equal(state.openKey, null);
  });

  it('dismissing the panel keeps the selections', () => {
    let state = toggleCategory(INITIAL_STATE, 'faction');
    state = toggleBlockValue(state, 'faction', 'orcs');
    state = closePanel(state);

    assert.equal(state.openKey, null);
    assert.deepEqual([...selectedBlocks(state.filters, 'faction')], ['orcs']);
  });
});
