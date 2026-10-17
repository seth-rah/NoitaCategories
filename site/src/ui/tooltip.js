import { h, replaceChildren } from './dom.js';

const TOOLTIP_ID = 'tooltip';
const TRIGGER_SELECTOR = '[data-tooltip]';
const VIEWPORT_MARGIN = 8;
const OFFSET = 8;

/**
 * Shows the `data-tooltip` text of any element carrying it: on hover, on keyboard focus,
 * and on tap. The tooltip is positioned against the viewport so scrolling containers
 * never clip it, and hides on Escape, scroll, or a click elsewhere.
 * @param {HTMLElement} root  Where the tooltip element is attached.
 */
export function mountTooltips(root) {
  const tooltip = h('div', { id: TOOLTIP_ID, class: 'tooltip', role: 'tooltip', hidden: true });
  /** @type {HTMLElement | null} */
  let anchor = null;

  /** @param {HTMLElement} trigger */
  function show(trigger) {
    hide();
    anchor = trigger;
    anchor.setAttribute('aria-describedby', TOOLTIP_ID);
    replaceChildren(tooltip, trigger.dataset.tooltip ?? '');
    tooltip.hidden = false;
    position(tooltip, trigger.getBoundingClientRect());
  }

  function hide() {
    anchor?.removeAttribute('aria-describedby');
    anchor = null;
    tooltip.hidden = true;
  }

  /**
   * @param {Event} event
   * @returns {HTMLElement | null}
   */
  function triggerOf(event) {
    return event.target instanceof Element ? event.target.closest(TRIGGER_SELECTOR) : null;
  }

  root.append(tooltip);
  document.addEventListener('pointerover', (event) => {
    const trigger = triggerOf(event);
    if (trigger && event.pointerType === 'mouse') {
      show(trigger);
    }
  });
  document.addEventListener('pointerout', (event) => {
    if (triggerOf(event) === anchor && event.pointerType === 'mouse') {
      hide();
    }
  });
  document.addEventListener('focusin', (event) => {
    const trigger = triggerOf(event);
    if (trigger) {
      show(trigger);
    }
  });
  document.addEventListener('focusout', (event) => {
    if (triggerOf(event) === anchor) {
      hide();
    }
  });
  document.addEventListener('click', (event) => {
    const trigger = triggerOf(event);
    if (trigger && trigger !== anchor) {
      show(trigger);
    } else if (!trigger) {
      hide();
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      hide();
    }
  });
  document.addEventListener('scroll', hide, { capture: true, passive: true });
}

/**
 * Places the tooltip above the trigger, or below it when there is no room above,
 * kept fully inside the viewport.
 * @param {HTMLElement} tooltip
 * @param {DOMRect} trigger
 */
function position(tooltip, trigger) {
  const { width, height } = tooltip.getBoundingClientRect();
  const above = trigger.top - height - OFFSET;
  const top = above >= VIEWPORT_MARGIN ? above : trigger.bottom + OFFSET;
  const centred = trigger.left + trigger.width / 2 - width / 2;
  const left = Math.min(
    Math.max(centred, VIEWPORT_MARGIN),
    window.innerWidth - width - VIEWPORT_MARGIN,
  );
  tooltip.style.top = `${top}px`;
  tooltip.style.left = `${left}px`;
}
