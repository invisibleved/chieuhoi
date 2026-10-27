import * as migration_20261026_140648_initial from './20261026_140648_initial';
import * as migration_20261026_190416_home_media from './20261026_190416_home_media';
import * as migration_20261027_084854_phase4_pages from './20261027_084854_phase4_pages';
import * as migration_20261027_164100_phase5a_stories from './20261027_164100_phase5a_stories';
import * as migration_20261027_165727_phase5a_people from './20261027_165727_phase5a_people';

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
    name: '20261027_084854_phase4_pages',
  },
  {
    up: migration_20261027_164100_phase5a_stories.up,
    down: migration_20261027_164100_phase5a_stories.down,
    name: '20261027_164100_phase5a_stories',
  },
  {
    up: migration_20261027_165727_phase5a_people.up,
    down: migration_20261027_165727_phase5a_people.down,
    name: '20261027_165727_phase5a_people'
  },
];
