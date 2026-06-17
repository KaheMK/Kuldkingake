// js/controls.js
import Zoom from 'https://cdn.jsdelivr.net/npm/ol@latest/control/Zoom.js';
import ScaleLine from 'https://cdn.jsdelivr.net/npm/ol@latest/control/ScaleLine.js';
import Attribution from 'https://cdn.jsdelivr.net/npm/ol@latest/control/Attribution.js';
import FullScreen from 'https://cdn.jsdelivr.net/npm/ol@latest/control/FullScreen.js';
import Rotate from 'https://cdn.jsdelivr.net/npm/ol@latest/control/Rotate.js';

import { initSidebar, showWelcomeView, showObjectInfo, showAdminBox } from './sidebar.js';
import { enableDrawing, disableDrawing, saveFeaturesToLocal, loadFeaturesFromLocal, drawLayer } from './draw-utils.js';

const CONTROLS_ID = 'controls';
const LAYERS_ID = 'layer-switcher';

export const zoomControl = new Zoom();
export const scaleLineControl = new ScaleLine({ units: 'metric' });
export const attributionControl = new Attribution({ collapsible: true, collapsed: true });
export const fullScreenControl = new FullScreen();
export const rotateControl = new Rotate({ autoHide: true });

function buildLayerSwitcherHtml(layers) {
  let html = '<div class="layer-switcher"><h3>Kihtide valik</h3>';
  for (const l of layers) {
    html += `
      <label class="ls-row">
        <input type="checkbox" data-layer-id="${l.id}" ${l.layer.getVisible() ? 'checked' : ''}>
        <span class="ls-title">${escapeHtml(l.title)}</span>
      </label>
    `;
  }
  html += '</div>';
  return html;
}

function escapeHtml(s = '') {
  return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
}

export function initControls(map, options = {}) {
  const controlsEl = document.getElementById(CONTROLS_ID);
  if (!controlsEl) {
    console.warn('Controls container not found:', CONTROLS_ID);
    return;
  }

  controlsEl.innerHTML = `
    <div class="controls-row">
      <button id="btn-draw" title="Joonista ala">Joonista</button>
      <button id="btn-modify" title="Muuda joonistusi">Muuda</button>
      <button id="btn-save" title="Salvesta">Salvesta</button>
      <button id="btn-load" title="Laadi">Laadi</button>
      <button id="btn-export" title="Ekspordi">Ekspordi</button>
      <button id="btn-clear" title="Kustuta joonised">Kustuta</button>
      <button id="btn-info" title="Info">Info</button>
    </div>
    <div id="${LAYERS_ID}" class="layer-switcher-wrap"></div>
  `;

  map.addControl(zoomControl);
  map.addControl(scaleLineControl);
  map.addControl(attributionControl);
  map.addControl(fullScreenControl);
  map.addControl(rotateControl);

  initSidebar({ defaultView: showWelcomeView });

  const layerContainer = document.getElementById(LAYERS_ID);
  const knownLayers = [];

  if (Array.isArray(options.baseLayers)) {
    for (const l of options.baseLayers) knownLayers.push({ id: l.id, title: l.title, layer: l.layer, type: 'base' });
  }
  if (Array.isArray(options.overlayLayers)) {
    for (const l of options.overlayLayers) knownLayers.push({ id: l.id, title: l.title, layer: l.layer, type: 'overlay' });
  }

  if (knownLayers.length === 0) {
    map.getLayers().forEach((layer, idx) => {
      const title = layer.get('title') || `Layer ${idx}`;
      knownLayers.push({ id: `l${idx}`, title, layer, type: 'unknown' });
    });
  }

  layerContainer.innerHTML = buildLayerSwitcherHtml(knownLayers);

  layerContainer.addEventListener('change', (ev) => {
    const input = ev.target;
    if (input && input.dataset && input.dataset.layerId) {
      const id = input.dataset.layerId;
      const entry = knownLayers.find(x => x.id === id);
      if (entry) entry.layer.setVisible(input.checked);
    }
  });

  document.getElementById('btn-draw').addEventListener('click', () => {
    enableDrawing(map, 'Polygon');
    document.getElementById('btn-draw').classList.add('active');
    document.getElementById('btn-modify').classList.remove('active');
  });

  document.getElementById('btn-modify').addEventListener('click', () => {
    const active = document.getElementById('btn-modify').classList.toggle('active');
    if (active) {
      disableDrawing(map);
      enableDrawing(map, 'Modify');
    } else {
      disableDrawing(map);
    }
  });

  document.getElementById('btn-save').addEventListener('click', () => {
    saveFeaturesToLocal();
    showAdminBox({ text: 'Salvestatud localStorage\'i' });
  });

  document.getElementById('btn-load').addEventListener('click', () => {
    loadFeaturesFromLocal();
    showAdminBox({ text: 'Laetud localStorage\'ist' });
  });

  document.getElementById('btn-export').addEventListener('click', () => {
    exportGeoJSON();
  });

  document.getElementById('btn-clear').addEventListener('click', () => {
    if (confirm('Kustutada kõik joonised?')) {
      drawLayer.getSource().clear();
      saveFeaturesToLocal();
    }
  });

  document.getElementById('btn-info').addEventListener('click', () => {
    showWelcomeView();
  });

  map.on('singleclick', (evt) => {
    map.forEachFeatureAtPixel(evt.pixel, (feature) => {
      const title = feature.get('title') || 'Valitud objekt';
      const description = feature.get('note') || '';
      showObjectInfo({ title, description, properties: feature.getProperties() });
    });
  });

  return { knownLayers };
}


