const STORAGE_KEY = 'noita-categories:disclaimer-accepted';

/**
 * The disclaimer visitors last confirmed. Change it whenever the disclaimer or the site
 * changes meaningfully, so every visitor confirms again.
 */
export const DISCLAIMER_VERSION = '2026-11-02';

/** @typedef {Pick<Storage, 'getItem' | 'setItem'>} DisclaimerStorage */

/**
 * The browser's persistent storage for this site.
 * @returns {DisclaimerStorage | null} `null` when the browser blocks storage.
 */
export function browserStorage() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/**
 * Whether this visitor has confirmed the current disclaimer.
 * @param {DisclaimerStorage | null} storage
 * @returns {boolean} `false` for first-time visitors, visitors who confirmed an earlier
 *   version, and whenever storage is unavailable.
 */
export function hasAcceptedDisclaimer(storage) {
  try {
    return storage?.getItem(STORAGE_KEY) === DISCLAIMER_VERSION;
  } catch {
    return false;
  }
}

/**
 * Remembers the visitor's confirmation. When storage is unavailable the visitor is
 * simply asked again on their next visit.
 * @param {DisclaimerStorage | null} storage
 * @returns {boolean} Whether the confirmation was remembered.
 */
export function recordDisclaimerAcceptance(storage) {
  if (storage === null) {
    return false;
  }
  try {
    storage.setItem(STORAGE_KEY, DISCLAIMER_VERSION);
    return true;
  } catch {
    return false;
  }
}
