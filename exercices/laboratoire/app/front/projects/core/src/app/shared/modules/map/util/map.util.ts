import {icon} from 'leaflet/dist/leaflet-src.esm.js'
import type { IconOptions } from 'leaflet'
import {IconMap} from '../models/icon.model';


export class MapUtil {
  static markerIcons: IconMap = {
    "black": ({
      iconUrl: '/imgs/leaflet/marker-icon-black.png',
      shadowUrl: '/imgs/leaflet/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [12, 41],
      shadowSize: [1, -34]
    }),
    "black2x": ({
      iconUrl: '/imgs/leaflet/marker-icon-2x-black.png',
      shadowUrl: '/imgs/leaflet/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [12, 41],
      shadowSize: [1, -34]
    }),
    "blue": ({
      iconUrl: '/imgs/leaflet/marker-icon-blue.png',
      shadowUrl: '/imgs/leaflet/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [12, 41],
      shadowSize: [1, -34]
    }),
    "blue2x": ({
      iconUrl: '/imgs/leaflet/marker-icon-2x-blue.png',
      shadowUrl: '/imgs/leaflet/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [12, 41],
      shadowSize: [1, -34]
    }),
    "gold": ({
      iconUrl: '/imgs/leaflet/marker-icon-gold.png',
      shadowUrl: '/imgs/leaflet/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [12, 41],
      shadowSize: [1, -34]
    }),
    "gold2x": ({
      iconUrl: '/imgs/leaflet/marker-icon-2x-gold.png',
      shadowUrl: '/imgs/leaflet/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [12, 41],
      shadowSize: [1, -34]
    }),
    "green": ({
      iconUrl: '/imgs/leaflet/marker-icon-green.png',
      shadowUrl: '/imgs/leaflet/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [12, 41],
      shadowSize: [1, -34]
    }),
    "green2x": ({
      iconUrl: '/imgs/leaflet/marker-icon-2x-green.png',
      shadowUrl: '/imgs/leaflet/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [12, 41],
      shadowSize: [1, -34]
    }),
    "grey": ({
      iconUrl: '/imgs/leaflet/marker-icon-grey.png',
      shadowUrl: '/imgs/leaflet/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [12, 41],
      shadowSize: [1, -34]
    }),
    "grey2x": ({
      iconUrl: '/imgs/leaflet/marker-icon-2x-grey.png',
      shadowUrl: '/imgs/leaflet/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [12, 41],
      shadowSize: [1, -34]
    }),
    "orange": ({
      iconUrl: '/imgs/leaflet/marker-icon-orange.png',
      shadowUrl: '/imgs/leaflet/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [12, 41],
      shadowSize: [1, -34]
    }),
    "orange2x": ({
      iconUrl: '/imgs/leaflet/marker-icon-2x-orange.png',
      shadowUrl: '/imgs/leaflet/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [12, 41],
      shadowSize: [1, -34]
    }),
    "red": ({
      iconUrl: '/imgs/leaflet/marker-icon-red.png',
      shadowUrl: '/imgs/leaflet/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [12, 41],
      shadowSize: [1, -34]
    }),
    "red2x": ({
      iconUrl: '/imgs/leaflet/marker-icon-2x-red.png',
      shadowUrl: '/imgs/leaflet/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [12, 41],
      shadowSize: [1, -34]
    }),
    "violet": ({
      iconUrl: '/imgs/leaflet/marker-icon-violet.png',
      shadowUrl: '/imgs/leaflet/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [12, 41],
      shadowSize: [1, -34]
    }),
    "violet2x": ({
      iconUrl: '/imgs/leaflet/marker-icon-2x-violet.png',
      shadowUrl: '/imgs/leaflet/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [12, 41],
      shadowSize: [1, -34]
    }),
    "yellow": ({
      iconUrl: '/imgs/leaflet/marker-icon-yellow.png',
      shadowUrl: '/imgs/leaflet/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [12, 41],
      shadowSize: [1, -34]
    }),
    "yellow2x": ({
      iconUrl: '/imgs/leaflet/marker-icon-2x-yellow.png',
      shadowUrl: '/imgs/leaflet/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [12, 41],
      shadowSize: [1, -34]
    }),
  }

  static addIcon(
    name: string,
    options: IconOptions
  ) {
    MapUtil.markerIcons[name] = options
  }

  static createIcon(name: keyof IconMap) {
    return icon(MapUtil.markerIcons[name])
  }
}
