// js/map-core.js — map initialization skeleton
// Provides window.initApp() which initializes a bare map and exposes mapObjects
(function(window){
  function createMap(targetId){
    if (!window.ol) { console.error('OpenLayers (ol) not available — ensure loadOl ran first'); return null; }
    const view = new ol.View({ center: ol.proj.fromLonLat([24.0,58.9]), zoom: 12 });
    const osm = new ol.layer.Tile({ source: new ol.source.OSM(), zIndex:0 });
    const cadastral = new ol.layer.Image({ source: new ol.source.ImageWMS({ url: 'https://kaart.maaamet.ee/wms/alus', params:{LAYERS:'BAASKAART',FORMAT:'image/png',TRANSPARENT:true,VERSION:'1.3.0'}, crossOrigin:'anonymous'}), visible:false, zIndex:500 });
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

  function initApp(){
    const objs = createMap('map');
    if (!objs) return;
    window.mapObjects = objs;
    console.info('map-core: map initialized (skeleton)');
    // emit event for other modules
    try{ window.dispatchEvent(new CustomEvent('map-core:ready', { detail: objs })); }catch(e){}
  }

  window.initApp = initApp;
  window.createMap = createMap;
})(window);
