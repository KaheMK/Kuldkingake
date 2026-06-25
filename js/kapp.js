// =========================================================================
// 1. SIDEBAR MOODUL (Endine js/sidebar.js)
// =========================================================================
const sidebarEl = document.getElementById('sidebar');

function ensureSidebar() {
  if (!sidebarEl) console.warn('Külgriba elementi "sidebar" ei leitud DOM-ist');
}

function escapeHtml(str = '') {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function setSidebarContent(html) {
  ensureSidebar();
  if(sidebarEl) sidebarEl.innerHTML = html;
}

function setSidebarText(title = '', text = '') {
  ensureSidebar();
  if(!sidebarEl) return;
  sidebarEl.innerHTML = '';
  if (title) {
    const h = document.createElement('h2'); h.textContent = title; sidebarEl.appendChild(h);
  }
  if (text) {
    const p = document.createElement('p'); p.textContent = text; sidebarEl.appendChild(p);
  }
}

function setSidebarHtml(title = '', html = '') {
  ensureSidebar();
  if(!sidebarEl) return;
  sidebarEl.innerHTML = '';
  if (title) {
    const h = document.createElement('h2'); h.textContent = title; sidebarEl.appendChild(h);
  }
  if (html) {
    const wrapper = document.createElement('div'); wrapper.innerHTML = html; sidebarEl.appendChild(wrapper);
  }
}

function showWelcomeView() {
  setSidebarText('Tere tulemast', 'Vali objekt kaardilt või kasuta nuppe joonistamiseks ja salvestamiseks.');
}

function showObjectInfo(data = {}) {
  const title = data.title || 'Objekt';
  const description = data.description || '';
  let html = `<p>${escapeHtml(description)}</p>`;
  if (data.properties) {
    html += '<dl>';
    for (const k in data.properties) {
      if (k === 'geometry' || k === 'createdAt' || k === 'title') continue;
      html += `<dt style="font-weight:bold;margin-top:4px;">${escapeHtml(k)}</dt><dd style="margin-left:0;margin-bottom:4px;">${escapeHtml(String(data.properties[k]))}</dd>`;
    }
    html += '</dl>';
  }
  setSidebarHtml(title, html);
}

function showAdminBox(data = {}) {
  const text = data.text || '';
  const html = `
    <label for="admin-note" style="display:block;font-weight:600;margin-bottom:4px;">Iseloomustus</label>
    <textarea id="admin-note" rows="6" style="width:100%;box-sizing:border-box;padding:6px;border-radius:4px;border:1px solid #ccc;">${escapeHtml(text)}</textarea>
    <div class="sidebar-actions" style="margin-top:8px;display:flex;gap:8px;justify-content:flex-end;">
      <button id="admin-cancel" style="padding:6px 12px;border:none;background:#eee;border-radius:4px;cursor:pointer;">Tühista</button>
      <button id="admin-save" style="padding:6px 12px;border:none;background:#a3005a;color:#fff;border-radius:4px;cursor:pointer;font-weight:600;">Salvesta</button>
    </div>
  `;
  setSidebarHtml('Teavitus', html);
}

function initSidebar({ defaultView = showWelcomeView } = {}) {
  ensureSidebar();
  if (!sidebarEl) return;
  if (!sidebarEl.querySelector('.sidebar-close')) {
    const closeBtn = document.createElement('button');
    closeBtn.className = 'sidebar-close';
    closeBtn.title = 'Sulge';
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', () => {
      sidebarEl.classList.toggle('collapsed');
    });
    sidebarEl.prepend(closeBtn);
  }
  defaultView();
}

// =========================================================================
// 2. DRAW UTILS MOODUL (Endine js/draw-utils.js)
// =========================================================================
let geojsonFormat, drawSource, drawLayer;
let drawInteraction = null, modifyInteraction = null, snapInteraction = null;
const LOCAL_STORAGE_KEY = 'orhideed_features_v1';

