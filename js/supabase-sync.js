(function(){
  // supabase-sync.js — laadib automaatselt Supabase'ist vaikimisi avalikud kirjed (nahtavus='avalik').
  // Kui kasutaja on sisse logitud, lisame tema omad (looja_id = session.user.id).
  // Kui kasutaja on admin (profiles.roll === 'admin'), laeme kõik kirjed.

  async function loadSupabaseFeatures(){
    if (!window.mapObjects) {
      window.addEventListener('map-core:ready', function handler(){ window.removeEventListener('map-core:ready', handler); loadSupabaseFeatures(); });
      return;
    }
    if (!window.supabase) { console.info('supabase-sync: supabase klient pole saadaval'); return; }

    try{
      const map = window.mapObjects.map;
      const format = new ol.format.GeoJSON();

      // supabase layer ja source (lisame eraldi layeri)
      const supaSource = new ol.source.Vector();
      const supaLayer = new ol.layer.Vector({
        source: supaSource,
        style: new ol.style.Style({
          fill: new ol.style.Fill({ color: 'rgba(2,136,209,0.12)' }),
          stroke: new ol.style.Stroke({ color: '#0288d1', width: 2 }),
          image: new ol.style.Circle({ radius: 6, fill: new ol.style.Fill({ color: '#0288d1' }) })
        }),
        zIndex: 900,
        visible: true
      });

      map.addLayer(supaLayer);

      // Funktsioon tehakse väikseks abiks: teisendab DB rea GeoJSON feature'iks
      function rowToFeature(row){
        // row.koordinaadid expected to be a GeoJSON geometry (jsonb)
        const geom = row.koordinaadid;
        if (!geom) return null;
        const featureGeo = { type: 'Feature', geometry: geom, properties: Object.assign({}, row) };
        // eemaldame suured või dubleerivad väljad properties'ist, kui vaja
        try{
          const feat = format.readFeature(featureGeo, { dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' });
          // merkime allika ja vajalikud meta v��rdused
          feat.setProperties(Object.assign({}, row, { _source: 'supabase' }));
          feat.setId(row.id);
          return feat;
        }catch(e){ console.warn('supabase-sync: readFeature error for row', row.id, e); return null; }
      }

      // 1) lae avalikud kirjed
      const publicRes = await window.supabase.from('vaatlus_objektid').select('*').eq('nahtavus','avalik');
      if (publicRes.error) { console.warn('supabase-sync: public query error', publicRes.error); }
      const rows = [];
      if (publicRes.data && Array.isArray(publicRes.data)) rows.push(...publicRes.data);

      // 2) kui on sessioon, laeme lisaks kasutaja enda kirjed või kõik kui admin
      const { data: sessionData } = await window.supabase.auth.getSession();
      const session = sessionData?.session || null;
      if (session && session.user){
        // proovime laadida profiili (profiles tabel)
        let profile = null;
        try{ if (typeof window.loadUserRow === 'function') profile = await window.loadUserRow(); } catch(e){ console.warn('supabase-sync: failed to load profile', e); }

        if (profile && profile.roll === 'admin'){
          // admin: laeme kõik kirjed
          const allRes = await window.supabase.from('vaatlus_objektid').select('*');
          if (!allRes.error && Array.isArray(allRes.data)) rows.length = 0, rows.push(...allRes.data);
        } else {
          // lae kasutaja enda kirjed (kui neid on) ja ühenda avalikega
          const ownRes = await window.supabase.from('vaatlus_objektid').select('*').eq('looja_id', session.user.id);
          if (!ownRes.error && Array.isArray(ownRes.data)) {
            // lisa vaid need, mida avalikud päringud ei sisaldanud
            const known = new Set(rows.map(r => String(r.id)));
            ownRes.data.forEach(r => { if (!known.has(String(r.id))) rows.push(r); });
          }
        }
      }

      // 3) teisenda read feature'ideks ja lisa source layerisse
      let added = 0;
      for (const row of rows){
        const feat = rowToFeature(row);
        if (feat) { supaSource.addFeature(feat); added++; }
      }

      console.info('supabase-sync: laetud', added, 'objekti (avalikke + omasid vastavalt)');
    }catch(e){ console.error('supabase-sync: catastrophic error', e); }
  }

  // alustame laadimist kohe kui map on valmis
  if (window.mapObjects) loadSupabaseFeatures(); else window.addEventListener('map-core:ready', loadSupabaseFeatures);
})();
