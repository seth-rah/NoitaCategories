import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CATEGORIES, categoryByKey } from '../../site/src/domain/categories.js';
import { formatValue, summarizeFilter } from '../../site/src/domain/format.js';
import { PIKKUMATO, SUHISEVA_LAMMAS, UNKNOWN_ENEMY } from './fixtures.js';
/** @import { Enemy } from '../../site/src/domain/types.js' */

/** @param {Enemy} enemy */
function row(enemy) {
  return CATEGORIES.map((c) => formatValue(c, enemy.values[c.key])).join(' | ');
}

describe('Displayed values', () => {
  it('shows each enemy exactly as noitadle shows it', () => {
    assert.equal(
      row(SUHISEVA_LAMMAS),
      '5 | 12-18 | none | Polymorph | helpless | walk, fly | none | 0 | blood | meat of an innocent creature',
    );
  });

  it('shows a single height without a range', () => {
    assert.equal(formatValue(categoryByKey('height'), PIKKUMATO.values.height), '8');
  });

  it('shows burrow movement as "burrow / phasing"', () => {
    assert.equal(
      formatValue(categoryByKey('movement'), PIKKUMATO.values.movement),
      'burrow / phasing',
    );
  });

  it('shows an unknown value as "?"', () => {
    assert.equal(row(UNKNOWN_ENEMY), CATEGORIES.map(() => '?').join(' | '));
  });

  it('summarizes each active filter in the sidebar', () => {
    assert.equal(summarizeFilter(categoryByKey('gold'), { op: '>', value: 10 }), '> 10');
    assert.equal(summarizeFilter(categoryByKey('hp'), { op: '=', value: 2.5 }), '= 2.5');
    assert.equal(summarizeFilter(categoryByKey('height'), { mode: 'exact', value: 12 }), '12');
    assert.equal(
      summarizeFilter(categoryByKey('height'), { mode: 'range', from: 12, to: 18 }),
      '12–18',
    );
    assert.equal(summarizeFilter(categoryByKey('bleeds'), new Set(['blood'])), 'blood');
    assert.equal(
      summarizeFilter(categoryByKey('bleeds'), new Set(['blood', 'acid', 'oil'])),
      'blood +2',
    );
  });
});
