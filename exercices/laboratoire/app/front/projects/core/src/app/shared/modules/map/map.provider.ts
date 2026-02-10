import {IconMap} from './models/icon.model';
import {MapUtil} from './util/map.util';

export const loadMapIcons = async (icons: IconMap = {}) => {

  for (const [key, value] of Object.entries(icons)) {
    MapUtil.addIcon(key, value)
  }
}
