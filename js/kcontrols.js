import { showWelcomeView, showObjectInfo, showAdminBox } from './sidebar.js';
import { enableDrawing, disableDrawing, saveFeaturesToLocal, loadFeaturesFromLocal, drawLayer, exportGeoJSON } from './draw-utils.js';

export function initControls(map, options = {}) {
  const controlsEl = document.getElementById('controls');
  if (!controlsEl) return;

  controlsEl.innerHTML = `
    <div class="controls-row">
      <button id="btn-draw">Joonista</button>
      <button id="btn-modify">Muuda</button>
      <button id="btn-save">Salvesta</button>
      <button id="btn-load">Laadi</button>
      <button id="btn-export">Ekspordi</button>
      <button id="btn-clear">Kustuta</button>
    </div>
    <div id="layer-switcher"></div>
  `;

  map.addControl(new ol.control.Zoom());
  map.addControl(new ol.control.ScaleLine({ units: 'metric' }));
  map.addControl(new ol.control.Attribution({ collapsible: true }));
  map.addControl(new ol.control.FullScreen());
  map.addControl(new ol.control.Rotate({ autoHide: true }));

  const layerContainer = document.getElementById('layer-switcher');
  const layers = [...(options.baseLayers || []), ...(options.overlayLayers || [])];
  
  let layersHtml = '<h3>Kihtide valik</h3>';
  layers.forEach(l => {
    layersHtml += `
      <label class="ls-row">
        <input type="checkbox" data-layer-id="${l.id}" ${l.layer.getVisible() ? 'checked' : ''}>
        <span>${l.title}</span>
      </label>
    `;
  });
  layerContainer.innerHTML = layersHtml;

  layerContainer.addEventListener('change', (ev) => {
    const input = ev.target;
    const found = layers.find(x => x.id === input.dataset.layerId);
    if (found) found.layer.setVisible(input.checked);
  });

  document.getElementById('btn-draw').addEventListener('click', () => {
    enableDrawing(map, 'Polygon');
    document.getElementById('btn-draw').classList.add('active');
    document.getElementById('btn-modify').classList.remove('active');
  });

  document.getElementById('btn-modify').addEventListener('click', () => {
    enableDrawing(map, 'Modify');
    document.getElementById('btn-modify').classList.add('active');
    document.getElementById('btn-draw').classList.remove('active');
  });

  document.getElementById('btn-save').addEventListener('click', () => {
    saveFeaturesToLocal();
    showAdminBox({ text: 'Salvestatud kohalikku mällu.' });
  });

  document.getElementById('btn-load').addEventListener('click', () => {
    loadFeaturesFromLocal();
  });

  document.getElementById('btn-export').addEventListener('click', () => exportGeoJSON());

  document.getElementById('btn-clear').addEventListener('click', () => {
    if (confirm('Kustutada kaikki joonised?')) {
      drawLayer.getSource().clear();
      saveFeaturesToLocal();
    }
  });

  map.on('singleclick', (evt) => {
    const feature = map.forEachFeatureAtPixel(evt.pixel, (f) => f);
    if (feature) {
      showObjectInfo({ title: feature.get('title'), description: feature.get('note'), properties: feature.getProperties() });
    } else {
      showWelcomeView();
    }
  });
}


