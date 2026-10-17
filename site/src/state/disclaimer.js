const STORAGE_KEY = 'noita-categories:disclaimer-accepted';
const ACCEPTED = '1';

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
 * Whether this visitor has already confirmed they will use the site for learning.
 * @param {DisclaimerStorage | null} storage
 * @returns {boolean} `false` for first-time visitors and whenever storage is unavailable.
 */
export function hasAcceptedDisclaimer(storage) {
  try {
    return storage?.getItem(STORAGE_KEY) === ACCEPTED;
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
    storage.setItem(STORAGE_KEY, ACCEPTED);
    return true;
  } catch {
    return false;
  }
}
