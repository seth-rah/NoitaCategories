# Noita Categories

A companion for [noitadle](https://noitadle.seamob.lol/). It lists every guessable enemy with the
exact values noitadle reveals: HP, Height px, Attacks, Spawn, Faction, Movement, Immunities, Gold,
Bleeds and Corpse. You can narrow the list with any combination of them, for example "more than
10 gold", "height 12", or "bleeds blood and spawns in the Mines".

Live site: https://seth-rah.github.io/NoitaCategories/

## Using it

- Before the site loads you confirm that you'll use it to learn, before or after playing noitadle,
  and not to cheat. The confirmation is remembered in your browser, and you're asked again when the
  disclaimer is updated.
- Pick a category in the sidebar to expand its editor. Picking another category replaces it, and
  your earlier choices are kept.
- **HP, Height px and Gold:** choose _Exactly_, _Range_, _More than_ or _Less than_, then type a
  number (HP allows one decimal place; Height and Gold are whole numbers). Some values vary, such
  as a height across animation frames or HP that is higher in some areas, and show as a range like
  25-50.
  - _Exactly_ matches when the number can be the enemy's value (14 matches 12-18).
  - _Range_ matches when the enemy's whole value fits between lowest and highest: 10–13 matches
    10-12, but not 6-17.
  - _More than_ / _Less than_ match when any part of the value is above or below the number.
  - All bounds are inclusive.
- **Blocks:** Attacks, Spawn, Movement and Immunities take as many values as you like, and an enemy
  must have every selected one. Faction, Bleeds and Corpse have a single value per enemy, so
  selecting another block replaces the current one. The `none` block finds enemies with nothing in
  that category.
- **Colours:** a highlighted value is green only for an exact match: exactly the enemy's number or
  range, or exactly all of its blocks. Any other match is yellow.
- `×` clears one category, and **Clear all** clears everything. With no filters, every enemy is
  shown.
- Click an enemy's sprite to open its page on the [Noita wiki](https://noita.wiki.gg/).
- **Sorting:** click a column header to sort ascending, click again for descending, and a third
  time to return to noitadle's order. Height sorts by its lowest value. Unknown values (`?`) stay
  last. On phones, use the _Sort by_ control above the list.

## Development

Requires Node 22+. Python is only used for the local preview server.

```bash
npm install
npm run serve     # http://localhost:8000
npm run check     # lint, format check, typecheck, tests
npm run format    # apply Prettier
```

### Architecture

```
site/                  everything published to GitHub Pages
  src/domain/          pure logic: categories, filtering, sorting, formatting, input masking
  src/state/           pure state transitions (the only way state changes)
  src/ui/              DOM components that render state and dispatch transitions
  data/enemies.json    enemy values and wiki pages
  assets/              noitadle sprites and the Noita pixel font
test/requirements/     tests named after, and organised by, the site's requirements
```

`site/src/domain/categories.js` is the single source of truth. Filtering, sorting, editors and
table columns are all driven by its `CATEGORIES` list.

There is no build step: the site is plain ES modules, type-checked with JSDoc by `tsc`.

### Data

`site/data/enemies.json` is a snapshot of every noitadle enemy's answers, with each enemy's
noita.wiki.gg page. Edit it directly to correct or add an enemy; `npm run check` validates it.

### Deployment

`.github/workflows/ci.yml` runs `npm run check` on every push and pull request. Pushes to `main`
then deploy the `site/` folder to GitHub Pages. To redeploy without a new commit, use **Run
workflow** on the CI workflow in the repository's Actions tab.

## Credits

Enemy values, English names, sprites and the pixel font come from
[noitadle](https://noitadle.seamob.lol/). The sprites and font are assets of
[Noita](https://noitagame.com/) by Nolla Games.
