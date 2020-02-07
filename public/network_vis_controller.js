import { uiModules } from 'ui/modules';
import { AggConfig } from 'ui/agg_types/agg_config';

// get the kibana/table_vis module, and make sure that it requires the "kibana" module if it
// didn't already
const module = uiModules.get('kibana/transform_vis', ['kibana']);
//import the npm modules
const visN = require('vis-network');
const randomColor = require('randomcolor');
const ElementQueries = require('css-element-queries/src/ElementQueries');
const ResizeSensor = require('css-element-queries/src/ResizeSensor');


// add a controller to the module, which will transform the esResponse into a
// tabular format that we can pass to the table directive
module.controller('KbnNetworkVisController', function ($scope, $sce, $timeout, Private) {
    var network_id, loading_id;

    $scope.errorNodeColor = function () {
        $("#" + network_id).hide();
        $("#" + loading_id).hide();
        $("#errorHtml").html("<h1><strong>ERROR</strong>: Node Color must be the LAST selection</h1>");
        $("#errorHtml").show();
    }

    $scope.errorNodeNodeRelation = function () {
        $("#" + network_id).hide();
        $("#" + loading_id).hide();
        $("#errorHtml").html("<h1><strong>ERROR</strong>: You can only choose Node-Node or Node-Relation</h1>");
        $("#errorHtml").show();
    }

    $scope.initialShows = function () {
        $("#" + network_id).show();
        $("#" + loading_id).show();
        $("#errorHtml").hide();
    }

    $scope.startDynamicResize = function (network) {
        new ResizeSensor($("#" + network_id), function () {
            network.setSize('100%', '100%');
        });
    }

    $scope.drawColorLegend = function (usedColors, colorDicc) {
        var canvas = document.getElementsByTagName("canvas")[0];
        var context = canvas.getContext("2d");

        context.fillStyle = "#FFE8D6";
        var totalheight = usedColors.length * 25
        context.fillRect(canvas.width * (-2) - 10, canvas.height * (-2) - 18, 350, totalheight);

        context.fillStyle = "black";
        context.font = "bold 30px Arial";
        context.textAlign = "start";
        context.fillText("LEGEND OF COLORS:", canvas.width * (-2), canvas.height * (-2));

        var p = canvas.height * (-2) + 40;
        for (var key in colorDicc) {
            context.fillStyle = colorDicc[key];
            context.font = "bold 20px Arial";
            context.fillText(key, canvas.width * (-2), p);
            p = p + 22;
        }
    }

    $scope.$watchMulti(['esResponse', 'vis.params.secondNodeColor'], function ([resp]) {
        // variables for column ids
        let firstFirstBucketId, firstSecondBucketId, secondBucketId, colorBucketId, nodeSizeId, edgeSizeId

        // variables for agg ids
        let secondBucketAggId, colorNodeAggId

        let edgeSizeSet = false

        if (resp) {
            // helper function to get column id
            var getColumnIdByAggId = function getColumnIdByAggId(aggId) {
                return resp.columns.find(function (col) {
                    return col.id.split('-')[2] === aggId;
                }).id;
            };

            // helper function to get column id for colornode
            var getColorNodeColumnId = function getColumnIdByAggId(aggId) {
                if (!secondBucketId) {
                    return "col-3-" + aggId
                } else if (secondBucketId && !edgeSizeId) {
                    return "col-4-" + aggId
                } else if (secondBucketId && edgeSizeId) {
                    return "col-6-" + aggId
                } else {
                    return ""
                }
            };            

            $scope.vis.aggs.aggs.forEach((agg) => {
                if (agg.__schema.name === "first") {
                    // firstSecondBucketId is the secondary node in a node-node
                    // it also has a schema name of 'first', so set it if the first node is already set
                    if (firstFirstBucketId) {
                        firstSecondBucketId = getColumnIdByAggId(agg.id)
                    } else {
                        firstFirstBucketId = getColumnIdByAggId(agg.id)
                    }
                } else if (agg.__schema.name === "second") {
                    secondBucketAggId = agg.id
                    secondBucketId = getColumnIdByAggId(agg.id)
                } else if (agg.__schema.name === "colornode") {
                    colorNodeAggId = agg.id
                    colorBucketId = getColorNodeColumnId(agg.id)
                } else if (agg.__schema.name === "size_node") {
                    nodeSizeId = getColumnIdByAggId(agg.id)
                } else if (agg.__schema.name === "size_edge") {
                    // set edge id for node-node or node-relation
                    if (firstFirstBucketId && (firstSecondBucketId || secondBucketId)) {
                        edgeSizeSet = true
                        edgeSizeId = "col-5-" + agg.id
                    }
                }
            });

            // Get the buckets of the aggregation
            var buckets = resp.rows;

            // It is neccessary to add a timeout in order to have more than 1 net in the same dashboard
            $timeout(function () {
                network_id = "net_" + $scope.$id;
                loading_id = "loading_" + $scope.$parent.$id;
                $("#" + loading_id).hide();

                // Single NODE or NODE-NODE Type
                if ((firstFirstBucketId || firstSecondBucketId) && !secondBucketId) {
                    $scope.initialShows();
                    $(".secondNode").show();

                    if (colorNodeAggId) {
                        var colorDicc = {};
                        var usedColors = [];
                    }

                    /// DATA PARSED AND BUILDING NODES
                    var dataParsed = [];
                    // Iterate the buckets
                    var i = 0;
                    var dataNodes = buckets.map(function (bucket) {

                        var result = $.grep(dataParsed, function (e) { return e.keyFirstNode == bucket[firstFirstBucketId]; });
                        // first time we've parsed a node with this id
                        if (result.length == 0) {
                            dataParsed[i] = {};

                            dataParsed[i].keyFirstNode = bucket[firstFirstBucketId];

                            var value = bucket[nodeSizeId]

                            // Don't show nodes under the value
                            if ($scope.vis.params.minCutMetricSizeNode > value) {
                                dataParsed.splice(i, 1);
                                return;
                            }

                            dataParsed[i].valorSizeNode = value;
                            dataParsed[i].nodeColorValue = "default";
                            dataParsed[i].nodeColorKey = "default";
                            if (!dataParsed[i].relationWithSecondNode) {
                                dataParsed[i].relationWithSecondNode = [];
                            }

                            // Iterate rows and choose the edge size
                            if (firstSecondBucketId) {
                                if (edgeSizeSet) {
                                    var value_sizeEdge = bucket[edgeSizeId];
                                    var sizeEdgeVal = value_sizeEdge;
                                } else {
                                    var sizeEdgeVal = 0.1;
                                }

                                if (colorNodeAggId) {
                                    if (colorDicc[bucket[colorBucketId]]) {
                                        dataParsed[i].nodeColorKey = bucket[colorBucketId];
                                        dataParsed[i].nodeColorValue = colorDicc[bucket[colorBucketId]];
                                    } else {
                                        //repeat to find a NO-REPEATED color
                                        while (true) {
                                            var confirmColor = randomColor();
                                            if (usedColors.indexOf(confirmColor) == -1) {
                                                colorDicc[bucket[colorBucketId]] = confirmColor;
                                                dataParsed[i].nodeColorKey = bucket[colorBucketId];
                                                dataParsed[i].nodeColorValue = colorDicc[bucket[colorBucketId]];
                                                usedColors.push(confirmColor);
                                                break;
                                            }
                                        }

                                    }
                                }

                                var relation = {
                                    keySecondNode: bucket[firstSecondBucketId],
                                    countMetric: bucket[nodeSizeId],
                                    widthOfEdge: sizeEdgeVal
                                }
                                dataParsed[i].relationWithSecondNode.push(relation)
                            }

                            // Assign color and the content of the popup
                            var inPopup = bucket[firstFirstBucketId]
                            console.log("inPopup 2: ", inPopup)
                            if (dataParsed[i].nodeColorValue != "default") {
                                var colorNodeFinal = dataParsed[i].nodeColorValue;
                                // inPopup += "<p>" + dataParsed[i].nodeColorKey + "</p>";
                            } else {
                                var colorNodeFinal = $scope.vis.params.firstNodeColor;
                            }

                            i++;

                            // Return the node totally built
                            var nodeReturn = {
                                id: i,
                                key: bucket[firstFirstBucketId],
                                // title: bucket[firstFirstBucketId],
                                color: colorNodeFinal,
                                shape: $scope.vis.params.shapeFirstNode,
                                value: value,
                                font: {
                                    color: $scope.vis.params.labelColor
                                }
                            }

                            // If activated, show the labels
                            if ($scope.vis.params.showLabels) {
                                nodeReturn.label = bucket[firstFirstBucketId];
                            }

                            // If activated, show the popups
                            if ($scope.vis.params.showPopup) {
                                console.log("Showing popup: ", inPopup)
                                nodeReturn.title = inPopup;
                            }

                            return nodeReturn;


                        } else if (result.length == 1) { // we already have this node id in dataNodes, so update with new info
                            var dataParsed_node_exist = result[0]
                            //Iterate rows and choose the edge size
                            if (firstSecondBucketId) {
                                if (edgeSizeSet) {
                                    var value_sizeEdge = bucket[edgeSizeId];
                                    var sizeEdgeVal = value_sizeEdge;
                                } else {
                                    var sizeEdgeVal = 0.1;
                                }

                                var relation = {
                                    keySecondNode: bucket[firstSecondBucketId],
                                    countMetric: bucket[nodeSizeId],
                                    widthOfEdge: sizeEdgeVal
                                }
                                dataParsed_node_exist.relationWithSecondNode.push(relation)
                            }
                            return undefined
                        }
                    });
                    // Clean "undefined" out of the array
                    dataNodes = dataNodes.filter(Boolean);

                    // BUILDING EDGES AND SECONDARY NODES
                    var dataEdges = [];
                    for (var n = 0; n < dataParsed.length; n++) {
                        // Find in the array the node with the keyFirstNode
                        var result = $.grep(dataNodes, function (e) { return e.key == dataParsed[n].keyFirstNode; });
                        if (result.length == 0) {
                            console.log("Error: Node not found");
                        } else if (result.length == 1) {
                            // Found the node, access to its id
                            if (firstSecondBucketId) {
                                for (var r = 0; r < dataParsed[n].relationWithSecondNode.length; r++) {
                                    // Find in the relations the second node to relate
                                    var nodeOfSecondType = $.grep(dataNodes, function (e) { return e.key == dataParsed[n].relationWithSecondNode[r].keySecondNode; });
                                    
                                    if (nodeOfSecondType.length == 0) {
                                        // This is the first time this secondary node has been processed
                                        i++;
                                        var secondaryNode = {
                                            id: i,
                                            key: dataParsed[n].relationWithSecondNode[r].keySecondNode,
                                            label: dataParsed[n].relationWithSecondNode[r].keySecondNode,
                                            color: $scope.vis.params.secondNodeColor,
                                            font: {
                                                color: $scope.vis.params.labelColor
                                            },
                                            shape: $scope.vis.params.shapeSecondNode
                                        };
                                        if ($scope.vis.params.showPopup) {
                                            secondaryNode.title = dataParsed[n].relationWithSecondNode[r].keySecondNode
                                        }
                                        // Add a new secondary node
                                        dataNodes.push(secondaryNode);

                                        // Create a new edge between a primary and secondary node
                                        var edge = {
                                            from: result[0].id,
                                            to: dataNodes[dataNodes.length - 1].id,
                                            value: dataParsed[n].relationWithSecondNode[r].widthOfEdge
                                        }
                                        if ($scope.vis.params.showPopup) {
                                            edge.title = dataParsed[n].relationWithSecondNode[r].widthOfEdge
                                        }
                                        dataEdges.push(edge);

                                    } else if (nodeOfSecondType.length == 1) {
                                        // The secondary node being processed already exists,
                                        //    only a new edge needs to be created 
                                        var enlace = {
                                            from: result[0].id,
                                            to: nodeOfSecondType[0].id,
                                            value: dataParsed[n].relationWithSecondNode[r].widthOfEdge
                                        }
                                        if ($scope.vis.params.showPopup) {
                                            enlace.title = dataParsed[n].relationWithSecondNode[r].widthOfEdge
                                        }
                                        dataEdges.push(enlace);
                                    } else {
                                        console.log("Error: Multiple nodes with same id found");
                                    }
                                }
                            }
                        } else {
                            console.log("Error: Multiple nodes with same id found");
                        }
                    }

                    // Creation of the network with the library
                    var nodesDataSet = new visN.DataSet(dataNodes);
                    var edgesDataSet = new visN.DataSet(dataEdges);

                    var container = document.getElementById(network_id);
                    container.style.height = container.getBoundingClientRect().height;
                    container.height = container.getBoundingClientRect().height;
                    var data = {
                        nodes: nodesDataSet,
                        edges: edgesDataSet
                    };
                    // Options controlled by user directly
                    var options_1 = {
                        height: container.getBoundingClientRect().height.toString(),
                        physics: {
                            barnesHut: {
                                gravitationalConstant: $scope.vis.params.gravitationalConstant,
                                springConstant: $scope.vis.params.springConstant
                            }
                        },
                        edges: {
                            arrowStrikethrough: false,
                            smooth: {
                                type: $scope.vis.params.smoothType
                            },
                            scaling: {
                                min: $scope.vis.params.minEdgeSize,
                                max: $scope.vis.params.maxEdgeSize
                            }
                        },
                        nodes: {
                            physics: $scope.vis.params.nodePhysics,
                            scaling: {
                                min: $scope.vis.params.minNodeSize,
                                max: $scope.vis.params.maxNodeSize
                            }
                        },
                        layout: {
                            improvedLayout: !(dataEdges.length > 200)
                        },
                        interaction: {
                            hover: true,
                            tooltipDelay: 50 
                        },
                        manipulation: {
                            enabled: true
                        }
                    };
                    switch ($scope.vis.params.posArrow) {
                        case 'from':
                            var options_2 = {
                                edges: {
                                    arrows: {
                                        from: {
                                            enabled: $scope.vis.params.displayArrow,
                                            scaleFactor: $scope.vis.params.scaleArrow,
                                            type: $scope.vis.params.shapeArrow
                                        }
                                    }
                                }
                            };
                            break;
                        case 'middle':
                            var options_2 = {
                                edges: {
                                    arrows: {
                                        middle: {
                                            enabled: $scope.vis.params.displayArrow,
                                            scaleFactor: $scope.vis.params.scaleArrow,
                                            type: $scope.vis.params.shapeArrow
                                        }
                                    }
                                }
                            };
                            break;
                        case 'to':
                            var options_2 = {
                                edges: {
                                    arrows: {
                                        to: {
                                            enabled: $scope.vis.params.displayArrow,
                                            scaleFactor: $scope.vis.params.scaleArrow,
                                            type: $scope.vis.params.shapeArrow
                                        }
                                    }
                                }
                            };
                            break;
                        default:
                            var options_2 = {
                                edges: {
                                    arrows: {
                                        from: {
                                            enabled: $scope.vis.params.displayArrow,
                                            scaleFactor: $scope.vis.params.scaleArrow,
                                            type: $scope.vis.params.shapeArrow
                                        }
                                    }
                                }
                            };
                            break;
                    }
                    var options = angular.merge(options_1, options_2);
                    console.log("Network Plugin: Create network now");
                    var network = new visN.Network(container, data, options);

                    $scope.startDynamicResize(network);

                    network.on("afterDrawing", function (canvasP) {
                        $("#" + loading_id).hide();
                        // Draw the color legend if Node Color is activated
                        if (colorBucketId  && $scope.vis.params.showColorLegend) {
                            $scope.drawColorLegend(usedColors, colorDicc);
                        }
                    });

                  // NODE-RELATION Type
                } else if (secondBucketId) {
                    $scope.initialShows();
                    $(".secondNode").hide();

                    if (colorBucketId) {
                        var colorDicc = {};
                        var usedColors = [];

                        // Check if "Node Color" is the last selection
                        if (colorNodeAggId <= secondBucketAggId) {
                            $scope.errorNodeColor();
                            return;
                        }
                    }

                    // DATA PARSED AND BUILDING NODES
                    var dataParsed = [];
                    // Iterate the buckets
                    var i = 0;
                    var dataNodes = buckets.map(function (bucket) {
                        // New structure, needed to search after algorithm
                        var result = $.grep(dataParsed, function (e) { return e.keyNode == bucket[firstFirstBucketId]; });
                        if (result.length == 0) {
                            dataParsed[i] = {};
                            dataParsed[i].keyNode = bucket[firstFirstBucketId];

                            var value = bucket[nodeSizeId];

                            // Don't show nodes under the value
                            if ($scope.vis.params.minCutMetricSizeNode > value) {
                                dataParsed.splice(i, 1);
                                return;
                            }
                  
                            dataParsed[i].valorSizeNode = value;
                            dataParsed[i].nodeColorValue = "default";
                            dataParsed[i].nodeColorKey = "default";
                            dataParsed[i].relationWithSecondField = []

                            // Add relation edges
                            if (edgeSizeSet) {
                                var value_sizeEdge = bucket[edgeSizeId];
                                var sizeEdgeVal = value_sizeEdge;
                            } else {
                                var sizeEdgeVal = 0.1;
                            }

                            // Get the color of the node, save in the dictionary
                            if (colorNodeAggId) {
                                if (colorDicc[bucket[colorBucketId]]) {
                                    dataParsed[i].nodeColorKey = bucket[colorBucketId];
                                    dataParsed[i].nodeColorValue = colorDicc[bucket[colorBucketId]];
                                } else {
                                    // repeat to find a NO-REPEATED color
                                    while (true) {
                                        var confirmColor = randomColor();
                                        if (usedColors.indexOf(confirmColor) == -1) {
                                            colorDicc[bucket[colorBucketId]] = confirmColor;
                                            dataParsed[i].nodeColorKey = bucket[colorBucketId];
                                            dataParsed[i].nodeColorValue = colorDicc[bucket[colorBucketId]];
                                            usedColors.push(confirmColor);
                                            break;
                                        }
                                    }

                                }
                            }

                            var relation = {
                                keyRelation: bucket[secondBucketId],
                                countMetric: bucket[nodeSizeId],
                                widthOfEdge: sizeEdgeVal
                            };
                            dataParsed[i].relationWithSecondField.push(relation)

                            var inPopup = bucket[firstFirstBucketId]
                            console.log("inPopup 1: ", inPopup)
                            if (dataParsed[i].nodeColorValue != "default") {
                                var colorNodeFinal = dataParsed[i].nodeColorValue;
                                // inPopup += "<p>" + dataParsed[i].nodeColorKey + "</p>";
                            } else {
                                var colorNodeFinal = $scope.vis.params.firstNodeColor;
                            }

                            i++;

                            // Return the node totally built
                            var nodeReturn = {
                                id: i,
                                key: bucket[firstFirstBucketId],
                                // title: bucket[firstFirstBucketId],
                                color: colorNodeFinal,
                                shape: $scope.vis.params.shapeFirstNode,
                                value: value,
                                font: {
                                    color: $scope.vis.params.labelColor
                                }
                            }

                            // If activated, show the labels
                            if ($scope.vis.params.showLabels) {
                                nodeReturn.label = bucket[firstFirstBucketId];
                            }

                            // If activated, show the popups
                            if ($scope.vis.params.showPopup) {
                                console.log("Showing popup 2: ", inPopup)
                                nodeReturn.title = inPopup;
                            }

                            return nodeReturn;
                        } else if (result.length == 1) {
                            var dataParsed_node_exist = result[0]
                            if ($scope.vis.aggs.bySchemaName['second'].length > 0) {
                                if (edgeSizeSet) {
                                    var value_sizeEdge = bucket[edgeSizeId];
                                    var sizeEdgeVal = value_sizeEdge;
                                } else {
                                    var sizeEdgeVal = 0.1;
                                }

                                var relation = {
                                    keyRelation: bucket[secondBucketId],
                                    countMetric: bucket[nodeSizeId],
                                    widthOfEdge: sizeEdgeVal
                                }
                                dataParsed_node_exist.relationWithSecondField.push(relation)
                            }
                            return undefined
                        }
                    });

                    // BUILDING EDGES
                    // Clean "undefinded" in the array
                    dataNodes = dataNodes.filter(Boolean);
                    var dataEdges = [];

                    // Iterate parsed nodes
                    for (var n = 0; n < dataParsed.length; n++) {
                        // Obtain id of the node
                        var NodoFrom = $.grep(dataNodes, function (e) { return e.key == dataParsed[n].keyNode; });
                        if (NodoFrom.length == 0) {
                            console.log("Error: Node not found");
                        } else if (NodoFrom.length == 1) {
                            var id_from = NodoFrom[0].id;
                            // Iterate relations that have with the second field selected
                            for (var p = 0; p < dataParsed[n].relationWithSecondField.length; p++) {
                                // Iterate again the nodes
                                for (var z = 0; z < dataParsed.length; z++) {
                                    // Check that we don't compare the same node
                                    if (dataParsed[n] != dataParsed[z]) {
                                        var NodoTo = $.grep(dataNodes, function (e) { return e.key == dataParsed[z].keyNode; });
                                        if (NodoTo.length == 0) {
                                            console.log("Error: Node not found");
                                        } else if (NodoTo.length == 1) {
                                            var id_to = NodoTo[0].id;
                                            // Have relation?
                                            var sameRelation = $.grep(dataParsed[z].relationWithSecondField, function (e) { return e.keyRelation == dataParsed[n].relationWithSecondField[p].keyRelation; });
                                            if (sameRelation.length == 1) {
                                                // Nodes have a relation, creating the edge
                                                var edgeExist = $.grep(dataEdges, function (e) { return (e.to == id_from && e.from == id_to) || (e.to == id_to && e.from == id_from); });
                                                if (edgeExist.length == 0) {
                                                    // The size of the edge is the total of the common
                                                    var sizeEdgeTotal = sameRelation[0].widthOfEdge + dataParsed[n].relationWithSecondField[p].widthOfEdge;
                                                    var edge = {
                                                        from: id_from,
                                                        to: id_to,
                                                        value: sizeEdgeTotal
                                                    };
                                                    dataEdges.push(edge);
                                                }
                                            }
                                        } else {
                                            console.log("Error: Multiples nodes with same id found");
                                        }
                                    }
                                }
                            }

                        } else {
                            console.log("Error: Multiples nodes with same id found");
                        }
                    }

                    // Creation of the network with the library
                    var nodesDataSet = new visN.DataSet(dataNodes);
                    var edgesDataSet = new visN.DataSet(dataEdges);


                    // Creation of the network
                    var container = document.getElementById(network_id);
                    // Set the Height
                    container.style.height = container.getBoundingClientRect().height;
                    container.height = container.getBoundingClientRect().height;
                    // Set the Data
                    var data = {
                        nodes: nodesDataSet,
                        edges: edgesDataSet
                    };
                    // Set the Options
                    var options = {
                        height: container.getBoundingClientRect().height.toString(),
                        physics: {
                            barnesHut: {
                                gravitationalConstant: $scope.vis.params.gravitationalConstant,
                                springConstant: $scope.vis.params.springConstant,
                                springLength: 500
                            }
                        },
                        edges: {
                            arrows: {
                                to: {
                                    enabled: $scope.vis.params.displayArrow,
                                    scaleFactor: $scope.vis.params.scaleArrow,
                                    type: $scope.vis.params.shapeArrow
                                }
                            },
                            arrowStrikethrough: false,
                            smooth: {
                                type: $scope.vis.params.smoothType
                            },
                            scaling: {
                                min: $scope.vis.params.minEdgeSize,
                                max: $scope.vis.params.maxEdgeSize
                            }
                        },
                        interaction: {
                            hideEdgesOnDrag: true,
                            hover: true,
                            tooltipDelay: 100
                        },
                        nodes: {
                            physics: $scope.vis.params.nodePhysics,
                            scaling: {
                                min: $scope.vis.params.minNodeSize,
                                max: $scope.vis.params.maxNodeSize
                            }
                        },
                        layout: {
                            improvedLayout: false
                        },
                        manipulation: {
                            enabled: true
                        }
                    }
                    console.log("Create network now");
                    var network = new visN.Network(container, data, options);

                    $scope.startDynamicResize(network);

                    network.on("afterDrawing", function (canvasP) {
                        $("#" + loading_id).hide();
                        // Draw the color legend if Node Color is activated
                        if (colorBucketId && $scope.vis.params.showColorLegend) {
                            $scope.drawColorLegend(usedColors, colorDicc);
                        }
                    });
                } else {
                    $scope.errorNodeNodeRelation();
                }
            });
        }
    });
});

