import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { categoryByKey } from '../../site/src/domain/categories.js';
import { applyFilters, matchStrength } from '../../site/src/domain/filter.js';
import { INITIAL_STATE, setFilter } from '../../site/src/state/actions.js';
import { ENEMIES, HAULIKKOHIISI, PIKKUMATO, SUHISEVA_LAMMAS, names } from './fixtures.js';
/** @import { Enemy, RangeFilter } from '../../site/src/domain/types.js' */

const HEIGHT = categoryByKey('height');

/** @param {RangeFilter} filter */
function withHeight(filter) {
  return names(applyFilters(ENEMIES, setFilter(INITIAL_STATE, 'height', filter).filters));
}

/**
 * @param {Enemy} enemy
 * @param {RangeFilter} filter
 */
function highlight(enemy, filter) {
  return matchStrength(HEIGHT, enemy.values.height, filter);
}

describe('Height filter', () => {
  it('an exact height matches enemies whose range includes it, inclusive at both ends', () => {
    assert.ok(withHeight({ mode: 'exact', value: 12 }).includes('Suhiseva lammas'));
    assert.ok(withHeight({ mode: 'exact', value: 18 }).includes('Suhiseva lammas'));
    assert.deepEqual(withHeight({ mode: 'exact', value: 8 }), ['Pikkumato']);
    assert.ok(!withHeight({ mode: 'exact', value: 11 }).includes('Suhiseva lammas'));
  });

  it('an exact height is green only for a 100% match and yellow when it falls within a range', () => {
    assert.equal(highlight(PIKKUMATO, { mode: 'exact', value: 8 }), 'full');
    assert.equal(highlight(SUHISEVA_LAMMAS, { mode: 'exact', value: 14 }), 'partial');
    assert.equal(highlight(SUHISEVA_LAMMAS, { mode: 'exact', value: 12 }), 'partial');
  });

  it('a height range shows only enemies whose whole height lies between lowest and highest, inclusive', () => {
    assert.deepEqual(withHeight({ mode: 'range', from: 12, to: 18 }), [
      'Suhiseva lammas',
      'Haulikkohiisi',
      'Hornahiisi',
    ]);
    assert.deepEqual(withHeight({ mode: 'range', from: 13, to: 15 }), ['Haulikkohiisi']);
    assert.deepEqual(withHeight({ mode: 'range', from: 19, to: 25 }), ['Kummitus']);
  });

  it('an enemy reaching past either bound is not shown', () => {
    assert.ok(!withHeight({ mode: 'range', from: 13, to: 18 }).includes('Suhiseva lammas'));
    assert.ok(!withHeight({ mode: 'range', from: 12, to: 17 }).includes('Suhiseva lammas'));
  });

  it('the first value is the lowest and the second the highest, so a reversed range matches nothing', () => {
    assert.deepEqual(withHeight({ mode: 'range', from: 25, to: 19 }), []);
  });

  it('a height range match is green', () => {
    assert.equal(highlight(HAULIKKOHIISI, { mode: 'range', from: 12, to: 18 }), 'full');
  });
});
