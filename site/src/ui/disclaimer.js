import { h, replaceChildren } from './dom.js';

const MESSAGE =
  'This site is to be used for learning purposes and should not be used to cheat while playing ' +
  "noitadle. I won't be able to stop you from cheating, but please use this only before or after " +
  'you played noitadle to learn.';

/**
 * Asks a first-time visitor to confirm they will use the site for learning. The page
 * stays unusable until they tick the confirmation and continue; Escape cannot skip it.
 * @param {HTMLDialogElement} dialog
 * @param {() => void} onAccept  Called once the visitor continues.
 */
export function mountDisclaimer(dialog, onAccept) {
  const submit = h(
    'button',
    { type: 'submit', class: 'primary-button', disabled: true },
    'Continue',
  );
  const checkbox = h('input', {
    type: 'checkbox',
    required: true,
    onChange: () => {
      submit.disabled = !checkbox.checked;
    },
  });

  replaceChildren(
    dialog,
    h(
      'form',
      { method: 'dialog', class: 'disclaimer-form', onSubmit: onAccept },
      h('h2', { id: 'disclaimer-title' }, 'Before you start'),
      h('p', null, MESSAGE),
      h(
        'label',
        { class: 'disclaimer-check' },
        checkbox,
        'I will not use this site to cheat while playing noitadle.',
      ),
      submit,
    ),
  );
  dialog.addEventListener('cancel', (event) => event.preventDefault());
  dialog.showModal();
}
