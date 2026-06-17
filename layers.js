// js/layers.js
import TileLayer from 'https://cdn.jsdelivr.net/npm/ol@v7.4.0/layer/Tile.js';
import OSM from 'https://cdn.jsdelivr.net/npm/ol@v7.4.0/source/OSM.js';
import TileWMS from 'https://cdn.jsdelivr.net/npm/ol@v7.4.0/source/TileWMS.js';
import ImageLayer from 'https://cdn.jsdelivr.net/npm/ol@v7.4.0/layer/Image.js';
import ImageWMS from 'https://cdn.jsdelivr.net/npm/ol@v7.4.0/source/ImageWMS.js';

// Baaskaart: OSM (võid asendada satelliidiga)
export const satelliteLayer = new TileLayer({
  source: new OSM(),
  visible: true,
  zIndex: 0
});

// Katastriosa (WMS) — LAYERS väärtus muuda vastavalt vajadusele (BK_KARJAAR näide)
export const cadastralLayer = new ImageLayer({
  source: new ImageWMS({
    url: 'https://kaart.maaamet.ee/wms/alus',
    params: {
      LAYERS: 'BK_METS',
      FORMAT: 'image/png',
      TRANSPARENT: true,
      VERSION: '1.3.0',
      CRS: 'EPSG:3857' // prooviks EPSG:3857; kui server nõuab 3301, muuda vastavalt
    },
    crossOrigin: 'anonymous'
  }),
  visible: false,
  zIndex: 500
});













