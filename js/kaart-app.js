// selgitus: kaart-app.js — komponeerib map-core, draw, ui ja persistence moodulid kaart.html jaoks
(function(window){
  // selgitus: käivitatakse peale map-core:ready signaali
  function initKaartApp(){
    const objs = window.mapObjects;
    if (!objs) { console.warn('kaart-app: mapObjects puudub'); return; }

    // selgitus: mugav viide drawSource ja map
    const map = objs.map;
    const drawSource = objs.drawSource;

    // selgitus: kinnita ui modal adapters
    if (window.UIModule && typeof window.UIModule.modalAdapter === 'function') window.UIModule.modalAdapter();

    // selgitus: kui drawModule on olemas, võime siduda riboni nuppe
    if (window.drawModule){
      document.getElementById('ribbon-draw')?.addEventListener('click', () => { window.drawModule.enableDraw('Polygon'); document.querySelectorAll('#tool-ribbon .rbtn').forEach(b => b.classList.remove('active')); document.getElementById('ribbon-draw')?.classList.add('active'); });
      document.getElementById('ribbon-modify')?.addEventListener('click', () => { window.drawModule.enableDraw('Modify'); document.querySelectorAll('#tool-ribbon .rbtn').forEach(b => b.classList.remove('active')); document.getElementById('ribbon-modify')?.classList.add('active'); });
    }

    // selgitus: persistence ühendus
    if (window.persistence){
      document.getElementById('ribbon-save')?.addEventListener('click', () => { window.persistence.pushSnapshot(drawSource); window.persistence.saveToLocal(drawSource); });
      document.getElementById('ribbon-load')?.addEventListener('click', () => { window.persistence.loadFromLocal(drawSource); });
      document.getElementById('ribbon-export')?.addEventListener('click', () => { window.persistence.exportGeoJSON(drawSource); });
      document.getElementById('ribbon-clear')?.addEventListener('click', () => { if (confirm('Kirjuta täpselt sõna KUSTUTA, et kinnitada kõigi jooniste kustutamine:') === 'KUSTUTA') { drawSource.clear(); window.persistence.saveToLocal(drawSource); } });
      document.getElementById('ribbon-back')?.addEventListener('click', () => { window.persistence.undo(drawSource); });
    }

    // selgitus: klahvikomplektid (lühike)
    window.addEventListener('keydown', (ev) => {
      if (ev.key === 'd') { if (window.drawModule) window.drawModule.enableDraw('Polygon'); }
      if (ev.key === 'm') { if (window.drawModule) window.drawModule.enableDraw('Modify'); }
      if (ev.key === 'Escape') { if (window.drawModule) window.drawModule.disableInteractions(); document.querySelectorAll('#tool-ribbon .rbtn').forEach(b => b.classList.remove('active')); }
    });

    // selgitus: map click to show feature info (simple)
    function escapeHtml(s=''){ return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;'); }
    function setSidebarHtml(title, html){ const sidebarEl = document.getElementById('sliding-sidebar-content'); if (!sidebarEl) return; const preserved = document.getElementById('layer-switcher'); sidebarEl.innerHTML=''; if (preserved) sidebarEl.appendChild(preserved); if (title) { const h=document.createElement('h2'); h.textContent=title; sidebarEl.appendChild(h); } const wrapper=document.createElement('div'); wrapper.innerHTML=html||''; sidebarEl.appendChild(wrapper); }
    map.on('singleclick', (evt) => {
      const feature = map.forEachFeatureAtPixel(evt.pixel, (f) => f);
      if (feature) {
        const title = feature.get('title') || 'Valitud objekt';
        const note = feature.get('note') || '';
        const props = feature.getProperties();
        let html = `<p>${escapeHtml(note)}</p><dl>`;
        for (const k in props){ if (k === 'geometry') continue; html += `<dt>${escapeHtml(k)}</dt><dd>${escapeHtml(String(props[k]))}</dd>`; }
        html += '</dl>';
        setSidebarHtml(title, html);
      } else {
        setSidebarHtml('Tere tulemast', '<p>Vali objekt kaardilt või kasuta nuppe joonistamiseks ja salvestamiseks.</p>');
      }
    });

    // selgitus: eemaldame lehe loaderi kui kaart valmis
    map.once('rendercomplete', () => { document.getElementById('page-loader')?.remove(); });

    console.info('kaart-app: valmis');
  }

  // registreeri käivitaja, kui map-core on valmis
  window.addEventListener('map-core:ready', function(){ try{ initKaartApp(); } catch(e){ console.error('kaart-app init error', e); } });

  // expose for debugging
  window.kaartApp = { init: initKaartApp };

})(window);
