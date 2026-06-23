// js/kaart-app.js — lihtsustatud app koostaja: sidebari render, tööriistade sidumine ja feature info
(function(window){
  function ensureMapReady(cb){ if (window.mapObjects) return cb(); window.addEventListener('map-core:ready', function handler(){ window.removeEventListener('map-core:ready', handler); cb(); }); }

  function formatDateIsoToDDMMYYYY(iso){ if(!iso) return ''; try{ const d = new Date(iso); return d.toLocaleDateString('et-EE'); }catch(e){ return String(iso); } }

  function escapeHtml(s=''){ return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;'); }

  function setSidebarHtml(title, html){ const sidebarEl = document.getElementById('sliding-sidebar-content'); if (!sidebarEl) return; const preserved = document.getElementById('layer-switcher'); sidebarEl.innerHTML = ''; if (preserved) sidebarEl.appendChild(preserved); if (title) { const h=document.createElement('h2'); h.textContent=title; sidebarEl.appendChild(h); } const wrapper=document.createElement('div'); wrapper.innerHTML=html||''; sidebarEl.appendChild(wrapper); }

  async function showFeatureInfo(feature){
    if (!feature) return setSidebarHtml('Tere tulemast', '<p>Vali objekt kaardilt või kasuta nuppe joonistamiseks ja salvestamiseks.</p>');
    const props = feature.getProperties ? feature.getProperties() : {};
    // determine source
    const source = props._source || props.source || 'local';
    if (source === 'supabase' || props.looja_id || props.koht){
      // specialist / supabase fields
      const title = props.pealkiri || props.kasutajanimi || 'Vaatlusobjekt';
      const noted = props.noted || props.note || '';
      const liik = props.liik || '';
      const kogus = props.kogus || '';
      const kvaliteet = props.kvaliteet || '';
      const ohustatus = props.ohustatus || '';
      const nahtavus = props.nahtavus || '';
      const author = props.kasutajanimi || '';
      const created = formatDateIsoToDDMMYYYY(props.created_at || props.createdAt || props.created);
      let html = `<p>${escapeHtml(noted)}</p><dl>`;
      html += `<dt>Liik</dt><dd>${escapeHtml(liik)}</dd>`;
      html += `<dt>Levik / kogus</dt><dd>${escapeHtml(kogus)}</dd>`;
      html += `<dt>Kvaliteet</dt><dd>${escapeHtml(kvaliteet)}</dd>`;
      html += `<dt>Ohustatus</dt><dd>${escapeHtml(ohustatus)}</dd>`;
      html += `<dt>Nähtavus</dt><dd>${escapeHtml(nahtavus)}</dd>`;
      html += `<dt>Looja</dt><dd>${escapeHtml(author)}</dd>`;
      html += `<dt>Lisatud</dt><dd>${escapeHtml(created)}</dd>`;
      html += `</dl>`;
      setSidebarHtml(title, html);
    } else {
      // local feature
      const title = props.title || props.pealkiri || 'Valitud objekt';
      const note = props.note || props.noted || '';
      const created = formatDateIsoToDDMMYYYY(props.created_at || props.createdAt || props.ts || props.timestamp);
      let html = `<p>${escapeHtml(note)}</p><dl>`;
      html += `<dt>Lisa</dt><dd>${escapeHtml(created)}</dd>`;
      html += `</dl>`;
      setSidebarHtml(title, html);
    }
  }

  function wireToolbar(drawSource){
    // draw/modify
    document.getElementById('ribbon-draw')?.addEventListener('click', () => { if (window.drawModule) window.drawModule.enableDraw('Polygon'); document.querySelectorAll('#tool-ribbon .rbtn').forEach(b=>b.classList.remove('active')); document.getElementById('ribbon-draw')?.classList.add('active'); });
    document.getElementById('ribbon-modify')?.addEventListener('click', () => { if (window.drawModule) window.drawModule.enableDraw('Modify'); document.querySelectorAll('#tool-ribbon .rbtn').forEach(b=>b.classList.remove('active')); document.getElementById('ribbon-modify')?.classList.add('active'); });

    // save (basic local for now)
    document.getElementById('ribbon-save')?.addEventListener('click', () => {
      // if user logged in, open specialist modal (handled elsewhere); otherwise prompt for name/desc
      (async function(){
        const { data: { session } } = await (window.supabase ? window.supabase.auth.getSession() : Promise.resolve({data:{session:null}}));
        if (!session || !session.user){
          // simple local save flow
          const pealkiri = prompt('Sisesta objekti pealkiri (nimi):') || 'Ilma pealkirjata';
          const note = prompt('Lisamärkused (vabatahtlik):') || '';
          // attach props to last drawn feature(s) if present
          try{
            if (window.currentDrawingFeatures && window.currentDrawingFeatures.length>0){
              const f = window.currentDrawingFeatures.pop();
              f.set('pealkiri', pealkiri); f.set('noted', note); f.set('created_at', new Date().toISOString()); f.set('_source','local');
              drawSource.addFeature(f);
            } else {
              // fallback: persist entire drawSource to localStorage
            }
            if (typeof window.persistence !== 'undefined' && typeof window.persistence.saveToLocal === 'function') window.persistence.saveToLocal(drawSource);
            if (typeof window.persistence !== 'undefined' && typeof window.persistence.pushSnapshot === 'function') window.persistence.pushSnapshot(drawSource);
            alert('Salvestatud lokaalselt');
          }catch(e){ console.error('save local error', e); alert('Salvestus ebaõnnestus'); }
        } else {
          // user logged in — specialist flow handled by modal elsewhere; trigger global event
          window.dispatchEvent(new CustomEvent('kaart:request-specialist-save'));
        }
      })();
    });

    document.getElementById('ribbon-load')?.addEventListener('click', () => { if (window.persistence) window.persistence.loadFromLocal(drawSource); });
    document.getElementById('ribbon-export')?.addEventListener('click', () => { if (window.persistence) window.persistence.exportGeoJSON(drawSource); });
    document.getElementById('ribbon-clear')?.addEventListener('click', () => {
      if (!confirm('Kirjuta täpselt sõna KUSTUTA, et kinnitada kõigi jooniste kustutamine:')) return;
      drawSource.clear(); if (window.persistence) window.persistence.saveToLocal(drawSource); setSidebarHtml('Tühjendatud', '<p>Kaardilt eemaldatud kõik joonised.</p>');
    });
    document.getElementById('ribbon-back')?.addEventListener('click', () => { if (window.persistence) window.persistence.undo(drawSource); });
  }

  function wireSidebarToggle(){
    const sidebarTab = document.getElementById('sidebar-tab');
    const slidingSidebar = document.getElementById('sliding-sidebar');
    const sidebarPin = document.getElementById('sidebar-pin');
    if (!sidebarTab || !slidingSidebar) return;
    sidebarTab.addEventListener('click', () => { slidingSidebar.classList.toggle('open'); slidingSidebar.classList.toggle('closed'); sidebarTab.textContent = slidingSidebar.classList.contains('open') ? '✕' : '☰'; });
    if (sidebarPin) sidebarPin.addEventListener('click', () => { const p = sidebarPin.getAttribute('aria-pressed') === 'true'; sidebarPin.setAttribute('aria-pressed', String(!p)); });

    // tabs inside sidebar
    document.querySelectorAll('#sliding-sidebar .tab').forEach(btn => btn.addEventListener('click', (ev)=>{
      const tab = ev.currentTarget.dataset.tab; document.querySelectorAll('#sliding-sidebar .tab').forEach(b=>b.classList.remove('active'));
      ev.currentTarget.classList.add('active'); document.querySelectorAll('#sliding-sidebar .tab-panel').forEach(p=>p.classList.remove('active'));
      const panel = document.getElementById('panel-'+tab); if (panel) panel.classList.add('active');
    }));
  }

  function initKaartApp(){
    const objs = window.mapObjects; if (!objs) { console.warn('kaart-app: mapObjects puudub'); return; }
    const map = objs.map; const drawSource = objs.drawSource;
    if (window.UIModule && typeof window.UIModule.modalAdapter === 'function') window.UIModule.modalAdapter();

    // wire toolbar and sidebar
    wireToolbar(drawSource); wireSidebarToggle();

    // map click to show feature info
    map.on('singleclick', (evt) => {
      const feature = map.forEachFeatureAtPixel(evt.pixel, (f) => f);
      showFeatureInfo(feature);
    });

    // expose for debug
    window.kaartApp = { showFeatureInfo };
    console.info('kaart-app: valmis');
  }

  ensureMapReady(function(){ try{ initKaartApp(); }catch(e){ console.error('kaart-app init error', e); } });

})(window);
