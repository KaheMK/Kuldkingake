(function(global){
  // ol-loader.js — lightweight OpenLayers loader
  // exposes `loadOl(cb)` on the window/global object
  function loadOl(cb){
    if (global.ol) { setTimeout(cb,0); return; }
    var s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/ol@v7.4.0/dist/ol.js';
    s.crossOrigin = 'anonymous';
    s.onload = function(){ cb && cb(); };
    s.onerror = function(){
      var s2 = document.createElement('script');
      s2.src = 'https://unpkg.com/ol@v7.4.0/dist/ol.js';
      s2.crossOrigin = 'anonymous';
      s2.onload = function(){ cb && cb(); };
      s2.onerror = function(){ console.error('OpenLayers CDN failed to load.'); cb && cb(); };
      document.head.appendChild(s2);
    };
    document.head.appendChild(s);
  }
  global.loadOl = loadOl;
})(window);
