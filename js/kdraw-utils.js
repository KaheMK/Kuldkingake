import VectorLayer from 'https://esm.sh';
import VectorSource from 'https://esm.sh';
import GeoJSON from 'https://esm.sh';
import Style from 'https://esm.sh';
import Fill from 'https://esm.sh';
import Stroke from 'https://esm.sh';
import CircleStyle from 'https://esm.sh';
import Draw from 'https://esm.sh';
import Modify from 'https://esm.sh';
import Snap from 'https://esm.sh';

const geojsonFormat = new GeoJSON();
const drawSource = new VectorSource();
const LOCAL_STORAGE_KEY = 'orhideed_features_v1';

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
    feature.set('title', 'Märk');
    setTimeout(() => {
      const note = prompt('Sisesta märge valitud alale:', '');
      if (note !== null) feature.set('note', note);
      saveFeaturesToLocal();
    }, 50);
  });
}

export function disableDrawing(map) {
  if (drawInteraction && map) map.removeInteraction(drawInteraction);
  if (modifyInteraction && map) map.removeInteraction(modifyInteraction);
  if (snapInteraction && map) map.removeInteraction(snapInteraction);
  drawInteraction = modifyInteraction = snapInteraction = null;
}

export function saveFeaturesToLocal() {
  try {
    const features = drawSource.getFeatures();
    const geojson = geojsonFormat.writeFeatures(features, { featureProjection: 'EPSG:3857' });
    localStorage.setItem(LOCAL_STORAGE_KEY, geojson);
  } catch (err) { console.error(err); }
}

export function loadFeaturesFromLocal() {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!data) return;
    const features = geojsonFormat.readFeatures(data, { featureProjection: 'EPSG:3857' });
    drawSource.clear();
    drawSource.addFeatures(features);
  } catch (err) { console.error(err); }
}

export function exportGeoJSON() {
  const geojson = geojsonFormat.writeFeatures(drawSource.getFeatures(), { featureProjection: 'EPSG:3857' });
  const blob = new Blob([geojson], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'features.geojson';
  document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}

try { loadFeaturesFromLocal(); } catch (e) {}

