// selgitus: compat-shim.js — ühilduvusshim vanale globaalsele API‑le
// See fail määrab olemasolevad globaalfuncid (nt initDraw, enableDraw, saveToLocal jne),
// mis vana app.js eeldab. Shim suunab need uue mooduli API (drawModule/map-core) külge.

(function(window){
  // selgitus: abifunktsioon, mis ootab kuni mapObjects on valmis
  function ensureMapReady(cb){
    if (window.mapObjects) return cb();
    window.addEventListener('map-core:ready', function handler(ev){ window.removeEventListener('map-core:ready', handler); cb(); });
  }

  // selgitus: initDraw / initDrawUtils — vanad initsialiseerijad
  window.initDraw = window.initDrawUtils = function(){
    ensureMapReady(function(){
      // drawModule ise ei pruugi vajada eraldi initsialiseerimist, aga kontrollime
      if (window.drawModule) console.info('compat-shim: drawModule valmis');
      else console.warn('compat-shim: drawModule ei leitud');
    });
  };

  // selgitus: enableDraw / enableDrawing — joonistamise alustamine
  window.enableDraw = window.enableDrawing = function(type){
    ensureMapReady(function(){
      if (window.drawModule && typeof window.drawModule.enableDraw === 'function') return window.drawModule.enableDraw(type || 'Polygon');
      console.warn('compat-shim: enableDraw pole saadaval');
    });
  };

  // selgitus: disableDrawing / disableInteractions — lõpetame joonistamise/modify interaktsioonid
  window.disableDrawing = window.disableInteractions = function(){
    if (window.drawModule && typeof window.drawModule.disableInteractions === 'function') return window.drawModule.disableInteractions();
    console.warn('compat-shim: disableInteractions pole saadaval');
  };

  // selgitus: salvestuse aliased — salvestame kohalikku mällu
  window.saveFeaturesToLocal = window.saveToLocal = function(){
    if (window.drawModule && typeof window.drawModule.saveToLocal === 'function') return window.drawModule.saveToLocal();
    // hädaolukorra varuvariant, mis kasutab otseselt mapObjects'it
    try{
      const fmt = new ol.format.GeoJSON();
      const geojson = fmt.writeFeatures(window.mapObjects.drawSource.getFeatures(), { featureProjection: 'EPSG:3857' });
      localStorage.setItem('orhideed_features_v1', geojson);
      console.info('compat-shim: salvestatud lokaalse varuvõimalusega');
    }catch(e){ console.error('compat-shim salvestus ebaõnnestus', e); }
  };

  // selgitus: laadimise aliased (lokalne import)
  window.loadFeaturesFromLocal = window.loadFromLocal = function(){
    if (window.drawModule && typeof window.drawModule.loadFromLocal === 'function') return window.drawModule.loadFromLocal();
    try{
      const data = localStorage.getItem('orhideed_features_v1');
      if (!data) { console.info('compat-shim: kohalikku andmestikku ei leitud'); return; }
      const fmt = new ol.format.GeoJSON();
      const feats = fmt.readFeatures(data, { featureProjection: 'EPSG:3857' });
      window.mapObjects.drawSource.clear();
      window.mapObjects.drawSource.addFeatures(feats);
      console.info('compat-shim: laetud funktsiooniga lokaalsest salvestusest');
    }catch(e){ console.error('compat-shim laadimine ebaõnnestus', e); }
  };

  // selgitus: eksport/impordi aliased
  window.exportGeoJSON = window.exportGeoJSON || function(){
    try{
      const fmt = new ol.format.GeoJSON();
      const geojson = fmt.writeFeatures(window.mapObjects.drawSource.getFeatures(), { featureProjection: 'EPSG:3857' });
      const blob = new Blob([geojson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'features.geojson'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
      console.info('compat-shim: geojson eksport');
    }catch(e){ console.error('compat-shim eksport ebaõnnestus', e); }
  };

  window.importGeoJSONFile = window.importGeoJSONFile || function(file){
    const reader = new FileReader();
    reader.onload = function(){
      try{
        const fmt = new ol.format.GeoJSON();
        const feats = fmt.readFeatures(reader.result, { featureProjection: 'EPSG:3857' });
        window.mapObjects.drawSource.addFeatures(feats);
        console.info('compat-shim: geojson imporditud');
      }catch(e){ console.error('compat-shim import ebaõnnestus', e); }
    };
    reader.readAsText(file);
  };

  // selgitus: undo/redo ajutised kohad — praegu noop, et vana kood ei viskaks vigu
  window.undoAction = window.undoAction || function(){ console.info('compat-shim: undoAction pole veel implementeeritud'); };
  window.pushAction = window.pushAction || function(){ /* noop */ };
  window.pushSnapshot = window.pushSnapshot || function(){ /* noop */ };

})(window);
