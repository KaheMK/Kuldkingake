// Konfiguratsioonifail. Asenda KATASTER_WMS.url ametliku WMS/WMTS URL-iga.
// Kui kasutad Maaameti WMTS, lisa vastav WMTS URL ja parameetrid.

export const MAAMET_HYBRID = {
  // Näidis: Esri WorldImagery + label overlay creates hybrid look.
  // Kui sul on Maaameti hübriid WMTS, asenda siia selle URL.
  satelliteUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  labelUrl: 'https://stamen-tiles.a.ssl.fastly.net/toner-labels/{z}/{x}/{y}.png'
};

export const KATASTER_WMS = {
  // Asenda see reaalse Maaameti WMS URL-iga, nt 'https://kaart.maaamet.ee/wms/alus'
  url: 'https://kaart.maaamet.ee/wms/alus',
  layer: 'KATASTRIYKSUS'
};













