/**
 * Restricts free text to a non-negative number with at most `decimals` decimal places.
 * Invalid characters are dropped rather than rejecting the whole input.
 * @param {string} raw
 * @param {{ decimals: number }} options
 * @returns {string} The cleaned text, or `''` when nothing valid remains.
 */
export function sanitizeNumber(raw, { decimals }) {
  const allowed = decimals > 0 ? /[^\d.]/g : /\D/g;
  const [whole = '', ...fractionParts] = raw.replace(allowed, '').split('.');
  if (fractionParts.length === 0) {
    return whole;
  }
  const fraction = fractionParts.join('').slice(0, decimals);
  return `${whole || '0'}.${fraction}`;
}

/**
 * @param {string} text  Output of {@link sanitizeNumber}.
 * @returns {number | undefined} The number, or `undefined` when the text holds none yet.
 */
export function toNumber(text) {
  return text === '' ? undefined : Number(text);
}
