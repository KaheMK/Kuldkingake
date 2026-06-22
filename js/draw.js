// js/draw.js — drawing helpers skeleton
// Listens for map-core:ready and attaches simple drawing/modify helpers
(function(window){
  function enableDraw(type){
    const objs = window.mapObjects;
    if (!objs) { console.warn('draw: mapObjects not ready'); return; }
    // remove existing interactions
    disableInteractions();
    const map = objs.map;
    const drawInteraction = new ol.interaction.Draw({ source: objs.drawSource, type: type || 'Polygon' });
    map.addInteraction(drawInteraction);
    const modifyInteraction = new ol.interaction.Modify({ source: objs.drawSource });
    map.addInteraction(modifyInteraction);
    const snap = new ol.interaction.Snap({ source: objs.drawSource });
    map.addInteraction(snap);
    // store references
    window.__drawInteractions = { draw: drawInteraction, modify: modifyInteraction, snap };
    drawInteraction.on('drawend', function(evt){
      const f = evt.feature; f.setId('f-'+Date.now());
      console.info('draw: feature drawn', f);
      // push to a holding array for later save
      window.currentDrawingFeatures = window.currentDrawingFeatures || [];
      const geom = f.getGeometry().clone().transform('EPSG:3857','EPSG:4326');
      window.currentDrawingFeatures.push({ tuup: geom.getType(), koordinaadid: geom.getCoordinates(), featureId: f.ol_uid });
    });
  }
  function disableInteractions(){
    const ints = window.__drawInteractions || {};
    const map = window.mapObjects && window.mapObjects.map;
    if (!map) return;
    if (ints.draw) map.removeInteraction(ints.draw);
    if (ints.modify) map.removeInteraction(ints.modify);
    if (ints.snap) map.removeInteraction(ints.snap);
    window.__drawInteractions = null;
  }

  function saveToLocal(){
    try{
      const format = new ol.format.GeoJSON();
      const geojson = format.writeFeatures(window.mapObjects.drawSource.getFeatures(), { featureProjection: 'EPSG:3857' });
      localStorage.setItem('orhideed_features_v1', geojson);
      flash('Salvestatud localStorage\'i');
    }catch(e){ console.error(e); flash('Salvestus ebaõnnestus'); }
  }

  function flash(msg, ms=1400){
    const elId='__flash_msg';
    let el=document.getElementById(elId);
    if(!el){ el=document.createElement('div'); el.id=elId; document.body.appendChild(el); }
    el.textContent=msg; el.style.display='block'; setTimeout(()=>el.style.display='none',ms);
  }

  window.drawModule = { enableDraw, disableInteractions, saveToLocal };

  window.addEventListener('map-core:ready', function(){ console.info('draw: detected map-core ready'); });
})(window);
