// js/draw-utils.js
import VectorLayer from 'https://cdn.jsdelivr.net/npm/ol@v7.4.0/layer/Vector.js';
import VectorSource from 'https://cdn.jsdelivr.net/npm/ol@v7.4.0/source/Vector.js';
import GeoJSON from 'https://cdn.jsdelivr.net/npm/ol@v7.4.0/format/GeoJSON.js';
import Style from 'https://cdn.jsdelivr.net/npm/ol@v7.4.0/style/Style.js';
import Fill from 'https://cdn.jsdelivr.net/npm/ol@v7.4.0/style/Fill.js';
import Stroke from 'https://cdn.jsdelivr.net/npm/ol@v7.4.0/style/Stroke.js';
import CircleStyle from 'https://cdn.jsdelivr.net/npm/ol@v7.4.0/style/Circle.js';
import Draw from 'https://cdn.jsdelivr.net/npm/ol@v7.4.0/interaction/Draw.js';
import Modify from 'https://cdn.jsdelivr.net/npm/ol@v7.4.0/interaction/Modify.js';
import Snap from 'https://cdn.jsdelivr.net/npm/ol@v7.4.0/interaction/Snap.js';

const geojsonFormat = new GeoJSON();
const drawSource = new VectorSource();
export const drawLayer = new VectorLayer({
  source: drawSource,
  style: new Style({
    fill: new Fill({ color: 'rgba(255,165,0,0.25)' }),
    stroke: new Stroke({ color: '#ff8c00', width: 2 }),
    image: new CircleStyle({ radius: 6, fill: new Fill({ color: '#ff8c00' }) })
  }),
  zIndex: 1000,
  visible: true
});

let drawInteraction = null;
let modifyInteraction = null;
let snapInteraction = null;

export function enableDrawing(map, mode = 'Polygon') {
  disableDrawing(map);
  if (mode === 'Modify') {
    modifyInteraction = new Modify({ source: drawSource });
    map.addInteraction(modifyInteraction);
    snapInteraction = new Snap({ source: drawSource });
    map.addInteraction(snapInteraction);
    return;
  }
  drawInteraction = new Draw({ source: drawSource, type: mode });
  map.addInteraction(drawInteraction);
  modifyInteraction = new Modify({ source: drawSource });
  map.addInteraction(modifyInteraction);
  snapInteraction = new Snap({ source: drawSource });
  map.addInteraction(snapInteraction);

  drawInteraction.on('drawend', (evt) => {
    const feature = evt.feature;
    feature.setId(`f-${Date.now()}`);
    feature.set('createdAt', new Date().toISOString());
    feature.set('title', feature.get('title') || 'Märk');
    feature.set('note', feature.get('note') || '');
    setTimeout(() => {
      const note = prompt('Sisesta märge valitud alale:', feature.get('note') || '');
      if (note !== null) feature.set('note', note);
      saveFeaturesToLocal();
    }, 50);
  });
}

export function disableDrawing(map) {
  if (drawInteraction && map) map.removeInteraction(drawInteraction);
  if (modifyInteraction && map) map.removeInteraction(modifyInteraction);
  if (snapInteraction && map) map.removeInteraction(snapInteraction);
  drawInteraction = null;
  modifyInteraction = null;
  snapInteraction = null;
}

export function saveFeaturesToLocal(key = 'myMapFeatures') {
  try {
    const features = drawSource.getFeatures();
    const geojson = geojsonFormat.writeFeatures(features, { featureProjection: 'EPSG:3857' });
    localStorage.setItem(key, geojson);
    console.log('Features saved:', features.length);
  } catch (err) {
    console.error('Save failed', err);
  }
}

export function loadFeaturesFromLocal(key = 'myMapFeatures') {
  try {
    const data = localStorage.getItem(key);
    if (!data) return;
    const features = geojsonFormat.readFeatures(data, { featureProjection: 'EPSG:3857' });
    drawSource.clear();
    drawSource.addFeatures(features);
    console.log('Features loaded:', features.length);
  } catch (err) {
    console.error('Load failed', err);
  }
}

export function exportGeoJSON(filename = 'features.geojson') {
  const geojson = geojsonFormat.writeFeatures(drawSource.getFeatures(), { featureProjection: 'EPSG:3857' });
  const blob = new Blob([geojson], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function importGeoJSONFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const features = geojsonFormat.readFeatures(reader.result, { featureProjection: 'EPSG:3857' });
        drawSource.addFeatures(features);
        saveFeaturesToLocal();
        resolve(features.length);
      } catch (err) { reject(err); }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

export function clearDrawnFeatures() {
  drawSource.clear();
  saveFeaturesToLocal();
}

export function getDrawSource() {
  return drawSource;
}

try { loadFeaturesFromLocal(); } catch (e) { /* ignore */ }

export default {
  drawLayer,
  enableDrawing,
  disableDrawing,
  saveFeaturesToLocal,
  loadFeaturesFromLocal,
  exportGeoJSON,
  importGeoJSONFile,
  clearDrawnFeatures,
  getDrawSource
};

