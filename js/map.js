// js/map.js
import Map from 'https://cdn.jsdelivr.net/npm/ol@v7.4.0/Map.js';
import View from 'https://cdn.jsdelivr.net/npm/ol@v7.4.0/View.js';
import { fromLonLat } from 'https://cdn.jsdelivr.net/npm/ol@v7.4.0/proj.js';

export function createMap(targetId = 'map') {
  const map = new Map({
    target: targetId,
    view: new View({
      center: fromLonLat([24.0, 58.9]), // Palivere/Tallinn ümbrus
      zoom: 12
    }),
    controls: []
  });
  return map;
}



