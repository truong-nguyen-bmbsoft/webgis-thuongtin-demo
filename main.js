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

    var XANH1 = new ol.layer.Image({
        source: new ol.source.ImageWMS({
            ratio: 1,
            url: "http://dongtrieusmartcity.c2tech.vn:8080/geoserver/qhdongtrieu/wms",
            params: {
                projection: "EPSG:4326",
                transparent: true,
                format: 'image/png',
                VERSION: "1.1.0",
                STYLES: "",
                LAYERS: "qhdongtrieu:qhpk10_sdd_m3_tiff"
            }
        })
    });

    var GROUP = new ol.layer.Image({
        source: new ol.source.ImageWMS({
            ratio: 1,
            url: "http://thanhhoasmartcity.cgis.vn:8080/geoserver/qhthanhhoa/wms",
            params: {
                projection: "EPSG:4326",
                FORMAT: 'image/tiff',
                VERSION: "1.1.0",
                STYLES: "",
                LAYERS: "qhthanhhoa:b3ce_71b0_405a_49de_4ba5"
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

    // const fillStyle = new ol.style.Fill({
    //     color: [84, 118, 255, 1]
    // });
    //
    // const strokeStyle = new ol.style.Stroke({
    //     color: [46, 45, 45, 1],
    //     width: 1.2
    // });
    //
    // const circleStyle = new ol.style.Circle({
    //     color: [245, 49, 5, 1],
    //     radius: 7,
    //     stroke: strokeStyle
    // });

    var white = [255, 255, 255, 1];
    var blue = [0, 153, 255, 1];
    var width = 3;
    //Vector layer
    const VNCountriesGeoJSON = new ol.layer.VectorImage({
        source: new ol.source.Vector({
            url: 'http://localhost:8080/Webgis/api/genderMap/0',
            format: new ol.format.GeoJSON()
        }),
        visible: true,
        title: 'VNCountriesGeoJSON',
        style: new ol.style.Style({
            image: new ol.style.Circle({
                radius: width * 2,
                fill: new ol.style.Fill({
                    color: blue
                }),
                stroke: new ol.style.Stroke({
                    color: white,
                    width: width / 2
                })
            }),
            zIndex: Infinity
        })
    })

    var map = new ol.Map({
        target: 'map',
        layers: [
            baseLayerGroup,
            // NEN,
            XANH1,
            // GROUP,
            // VNCountriesGeoJSON
        ],
        view: new ol.View({
            center: ol.proj.fromLonLat([106.438140869141, 21.0090808868408]),
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
    map.on("dblclick", function (e) {
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

    map.on('singleclick', function (evt) {
        document.getElementById('info').innerHTML = "Loading... please wait...";
        var view = map.getView();
        var viewResolution = view.getResolution();
        var source = GROUP.getSource();
        var url = source.getFeatureInfoUrl(
            evt.coordinate, viewResolution, view.getProjection(),
            { 'INFO_FORMAT': 'application/json', 'FEATURE_COUNT': 50 });
        if (url) {
            $.ajax({
                type: "POST",
                url: url,
                contentType: "application/json; charset=utf-8",
                dataType: 'json',
                success: function (n) {
                    var content = "<table class=\"demo\" style='margin-left: 30px'>" +
                        "    <p style='text-align: center; color:#2aabd2; margin-top: 10px; font-weight: bold'>Thông tin khu vực chọn</p>" +
                        "    <thead>" +
                        "    <tr>" +
                        "    <th>Tên lớp</th>" +
                        "    <th>Màu sắc</th>" +
                        "    <th>Kiểu line</th>" +
                        "    <th>Độ cao</th>" +
                        "    </tr>" +
                        "    </thead>";
                    for (var i = 0; i < n.features.length; i++) {
                        var feature = n.features[i];
                        var featureAttr = feature.properties;
                        content += "<tr>"
                            + "<td>" + featureAttr["layer"] + "</td>"
                            + "<td>" + featureAttr["color"]+ "</td>"
                            + "<td>" + featureAttr["linetype"]+ "</td>"
                            + "<td>" + featureAttr["elevation"]+ "</td>"
                            + "</tr>"
                    }
                    content += "</table>";
                    $("#info").html(content);
                }
            });
        }
    });

    $("#type").change(function () {
        var type = $('#type').val();
        map.getInteractions().array_.forEach(function (interaction) {
            if (interaction instanceof ol.interaction.Draw) {
                map.removeInteraction(interaction);
                return;
            }
        })

        function calculateMeasure() {
            var sketch;
            var helpTooltipElement;
            var helpTooltip;
            var measureTooltipElement;
            var measureTooltip;
            var continuePolygonMsg = 'Click to continue drawing the polygon';
            var continueLineMsg = 'Click to continue drawing the line';

            var pointerMoveHandler = function (evt) {
                if (evt.dragging) {
                    return;
                }
                /** @type {string} */
                var helpMsg = 'Click to start drawing';

                if (sketch) {
                    var geom = sketch.getGeometry();
                    if (geom instanceof ol.geom.Polygon) {
                        helpMsg = continuePolygonMsg;
                    } else if (geom instanceof ol.geom.LineString) {
                        helpMsg = continueLineMsg;
                    }
                }

                helpTooltipElement.innerHTML = helpMsg;
                helpTooltip.setPosition(evt.coordinate);

                helpTooltipElement.classList.remove('hidden');
            };

            map.on('pointermove', pointerMoveHandler);
            map.getViewport().addEventListener('mouseout', function () {
                helpTooltipElement.classList.add('hidden');
            });

            var typeSelect = document.getElementById('type');

            var draw; // global so we can remove it later

            /**
             * Format length output.
             * @param {LineString} line The line.
             * @return {string} The formatted length.
             */
            var formatLength = function (line) {
                var length = ol.sphere.getLength(line);
                var output;
                if (length > 100) {
                    output = Math.round((length / 1000) * 100) / 100 + ' ' + 'km';
                } else {
                    output = Math.round(length * 100) / 100 + ' ' + 'm';
                }
                return output;
            };

            /**
             * Format area output.
             * @param {Polygon} polygon The polygon.
             * @return {string} Formatted area.
             */
            var formatArea = function (polygon) {
                var area = ol.sphere.getArea(polygon);
                var output;
                if (area > 10000) {
                    output = Math.round((area / 1000000) * 100) / 100 + ' ' + 'km<sup>2</sup>';
                } else {
                    output = Math.round(area * 100) / 100 + ' ' + 'm<sup>2</sup>';
                }
                return output;
            };

            function addInteraction() {
                var type = typeSelect.value === 'area' ? 'Polygon' : 'LineString';
                draw = new ol.interaction.Draw({
                    source: map,
                    type: type,
                    style: new ol.style.Style({
                        fill: new ol.style.Fill({
                            color: 'rgba(255, 255, 255, 0.2)',
                        }),
                        stroke: new ol.style.Stroke({
                            color: 'rgba(0, 0, 0, 0.5)',
                            lineDash: [10, 10],
                            width: 2,
                        }),
                        image: new ol.style.Circle({
                            radius: 5,
                            stroke: new ol.style.Stroke({
                                color: 'rgba(0, 0, 0, 0.7)',
                            }),
                            fill: new ol.style.Fill({
                                color: 'rgba(255, 255, 255, 0.2)',
                            }),
                        }),
                    }),
                });
                map.addInteraction(draw);

                createMeasureTooltip();
                createHelpTooltip();

                var listener;
                draw.on('drawstart', function (evt) {
                    // set sketch
                    sketch = evt.feature;

                    /** @type {import("../src/ol/coordinate.js").Coordinate|undefined} */
                    var tooltipCoord = evt.coordinate;

                    listener = sketch.getGeometry().on('change', function (evt) {
                        var geom = evt.target;
                        var output;
                        if (geom instanceof ol.geom.Polygon) {
                            output = formatArea(geom);
                            tooltipCoord = geom.getInteriorPoint().getCoordinates();
                        } else if (geom instanceof ol.geom.LineString) {
                            output = formatLength(geom);
                            tooltipCoord = geom.getLastCoordinate();
                        }
                        measureTooltipElement.innerHTML = output;
                        measureTooltip.setPosition(tooltipCoord);
                    });
                });

                draw.on('drawend', function () {
                    measureTooltipElement.className = 'ol-tooltip ol-tooltip-static';
                    measureTooltip.setOffset([0, -7]);
                    // unset sketch
                    sketch = null;
                    // unset tooltip so that a new one can be created
                    measureTooltipElement = null;
                    createMeasureTooltip();
                    ol.Observable.unByKey(listener);
                });
            }

            /**
             * Creates a new help tooltip
             */
            function createHelpTooltip() {
                if (helpTooltipElement) {
                    helpTooltipElement.parentNode.removeChild(helpTooltipElement);
                }
                helpTooltipElement = document.createElement('div');
                helpTooltipElement.className = 'ol-tooltip hidden';
                helpTooltip = new ol.Overlay({
                    element: helpTooltipElement,
                    offset: [15, 0],
                    positioning: 'center-left',
                });
                map.addOverlay(helpTooltip);
            }

            /**
             * Creates a new measure tooltip
             */
            function createMeasureTooltip() {
                if (measureTooltipElement) {
                    measureTooltipElement.parentNode.removeChild(measureTooltipElement);
                }
                measureTooltipElement = document.createElement('div');
                measureTooltipElement.className = 'ol-tooltip ol-tooltip-measure';
                measureTooltip = new ol.Overlay({
                    element: measureTooltipElement,
                    offset: [0, -15],
                    positioning: 'bottom-center',
                });
                map.addOverlay(measureTooltip);
            }

            /**
             * Let user change the geometry type.
             */
            typeSelect.onchange = function () {
                map.removeInteraction(draw);
                addInteraction();
            };

            addInteraction();
        }

        function zoomIn() {
            map.getView().setZoom(map.getView().getZoom() + 1);
        }

        function zoomOut() {
            map.getView().setZoom(map.getView().getZoom() - 1)
        }

        function exportMap() {
            map.once('postcompose', function (event) {
                var canvas = event.context.canvas;
                var data = canvas.toDataURL("image/png");

                if (navigator.msSaveBlob) {
                    navigator.msSaveBlob(canvas.msToBlob(), 'map.png');
                } else {
                    canvas.toBlob(function (blob) {
                        saveAs(blob, 'map.png');
                    });
                }

            });
            map.renderSync();
        }

        function selectOne() {
            this.ctr_selectFeature = new ol.interaction.Select({
                condition: ol.events.condition.click
            });
            map.addInteraction(this.ctr_selectFeature);
            this.ctr_selectFeature.on('select', function (e) {
                var n = e.target.getFeatures().getLength();
                if (n == 0) return;
            });
        }

        switch (type) {
            case "icon-fullScreen":
                break;
            case "icon-selectOne":
                selectOne();
                break;
            case "icon-selectMany":
                break;
            case "icon-pan":
                break;
            case "icon-pin":
                break;
            case "icon-location":
                break;
            case "icon-zoomIn":
                zoomIn();
                break;
            case "icon-zoomOut":
                zoomOut();
                break;
            case "LineString":
                calculateMeasure();
                break;
            case "area":
                calculateMeasure();
                break;
            case "icon-exportmap":
                exportMap();
                break;
            case "icon-print":
                break;
            case "icon-filter":
                break;
            case "icon-legend":
                break;
            case "icon-identify":
                break;
            case "icon-duan":
                break;
        }
    })
}