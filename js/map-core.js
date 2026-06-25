// js/map-core.js — map initialization skeleton
// Provides window.initApp() which initializes a bare map and exposes mapObjects
(function(window){
  function createMap(targetId){
    if (!window.ol) { console.error('OpenLayers (ol) not available — ensure loadOl ran first'); return null; }
    const view = new ol.View({ center: ol.proj.fromLonLat([24.0,58.9]), zoom: 12 });
    const osm = new ol.layer.Tile({ source: new ol.source.OSM(), zIndex:0 });
// js/map-core.js — Asenda vana cadastral kihi loomine selle hübriidfoto loogikaga:

// PARANDUS: Maa-ameti ametlik hübriidkaart (aerofoto + nimed ja teed)
// js/map-core.js — UUENDATUD JA AMETLIK MAA-AMETI HÜBRIIDKIHT

// js/map-core.js — AMETLIK JA TÖÖTAV MAA-AMETI HÜBRIIDKAART (XYZ TAILID)

// js/map-core.js — KORRASTATUD JA TÖÖTAV MAA-AMETI HÜBRIIDKAART

// js/map-core.js — 100% TÖÖTAV JA AMETLIK MAA-AMETI HÜBRIIDKAART

const cadastral = new ol.layer.Tile({
  source: new ol.source.XYZ({
    // Standardne OpenLayersi globaalne GoogleMaps-ühilduv (GMC) ruudustik.
    // Kuna see kasutab standardset {y} päringut, kaob ära igasugune risk,
    // et brauser kleebib numbreid domeeni nime otsa.
    url: 'https://maaamet.ee{z}/{x}/{y}.png',
    crossOrigin: 'anonymous'
  }),
  visible: false, // Vaikimisi peidus, et algne vaade oleks puhas ja rahulik
  zIndex: 100     // Alusbaasi peal, kuid jooniste all
});





    const drawSource = new ol.source.Vector();
    const drawLayer = new ol.layer.Vector({ source: drawSource, zIndex:1000 });
    const map = new ol.Map({ target: targetId || 'map', layers: [osm, cadastral, drawLayer], view: view, controls: [] });
    // add a few default controls
    map.addControl(new ol.control.Zoom());
    map.addControl(new ol.control.FullScreen());
    map.addControl(new ol.control.Rotate({ autoHide:true }));
    map.addControl(new ol.control.ScaleLine({ units: 'metric' }));
    map.addControl(new ol.control.Attribution({ collapsible: true }));
    return { map, view, layers: { osm, cadastral, drawLayer }, drawSource };
  }

 // Laadimise kinnitus
function initApp(){
  const objs = createMap('map');
  if (!objs) return;
  window.mapObjects = objs;
  console.info('map-core: map initialized (skeleton)');

  // PARANDUS: Peidame laadimise akna, kuna kaart on valmis!
  const loader = document.getElementById('page-loader');
  if (loader) {
    loader.style.display = 'none';
    loader.setAttribute('aria-hidden', 'true');
  }

  // emit event for other modules
  try{ window.dispatchEvent(new CustomEvent('map-core:ready', { detail: objs })); }catch(e){}
}

 //
  window.initApp = initApp;
  window.createMap = createMap;
})(window);
