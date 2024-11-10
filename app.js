// Importa os módulos necessários da ArcGIS API for JavaScript
require([
  "esri/Map",
  "esri/views/MapView",
  "esri/layers/FeatureLayer",
  "esri/widgets/Legend"
], function(Map, MapView, FeatureLayer, Legend) {

  // Cria o mapa básico com uma camada base
  const map = new Map({
    basemap: "streets-navigation-vector"
  });

  // Configura a visualização do mapa no contêiner HTML
  const view = new MapView({
    container: "viewDiv", // ID do elemento HTML onde o mapa será exibido
    map: map,
    center: [-98, 39], // Centraliza nos Estados Unidos
    zoom: 4
  });

  // Define a camada de condados (polígonos) com base no endpoint fornecido
  const countiesLayer = new FeatureLayer({
    url: "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Census_Counties/FeatureServer/0",
    outFields: ["*"], // Carrega todos os campos para consultas futuras
    opacity: 0.7 // Define a transparência dos polígonos
  });

  // Define a camada de câmeras de tráfego (pontos) com base no endpoint fornecido
  const camerasLayer = new FeatureLayer({
    url: "https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services/Traffic_Cameras/FeatureServer/0"
  });

  // Consulta a contagem de câmeras por condado
  camerasLayer.queryFeatures({
    where: "1=1", // Consulta todos os registros
    outStatistics: [{
      onStatisticField: "OBJECTID",
      outStatisticFieldName: "cameraCount",
      statisticType: "count"
    }],
    groupByFieldsForStatistics: ["County_ID"] // Campo identificador dos condados
  }).then(function(results) {

    // Cria um objeto para armazenar a contagem de câmeras por condado
    const countyCameraCounts = {};
    results.features.forEach(function(feature) {
      const countyID = feature.attributes.County_ID;
      const count = feature.attributes.cameraCount;
      countyCameraCounts[countyID] = count;
    });

    // Configura a renderização coroplética com base na contagem de câmeras
    const renderer = {
      type: "class-breaks",
      field: "cameraCount", // Campo com a contagem de câmeras
      classBreakInfos: [
        { minValue: 0, maxValue: 5, symbol: { color: "#edf8fb", type: "simple-fill" } },
        { minValue: 6, maxValue: 15, symbol: { color: "#b2e2e2", type: "simple-fill" } },
        { minValue: 16, maxValue: 30, symbol: { color: "#66c2a4", type: "simple-fill" } },
        { minValue: 31, maxValue: 50, symbol: { color: "#2ca25f", type: "simple-fill" } },
        { minValue: 51, maxValue: 100, symbol: { color: "#006d2c", type: "simple-fill" } }
      ]
    };

    // Aplica a renderização à camada de condados e adiciona ao mapa
    countiesLayer.renderer = renderer;
    map.add(countiesLayer);

    // Adiciona uma legenda para a escala de cores
    const legend = new Legend({
      view: view,
      layerInfos: [{
        layer: countiesLayer,
        title: "Contagem de Câmeras de Tráfego por Condado"
      }]
    });

    view.ui.add(legend, "bottom-right");
  });

  // Adiciona a camada de câmeras de tráfego ao mapa
  map.add(camerasLayer);

});
