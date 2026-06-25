// js/supabase-sync.js — SAMM-SAMMULINE DIAGNOSTIKA JA JOONISTAMISE TEST
(function() {
  let syncInterval = null;
  console.log("%c🔍 STEP 1: Fail jooksis brauserisse sisse. Sünkroniseerija on elus!", "color: #00ffff; font-weight: bold;");

  async function loadSupabaseFeatures() {
    console.log("🔍 STEP 2: Funktsioon loadSupabaseFeatures käivitati taustal.");

    // 1. Kontrollime kaardi olemasolu
    if (!window.mapObjects) {
      console.log("🔍 STEP 2a: mapObjects pole veel valmis, ootan järgmist kordust...");
      return;
    }
    console.log("🔍 STEP 3: Kaardi põhi (window.mapObjects) leitud edukalt.");

    // 2. Kontrollime API olemasolu
    const api = window.supabaseAPI || null;
    if (!api) {
      console.log("🔍 STEP 3a: window.supabaseAPI puudub veel mälust, ootan järgmist kordust...");
      return; 
    }
    console.log("🔍 STEP 4: window.supabaseAPI leitud! Peatame automaatse korduse.");

    // Peatame korduse, kuna saime API kätte
    if (syncInterval) { clearInterval(syncInterval); syncInterval = null; }

    try {
      const map = window.mapObjects.map;
      const format = new ol.format.GeoJSON();

      // 3. Loome või puhastame pilvekihi
      let supaSource = window.__supabaseSource || null;
      if (!supaSource) {
        supaSource = new ol.source.Vector();
        window.__supabaseSource = supaSource;
        
       // js/supabase-sync.js — Asenda supaLayeri sees olev staatiline stiil selle targa funktsiooniga:

// KAVAL LIIGIPÕHINE VÄRVIKAART: Määrab igale liigile oma unikaalse värvi maastikul
function saaLiigiVarv(liik) {
  const l = String(liik).toLowerCase();
  if (l.includes('kuldking')) return { fill: 'rgba(255, 204, 0, 0.2)', stroke: '#ffaa00' }; // Kollakas-oranž indikaator
  if (l.includes('hall käpp')) return { fill: 'rgba(230, 0, 115, 0.2)', stroke: '#e60073' }; // Ergas lilla-roosa
  if (l.includes('kärbesõis')) return { fill: 'rgba(102, 51, 0, 0.2)', stroke: '#663300' };    // Tume maapruun
  if (l.includes('ööviiul')) return { fill: 'rgba(255, 255, 255, 0.3)', stroke: '#33cc33' };   // Valge-roheline kuma
  if (l.includes('sõrmkäpp')) return { fill: 'rgba(153, 51, 255, 0.2)', stroke: '#9933ff' };  // Sügavlilla
  if (l.includes('maasapp')) return { fill: 'rgba(255, 102, 153, 0.2)', stroke: '#ff6699' };   // Roosa
  
  // Fallback muudele vaatlustele (nt. metsad, tiigid jne)
  return { fill: 'rgba(0, 153, 255, 0.15)', stroke: '#0099ff' }; // Standardne sinine indikaator
}

// Seejärel uuenda supaLayeri loomist:
const supaLayer = new ol.layer.Vector({
  source: supaSource,
  // DÜNAAMILINE STIIL: OpenLayers küsib iga kujundi joonistamisel värvi siit funktsioonist reaalajas!
  style: function(feature) {
    const liik = feature.get('liik') || '';
    const varvid = saaLiigiVarv(liik);
    
    return new ol.style.Style({
      fill: new ol.style.Fill({ color: varvid.fill }),
      stroke: new ol.style.Stroke({ color: varvid.stroke, width: 3 }),
      image: new ol.style.Circle({ radius: 7, fill: new ol.style.Fill({ color: varvid.stroke }) })
    });
  },
  zIndex: 900,
  visible: true
});

        map.addLayer(supaLayer);
        console.log("🔍 STEP 5: Punane pilvekiht edukalt kaardile lisatud.");
      } else {
        supaSource.clear();
      }

      // 4. Küsime andmed otse pilvest
      console.log("🔍 STEP 6: Saadan päringu vaatlus_objektid tabelisse...");
      const res = await api.listAllActiveFeatures();
      let rows = (res && Array.isArray(res.data)) ? res.data : [];
      console.log("🔍 STEP 7: Päring lõppenud. Andmebaasist tuli kohale ridu: " + rows.length);

      let added = 0;
      
      // 5. Hakkame ridu töötlema
      for (const row of rows) {
        console.log(`🔍 STEP 8: Hakkan töötlema objekti ID-ga: ${row.id}, Pealkiri: ${row.pealkiri}`);
        
        let geom = row.koordinaadid;
        if (!geom) {
          console.warn(`  ↳ Objektil ${row.id} puuduvad koordinaadid täielikult!`);
          continue;
        }

        // Parsime stringi vajadusel
        if (typeof geom === 'string') {
          try { geom = JSON.parse(geom); } catch(e) { console.error("  ↳ JSON parsimise viga!"); continue; }
        }

        // Võtame sinu konsooli näidise järgi väärtused
        const reaalneTuup = geom.type || row.tuup || 'Polygon';
        const reaalsedKoordinaadid = geom.coordinates || geom;

        console.log(`  ↳ Tüüp: ${reaalneTuup}, Punkte massiivis: ${reaalsedKoordinaadid ? reaalsedKoordinaadid.length : 0}`);

        // Ehitame GeoJSON standardi
        const geojsonStructure = {
          type: 'Feature',
          geometry: {
            type: reaalneTuup,
            coordinates: reaalsedKoordinaadid
          },
          properties: Object.assign({}, row)
        };
        
        // TEST: Proovime, kas OpenLayers teeb sellest kujundi
        try {
          const feat = format.readFeature(geojsonStructure, { 
            dataProjection: 'EPSG:4326', 
            featureProjection: 'EPSG:3857' 
          });
          
          if (feat) {
            feat.setProperties(Object.assign({}, row, { _source: 'supabase' }));
            feat.setId(row.id);
            supaSource.addFeature(feat); 
            added++;
            console.log(`  ↳ %cEDUKAS! OpenLayers lõi polügooni ja see lisati kaardile.`, "color: #00ff00;");
          } else {
            console.error(`  ↳ OpenLayers tagastas tühja tulemuse (null)!`);
          }
        } catch(e) { 
          console.error(`  ↳ %cKRAHH! OpenLayers viskas kujundi loomisel vea: ${e.message}`, "color: #ff0000;"); 
        }
      }
      
      console.log(`%c🏁 JOONISTAMISE RAPORT: Pilvest laeti ${rows.length} rida. Kaardile sai edukalt joonistatud: ${added} kujundit.`, "color: #05ee3b; font-weight: bold; font-size: 14px;");
    } catch(e) {
      console.error('❌ CRITICAL ERROR loadSupabaseFeatures sees:', e);
    }
  }

  window.refreshSupabaseData = loadSupabaseFeatures;
  
  // Käivitame taustakontrolli
  syncInterval = setInterval(loadSupabaseFeatures, 250);
})();










