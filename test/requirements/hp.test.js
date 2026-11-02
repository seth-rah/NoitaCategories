import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { categoryByKey } from '../../site/src/domain/categories.js';
import { applyFilters, matchStrength } from '../../site/src/domain/filter.js';
import { sanitizeNumber } from '../../site/src/domain/sanitize.js';
import { INITIAL_STATE, setFilter } from '../../site/src/state/actions.js';
import { ENEMIES, RYNKKYHIISI, fixed, names } from './fixtures.js';
/** @import { Enemy, NumberFilter } from '../../site/src/domain/types.js' */

const HP = categoryByKey('hp');

/**
 * @param {NumberFilter} filter
 * @param {readonly Enemy[]} [enemies]
 */
function withHp(filter, enemies = ENEMIES) {
  return names(applyFilters(enemies, setFilter(INITIAL_STATE, 'hp', filter).filters));
}

describe('HP filter', () => {
  it('exact HP matches, including decimals like 2.5', () => {
    assert.deepEqual(withHp({ mode: 'exact', value: 2.5 }), ['Kummitus']);
    assert.deepEqual(withHp({ mode: 'exact', value: 22.5 }), ['Haulikkohiisi']);
  });

  it('"more than" excludes the exact value', () => {
    assert.deepEqual(withHp({ mode: 'above', value: 10 }), ['Haulikkohiisi', 'Hornahiisi']);
  });

  it('"less than" excludes the exact value', () => {
    assert.deepEqual(withHp({ mode: 'below', value: 5 }), ['Kummitus']);
  });

  it('a range shows enemies whose HP fits between lowest and highest, inclusive', () => {
    assert.deepEqual(withHp({ mode: 'range', from: 2, to: 6 }), ['Suhiseva lammas', 'Kummitus']);
  });

  it('exact HP matches an enemy whose HP range includes it', () => {
    assert.deepEqual(withHp({ mode: 'exact', value: 30 }, [RYNKKYHIISI]), ['Rynkkyhiisi']);
    assert.deepEqual(withHp({ mode: 'exact', value: 51 }, [RYNKKYHIISI]), []);
  });

  it('"more than" matches an enemy whose HP can be higher', () => {
    assert.deepEqual(withHp({ mode: 'above', value: 40 }, [RYNKKYHIISI]), ['Rynkkyhiisi']);
    assert.deepEqual(withHp({ mode: 'above', value: 50 }, [RYNKKYHIISI]), []);
  });

  it('"less than" matches an enemy whose HP can be lower', () => {
    assert.deepEqual(withHp({ mode: 'below', value: 30 }, [RYNKKYHIISI]), ['Rynkkyhiisi']);
    assert.deepEqual(withHp({ mode: 'below', value: 25 }, [RYNKKYHIISI]), []);
  });

  it('a range matches an enemy only when its whole HP range fits inside', () => {
    assert.deepEqual(withHp({ mode: 'range', from: 20, to: 60 }, [RYNKKYHIISI]), ['Rynkkyhiisi']);
    assert.deepEqual(withHp({ mode: 'range', from: 30, to: 60 }, [RYNKKYHIISI]), []);
  });

  it('a match is green only when it names the exact HP, otherwise yellow', () => {
    const range = RYNKKYHIISI.values.hp;
    assert.equal(matchStrength(HP, fixed(30), { mode: 'exact', value: 30 }), 'full');
    assert.equal(matchStrength(HP, range, { mode: 'exact', value: 30 }), 'partial');
    assert.equal(matchStrength(HP, range, { mode: 'above', value: 20 }), 'partial');
    assert.equal(matchStrength(HP, range, { mode: 'range', from: 25, to: 50 }), 'full');
    assert.equal(matchStrength(HP, range, { mode: 'range', from: 20, to: 60 }), 'partial');
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
    /** @type {NumberFilter[]} */
    const filters = [
      { mode: 'exact', value: 0 },
      { mode: 'above', value: 0 },
      { mode: 'below', value: 100 },
      { mode: 'range', from: 0, to: 100 },
    ];
    for (const filter of filters) {
      assert.ok(!withHp(filter).includes('Unknown enemy'), filter.mode);
    }
  });
});
