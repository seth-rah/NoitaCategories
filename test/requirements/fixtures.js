/** @import { Enemy, Range, Value } from '../../site/src/domain/types.js' */

/**
 * @param {number} n
 * @returns {Range} A value that does not vary.
 */
export function fixed(n) {
  return { min: n, max: n };
}

/**
 * @param {string} name
 * @param {Record<string, Value>} values
 * @returns {Enemy}
 */
function enemy(name, values) {
  return { name, aliases: [], wikiPage: null, order: 0, images: [], values };
}

/** Modelled on noitadle's Suhiseva lammas. */
export const SUHISEVA_LAMMAS = enemy('Suhiseva lammas', {
  hp: fixed(5),
  height: { min: 12, max: 18 },
  attacks: [],
  spawn: ['Polymorph'],
  faction: ['helpless'],
  movement: ['walk', 'fly'],
  immunities: [],
  gold: fixed(0),
  bleeds: ['blood'],
  corpse: ['meat of an innocent creature'],
});

export const HAULIKKOHIISI = enemy('Haulikkohiisi', {
  hp: fixed(22.5),
  height: { min: 14, max: 15 },
  attacks: ['melee', 'projectile'],
  spawn: ['Mines', 'Coal Pits'],
  faction: ['orcs'],
  movement: ['walk'],
  immunities: [],
  gold: fixed(10),
  bleeds: ['blood'],
  corpse: ['meat'],
});

export const HORNAHIISI = enemy('Hornahiisi', {
  hp: fixed(72.5),
  height: { min: 14, max: 16 },
  attacks: ['projectile'],
  spawn: ['Hell'],
  faction: ['orcs'],
  movement: ['walk'],
  immunities: ['fire'],
  gold: fixed(20),
  bleeds: ['liquid fire'],
  corpse: ['meat'],
});

export const KUMMITUS = enemy('Kummitus', {
  hp: fixed(2.5),
  height: { min: 19, max: 25 },
  attacks: ['melee'],
  spawn: ['Snowy Depths'],
  faction: ['ghost'],
  movement: ['fly'],
  immunities: ['fire', 'melee'],
  gold: fixed(10),
  bleeds: [],
  corpse: [],
});

export const PIKKUMATO = enemy('Pikkumato', {
  hp: fixed(10),
  height: { min: 8, max: 8 },
  attacks: ['melee'],
  spawn: ['Desert', 'Coal Pits'],
  faction: ['worm'],
  movement: ['burrow'],
  immunities: [],
  gold: fixed(10),
  bleeds: ['worm blood'],
  corpse: ['worm meat'],
});

/** An enemy that is stronger in some areas, so its HP and Gold are ranges. Not in {@link ENEMIES}. */
export const RYNKKYHIISI = enemy('Rynkkyhiisi', {
  hp: { min: 25, max: 50 },
  height: { min: 15, max: 17 },
  attacks: ['ranged'],
  spawn: ['Hiisi Base'],
  faction: ['orcs'],
  movement: ['walk'],
  immunities: [],
  gold: { min: 10, max: 20 },
  bleeds: ['blood'],
  corpse: ['meat'],
});

/** An enemy whose values could not be determined. */
export const UNKNOWN_ENEMY = enemy('Unknown enemy', {
  hp: null,
  height: null,
  attacks: null,
  spawn: null,
  faction: null,
  movement: null,
  immunities: null,
  gold: null,
  bleeds: null,
  corpse: null,
});

export const ENEMIES = Object.freeze([
  SUHISEVA_LAMMAS,
  HAULIKKOHIISI,
  HORNAHIISI,
  KUMMITUS,
  PIKKUMATO,
  UNKNOWN_ENEMY,
]);

/**
 * @param {readonly Enemy[]} enemies
 * @returns {string[]}
 */
export function names(enemies) {
  return enemies.map((e) => e.name);
}