function initDrawUtils() {
  geojsonFormat = new ol.format.GeoJSON();
  drawSource = new ol.source.Vector();
  drawLayer = new ol.layer.Vector({
    source: drawSource,
    style: new ol.style.Style({
      fill: new ol.style.Fill({ color: 'rgba(255,165,0,0.25)' }),
      stroke: new ol.style.Stroke({ color: '#ff8c00', width: 2 }),
      image: new ol.style.Circle({ radius: 6, fill: new ol.style.Fill({ color: '#ff8c00' }) })
    }),
    zIndex: 1000,
    visible: true
  });
}

function enableDrawing(map, mode = 'Polygon') {
  disableDrawing(map);
  if (mode === 'Modify') {
    modifyInteraction = new ol.interaction.Modify({ source: drawSource });
    map.addInteraction(modifyInteraction);
    snapInteraction = new ol.interaction.Snap({ source: drawSource });
    map.addInteraction(snapInteraction);
    return;
  }
  drawInteraction = new ol.interaction.Draw({ source: drawSource, type: mode });
  map.addInteraction(drawInteraction);
  modifyInteraction = new ol.interaction.Modify({ source: drawSource });
  map.addInteraction(modifyInteraction);
  snapInteraction = new ol.interaction.Snap({ source: drawSource });
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

function disableDrawing(map) {
  if (drawInteraction && map) map.removeInteraction(drawInteraction);
  if (modifyInteraction && map) map.removeInteraction(modifyInteraction);
  if (snapInteraction && map) map.removeInteraction(snapInteraction);
  drawInteraction = modifyInteraction = snapInteraction = null;
}

function saveFeaturesToLocal() {
  try {
    const features = drawSource.getFeatures();
    const geojson = geojsonFormat.writeFeatures(features, { featureProjection: 'EPSG:3857' });
    localStorage.setItem(LOCAL_STORAGE_KEY, geojson);
  } catch (err) { console.error(err); }
}

function loadFeaturesFromLocal() {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!data) return;
    const features = geojsonFormat.readFeatures(data, { featureProjection: 'EPSG:3857' });
    drawSource.clear();
    drawSource.addFeatures(features);
  } catch (err) { console.error(err); }
}

function exportGeoJSON() {
  const geojson = geojsonFormat.writeFeatures(drawSource.getFeatures(), { featureProjection: 'EPSG:3857' });
  const blob = new Blob([geojson], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'features.geojson';
  document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}

// =========================================================================
// 3. CONTROLS MOODUL (Endine js/controls.js)
// =========================================================================
function initControls(map, options = {}) {
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
    if (confirm('Kustutada kõik joonised?')) {
      drawLayer.getSource().clear();
      saveFeaturesToLocal();
    }
  });

  map.on('singleclick', (evt) => {
    if (evt.originalEvent.target.closest('.modal-card, #controls, #sidebar, #auth-pill, #map-branding')) return;
    const feature = map.forEachFeatureAtPixel(evt.pixel, (f) => f);
    if (feature) {
      showObjectInfo({ title: feature.get('title'), description: feature.get('note'), properties: feature.getProperties() });
    } else {
      showWelcomeView();
    }
  });
}

