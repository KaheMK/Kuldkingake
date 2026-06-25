// selgitus: persistence.js — jooniste salvestus/laadimine/eksport/import + undo/redo skelet
// See fail pakub lihtsat API'd, mida saab kasutada nii vana kui uue käivitaja poolt.
(function(window){
  // selgitus: konstant localStorage võtme jaoks
  const LOCAL_KEY = 'orhideed_features_v1';

  // selgitus: undo/redo virna (simple stringified snapshots)
  const undoStack = [];
  const redoStack = [];
  const MAX_STACK = 60;

  function formatFeatures(source){
    try{ const fmt = new ol.format.GeoJSON(); return fmt.writeFeatures(source.getFeatures(), { featureProjection: 'EPSG:3857' }); }
    catch(e){ console.warn('persistence: formatFeatures error', e); return null; }
  }

  function pushSnapshot(source){
    try{
      const snap = formatFeatures(source);
      if (snap !== null) { undoStack.push(snap); if (undoStack.length > MAX_STACK) undoStack.shift(); redoStack.length = 0; }
    }catch(e){ console.warn('persistence pushSnapshot', e); }
  }

  function saveToLocal(source){
    try{
      const geojson = formatFeatures(source);
      if (!geojson) return false;
      localStorage.setItem(LOCAL_KEY, geojson);
      flash('Salvestatud lokalStorage\'i');
      return true;
    }catch(e){ console.error('persistence saveToLocal', e); flash('Salvestus ebaõnnestus'); return false; }
  }

  function loadFromLocal(source){
    try{
      const data = localStorage.getItem(LOCAL_KEY);
      if (!data) { flash('LocalStorage tühi'); return false; }
      const fmt = new ol.format.GeoJSON();
      const feats = fmt.readFeatures(data, { featureProjection: 'EPSG:3857' });
      source.clear();
      source.addFeatures(feats);
      flash('Laetud localStorage\'ist');
      return true;
    }catch(e){ console.error('persistence loadFromLocal', e); flash('Laadimine ebaõnnestus'); return false; }
  }

  function exportGeoJSON(source){
    try{
      const fmt = new ol.format.GeoJSON();
      const geojson = fmt.writeFeatures(source.getFeatures(), { featureProjection: 'EPSG:3857' });
      const blob = new Blob([geojson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'features.geojson'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
      flash('Eksport valmis');
      return true;
    }catch(e){ console.error('persistence exportGeoJSON', e); flash('Eksport ebaõnnestus'); return false; }
  }

  function importGeoJSONFile(file, source){
    const reader = new FileReader();
    reader.onload = () => {
      try{
        const fmt = new ol.format.GeoJSON();
        const feats = fmt.readFeatures(reader.result, { featureProjection: 'EPSG:3857' });
        source.addFeatures(feats);
        flash('Imporditud GeoJSON');
      }catch(e){ console.error('persistence import', e); flash('Import ebaõnnestus'); }
    };
    reader.readAsText(file);
  }

  function undo(source){
    if (undoStack.length === 0) { flash('Tagasi: pole tegevust'); return; }
    const cur = formatFeatures(source);
    if (cur) redoStack.push(cur);
    const prev = undoStack.pop();
    const fmt = new ol.format.GeoJSON();
    const feats = fmt.readFeatures(prev, { featureProjection: 'EPSG:3857' });
    source.clear();
    source.addFeatures(feats);
    flash('Tagasi tehtud');
  }

  function redo(source){
    if (redoStack.length === 0) { flash('Edasi: pole tegevust'); return; }
    const cur = formatFeatures(source);
    if (cur) undoStack.push(cur);
    const next = redoStack.pop();
    const fmt = new ol.format.GeoJSON();
    const feats = fmt.readFeatures(next, { featureProjection: 'EPSG:3857' });
    source.clear();
    source.addFeatures(feats);
    flash('Edasi tehtud');
  }

  // selgitus: lihtne flash util (kopeeritud skeletist)
  function flash(msg, ms=1400){
    const elId='__flash_msg';
    let el=document.getElementById(elId);
    if(!el){ el=document.createElement('div'); el.id=elId; document.body.appendChild(el); }
    el.textContent=msg; el.style.display='block'; setTimeout(()=>el.style.display='none',ms);
  }

  // avalda API globaalina (seni mitte ES moduleid, lihtsuse huvides)
  window.persistence = { pushSnapshot, saveToLocal, loadFromLocal, exportGeoJSON, importGeoJSONFile, undo, redo };

})(window);
