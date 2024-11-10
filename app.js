<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mapa Coroplético - ArcGIS</title>
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' https://js.arcgis.com; style-src 'self' https://js.arcgis.com; font-src 'self' https://fonts.gstatic.com;">
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' https://js.arcgis.com; style-src 'self' 'unsafe-inline' https://js.arcgis.com;">
    <link rel="stylesheet" href="https://js.arcgis.com/4.30/esri/themes/light/main.css">
    <script src="https://js.arcgis.com/4.30/"></script>
    <style>
        html, body, #viewDiv {
            padding: 0;
            margin: 0;
            height: 100%;
            width: 100%;
        }
    </style>
</head>
<body>
    <div id="viewDiv"></div>

    <script>
        require([
            "esri/Map",
            "esri/views/MapView",
            "esri/layers/FeatureLayer",
            "esri/renderers/ClassBreaksRenderer",
            "esri/symbols/SimpleFillSymbol",
            "esri/Color",
            "esri/widgets/Legend",
            "esri/Graphic",
            "esri/config"
        ], function (Map, MapView, FeatureLayer, ClassBreaksRenderer, SimpleFillSymbol, Color, Legend, Graphic, esriConfig) {

            // Defina sua API Key
            esriConfig.apiKey = "AAPTxy8BH1VEsoebNVZXo8HurECz7IoXQVtCYYhL3Zr8-7bQZcFyEoP_-k8I55mh8B2nJOAg-rmY4IGvlpDAlLr3_uBpxitors-RJMqOXEq2OgjFVN7KE5dUxru6PwDqxYwFgdZdmMgyarx7Po5FV9tjG2DUgdwJ1QMlGGDKk_0y4bRHKACBRAZdLjCCJDRhPDAx-GV8ryx-dGGse9Ia4ZAEFSGcRLiuPThSQNYgtGqwrcA.AT1_7w38zkm5";  // Substitua pela sua chave da API

            // Definir a camada de câmeras de tráfego
            const trafficCamerasLayer = new FeatureLayer({
                url: "https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services/Traffic_Cameras/FeatureServer/0"
            });

            // Definir a camada de condados
            const countiesLayer = new FeatureLayer({
                url: "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Census_Counties/FeatureServer/0"
            });

            // Criar o mapa com a camada base
            const map = new Map({
                basemap: "arcgis/topographic",
                layers: [countiesLayer, trafficCamerasLayer]
            });

            // Criar a visualização do mapa
            const view = new MapView({
                container: "viewDiv",
                map: map,
                center: [-98.58, 39.82],  // Centro nos EUA
                zoom: 5
            });

            // Definir o renderer para o mapa coroplético baseado na contagem de câmeras por condado
            const renderer = new ClassBreaksRenderer({
                field: "camera_count",  // Atributo que será usado para a contagem
                defaultSymbol: new SimpleFillSymbol({
                    color: new Color([255, 255, 255, 0.5]),
                    outline: { color: [0, 0, 0], width: 1 }
                }),
                classBreakInfos: [
                    {
                        minValue: 0,
                        maxValue: 100,
                        symbol: new SimpleFillSymbol({
                            color: new Color([255, 255, 204, 0.7]),
                            outline: { color: [0, 0, 0], width: 1 }
                        }),
                        label: "0 - 100 Cameras"
                    },
                    {
                        minValue: 101,
                        maxValue: 500,
                        symbol: new SimpleFillSymbol({
                            color: new Color([255, 204, 0, 0.7]),
                            outline: { color: [0, 0, 0], width: 1 }
                        }),
                        label: "101 - 500 Cameras"
                    },
                    {
                        minValue: 501,
                        maxValue: 1000,
                        symbol: new SimpleFillSymbol({
                            color: new Color([255, 102, 0, 0.7]),
                            outline: { color: [0, 0, 0], width: 1 }
                        }),
                        label: "501 - 1000 Cameras"
                    },
                    {
                        minValue: 1001,
                        symbol: new SimpleFillSymbol({
                            color: new Color([255, 0, 0, 0.7]),
                            outline: { color: [0, 0, 0], width: 1 }
                        }),
                        label: "1001+ Cameras"
                    }
                ]
            });

            // Aplicar o renderer ao condado
            countiesLayer.renderer = renderer;

            // Adicionar um widget de legenda ao mapa
            const legend = new Legend({
                view: view,
                layerInfos: [{
                    layer: countiesLayer,
                    title: "Cameras per County"
                }]
            });

            view.ui.add(legend, "bottom-right");

        });
    </script>
</body>
</html>
