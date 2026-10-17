/** @typedef {Node | string | number | null | undefined | false | Child[]} Child */

/**
 * @typedef {Record<string, unknown> & {
 *   class?: string,
 *   dataset?: Record<string, string>,
 * }} Props
 */

/**
 * Creates an element. Props beginning with `on` become event listeners, `dataset`
 * fills `data-*`, booleans toggle attributes, and everything else is set as an
 * attribute. Text is always inserted as text, never parsed as HTML.
 * @template {keyof HTMLElementTagNameMap} K
 * @param {K} tag
 * @param {Props | null} [props]
 * @param {...Child} children  Falsy children are skipped.
 * @returns {HTMLElementTagNameMap[K]}
 */
export function h(tag, props, ...children) {
  const element = document.createElement(tag);
  for (const [name, value] of Object.entries(props ?? {})) {
    applyProp(element, name, value);
  }
  element.append(...flatten(children));
  return element;
}

/**
 * Replaces an element's children.
 * @param {Element} element
 * @param {...Child} children
 */
export function replaceChildren(element, ...children) {
  element.replaceChildren(...flatten(children));
}

/**
 * @param {HTMLElement} element
 * @param {string} name
 * @param {unknown} value
 */
function applyProp(element, name, value) {
  if (name === 'dataset') {
    Object.assign(element.dataset, value);
  } else if (name.startsWith('on') && typeof value === 'function') {
    element.addEventListener(name.slice(2).toLowerCase(), /** @type {EventListener} */ (value));
  } else if (typeof value === 'boolean') {
    element.toggleAttribute(name, value);
  } else if (value !== null && value !== undefined) {
    element.setAttribute(name, String(value));
  }
}

/**
 * @param {Child[]} children
 * @returns {(Node | string)[]}
 */
function flatten(children) {
  return children.flatMap((child) => {
    if (Array.isArray(child)) {
      return flatten(child);
    }
    if (child === null || child === undefined || child === false) {
      return [];
    }
    return [typeof child === 'number' ? String(child) : child];
  });
}
