// js/draw.js — PUHASTATUD JOONISTAMISE MOOTOR ILMA AUTOMAATSE SALVESTAMISETA

(function(window){
  function ensureReady(cb){
    if (window.mapObjects) return cb();
    window.addEventListener('map-core:ready', function handler(){ window.removeEventListener('map-core:ready', handler); cb(); });
  }

  // Lülitab joonistamise pliiatsi hiire küljest lahti
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

      // Kui tahetakse ainult MUUTA (Modify) režiimi
      if (String(type).toLowerCase() === 'modify') {
        const modifyInteraction = new ol.interaction.Modify({ source: objs.drawSource });
        map.addInteraction(modifyInteraction);
        const snapInteraction = new ol.interaction.Snap({ source: objs.drawSource });
        map.addInteraction(snapInteraction);
        window.__drawInteractions = { draw: null, modify: modifyInteraction, snap: snapInteraction };
        return;
      }

      // Loome uue joonistamise (nt Polygon)
      const loppTuup = window.__currentDrawType || type || 'Polygon';
const drawInteraction = new ol.interaction.Draw({ source: objs.drawSource, type: loppTuup });
      map.addInteraction(drawInteraction);
      
      const modifyInteraction = new ol.interaction.Modify({ source: objs.drawSource });
      map.addInteraction(modifyInteraction);
      
      const snap = new ol.interaction.Snap({ source: objs.drawSource });
      map.addInteraction(snap);
      
      window.__drawInteractions = { draw: drawInteraction, modify: modifyInteraction, snap };

      // LUBAME JOONISTAMISE LÕPETADA KA ENTER KLAHVIGA
      const enterHandler = function(e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          try { if (drawInteraction) drawInteraction.finishDrawing(); } catch(err) {}
        }
      };
      window.addEventListener('keydown', enterHandler);

      // KUI JOONISTAMINE LÕPPEB (TOPELTKLÕPS VÕI ENTER)
      drawInteraction.on('drawend', function(evt){
        console.info('draw: Joonistamine lõpetatud, kujund on kaardil ootel.');
        
        // PARANDUS: Me ei tee siin absoluutselt mitte ühtegi automaatset salvestust LocalStorage'isse!
        // Me lülitame lihtsalt pliiatsi välja ja ootame, kuni kasutaja vajutab ülevalt nuppu "Salvesta".
        setTimeout(function() {
          disableInteractions(); // Võtab pliiatsi hiire küljest ära
          window.removeEventListener('keydown', enterHandler);
          
          // Eemaldame tööriistaribalt aktiivse nupu värvi
          document.querySelectorAll('#tool-ribbon .rbtn').forEach(b => b.classList.remove('active'));
          
          // Kuvame ekraani nurgas vaikse teavituse (flash)
          if (window.persistence && typeof window.persistence.flash === 'function') {
            window.persistence.flash("Joonis valmis! Vajuta ülevalt 'Salvesta'.");
          }
        }, 50);
      });
    });
  }

  // Avaldame mooduli globaalselt
  window.drawModule = { enableDraw, disableInteractions };

})(window);