async function initApp() {
// Initsialiseerime joonistamise
initDrawUtils();
// Luuakse põhikaart
const map = new ol.Map({
target: 'map',
view: new ol.View({
center: ol.proj.fromLonLat([24.0, 58.9]),
zoom: 12
}),
controls: []
});
// Luuakse kaardikihid
const satelliteLayer = new ol.layer.Tile({ source: new ol.source.OSM(), visible: true, zIndex: 0 });
const cadastralLayer = new ol.layer.Image({
source: new ol.source.ImageWMS({
url: 'maaamet.ee',
params: { LAYERS: 'KATASTRIYKSUS', FORMAT: 'image/png', TRANSPARENT: true, VERSION: '1.3.0', CRS: 'EPSG:3857' },
crossOrigin: 'anonymous'
}),
visible: false,
zIndex: 500
});
map.addLayer(satelliteLayer);
map.addLayer(cadastralLayer);
map.addLayer(drawLayer); // drawLayer pärineb DrawUtils plokist [1]
initSidebar();
initControls(map, {
baseLayers: [{ id: 'sat', title: 'Baaskaart (OSM)', layer: satelliteLayer }],
overlayLayers: [
{ id: 'cad', title: 'Katastriosa', layer: cadastralLayer },
{ id: 'draw', title: 'Joonistused', layer: drawLayer }
]
});
loadFeaturesFromLocal();
// --- Modaalakende ja Supabase loogika integratsioon ---
const adminModal = document.getElementById('admin-modal');
const loginModal = document.getElementById('login-modal');
const logo = document.getElementById('orchid-logo-svg');
const authRight = document.getElementById('auth-right');
const authLeft = document.getElementById('auth-left');
logo?.addEventListener('click', () => { adminModal.style.display = 'flex'; });
document.getElementById('admin-close')?.addEventListener('click', () => { adminModal.style.display = 'none'; });
document.getElementById('login-badge')?.addEventListener('click', () => { adminModal.style.display = 'none'; loginModal.style.display = 'flex'; });
document.getElementById('login-close')?.addEventListener('click', () => { loginModal.style.display = 'none'; });
window.addEventListener('click', (e) => {
if (e.target === adminModal) adminModal.style.display = 'none';
if (e.target === loginModal) loginModal.style.display = 'none';
});
// Laadime Supabase asünkroonse mooduli otse rootist

// --- Modaalakende ja Supabase loogika integratsioon (Globaalne režiim) ---
const supabaseClient = window.supabase;

if (supabaseClient) {
  authRight?.addEventListener('click', async () => {
    if (authRight.textContent === 'Logi sisse') {
      loginModal.style.display = 'flex';
    } else {
      await supabaseClient.auth.signOut();
    }
  });

  document.getElementById('login-send')?.addEventListener('click', async () => {
    const email = document.getElementById('login-email').value.trim();
    const msg = document.getElementById('login-msg');
    if (!email) { msg.textContent = 'Sisesta e‑post!'; return; }
    msg.textContent = 'Saadan linki…';
    const { error } = await supabaseClient.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.href }});
    if (error) msg.textContent = 'Viga: ' + error.message;
    else msg.textContent = 'Magic link saadetud meilile!';
  });

  // Kasutame otse aknasse laetud Supabase abifunktsioone
  if (typeof window.initAuth === 'function') {
    await window.initAuth(async (user) => {
      if (user) {
        const row = typeof window.ensureUserRow === 'function' ? await window.ensureUserRow(user.email) : null;
        if (authLeft) authLeft.textContent = row?.display_name || user.email.split('@')[0];
        if (authRight) authRight.textContent = 'Logi välja';
        loginModal.style.display = 'none';
      } else {
        if (authLeft) authLeft.textContent = 'Uudistaja';
        if (authRight) authRight.textContent = 'Logi sisse';
      }
    });
  }
} else {
  console.warn("Supabase ootel või lokaalses režiimis. Süsteem töötab kohaliku mäluga.");
  if (authLeft) authLeft.textContent = 'Uudistaja';
  if (authRight) authRight.textContent = 'Logi sisse';

  authRight?.addEventListener('click', () => {
    loginModal.style.display = 'flex';
    const msg = document.getElementById('login-msg');
    if(msg) msg.textContent = 'Märkus: Andmebaasiühendus puudub, töötab kohalik režiim.';
  });
}


// Loader-ekraani peitmine
map.once('rendercomplete', () => {
document.getElementById('page-loader')?.remove();
});
}
// Käivitame kogu rakenduse alles siis, kui leht on kohal
window.addEventListener('DOMContentLoaded', () => {
initApp().catch(err => console.error('Viga käivitamisel:', err));
});




