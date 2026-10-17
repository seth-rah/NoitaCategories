import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { NONE, categoryByKey } from '../../site/src/domain/categories.js';
import { applyFilters, optionsFor, selectedBlocks } from '../../site/src/domain/filter.js';
import { INITIAL_STATE, toggleBlockValue } from '../../site/src/state/actions.js';
import { ENEMIES, names } from './fixtures.js';

/**
 * @param {string} key
 * @param {string[]} values  Blocks the user clicks, in order.
 */
function withBlocks(key, values) {
  const state = values.reduce((s, value) => toggleBlockValue(s, key, value), INITIAL_STATE);
  return names(applyFilters(ENEMIES, state.filters));
}

/** @param {string} key */
function offered(key) {
  return optionsFor(categoryByKey(key), ENEMIES).map((option) => option.value);
}

describe('Block filters', () => {
  it('selecting several attacks shows only enemies with all of them', () => {
    assert.deepEqual(withBlocks('attacks', ['melee', 'projectile']), ['Haulikkohiisi']);
  });

  it('selecting several spawn biomes shows only enemies found in all of them', () => {
    assert.deepEqual(withBlocks('spawn', ['Coal Pits', 'Mines']), ['Haulikkohiisi']);
  });

  it('the "none" block shows only enemies without any value in that category', () => {
    assert.deepEqual(withBlocks('attacks', [NONE]), ['Suhiseva lammas']);
    assert.deepEqual(withBlocks('bleeds', [NONE]), ['Kummitus']);
  });

  it('faction, bleeds and corpse take one value: selecting another replaces it', () => {
    for (const [key, first, second] of [
      ['faction', 'ghost', 'orcs'],
      ['bleeds', 'blood', 'liquid fire'],
      ['corpse', 'meat', 'worm meat'],
    ]) {
      const state = toggleBlockValue(toggleBlockValue(INITIAL_STATE, key, first), key, second);
      assert.deepEqual([...selectedBlocks(state.filters, key)], [second], key);
    }
    assert.deepEqual(withBlocks('faction', ['ghost', 'orcs']), ['Haulikkohiisi', 'Hornahiisi']);
  });

  it('multi-value categories keep every selection', () => {
    const state = toggleBlockValue(
      toggleBlockValue(INITIAL_STATE, 'spawn', 'Mines'),
      'spawn',
      'Hell',
    );
    assert.deepEqual([...selectedBlocks(state.filters, 'spawn')], ['Mines', 'Hell']);
  });

  it('clicking a selected block again deselects it', () => {
    assert.deepEqual(withBlocks('faction', ['ghost', 'ghost']), names(ENEMIES));
  });

  it('spawn biomes are offered alphabetically', () => {
    assert.deepEqual(offered('spawn'), [
      'Coal Pits',
      'Desert',
      'Hell',
      'Mines',
      'Polymorph',
      'Snowy Depths',
    ]);
  });

  it('factions are offered alphabetically', () => {
    assert.deepEqual(offered('faction'), ['ghost', 'helpless', 'orcs', 'worm']);
  });

  it('"none" is offered last, and only when some enemy has no value', () => {
    assert.equal(offered('immunities').at(-1), NONE);
    assert.ok(!offered('faction').includes(NONE));
  });

  it('every option offered matches exactly the number of enemies it reports', () => {
    for (const key of ['attacks', 'spawn', 'faction', 'movement', 'immunities', 'bleeds']) {
      for (const option of optionsFor(categoryByKey(key), ENEMIES)) {
        assert.equal(
          withBlocks(key, [option.value]).length,
          option.count,
          `${key}: ${option.value}`,
        );
      }
    }
  });
});
