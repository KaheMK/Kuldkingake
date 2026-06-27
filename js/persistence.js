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
// =========================================================================
// KOOLIPROGRAMMI EKSPORT: NIMI + VÄRVIPALETT (Lisatakse faili js/persistence.js)
// =========================================================================
// KOOLIPROGRAMMI EKSPORT – SISSE EHITATUD OTSE PERSISTENCE.JS SISSE
function exportGeoJSON(drawSource) {
    if (!drawSource) {
        console.error("Viga: drawSource puudub!");
        return;
    }

    // 1. Kontrollime ja loome dünaamiliselt seadete akna, kui seda veel pole
    let seadedModal = document.getElementById('eksport-seaded-modal');
    
    if (!seadedModal) {
        const eksportAkenHTML = `
        <div id="eksport-seaded-modal" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.75); z-index:10000; display:flex; justify-content:center; align-items:center;">
            <div style="background:#2a332c; color:#e0e0e0; padding:20px; border-radius:8px; border:2px solid #bf953f; width:90%; max-width:400px; box-shadow:0 4px 15px rgba(0,0,0,0.5); font-family: sans-serif;">
                <h3 style="color:#fcf6ba; margin-top:0;">💾 Ekspordi faili seaded</h3>
                <p style="font-size:13px; margin-bottom:15px; color:#b0b0b0;">Määra andmed, et õpetaja saaks kaardil Sinu joonistusi teistest eristada.</p>
                
                <div style="margin-bottom:12px;">
                    <label style="display:block; margin-bottom:4px; font-weight:bold; font-size:14px;">Õpilase nimi / Tunnus:</label>
                    <input type="text" id="exp-opilane-nimi" placeholder="nt: Anti-KoolX" style="width:100%; padding:8px; border-radius:4px; border:1px solid #bf953f; background:#1e251f; color:white; box-sizing:border-box;">
                </div>
                
                <div style="margin-bottom:20px; display:flex; align-items:center; gap:15px;">
                    <div>
                        <label style="display:block; margin-bottom:4px; font-weight:bold; font-size:14px;">Sinu kujundite värv:</label>
                        <input type="color" id="exp-opilane-varv" value="#bf953f" style="width:60px; height:35px; border:1px solid #bf953f; background:none; cursor:pointer; padding:0; border-radius:4px;">
                    </div>
                    <div style="font-size:12px; color:#b0b0b0; margin-top:15px;">
                        Vali kaardile ilmuvate joonte ja punktide unikaalne värv.
                    </div>
                </div>
                
                <div style="display:flex; justify-content:flex-end; gap:10px;">
                    <button id="exp-katkesta" style="background:#555; color:white; border:none; padding:8px 15px; border-radius:4px; cursor:pointer;">Katkesta</button>
                    <button id="exp-genereeri" style="background:#bf953f; color:black; font-weight:bold; border:none; padding:8px 15px; border-radius:4px; cursor:pointer;">Loo fail</button>
                </div>
            </div>
        </div>
        `;
        document.body.insertAdjacentHTML('beforeend', eksportAkenHTML);
        seadedModal = document.getElementById('eksport-seaded-modal');
    }

    // Näitame akent
    seadedModal.style.display = 'flex';

    // Katkestamise nupp
    document.getElementById('exp-katkesta').onclick = () => { seadedModal.style.display = 'none'; };

    // Kui vajutatakse "Loo fail"
    document.getElementById('exp-genereeri').onclick = () => {
        const nimiInput = document.getElementById('exp-opilane-nimi').value.trim();
        const varvInput = document.getElementById('exp-opilane-varv').value;

        if (!nimiInput) {
            alert("Palun sisesta oma nimi või unikaalne tunnus!");
            return;
        }

        // Loeme andmed Sinu orhideede ametlikust võtmest
        const kohalikudAndmedRaw = localStorage.getItem('orhideed_features_v1');
        if (!kohalikudAndmedRaw) {
            alert("Sinu märkmik on tühi! Kaardile pole veel ühtegi kujundit joonistatud.");
            seadedModal.style.display = 'none';
            return;
        }

        let geojsonEksportObject;
        try {
            geojsonEksportObject = JSON.parse(kohalikudAndmedRaw);
        } catch (e) {
            alert("Viga kohalike andmete lugemisel brauserist.");
            return;
        }

        // Pakime õpilase nime ja värvi absoluutselt igasse lahritesse, mida Sinu kaart-app.js oskab lugeda!
        if (geojsonEksportObject && Array.isArray(geojsonEksportObject.features)) {
            geojsonEksportObject.properties = {
                generator: "Kuldkingake Kooliprogramm",
                opilane: nimiInput,
                ekspordi_aeg: new Date().toISOString(),
                globaalne_varv: varvInput
            };

                        // Käime kõik kujundid läbi ja loome kolm puhast ja eraldi lahtrit
            geojsonEksportObject.features.forEach((feature, index) => {
                if (!feature.properties) feature.properties = {};
                
                // Säilitame õpilase enda pandud algse pealkirja (nt "Tammik")!
                // Kui mingil põhjusel pealkirja polnud, paneme asenduse
                const algnePealkiri = feature.properties.pealkiri || feature.properties.nimi || `Objekt ${index + 1}`;
                
                // 1. LAHTER - PEALKIRI: Jääb algupäraseks! (nt "Tammik")
                feature.properties.pealkiri = algnePealkiri;
                feature.properties.nimi = algnePealkiri;

                // 2. LAHTER - OMANIK/VAATLEJA: Paneme täpse õpilase nime
                feature.properties.opilane = nimiInput;
                feature.properties.vaatleja = `Vaatleja: ${nimiInput} (Objekt ${index + 1})`;
                
                // 3. LAHTER - VÄRV: Salvestame värviratta koodi
                feature.properties.varv = varvInput;
                
                // Sisselaadimise kavalus: kui Sinu külgriba kood kuvab andmeid tabelina, 
                // siis kirjutame märkuste/kirjelduse algusesse ilusa reaga ka vaatleja nime,
                // et see ilmuks automaatselt "Laiem kirjeldus / märkused" sektsiooni!
                const vanaKirjeldus = feature.properties.kirjeldus || feature.properties.description || '';
                feature.properties.kirjeldus = `[${feature.properties.vaatleja}]\n${vanaKirjeldus}`;
                feature.properties.description = `[${feature.properties.vaatleja}]\n${vanaKirjeldus}`;
            });

        } else {
            alert("Viga: Andmed ei ole korrektses kaardiformaadis.");
            return;
        }

        // Loome puhta faili allalaadimise
        const jsonString = JSON.stringify(geojsonEksportObject, null, 2);
        const failiBlob = new Blob([jsonString], { type: "application/geo+json;charset=utf-8;" });
        const failiUrl = URL.createObjectURL(failiBlob);
        
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", failiUrl);
        
        const puhasNimi = nimiInput.replace(/[^a-z0-9]/gi, '_');
        downloadAnchor.setAttribute("download", `eksport_${puhasNimi}.geojson`);
        
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        
        document.body.removeChild(downloadAnchor);
        URL.revokeObjectURL(failiUrl);

        seadedModal.style.display = 'none';
        alert(`Suurepärane, ${nimiInput}! Sinu fail laeti edukalt alla unikaalse nimega. Saada see õpetajale!`);
    };
}

// Kinnitame funktsiooni akna külge, et kaart-app.js selle üles leiaks
if (window.persistence) {
    window.persistence.exportGeoJSON = exportGeoJSON;
}
