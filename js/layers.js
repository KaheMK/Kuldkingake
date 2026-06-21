import TileLayer from 'https://esm.sh';
import OSM from 'https://esm.sh';
import ImageLayer from 'https://esm.sh';
import ImageWMS from 'https://esm.sh';
export const satelliteLayer = new ol.layer.Tile({
  source: new ol.source.OSM(),
  visible: true,
  zIndex: 0
});

export const cadastralLayer = new ol.layer.Image({
  source: new ol.source.ImageWMS({
    url: 'https://kaart.maaamet.ee/wms/alus',
    params: {
      LAYERS: 'BK_METS',
      FORMAT: 'image/png',
      TRANSPARENT: true,
      VERSION: '1.3.0',
      CRS: 'EPSG:3857'
    },
    crossOrigin: 'anonymous'
  }),
  visible: false,
  zIndex: 500
});













