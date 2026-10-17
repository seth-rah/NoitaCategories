import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { CATEGORIES } from '../../site/src/domain/categories.js';
/** @import { Enemy } from '../../site/src/domain/types.js' */

const SITE_DIR = new URL('../../site/', import.meta.url);

/** @type {Enemy[]} */
const enemies = JSON.parse(readFileSync(new URL('data/enemies.json', SITE_DIR), 'utf8'));

describe('Published enemy data', () => {
  it('lists every noitadle enemy once, including both halves of combined answers', () => {
    const names = enemies.map((enemy) => enemy.name);
    assert.equal(new Set(names).size, names.length, 'duplicate enemy names');
    assert.ok(names.includes('Mokke') && names.includes('Molari'));
  });

  it('keeps noitadle order', () => {
    const orders = enemies.map((enemy) => enemy.order);
    assert.deepEqual(
      orders,
      [...orders].sort((a, b) => a - b),
    );
  });

  it('gives every enemy an answer in all ten categories', () => {
    for (const enemy of enemies) {
      for (const category of CATEGORIES) {
        assert.ok(category.key in enemy.values, `${enemy.name}: ${category.label}`);
      }
    }
  });

  it('shows "?" only where noitadle itself does', () => {
    const unknown = enemies.flatMap((enemy) =>
      CATEGORIES.filter((category) => enemy.values[category.key] === null).map(
        (category) => `${enemy.name}: ${category.label}`,
      ),
    );
    assert.deepEqual(unknown, ['Kivi: HP']);
  });

  it('shows a sprite for every enemy', () => {
    for (const enemy of enemies) {
      assert.ok(enemy.images.length > 0, `${enemy.name} has no sprite`);
      for (const image of enemy.images) {
        assert.ok(existsSync(fileURLToPath(new URL(image, SITE_DIR))), `${enemy.name}: ${image}`);
      }
    }
  });

  it('links enemies to the Noita wiki page that covers them', () => {
    /** @param {string} name */
    const pageOf = (name) => enemies.find((enemy) => enemy.name === name)?.wikiPage;
    assert.equal(pageOf('Suhiseva lammas'), 'Lammas');
    assert.equal(pageOf('Kokkihiisi'), 'Tappurahiisi#Chef');
    assert.equal(pageOf('Crystal'), 'Houre');
    assert.ok(enemies.every((enemy) => enemy.wikiPage === null || enemy.wikiPage.length > 0));
  });

  it('shows wiki notes only on the categories where the wiki disagrees', () => {
    const categoryKeys = new Set(CATEGORIES.map((category) => category.key));
    for (const enemy of enemies) {
      for (const key of Object.keys(enemy.wikiNotes)) {
        assert.ok(categoryKeys.has(key), `${enemy.name}: unknown category ${key}`);
      }
    }
    /** @param {string} name */
    const notesOf = (name) => enemies.find((enemy) => enemy.name === name)?.wikiNotes;
    assert.deepEqual(notesOf('Pienkätyri'), { gold: 'The Noita wiki says: 160' });
    assert.deepEqual(notesOf('Suhiseva lammas'), {});
  });
});
