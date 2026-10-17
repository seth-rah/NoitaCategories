/** @import { Range, Value } from './types.js' */

/**
 * @param {Value} value
 * @returns {value is Range}
 */
export function isRange(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
