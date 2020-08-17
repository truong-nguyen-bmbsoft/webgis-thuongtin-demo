window.onload = init;

function init() {
    var format = "image/png";
    var NEN = new ol.layer.Image({
        source: new ol.source.ImageWMS({
            ratio: 1,
            url: "http://localhost:8081/geoserver/thuongtin_map/wms",
            params: {
                FORMAT: format,
                VERSION: "1.1.0",
                STYLES: "",
                LAYERS: "thuongtin_map:thuongtin-polygon"
            }
        })
    });

    const stamenTerrain = new ol.layer.Tile({
        source: new ol.source.OSM(),
        visible: true,
        title: 'StamenTerrain'
    })

    const baseLayerGroup  = new ol.layer.Group({
        layers: [
            stamenTerrain
        ]
    })

    var map = new ol.Map({
        target: 'map',
        layers: [
            baseLayerGroup,
            NEN
        ],
        view: new ol.View({
            center: [11786190.507062517, 2375295.6379531403],
            zoom: 10,
            minZoom: 1,
            maxZoom: 20,
            rotation:0.5
        })
    });

    const overlayContainerElement = document.querySelector(".overlay-container");
    const overlayLayer = new ol.Overlay({
        element: overlayContainerElement
    });
    map.addOverlay(overlayLayer);
    const overlayFeatureName = document.getElementById("address");
    const overlayFeatureAdditionInfo = document.getElementById("description");
    map.on("click", function (e) {
        console.log(e.coordinate)
        map.forEachFeatureAtPixel(e.pixel, function (feature, layer) {
            console.log(feature);
            let clickedCoordinate = e.coordinate;
            let clickedFeatureName = feature.get('address');
            let clickedFeatureInfo = feature.get('description');
            overlayLayer.setPosition(clickedCoordinate);
            overlayFeatureName.innerHTML = clickedFeatureName;
            overlayFeatureAdditionInfo.innerHTML = clickedFeatureInfo;
        })
    })
}
