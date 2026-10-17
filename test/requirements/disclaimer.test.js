import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  hasAcceptedDisclaimer,
  recordDisclaimerAcceptance,
} from '../../site/src/state/disclaimer.js';
/** @import { DisclaimerStorage } from '../../site/src/state/disclaimer.js' */

/** @returns {DisclaimerStorage} */
function browserMemory() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
}

/** @returns {DisclaimerStorage} */
function blockedStorage() {
  const blocked = () => {
    throw new Error('SecurityError');
  };
  return { getItem: blocked, setItem: blocked };
}

describe('Disclaimer', () => {
  it('first-time visitors have not accepted the disclaimer', () => {
    assert.equal(hasAcceptedDisclaimer(browserMemory()), false);
  });

  it('after accepting, returning visitors are not asked again', () => {
    const storage = browserMemory();
    recordDisclaimerAcceptance(storage);
    assert.equal(hasAcceptedDisclaimer(storage), true);
  });

  it('when the browser blocks storage, the disclaimer is shown again instead of failing', () => {
    const storage = blockedStorage();
    assert.equal(recordDisclaimerAcceptance(storage), false);
    assert.equal(hasAcceptedDisclaimer(storage), false);
    assert.equal(hasAcceptedDisclaimer(null), false);
  });
});
