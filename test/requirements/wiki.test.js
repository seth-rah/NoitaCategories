import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { wikiUrl } from '../../site/src/domain/wiki.js';
import { SUHISEVA_LAMMAS } from './fixtures.js';

/** @param {string | null} wikiPage */
function linkFor(wikiPage) {
  return wikiUrl({ ...SUHISEVA_LAMMAS, wikiPage });
}

describe('Wiki links', () => {
  it("clicking an enemy's sprite opens its Noita wiki page", () => {
    assert.equal(linkFor('Lammas'), 'https://noita.wiki.gg/wiki/Lammas');
  });

  it('opens the section for enemies that share a page', () => {
    assert.equal(linkFor('Tappurahiisi#Chef'), 'https://noita.wiki.gg/wiki/Tappurahiisi#Chef');
  });

  it('links Finnish page names with spaces and accents correctly', () => {
    assert.equal(
      linkFor('Mätänevä ruumis'),
      'https://noita.wiki.gg/wiki/M%C3%A4t%C3%A4nev%C3%A4_ruumis',
    );
  });

  it('enemies the wiki has no page for are not linked', () => {
    assert.equal(linkFor(null), null);
  });
});
