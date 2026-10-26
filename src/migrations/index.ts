import * as migration_20261026_140648_initial from './20261026_140648_initial';
import * as migration_20261026_190416_home_media from './20261026_190416_home_media';

export const migrations = [
  {
    up: migration_20261026_140648_initial.up,
    down: migration_20261026_140648_initial.down,
    name: '20261026_140648_initial',
  },
  {
    up: migration_20261026_190416_home_media.up,
    down: migration_20261026_190416_home_media.down,
    name: '20261026_190416_home_media'
  },
];
