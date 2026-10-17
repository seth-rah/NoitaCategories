/** @import { Enemy } from './types.js' */

const WIKI_BASE_URL = 'https://noita.wiki.gg/wiki/';

/**
 * The enemy's page on the Noita wiki, opened at its section when it has one.
 * @param {Enemy} enemy
 * @returns {string | null} `null` when the wiki has no page for the enemy.
 */
export function wikiUrl(enemy) {
  if (enemy.wikiPage === null) {
    return null;
  }
  const [title, section] = enemy.wikiPage.split('#');
  const anchor = section === undefined ? '' : `#${toWikiPath(section)}`;
  return `${WIKI_BASE_URL}${toWikiPath(title)}${anchor}`;
}

/**
 * @param {string} text
 * @returns {string} The text as MediaWiki writes it in URLs.
 */
function toWikiPath(text) {
  return encodeURIComponent(text.replaceAll(' ', '_'));
}
