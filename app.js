require([
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/FeatureLayer",
    "esri/widgets/Legend",
    "esri/widgets/Search"
  ], function (Map, MapView, FeatureLayer, Legend, Search) {
  
    // Configuração do MutationObserver
    const targetNode = document.getElementById('element-id');
    
    // Configuração do MutationObserver
    const config = { childList: true, subtree: true };
  
    // Função de callback para o MutationObserver
    const callback = function(mutationsList, observer) {
      for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
          console.log('A alteração foi detectada!');
        }
      }
    };
  
    // Criação do MutationObserver
    const observer = new MutationObserver(callback);
    
    // Inicia a observação
    observer.observe(targetNode, config);
  
    // Para parar a observação
    // observer.disconnect();
  
    // Mapa base
    const map = new Map({
      basemap: "streets-vector"
    });
  
    // Configuração da View
    const view = new MapView({
      container: "viewDiv",
      map: map,
      center: [-100, 40], // Coordenadas aproximadas para a visualização inicial
      zoom: 4
    });
  
    // Configuração da camada de Condados
    const countiesLayer = new FeatureLayer({
      url: "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Census_Counties/FeatureServer/0",
      outFields: ["OBJECTID"]
    });
  
    // Configuração da camada de Câmeras
    const camerasLayer = new FeatureLayer({
      url: "https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services/Traffic_Cameras/FeatureServer/0",
      outFields: ["FID", "OBJECTID", "location", "county", "feedID", "url", "iframe", "lat", "long"],
      visible: true,
      popupTemplate: {
        title: "Câmera de Tráfego",
        content: `
          <b>Localização:</b> {location}<br>
          <b>Condado:</b> {county}<br>
          <b>Latitude:</b> {lat}<br>
          <b>Longitude:</b> {long}<br>
          <b>URL:</b> <a href="{url}" target="_blank">Visualizar câmera</a>
        `
      }
    });
  
    // Renderer para camada de Condados baseada em contagem de câmeras
    const countiesRenderer = {
      type: "simple",
      symbol: {
        type: "simple-fill",
        color: [0, 0, 139, 0.6], // Azul escuro
        outline: {
          width: 0.5,
          color: [255, 255, 255, 0.3]
        }
      },
      visualVariables: [{
        type: "color",
        field: "OBJECTID", // Utilizado como referência para cada condado
        stops: [
          { value: 1, color: "#0000FF", label: "Menor Contagem" },
          { value: 100, color: "#ADD8E6", label: "Maior Contagem" } // Azul claro
        ]
      }]
    };
  
    countiesLayer.renderer = countiesRenderer;
    map.add(countiesLayer);
    map.add(camerasLayer);
  
    // Adicionando a barra de busca para filtrar câmeras por condado
    const search = new Search({
      view: view,
      allPlaceholder: "Pesquisar condado",
      includeDefaultSources: false,
      sources: [
        {
          layer: camerasLayer,
          searchFields: ["county"],
          displayField: "county",
          exactMatch: false,
          outFields: ["FID", "OBJECTID", "location", "county", "lat", "long"],
          name: "Câmeras por Condado",
          placeholder: "Digite o nome do condado",
          popupEnabled: true
        }
      ]
    });
  
    // Evento para aplicar filtro na camada de câmeras ao buscar um condado
    search.on("search-complete", function(event) {
      const countyName = event.results[0].results[0].feature.attributes.county;
      camerasLayer.definitionExpression = `county = '${countyName}'`;
    });
  
    // Adicionando a busca e a legenda na UI
    view.ui.add(search, "top-right");
  
    const legend = new Legend({
      view: view,
      layerInfos: [{
        layer: countiesLayer,
        title: "Contagem de Câmeras por Condado"
      }]
    });
  
    view.ui.add(legend, "bottom-right");
  });
  