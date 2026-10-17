import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { applyFilters } from '../../site/src/domain/filter.js';
import { sanitizeNumber } from '../../site/src/domain/sanitize.js';
import { INITIAL_STATE, setFilter } from '../../site/src/state/actions.js';
import { ENEMIES, names } from './fixtures.js';

/**
 * @param {'=' | '>' | '<'} op
 * @param {number} value
 */
function withGold(op, value) {
  return names(applyFilters(ENEMIES, setFilter(INITIAL_STATE, 'gold', { op, value }).filters));
}

describe('Gold filter', () => {
  it('"exactly 10 gold" shows only 10-gold enemies', () => {
    assert.deepEqual(withGold('=', 10), ['Haulikkohiisi', 'Kummitus', 'Pikkumato']);
  });

  it('"more than 10 gold" excludes enemies with exactly 10', () => {
    assert.deepEqual(withGold('>', 10), ['Hornahiisi']);
  });

  it('"less than 10 gold" excludes enemies with exactly 10', () => {
    assert.deepEqual(withGold('<', 10), ['Suhiseva lammas']);
  });

  it('gold input accepts whole numbers 0 and higher only', () => {
    const integer = { decimals: 0 };
    assert.equal(sanitizeNumber('7.9', integer), '79');
    assert.equal(sanitizeNumber('-1', integer), '1');
    assert.equal(sanitizeNumber('abc', integer), '');
    assert.equal(sanitizeNumber('0', integer), '0');
  });
});
