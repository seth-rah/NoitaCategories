import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { categoryByKey } from '../../site/src/domain/categories.js';
import { applyFilters, matchStrength } from '../../site/src/domain/filter.js';
import { sanitizeNumber } from '../../site/src/domain/sanitize.js';
import { INITIAL_STATE, setFilter } from '../../site/src/state/actions.js';
import { ENEMIES, RYNKKYHIISI, names } from './fixtures.js';
/** @import { Enemy, NumberFilter } from '../../site/src/domain/types.js' */

const GOLD = categoryByKey('gold');

/**
 * @param {NumberFilter} filter
 * @param {readonly Enemy[]} [enemies]
 */
function withGold(filter, enemies = ENEMIES) {
  return names(applyFilters(enemies, setFilter(INITIAL_STATE, 'gold', filter).filters));
}

describe('Gold filter', () => {
  it('"exactly 10 gold" shows only 10-gold enemies', () => {
    assert.deepEqual(withGold({ mode: 'exact', value: 10 }), [
      'Haulikkohiisi',
      'Kummitus',
      'Pikkumato',
    ]);
  });

  it('"more than 10 gold" excludes enemies with exactly 10', () => {
    assert.deepEqual(withGold({ mode: 'above', value: 10 }), ['Hornahiisi']);
  });

  it('"less than 10 gold" excludes enemies with exactly 10', () => {
    assert.deepEqual(withGold({ mode: 'below', value: 10 }), ['Suhiseva lammas']);
  });

  it('exact gold matches an enemy whose gold range includes it', () => {
    assert.deepEqual(withGold({ mode: 'exact', value: 15 }, [RYNKKYHIISI]), ['Rynkkyhiisi']);
  });

  it('"more than" matches an enemy whose gold can be higher', () => {
    assert.deepEqual(withGold({ mode: 'above', value: 10 }, [RYNKKYHIISI]), ['Rynkkyhiisi']);
    assert.deepEqual(withGold({ mode: 'above', value: 20 }, [RYNKKYHIISI]), []);
  });

  it('"less than" matches an enemy whose gold can be lower', () => {
    assert.deepEqual(withGold({ mode: 'below', value: 20 }, [RYNKKYHIISI]), ['Rynkkyhiisi']);
    assert.deepEqual(withGold({ mode: 'below', value: 10 }, [RYNKKYHIISI]), []);
  });

  it('a gold match is green only for the exact gold or range, otherwise yellow', () => {
    const range = RYNKKYHIISI.values.gold;
    assert.equal(matchStrength(GOLD, range, { mode: 'range', from: 10, to: 20 }), 'full');
    assert.equal(matchStrength(GOLD, range, { mode: 'above', value: 5 }), 'partial');
  });

  it('gold input accepts whole numbers 0 and higher only', () => {
    const integer = { decimals: 0 };
    assert.equal(sanitizeNumber('7.9', integer), '79');
    assert.equal(sanitizeNumber('-1', integer), '1');
    assert.equal(sanitizeNumber('abc', integer), '');
    assert.equal(sanitizeNumber('0', integer), '0');
  });
});
