/** @import { AppState } from '../domain/types.js' */

/**
 * @template {unknown[]} A
 * @typedef {(state: AppState, ...args: A) => AppState} Action
 */

/**
 * @typedef {object} Store
 * @property {() => AppState} get
 * @property {<A extends unknown[]>(action: Action<A>, ...args: A) => void} dispatch
 *   Applies a pure transition from `state/actions.js` and notifies subscribers if it changed state.
 * @property {(listener: (state: AppState, previous: AppState) => void) => void} subscribe
 */

/**
 * @param {AppState} initial
 * @returns {Store}
 */
export function createStore(initial) {
  let state = initial;
  /** @type {((state: AppState, previous: AppState) => void)[]} */
  const listeners = [];
  return {
    get: () => state,
    dispatch(action, ...args) {
      const previous = state;
      state = action(state, ...args);
      if (state !== previous) {
        listeners.forEach((listener) => listener(state, previous));
      }
    },
    subscribe(listener) {
      listeners.push(listener);
    },
  };
}
