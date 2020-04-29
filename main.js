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

    var XANH = new ol.layer.Image({
        source: new ol.source.ImageWMS({
            ratio: 1,
            url: "http://localhost:8081/geoserver/thuongtin_map/wms",
            params: {
                FORMAT: format,
                VERSION: "1.1.0",
                STYLES: "",
                LAYERS: "thuongtin_map:thuongtin-line"
            }
        })
    });

    var GROUP = new ol.layer.Image({
        source: new ol.source.ImageWMS({
            ratio: 1,
            url: "http://localhost:8081/geoserver/thuongtin_map/wms",
            params: {
                FORMAT: format,
                VERSION: "1.1.0",
                STYLES: "",
                LAYERS: "thuongtin_map:thuongtin_map"
            }
        })
    });

    const openStreetMapHumanitarian = new ol.layer.Tile({
        source: new ol.source.OSM({
            url: 'https://{a-c}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png'
        }),
        visible: true,
        title: 'OSMHumanitarian'
    })

    const openStreetMapStandard = new ol.layer.Tile({
        source: new ol.source.OSM(),
        visible: false,
        title: 'OSMHumanStandard'
    })

    const stamenTerrain = new ol.layer.Tile({
        source: new ol.source.XYZ({
            url: 'http://tile.stamen.com/terrain/{z}/{x}/{y}.jpg',
            attributions: 'DemoMap'
            }),
        visible: true,
        title: 'StamenTerrain'
    })

    const baseLayerGroup  = new ol.layer.Group({
        layers: [
            openStreetMapHumanitarian, openStreetMapStandard, stamenTerrain
        ]
    })

    const fillStyle = new ol.style.Fill({
        color: [84, 118, 255, 1]
    });

    const strokeStyle = new ol.style.Stroke({
        color: [46, 45, 45, 1],
        width: 1.2
    });

    const circleStyle = new ol.style.Circle({
        color: [245, 49, 5, 1],
        radius: 7,
        stroke: strokeStyle
    });

    //Vector layer
    const VNCountriesGeoJSON = new ol.layer.VectorImage({
        source: new ol.source.Vector({
            url: 'http://localhost:8080/Webgis/api/genderMap/0',
            format: new ol.format.GeoJSON()
        }),
        visible: true,
        title: 'VNCountriesGeoJSON',
        style: new ol.style.Style({
            fill: fillStyle,
            stroke: strokeStyle,
            image: circleStyle
        })
    })

    var map = new ol.Map({
        target: 'map',
        layers: [
            baseLayerGroup,
            NEN,
            XANH,
            GROUP,
            VNCountriesGeoJSON
        ],
        view: new ol.View({
            center: ol.proj.fromLonLat([105.80657052165057, 20.757279835934643]),
            zoom: 10,
            minZoom: 1,
            maxZoom: 20
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
        map.forEachFeatureAtPixel(e.pixel, function (feature, layer) {
            let clickedCoordinate = e.coordinate;
            let clickedFeatureName = feature.get('address');
            let clickedFeatureInfo = feature.get('description');
            overlayLayer.setPosition(clickedCoordinate);
            overlayFeatureName.innerHTML = clickedFeatureName;
            overlayFeatureAdditionInfo.innerHTML = clickedFeatureInfo;
        })
    })
    const baseLayerElements = document.querySelectorAll('.sidebar > input[type=radio]');
    for (let baseLayerElement of baseLayerElements) {
        baseLayerElement.addEventListener('change', function () {
            let baseLayerElementValue = this.value;
            baseLayerGroup.getLayers().forEach(function (element, index, array) {
                let baseLayerTitle = element.get('title');
                element.setVisible(baseLayerTitle === baseLayerElementValue)
            })
        })
    }

    $("#chkNen").change(function() {
        if ($("#chkNen").is(":checked")) {
            NEN.setVisible(true);
        } else {
            NEN.setVisible(false);
        }
    });

    $("#chkXanh").change(function() {
        if ($("#chkXanh").is(":checked")) {
            XANH.setVisible(true);
        } else {
            XANH.setVisible(false);
        }
    });

    $("#chkGroup").change(function() {
        if ($("#chkGroup").is(":checked")) {
            GROUP.setVisible(true);
        } else {
            GROUP.setVisible(false);
        }
    });

    // map.on('singleclick', function (evt) {
    //     document.getElementById('info').innerHTML = "Loading... please wait...";
    //     var view = map.getView();
    //     var viewResolution = view.getResolution();
    //     var source = GROUP.getSource();
    //     var url = source.getFeatureInfoUrl(
    //         evt.coordinate, viewResolution, view.getProjection(),
    //         { 'INFO_FORMAT': 'application/json', 'FEATURE_COUNT': 50 });
    //     if (url) {
    //         $.ajax({
    //             type: "POST",
    //             url: url,
    //             contentType: "application/json; charset=utf-8",
    //             dataType: 'json',
    //             success: function (n) {
    //                 var content = "<table class=\"demo\" style='margin-left: 30px'>" +
    //                     "    <p style='text-align: center; color:#2aabd2; margin-top: 10px; font-weight: bold'>Thông tin khu vực chọn</p>" +
    //                     "    <thead>" +
    //                     "    <tr>" +
    //                     "    <th>Tên lớp</th>" +
    //                     "    <th>Màu sắc</th>" +
    //                     "    <th>Kiểu line</th>" +
    //                     "    <th>Độ cao</th>" +
    //                     "    </tr>" +
    //                     "    </thead>";
    //                 for (var i = 0; i < n.features.length; i++) {
    //                     var feature = n.features[i];
    //                     var featureAttr = feature.properties;
    //                     content += "<tr>"
    //                         + "<td>" + featureAttr["layer"] + "</td>"
    //                         + "<td>" + featureAttr["color"]+ "</td>"
    //                         + "<td>" + featureAttr["linetype"]+ "</td>"
    //                         + "<td>" + featureAttr["elevation"]+ "</td>"
    //                         + "</tr>"
    //                 }
    //                 content += "</table>";
    //                 $("#info").html(content);
    //             }
    //         });
    //     }
    // });
}
