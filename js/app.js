// js/app.js
import { createMap } from './map.js';
import { satelliteLayer, cadastralLayer } from './layers.js';
import { drawLayer, enableDrawing, disableDrawing } from './draw-utils.js';
import { initControls } from './controls.js';
import { initSidebar, showWelcomeView } from './sidebar.js';

function ensureElement(id) {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Element with id="${id}" not found in DOM`);
  return el;
}

async function initApp() {
  ensureElement('map');
  ensureElement('sidebar');
  ensureElement('controls');

  const map = createMap('map');

  satelliteLayer.set('title', 'Baaskaart');
  cadastralLayer.set('title', 'Katastriosa');
  map.addLayer(satelliteLayer);

  drawLayer.setVisible(false);
  map.addLayer(drawLayer);

  cadastralLayer.setVisible(false);
  map.addLayer(cadastralLayer);

  initSidebar({ defaultView: showWelcomeView });

  initControls(map, {
    baseLayers: [{ id: 'sat', title: 'Baaskaart', layer: satelliteLayer }],
    overlayLayers: [
      { id: 'cad', title: 'Katastri', layer: cadastralLayer },
      { id: 'draw', title: 'Joonistused', layer: drawLayer }
    ]
  });

  const toggle = document.getElementById('toggle-cadastral');
  if (toggle) {
    toggle.checked = cadastralLayer.getVisible();
    toggle.addEventListener('change', (ev) => {
      cadastralLayer.setVisible(!!ev.target.checked);
    });
  }

  const baseSource = satelliteLayer.getSource && satelliteLayer.getSource();
  let pending = 0;
  let baseLoaded = false;

  function onBaseLoaded() {
    if (baseLoaded) return;
    baseLoaded = true;
    drawLayer.setVisible(true);
    console.info('Baaskaart laetud — joonistuskiht nähtav.');
  }

  if (baseSource && baseSource.on) {
    baseSource.on('tileloadstart', () => { pending++; });
    baseSource.on('tileloadend', () => {
      pending = Math.max(0, pending - 1);
      if (pending === 0) onBaseLoaded();
    });
    baseSource.on('tileloaderror', (e) => {
      pending = Math.max(0, pending - 1);
      console.warn('Base tile load error', e);
      if (pending === 0) onBaseLoaded();
    });
    map.once('rendercomplete', () => {
      if (!baseLoaded) onBaseLoaded();
    });
  } else {
    map.once('rendercomplete', () => onBaseLoaded());
  }

  window.addEventListener('keydown', (ev) => {
    if (ev.key === 'd') {
      enableDrawing(map, 'Polygon');
    } else if (ev.key === 'm') {
      disableDrawing(map);
    }
  });

  return map;
}

initApp().then((map) => {
  console.info('Kaart initsialiseeritud', map);
}).catch((err) => {
  console.error('Rakenduse initsialiseerimine ebaõnnestus:', err);
});




