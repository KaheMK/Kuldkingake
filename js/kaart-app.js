// js/kaart-app.js — lihtsustatud app koostaja: sidebari render, tööriistade sidumine ja feature info
(function(window){
  function ensureMapReady(cb){ if (window.mapObjects) return cb(); window.addEventListener('map-core:ready', function handler(){ window.removeEventListener('map-core:ready', handler); cb(); }); }

  function formatDateIsoToDDMMYYYY(iso){ if(!iso) return ''; try{ const d = new Date(iso); return d.toLocaleDateString('et-EE'); }catch(e){ return String(iso); } }

  function escapeHtml(s=''){ return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;'); }

  function setSidebarHtml(title, html){ const sidebarEl = document.getElementById('sliding-sidebar-content'); if (!sidebarEl) return; const preserved = document.getElementById('layer-switcher'); sidebarEl.innerHTML = ''; if (preserved) sidebarEl.appendChild(preserved); if (title) { const h=document.createElement('h2'); h.textContent=title; sidebarEl.appendChild(h); } const wrapper=document.createElement('div'); wrapper.innerHTML=html||''; sidebarEl.appendChild(wrapper); }

 // js/kaart-app.js — UUENDATUD showFeatureInfo funktsioon
// js/kaart-app.js — UUENDATUD JA PARANDATUD showFeatureInfo lokaalsete jooniste jaoks

function showFeatureInfo(feature){
  if (!feature) {
    return setSidebarHtml('Tere tulemast', '<p>Vali objekt kaardilt või kasuta nuppe joonistamiseks ja salvestamiseks.</p>');
  }
  
  // Loeme andmed OpenLayersi standardi järgi (.get())
  const source = feature.get('_source') || 'local';
  const pealkiri = feature.get('pealkiri') || 'Kohalik joonis';
  
  // PARANDUS: Loeme alati 'noted' välja, kuna salvestamisel kirjutame just sinna!
  const noted = feature.get('noted') || feature.get('note') || '';
  const created = formatDateIsoToDDMMYYYY(feature.get('created_at') || feature.get('createdAt') || feature.get('created'));

  if (source === 'supabase') {
    // Spetsialisti pilvevaade (Selle jätsime samaks)
    let dbNahtavus = feature.get('nahtavus') || '';
    if (dbNahtavus === 'kitsas_ring') {
      dbNahtavus = 'Kitsa ringi vaatlus (Autoriseeritud kasutajad)';
    } else if (dbNahtavus === 'avalik') {
      dbNahtavus = 'Avalik vaatlus (Kõik näevad)';
    }

    const liik = feature.get('liik') || '';
    const kogus = feature.get('kogus') || '';
    const ohustatus = feature.get('ohustatus') || '';
    const author = feature.get('kasutajanimi') || '';

    let html = `<p><strong>Märkused:</strong><br>${escapeHtml(noted)}</p><dl>`;
    html += `<dt>Liik</dt><dd>${escapeHtml(liik)}</dd>`;
    html += `<dt>Levik / kogus</dt><dd>${escapeHtml(kogus)}</dd>`;
    html += `<dt>Ohustatus</dt><dd>${escapeHtml(ohustatus)}</dd>`;
    html += `<dt>Nähtavus</dt><dd>${escapeHtml(dbNahtavus)}</dd>`;
    html += `<dt>Looja</dt><dd>${escapeHtml(author)}</dd>`;
    html += `<dt>Lisatud pilve</dt><dd>${escapeHtml(created)}</dd>`;
    html += `</dl>`;
    setSidebarHtml(pealkiri, html);
  } else {
    // === PARANDATUD KOHALIKU OBJEKTI VAADE ===
    // Nüüd kuvatakse 300-märgise laiendatava tekstikasti sisu vigadeta!
    let html = `<div style="margin-bottom: 15px;">`;
    html += `<strong>Laiem kirjeldus / märkused:</strong>`;
    html += `<p style="background: #f0f4f8; padding: 10px; border-radius: 6px; white-space: pre-wrap; max-height: 150px; overflow-y: auto; border: 1px solid #d0d7de;">${escapeHtml(noted || 'Märkused puuduvad.')}</p>`;
    html += `</div>`;
    
    html += `<dl>`;
    html += `<dt>Salvestatud seadmesse</dt><dd>${escapeHtml(created)}</dd>`;
    html += `<dt>Andmete asukoht</dt><dd>Selle brauseri kohalik mälu (LocalStorage)</dd>`;
    html += `</dl>`;
    setSidebarHtml(pealkiri, html);
  }
}


// 3. See funktsioon teeb koodi reaalselt kaardile ja localStorage'isse nähtavaks
// js/kaart-app.js — AINUS JA PARANDATUD salvestaKohalikkuMällu FUNKTSIOON

function salvestaKohalikkuMällu(objektiAndmed) {
  if (window.mapObjects && window.persistence) {
    const format = new ol.format.GeoJSON();
    
    // Loome puhta GeoJSON struktuuri OpenLayersi jaoks
    const geojsonFormula = {
      'type': 'Feature',
      'geometry': {
        'type': objektiAndmed.tuup,
        'coordinates': objektiAndmed.koordinaadid
      },
      'properties': {
        'pealkiri': objektiAndmed.pealkiri || 'Kohalik joonis',
        'noted': objektiAndmed.noted || '',
        'created_at': new Date().toISOString(),
        '_source': 'local' // Märgime unikaalse allika külgriba jaoks
      }
    };
    
    try {
      const feature = format.readFeature(geojsonFormula, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
      });
      
      // Lisame kujundi kaardi joonistuskihti reaalajas
      window.mapObjects.drawSource.addFeature(feature);
      
      // Salvestame seisu püsivalt brauseri mällu (persistence.js abil)
      window.persistence.pushSnapshot(window.mapObjects.drawSource);
      window.persistence.saveToLocal(window.mapObjects.drawSource);
      
      // PARANDUS: Puhastame pooleliolevate jooniste massiivi, kuna andmed on turvaliselt salvestatud!
      window.currentDrawingFeatures = [];
      console.log("✅ Peakood: Kohalik joonis edukalt taustal salvestatud ja ekraan puhastatud.");
      
    } catch(e) {
      console.error("❌ Peakood VIGA: Lokaalse objekti genereerimise tõrge:", e);
    }
  } else {
    // Kui kaart pole mingil põhjusel valmis, teeme turvalise toor-andmete varukoopia brauserisse
    localStorage.setItem('orhideed_features_backup', JSON.stringify(objektiAndmed));
    window.currentDrawingFeatures = [];
  }
}



// MODAALI LOOGIKA: Teadusandmete täitmine ja saatmine Supabase'i
// js/kaart-app.js — UUENDATUD avateadusAndmeteHupik ilma lehe restartideta
function avateadusAndmeteHupik(objektiAndmed, user) {
  const scienceModal = document.getElementById('science-modal');
  if (!scienceModal) {
    salvestaKohalikkuMällu(objektiAndmed);
    return;
  }

  scienceModal.style.display = 'flex';

  document.getElementById('sci-cancel-btn').onclick = function() {
    scienceModal.style.display = 'none';
  };

  // js/kaart-app.js — TÄIELIKULT UUENDATUD JA TURVATUD TEADUSANDMETE SALVESTAMINE

// js/kaart-app.js — Muuda funktsiooni avateadusAndmeteHupik sisemust:

// js/kaart-app.js — TÄIELIKULT TURVATUD JA TÕLGITUD PILVESALVESTUS

// js/kaart-app.js — MUUDA SEDA KOHTA FUNKTSIOONIS avateadusAndmeteHupik:

document.getElementById('sci-save-btn').onclick = async function() {
  const liik = document.getElementById('sci-liik').value.trim();
  const kogus = document.getElementById('sci-kogus').value.trim();
  const ohustatus = document.getElementById('sci-ohustatus').value;
  const tooresNahtavus = document.getElementById('sci-nahtavus').value.trim().toLowerCase(); // 'avalik' või 'piiratud'

  if (!liik) {
    alert("Palun määra orhidee liik enne pilve saatmist!");
    return;
  }

  // --- LÕPLIK JA ÕIGE ANDMEBAASI TÕLKIJA ---
  // Sinu RLS poliitika nime "Kitsa ringi punktid" järgi ootab andmebaas siia täpselt sõna 'kitsa_ringi'
  let nahtavus = 'avalik';
  if (tooresNahtavus === 'piiratud') {
    nahtavus = 'kitsas_ring'; // PARANDUS: See unikaalne koodisõna avab andmebaasi lukust!
  }

  const geojsonGeometry = {
    type: objektiAndmed.tuup,
    coordinates: objektiAndmed.koordinaadid
  };

  const reaalneKasutajanimi = user.email ? user.email.split('@')[0] : 'Spetsialist';

  // Saadame andmed taustal Supabase-i
  const { data, error } = await window.supabase
    .from('vaatlus_objektid')
    .insert([{
      looja_id: user.id,
      kasutajanimi: reaalneKasutajanimi,
      pealkiri: objektiAndmed.pealkiri || liik,
      tuup: objektiAndmed.tuup,
      koordinaadid: geojsonGeometry,
      noted: objektiAndmed.noted || '',
      liik: liik,
      kogus: kogus,
      ohustatus: ohustatus,
      nahtavus: nahtavus,   // Nüüd läheb andmebaasi kas 'avalik' või 'kitsa_ringi'
      staatus: 'kinnitatud' // Alati lubatud baasstaatus
    }]);

  if (error) {
    // Kui ka 'kitsa_ringi' viskab vea, näitab see teade konsoolis/ekraanil ära, mida andmebaas TÄPSELT ootab
    alert("Pilve salvestamisel tekkis tõrge: " + error.message + " \n\n(Kontrolli, kas viga on nahtavus_check)");
  } else {
    // Eduka salvestuse reaalajas kuvamine...
    if (window.mapObjects) {
      const format = new ol.format.GeoJSON();
      const geojsonFormula = {
        'type': 'Feature',
        'geometry': geojsonGeometry,
        'properties': {
          'pealkiri': objektiAndmed.pealkiri || liik,
          'noted': objektiAndmed.noted || '',
          'liik': liik,
          'kogus': kogus,
          'ohustatus': ohustatus,
          'nahtavus': tooresNahtavus, 
          'staatus': 'kinnitatud',
          'kasutajanimi': reaalneKasutajanimi,
          'created_at': new Date().toISOString(),
          '_source': 'supabase'
        }
      };
      
      try {
        const uueObjektiFeature = format.readFeature(geojsonFormula, {
          dataProjection: 'EPSG:4326',
          featureProjection: 'EPSG:3857'
        });
        window.mapObjects.drawSource.addFeature(uueObjektiFeature);
      } catch(e) { }
    }

    scienceModal.style.display = 'none';
    document.getElementById('sci-liik').value = '';
    document.getElementById('sci-kogus').value = '';
    window.currentDrawingFeatures = [];

    if (window.persistence && typeof window.persistence.flash === 'function') {
      window.persistence.flash("Vaatlus edukalt pilve edastatud!");
    }
  }
};




}


  function wireToolbar(drawSource){
    document.getElementById('ribbon-draw')?.addEventListener('click', () => { if (window.drawModule) window.drawModule.enableDraw('Polygon'); document.querySelectorAll('#tool-ribbon .rbtn').forEach(b=>b.classList.remove('active')); document.getElementById('ribbon-draw')?.classList.add('active'); });
    document.getElementById('ribbon-modify')?.addEventListener('click', () => { if (window.drawModule) window.drawModule.enableDraw('Modify'); document.querySelectorAll('#tool-ribbon .rbtn').forEach(b=>b.classList.remove('active')); document.getElementById('ribbon-modify')?.classList.add('active'); });

  // js/kaart-app.js — PARANDATUD JA LOLLIKINDEL ribbon-save KÄSITLEMINE

// js/kaart-app.js — LÕPLIK JA POMMIKINDEL SALVESTAMISE INTEGRATSIOON

// 1. KESKNE SALVESTAMISE NUPP (Tööriistaribal)
const ribbonSaveBtn = document.getElementById('ribbon-save');
if (ribbonSaveBtn) {
  ribbonSaveBtn.onclick = function(e) {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    console.log("⏳ Peakood: Vajutati nuppu 'Salvesta'. Otsin joonistust...");

    // Kontrollime, kas kaardi põhi on olemas
    if (!window.mapObjects || !window.mapObjects.drawSource) {
      alert("Süsteemi viga: Kaardikiht pole kättesaadav!");
      return;
    }

    const drawSource = window.mapObjects.drawSource;
    const features = drawSource.getFeatures();

    // Otsime, kas kaardil on olemas mõni joonistatud element, millel POLE veel allikat küljes (_source puudub)
    // See tähendab, et tegemist on parajasti ekraanile joonistatud uue, salvestamata kujundiga!
    const salvestamataKujundid = features.filter(f => !f.get('_source'));

    if (salvestamataKujundid.length === 0) {
      alert("Sul ei ole kaardil ühtegi uut joonistust, mida salvestada! Alustuseks vajuta 'Joonista'.");
      return;
    }

    // Võtame kõige viimati joonistatud salvestamata kujundi
    const aktiivneFeature = salvestamataKujundid[salvestamataKujundid.length - 1];
    
    try {
      // Teisendame OpenLayersi geomeetria standardseks WGS84 (EPSG:4326) koordinaatide paki andmebaasi jaoks
      const cloneGeom = aktiivneFeature.getGeometry().clone().transform('EPSG:3857', 'EPSG:4326');
      
      const objektiAndmed = {
        tuup: cloneGeom.getType(),
        koordinaadid: cloneGeom.getCoordinates(),
        featureRef: aktiivneFeature // Jätame kaardi objekti viite alles, et saaksime sellele hiljem andmed külge kirjutada
      };

      console.log("✅ Peakood: Joonistus leitud. Tüüp:", objektiAndmed.tuup, "Käivitan salvestamise käsitlemise...");
      
      // Käivitame sinu targa kaheastmelise valiku akna
      kasitleSalvestamist(objektiAndmed);

    } catch(err) {
      console.error("❌ Peakood VIGA koordinaatide püüdmisel:", err);
      alert("Joonise andmete lugemisel tekkis tõrge!");
    }
  };
}

// 2. KESKNE FUNKTSIOON: Küsime alati sisselogitult, kuhu salvestada
async function kasitleSalvestamist(objektiAndmed) {
  const sisseLogitudSessioon = window.supabase ? (await window.supabase.auth.getSession()).data.session : null;

  // Kui pole sisse logitud (Uudistaja), läheb alati otse lokaalsesse hüpikusse
  if (!sisseLogitudSessioon) {
    avaKohalikuSalvestamiseHupik(objektiAndmed);
    return;
  }

  // Kui ON sisse logitud spetsialist, küsime alati valikut
  const valik = confirm("Oled sisse logitud spetsialistina! Kas soovid salvestada andmed riiklikku pilveandmebaasi? \n\n[OK] = Pilve (Supabase) \n[Cancel] = Kohalikku mällu (LocalStorage)");

  if (valik) {
    avateadusAndmeteHupik(objektiAndmed, sisseLogitudSessioon.user);
  } else {
    avaKohalikuSalvestamiseHupik(objektiAndmed);
  }
}

// 3. KOHALIKU SALVESTAMISE ANKEET (300-märgilise laiendatava tekstikastiga)
function avaKohalikuSalvestamiseHupik(objektiAndmed) {
  const localModal = document.getElementById('local-save-modal');
  if (!localModal) {
    alert("Viga: Süsteemist puudub kohaliku salvestamise ankeet (#local-save-modal)!");
    return;
  }

  localModal.style.display = 'flex';

  document.getElementById('local-cancel-btn').onclick = function() {
    localModal.style.display = 'none';
  };

  document.getElementById('local-save-btn').onclick = function() {
    const pealkiri = document.getElementById('local-pealkiri').value.trim() || 'Kohalik joonis';
    const noted = document.getElementById('local-noted').value.trim();

    // Kirjutame andmed otse seal samas kaardil oleva kujundi külge!
    const feature = objektiAndmed.featureRef;
    if (feature) {
      feature.set('pealkiri', pealkiri);
      feature.set('noted', noted);
      feature.set('created_at', new Date().toISOString());
      feature.set('_source', 'local'); // Märgime puhtalt lokaalseks allikaks
    }

    // Kutsume välja sinu persistence.js faili püsivaks salvestamiseks LocalStorage'isse
    if (window.persistence && window.mapObjects) {
      window.persistence.pushSnapshot(window.mapObjects.drawSource);
      window.persistence.saveToLocal(window.mapObjects.drawSource);
    }

    // Puhastame tekstikastid järgmiseks korraks
    document.getElementById('local-pealkiri').value = '';
    document.getElementById('local-noted').value = '';
    localModal.style.display = 'none';
    
    alert("Objekt edukalt salvestatud seadme mällu!");
  };
}

// 4. PILVE (SUPABASE) TEADUSANDMETE SALVESTAMINE (Kitsa ringi tõlkijaga)
function avateadusAndmeteHupik(objektiAndmed, user) {
  const scienceModal = document.getElementById('science-modal');
  if (!scienceModal) {
    alert("Viga: Süsteemist puudub teadusandmete ankeet (#science-modal)!");
    return;
  }

  scienceModal.style.display = 'flex';

  document.getElementById('sci-cancel-btn').onclick = function() {
    scienceModal.style.display = 'none';
  };

  document.getElementById('sci-save-btn').onclick = async function() {
  const kategooria = document.getElementById('sci-kategooria').value;
  let liik = '';

  // PARANDUS: Otsustame liigi nime vastavalt valitud kategooriale
  if (kategooria === 'orhidee') {
    liik = document.getElementById('sci-liik-select').value;
  } else {
    liik = document.getElementById('sci-liik-vaba').value.trim();
  }
    const kogus = document.getElementById('sci-kogus').value.trim();
    const ohustatus = document.getElementById('sci-ohustatus').value;
    const tooresNahtavus = document.getElementById('sci-nahtavus').value.trim().toLowerCase(); // 'avalik' või 'piiratud'

    if (!liik) {
    alert("Palun määra vaatluse liik või nimetus enne pilve saatmist!");
    return;
  }

    // Sinu andmebaasi RLS poliitika range reegel: 'piiratud' muudetakse sõnaks 'kitsas_ring'
    let nahtavus = 'avalik';
    if (tooresNahtavus === 'piiratud') {
      nahtavus = 'kitsas_ring'; 
    }

    const geojsonGeometry = {
      type: objektiAndmed.tuup,
      coordinates: objektiAndmed.koordinaadid
    };

    const reaalneKasutajanimi = user.email ? user.email.split('@')[0] : 'Spetsialist';

    // Saadame andmed taustal Supabase-i
    const { data, error } = await window.supabase
      .from('vaatlus_objektid')
      .insert([{
        looja_id: user.id,
        kasutajanimi: reaalneKasutajanimi,
        pealkiri: liik,
        tuup: objektiAndmed.tuup,
        koordinaadid: geojsonGeometry,
        noted: objektiAndmed.noted || '',
        liik: liik,
        kogus: kogus,
        ohustatus: ohustatus,
        nahtavus: nahtavus,   
        staatus: 'kinnitatud' // Läbistab andmebaasi RLS kontrolli veatult
      }]);

    if (error) {
      alert("Pilve salvestamisel tekkis tõrge: " + error.message);
    } else {
      // Kuna andmed läksid pilve, siis eemaldame ajutise kohaliku joonise kaardilt, 
      // sest sinu supabase-sync.js laeb selle sealt taustal ise kohe ametliku punktina sisse!
      if (window.mapObjects && objektiAndmed.featureRef) {
        window.mapObjects.drawSource.removeFeature(objektiAndmed.featureRef);
      }

      scienceModal.style.display = 'none';
      document.getElementById('sci-liik').value = '';
      document.getElementById('sci-kogus').value = '';
      
      alert("Edukas! Sinu vaatlus edastati reaalajas Palivere pilveandmebaasi.");
      
      // Käivitame sünkroni kohe taustal uuesti, et uus kujund ilmuks pilvest ekraanile
      if (typeof window.refreshSupabaseData === 'function') {
        window.refreshSupabaseData();
      }
    }
  };
}





// js/kaart-app.js — PARANDATUD JA MOBIILISÕBRALIK LAADIMISE NUPP

document.getElementById('ribbon-load')?.addEventListener('click', () => {
  console.log("⏳ Peakood: Avatatakse seadme failihaldur GeoJSON laadimiseks...");
  
  // Loome nähtamatu failivaliku sisendi, mis avab telefonis ametliku "Files" või "Downloads" äpi
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.geojson, .json';

  // Kui kasutaja valib seadmes faili, hakkame seda töötlema
  fileInput.onchange = function(e) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    
    reader.onload = function(evt) {
      try {
        const format = new ol.format.GeoJSON();
        // Loeme faili sisu sisse
        const features = format.readFeatures(evt.target.result, {
          dataProjection: 'EPSG:4326',
          featureProjection: 'EPSG:3857'
        });

        if (features && features.length > 0) {
          // Märgime imporditud kujundid lokaalseks allikaks, et külgriba neid tajuks
          features.forEach(f => f.set('_source', 'local'));
          
          // Lisame kujundid kaardile joonistuskihti (drawSource)
          if (window.mapObjects && window.mapObjects.drawSource) {
            window.mapObjects.drawSource.addFeatures(features);
            
            // Salvestame andmed kohe ka selle seadme kohalikku mällu (LocalStorage)
            if (window.persistence) {
              window.persistence.pushSnapshot(window.mapObjects.drawSource);
              window.persistence.saveToLocal(window.mapObjects.drawSource);
            }
            
            alert(`Edukas! Kaardile laeti ${features.length} kohalikku objekti.`);
            window.location.reload(); // Värskendus, et klikid hakkaksid uusi märkmeid kohe reaalajas tajuma
          }
        } else {
          alert("Valitud fail ei sisaldanud ühtegi kaardiobjekti!");
        }
      } catch(err) {
        console.error("Faili lugemise viga seadmes:", err);
        alert("Faili laadimine ebaõnnestus! Fail on vigane või vales formaadis.");
      }
    };
    reader.readAsText(file);
  };

  // Käivitame failivaliku süsteemselt
  fileInput.click();
});

    document.getElementById('ribbon-export')?.addEventListener('click', () => { if (window.persistence) window.persistence.exportGeoJSON(drawSource); });
    // js/kaart-app.js — Asenda ribbon-clear klikikuulaja funktsioonis wireToolbar():
document.getElementById('ribbon-clear')?.addEventListener('click', async () => {
  const selectedFeature = window.lastSelectedFeature;

  // === RADA A: KASUTAJAL ON VALITUD ÜKS KONKREETNE KUJUND ===
  if (selectedFeature) {
    const props = selectedFeature.getProperties ? selectedFeature.getProperties() : {};
    const source = props._source || 'local';
    const pealkiri = props.pealkiri || props.liik || 'Valitud kujund';

    // 1. JUHTUM: Tegemist on Supabase pilveobjektiga
    if (source === 'supabase') {
      const api = window.supabaseAPI || null;
      const session = api ? await api.getSession() : null;

      if (!session || !session.user) {
        alert("Sisselogimata uudistajal pole õigust andmebaasist teadusobjekte kustutada!");
        return;
      }

      // Kontrollime, kas klikkija on objekti looja või admin
      const onOmanik = (session.user.id === props.looja_id);
      let onAdmin = false;
      try {
        const prof = await api.loadUserProfile();
        if (prof && prof.roll === 'admin') onAdmin = true;
      } catch(e) {}

      if (!onOmanik && !onAdmin) {
        alert("Sinu konto pole selle objekti looja ega administraator. Kustutamine keelatud!");
        return;
      }

      // Sinu uute RLS reeglite järgi: kontrollime staatust (kui on lukus, siis omanik ei saa kustutada)
      const staatus = props.staatus || 'kinnitatud';
      if (!onAdmin && (staatus === 'lukustatud_omanik' || staatus === 'lukustatud_admin')) {
        alert("See objekt on lukustatud! Seda saab kustutada ainult administraator.");
        return;
      }

      // Küsime kinnitust
      if (!confirm(`Kas oled kindel, et soovid objekti "${pealkiri}" püsivalt riiklikust PILVEANDMEBAASIST kustutada?`)) return;

      try {
        const { error } = await api.deleteFeature(props.id);
        if (error) throw error;

        // Eemaldame kaardikihtidelt
        if (window.__supabaseSource) window.__supabaseSource.removeFeature(selectedFeature);
        drawSource.removeFeature(selectedFeature);
        
        window.lastSelectedFeature = null;
        setSidebarHtml('Kustutatud', '<p>Objekt eemaldatud andmebaasist ja kaardilt.</p>');
        if (window.persistence && typeof window.persistence.flash === 'function') {
          window.persistence.flash("Kustutatud pilvest!");
        }
      } catch(err) {
        console.error("Pilveobjekti kustutamise viga:", err);
        alert("Kustutamine ebaõnnestus andmebaasi tõrke tõttu: " + err.message);
      }

    } else {
      // 2. JUHTUM: Tegemist on puhta KOHALIKU joonisega (LocalStorage)
      if (!confirm(`Kas soovid kujundi "${pealkiri}" sellest seadmest kustutada?`)) return;

      try {
        // Eemaldame joonise kaardikihtidelt
        drawSource.removeFeature(selectedFeature);
        if (window.__supabaseSource) {
          try { window.__supabaseSource.removeFeature(selectedFeature); } catch(e){}
        }

        // Salvestame uue seisukorra taustal LocalStorage'isse
        if (window.persistence && typeof window.persistence.pushSnapshot === 'function') window.persistence.pushSnapshot(drawSource);
        if (window.persistence && typeof window.persistence.saveToLocal === 'function') window.persistence.saveToLocal(drawSource);

        window.lastSelectedFeature = null;
        setSidebarHtml('Kustutatud', '<p>Joonis eemaldatud seadme mälust.</p>');
      } catch(err) {
        console.error("Kohaliku objekti kustutamise viga:", err);
      }
    }

    return; // Katkestame, et kood ei liiguks edasi kogu kaardi tühjendamise juurde!
  }

  // === RADA B: ÜHTEGI OBJEKTI POLE VALITUD (FALLBACK VANALE LOOGIKALE) ===
  // Kui kasutaja klikib tühjale alale ja vajutab Kustuta, pakume ikka kogu kaardi tühjendamist
  const kinnitaTekst = prompt('Kui soovid KUSTUTADA KÕIK kohalikud joonised korraga, kirjuta siia täpselt suurpäraste tähtedega sõna KUSTUTA:');
  if (kinnitaTekst === 'KUSTUTA') {
    drawSource.clear(); 
    if (window.persistence && typeof window.persistence.saveToLocal === 'function') window.persistence.saveToLocal(drawSource); 
    window.lastSelectedFeature = null;
    setSidebarHtml('Tühjendatud', '<p>Kaardilt eemaldatud kõik kohalikud joonised.</p>');
  }
});

    document.getElementById('ribbon-back')?.addEventListener('click', () => { if (window.persistence) window.persistence.undo(drawSource); });
  }

  // js/kaart-app.js — Kirjuta kihtide lülitamine wireSidebarToggle() sisse:

// js/kaart-app.js — TÄIELIKULT PUHASTATUD KIHTIDE LÜLITAMINE

function wireSidebarToggle() {
  console.log("⏳ Peakood: Seon kihtide lülitamise nupud...");
  
  const objs = window.mapObjects;
  if (!objs || !objs.layers) {
    console.warn("Peakood: mapObjects või layers puudub, ei saa nuppe siduda.");
    return;
  }

  const layers = objs.layers;

  // 1. LÜLITI: Baaskaart (OSM)
  const cbOsm = document.getElementById('ls-osm');
  if (cbOsm) {
    cbOsm.onchange = function() {
      if (layers.osm) {
        layers.osm.setVisible(cbOsm.checked);
        console.log("✦ Peakood: Baaskaardi nähtavus =", cbOsm.checked);
      }
    };
  }

  // 2. LÜLITI: Hübriidkaart (Aerofoto Maa-ametist)
  const cbHybrid = document.getElementById('ls-cad');
  if (cbHybrid) {
    cbHybrid.onchange = function() {
      if (layers.cadastral) {
        // Kasutame ainult korrektset OpenLayersi funktsiooni setVisible
        layers.cadastral.setVisible(cbHybrid.checked);
        console.log("✦ Peakood: Hübriidkaardi nähtavus =", cbHybrid.checked);
      }
    };
  }

  // 3. LÜLITI: Joonistused (Nii kohalikud kui pilve omad korraga)
  const cbDraw = document.getElementById('ls-draw');
  if (cbDraw) {
    cbDraw.onchange = function() {
      // Kohalik joonistuskiht
      if (layers.drawLayer) {
        layers.drawLayer.setVisible(cbDraw.checked);
      }
      
      // Supabase pilveandmete kiht (otsime selle üles unikaalse zIndex-i järgi)
      if (objs.map) {
        objs.map.getLayers().forEach(layer => {
          if (layer && typeof layer.getZIndex === 'function' && layer.getZIndex() === 900) {
            layer.setVisible(cbDraw.checked);
          }
        });
      }
      console.log("✦ Peakood: Joonistuste kihtide nähtavus =", cbDraw.checked);
    };
  }
}



// js/kaart-app.js — PUHAS JA LUKUVABA LÕPUOSA
// js/kaart-app.js — UUENDATUD initKaartApp() algusosa
function initKaartApp(){
  console.log("⏳ Peakood: Alustan initKaartApp käivitamist...");
  const objs = window.mapObjects; 
  if (!objs) { 
    console.warn('kaart-app: mapObjects puudub, katkestan.'); 
    return; 
  }
  
  const map = objs.map; 
  const drawSource = objs.drawSource;
  
  // 1. LUKUST LAHTI: Käivitame ui.js modalAdapteri, mis seob püsivalt AINSA klikiahela!
  if (typeof window.modalAdapter === 'function') {
    window.modalAdapter();
    console.log("✦ Peakood: Kasutajaliidese klikid (aknad ja ribad) edukalt lukust lahti tehtud!");
  } else if (window.UIModule && typeof window.UIModule.modalAdapter === 'function') {
    window.UIModule.modalAdapter();
  }

  // 2. TÖÖRIISTAD: Seome joonistamise nupud (Draw, Modify jne)
  wireToolbar(drawSource); 
  // js/kaart-app.js — Uuenda ribbon-back nupu klikki funktsioonis wireToolbar():
document.getElementById('ribbon-back')?.addEventListener('click', () => {
  // 1. Kui hiire küljes on pooleliolev joonistus, lülitame selle välja
  if (window.drawModule && typeof window.drawModule.disableInteractions === 'function') {
    window.drawModule.disableInteractions();
    console.log("✦ Peakood: Joonistamine tühistatud ja interaktsioonid suletud.");
  }
  
  // 2. Eemaldame nuppudelt aktiivsed stiilid
  document.querySelectorAll('#tool-ribbon .rbtn').forEach(b => b.classList.remove('active'));
  
  // 3. Kui mällu oli jäänud salvestamata jooniseid, kutsume välja persistence undo
  if (window.persistence && typeof window.persistence.undo === 'function') {
    if (window.mapObjects) window.persistence.undo(window.mapObjects.drawSource);
  }
});


  // 3. EEMALDATUD: wireSidebarToggle(); — Kustutatud, et vältida klikkide konflikti ui.js-iga!

  // 4. KAARDI KLIKK: Kuvame valitud objekti andmed külgribal
 // js/kaart-app.js — Uuenda klikiloogikat funktsioonis initKaartApp():
// js/kaart-app.js — Uuenda klikiloogikat funktsioonis initKaartApp():

// js/kaart-app.js — TÄIELIKULT PARANDATUD KAARDI KLIKILOOGIKA

map.on('singleclick', (evt) => {
  // TURVAKONTROLL: Kui kasutaja parajasti joonistab või muudab kujundit,
  // siis ignoreerime seda klikki täielikult! See hoiab ära automaatsed toor-salvestused.
  const ints = window.__drawInteractions || {};
  if (ints.draw || ints.modify) {
    console.log("✦ Peakood: Kasutaja joonistab parajasti, tavalised kaardiklikid on peatatud.");
    return; 
  }

  // Tuvastame, kas hiire noole all on mõni valmis objekt
  const feature = map.forEachFeatureAtPixel(evt.pixel, (f) => f);
  
  // Jätame viimati klikitud kujundi kustutamise jaoks meelde
  window.lastSelectedFeature = feature || null;
  
  const slidingSidebar = document.getElementById('sliding-sidebar');
  const sidebarTab = document.getElementById('sidebar-tab');

  if (feature) {
    // === VAIKIMISI RADA: KASUTAJA KLIKKIS VALMIS OBJEKTILE ===
    showFeatureInfo(feature);

    // Avame külgriba automaatselt
    if (slidingSidebar && !slidingSidebar.classList.contains('open')) {
      slidingSidebar.classList.add('open');
      slidingSidebar.classList.remove('closed');
      if (sidebarTab) sidebarTab.textContent = '✕';
      if (typeof window.setInert === 'function') window.setInert(slidingSidebar, false);
    }
  } else {
    // === VAIKIMISI RADA: KASUTAJA KLIKKIS TÜHJALE ALALE ===
    showFeatureInfo(null);

    // Sulgeme külgriba automaatselt, kui see oli lahti
    if (slidingSidebar && slidingSidebar.classList.contains('open')) {
      slidingSidebar.classList.remove('open');
      slidingSidebar.classList.add('closed');
      if (sidebarTab) sidebarTab.textContent = '☰';
      if (typeof window.setInert === 'function') window.setInert(slidingSidebar, true);
    }
  }
});




  // 5. AUTOMAATNE LAADIMINE: Laeb seadme mälust vanad kohalikud joonised taustal sisse
  if (window.persistence && typeof window.persistence.loadFromLocal === 'function') {
    window.persistence.loadFromLocal(drawSource);
  }

  window.kaartApp = { showFeatureInfo };
  console.info('✦ Peakood: Kaardirakendus on täielikult valmis.');
}


// Globaalne viide dirigendile, et ta saaks seda täpselt õigel ajal käivitada
window.initKaartApp = initKaartApp;

// Sündmuse kuulaja fallbackiks, kui failid laevad teises rütmis
if (window.mapObjects) {
  initKaartApp();
} else {
  window.addEventListener('map-core:ready', function() {
    initKaartApp();
  });
}

})(window);
