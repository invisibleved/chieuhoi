import * as migration_20261026_140648_initial from './20261026_140648_initial';
import * as migration_20261026_190416_home_media from './20261026_190416_home_media';
import * as migration_20261027_084854_phase4_pages from './20261027_084854_phase4_pages';

export const migrations = [
  {
    up: migration_20261026_140648_initial.up,
    down: migration_20261026_140648_initial.down,
    name: '20261026_140648_initial',
  },
  {
    up: migration_20261026_190416_home_media.up,
    down: migration_20261026_190416_home_media.down,
    name: '20261026_190416_home_media',
  },
  {
    up: migration_20261027_084854_phase4_pages.up,
    down: migration_20261027_084854_phase4_pages.down,
    name: '20261027_084854_phase4_pages'
  },
];
