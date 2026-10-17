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
function withHp(op, value) {
  return names(applyFilters(ENEMIES, setFilter(INITIAL_STATE, 'hp', { op, value }).filters));
}

describe('HP filter', () => {
  it('exact HP matches, including decimals like 2.5', () => {
    assert.deepEqual(withHp('=', 2.5), ['Kummitus']);
    assert.deepEqual(withHp('=', 22.5), ['Haulikkohiisi']);
  });

  it('"more than" excludes the exact value', () => {
    assert.deepEqual(withHp('>', 10), ['Haulikkohiisi', 'Hornahiisi']);
  });

  it('"less than" excludes the exact value', () => {
    assert.deepEqual(withHp('<', 5), ['Kummitus']);
  });

  it('HP input accepts 0 and higher with at most one decimal', () => {
    const decimal = { decimals: 1 };
    assert.equal(sanitizeNumber('-3.45', decimal), '3.4');
    assert.equal(sanitizeNumber('0', decimal), '0');
    assert.equal(sanitizeNumber('2.5', decimal), '2.5');
    assert.equal(sanitizeNumber('1.2.3', decimal), '1.2');
    assert.equal(sanitizeNumber('12a', decimal), '12');
  });

  it('an enemy with unknown HP never matches an HP filter', () => {
    for (const op of /** @type {const} */ (['=', '>', '<'])) {
      assert.ok(!withHp(op, 0).includes('Unknown enemy'));
    }
  });
});
