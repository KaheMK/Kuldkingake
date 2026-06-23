// js/draw.js — drawing helpers skeleton (fixed: handle 'Modify' mode correctly)
// selgitus: kuulab map-core:ready ja lisab joonistamise/modify/snap funktsionaalsuse
(function(window){
  function ensureReady(cb){
    if (window.mapObjects) return cb();
    window.addEventListener('map-core:ready', function handler(){ window.removeEventListener('map-core:ready', handler); cb(); });
  }

  // hoiab viiteid aktiivsetele interaktsioonidele
  function disableInteractions(){
    const ints = window.__drawInteractions || {};
    const map = window.mapObjects && window.mapObjects.map;
    if (!map) return;
    if (ints.draw) try{ map.removeInteraction(ints.draw); }catch(e){}
    if (ints.modify) try{ map.removeInteraction(ints.modify); }catch(e){}
    if (ints.snap) try{ map.removeInteraction(ints.snap); }catch(e){}
    window.__drawInteractions = null;
  }

  function enableDraw(type){
    ensureReady(function(){
      const objs = window.mapObjects;
      if (!objs) { console.warn('draw: mapObjects not ready'); return; }
      const map = objs.map;
      disableInteractions();

      // selgitus: kui tahetakse ainult MODIFY funktsionaalsust, ei loome Draw interaction'it
      if (String(type).toLowerCase() === 'modify') {
        const modifyInteraction = new ol.interaction.Modify({ source: objs.drawSource });
        map.addInteraction(modifyInteraction);
        const snapInteraction = new ol.interaction.Snap({ source: objs.drawSource });
        map.addInteraction(snapInteraction);
        window.__drawInteractions = { draw: null, modify: modifyInteraction, snap: snapInteraction };
        return;
      }

      // muidu loome Draw (nt Polygon) + Modify + Snap
      const drawInteraction = new ol.interaction.Draw({ source: objs.drawSource, type: type || 'Polygon' });
      map.addInteraction(drawInteraction);
      const modifyInteraction = new ol.interaction.Modify({ source: objs.drawSource });
      map.addInteraction(modifyInteraction);
      const snap = new ol.interaction.Snap({ source: objs.drawSource });
      map.addInteraction(snap);
      window.__drawInteractions = { draw: drawInteraction, modify: modifyInteraction, snap };

      drawInteraction.on('drawend', function(evt){
        const f = evt.feature; f.setId('f-'+Date.now()); f.set('createdAt', new Date().toISOString());
        console.info('draw: feature drawn', f);
        window.currentDrawingFeatures = window.currentDrawingFeatures || [];
        try{
          const geom = f.getGeometry().clone().transform('EPSG:3857','EPSG:4326');
          window.currentDrawingFeatures.push({ tuup: geom.getType(), koordinaadid: geom.getCoordinates(), featureId: f.ol_uid });
        }catch(e){ console.warn('draw: could not transform geometry', e); }
      });
    });
  }

  // exps
  window.drawModule = { enableDraw, disableInteractions };

  window.addEventListener('map-core:ready', function(){ console.info('draw: detected map-core ready'); });

})(window);
