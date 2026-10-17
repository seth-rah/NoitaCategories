import { INITIAL_STATE } from './state/actions.js';
import {
  browserStorage,
  hasAcceptedDisclaimer,
  recordDisclaimerAcceptance,
} from './state/disclaimer.js';
import { mountDisclaimer } from './ui/disclaimer.js';
import { h, replaceChildren } from './ui/dom.js';
import { mountPanel } from './ui/panel.js';
import { mountSidebar } from './ui/sidebar.js';
import { mountSortControl } from './ui/sort-control.js';
import { createStore } from './ui/store.js';
import { mountTable } from './ui/table.js';
import { mountTooltips } from './ui/tooltip.js';
/** @import { Enemy } from './domain/types.js' */

const DATA_URL = 'data/enemies.json';

/**
 * @param {string} id
 * @returns {HTMLElement}
 */
function element(id) {
  const found = document.getElementById(id);
  if (!found) {
    throw new Error(`Missing #${id} in index.html`);
  }
  return found;
}

/** @returns {Promise<Enemy[]>} */
async function loadEnemies() {
  const response = await fetch(DATA_URL, { cache: 'no-cache' });
  if (!response.ok) {
    throw new Error(`Could not load ${DATA_URL} (HTTP ${response.status})`);
  }
  return response.json();
}

const storage = browserStorage();
if (!hasAcceptedDisclaimer(storage)) {
  mountDisclaimer(/** @type {HTMLDialogElement} */ (element('disclaimer')), () =>
    recordDisclaimerAcceptance(storage),
  );
}

try {
  const enemies = await loadEnemies();
  const store = createStore(INITIAL_STATE);
  mountSidebar(element('sidebar'), store);
  mountPanel(element('panel'), store, enemies);
  mountSortControl(element('sort-control'), store);
  mountTable(element('table'), element('result-count'), store, enemies);
  mountTooltips(document.body);
} catch (error) {
  replaceChildren(
    element('table'),
    h('p', { class: 'empty', role: 'alert' }, `Something went wrong: ${String(error)}`),
  );
}
