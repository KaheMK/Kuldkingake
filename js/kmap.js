// Laadime OpenLayersi komponendid turvalise ESM jaoturi kaudu
// Kasutame otse kaart.html päises laetud OpenLayersit
export function createMap(targetId = 'map') {
  return new ol.Map({
    target: targetId,
    view: new ol.View({
      center: ol.proj.fromLonLat([24.0, 58.9]), // Palivere piirkond
      zoom: 12
    }),
    controls: []
  });
}



