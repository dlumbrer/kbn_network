import { uiModules } from 'ui/modules';
import angular from 'angular';
import randomColor from 'randomcolor';
import { Network } from 'vis-network';
// import ResizeSensor from 'css-element-queries/src/ResizeSensor';
import $ from 'jquery';

// get the kibana/table_vis module, and make sure that it requires the "kibana" module if it
// didn't already
const module = uiModules.get('kibana/transform_vis', ['kibana']);

// add a controller to the module, which will transform the esResponse into a
// tabular format that we can pass to the table directive
module.controller('KbnNetworkVisController', function($scope, $timeout) {
  let networkId;
  let loadingId;

  $scope.errorNodeColor = function() {
    $('#' + networkId).hide();
    $('#' + loadingId).hide();
    $('#errorHtml').html('<h1><strong>ERROR</strong>: Node Color must be the LAST selection</h1>');
    $('#errorHtml').show();
  };

  $scope.errorNodeNodeRelation = function() {
    $('#' + networkId).hide();
    $('#' + loadingId).hide();
    $('#errorHtml').html(
      '<h1><strong>ERROR</strong>: You can only choose Node-Node or Node-Relation</h1>'
    );
    $('#errorHtml').show();
  };

  $scope.initialShows = function() {
    $('#' + networkId).show();
    $('#' + loadingId).show();
    $('#errorHtml').hide();
  };

  $scope.drawColorLegend = function(usedColors, colorDicc) {
    const canvas = document.getElementsByTagName('canvas')[0];
    const context = canvas.getContext('2d');

    // Fill in text
    context.fillStyle = 'black';
    context.font = 'bold 30px Arial';
    context.textAlign = 'start';
    context.fillText('COLOR LEGEND:', canvas.width * -1, canvas.height * -1);

    let height = 40; // adds a preliminary buffer for the legend title
    let currentHeightOnCanvas = canvas.height * -1 + height;
    let largestWidth = context.measureText('COLOR LEGEND:').width;

    for (const key of Object.keys(colorDicc)) {
      context.fillStyle = colorDicc[key];
      context.font = 'bold 20px Arial';
      context.fillText(key, canvas.width * -1, currentHeightOnCanvas);
      height += 22;
      currentHeightOnCanvas = canvas.height * -1 + height;

      const currentWidth = context.measureText(key).width;
      if (currentWidth > largestWidth) {
        largestWidth = currentWidth;
      }
    }

    // Shade in the legend
    context.fillStyle = 'rgba(218, 218, 218, 0.25)';
    context.fillRect(
      canvas.width * -1 - 20,
      canvas.height * -1 - 40,
      largestWidth + 40,
      height + 60
    );
  };

  $scope.$watchMulti(['esResponse', 'vis.params.secondNodeColor'], function([resp]) {
    // constiables for column ids, ex. id: "col-0-3" from one of the 'columns' in the resp
    let firstFirstBucketId;
    let firstSecondBucketId;
    let secondBucketId;
    let colorBucketId;
    let nodeSizeId;
    let edgeSizeId;

    // constiables for agg ids, ex. id: "3" from one of the aggs (currently in $scope.vis.aggs)
    let edgeSizeAggId;

    // constiables for tooltip text
    let primaryNodeTermName;
    let secondaryNodeTermName;
    let edgeSizeTermName;
    let nodeSizeTermName;

    function getTooltipTitle(termName, termValue, sizeTerm = null, sizeValue = null) {
      let tooltipTitle = termName + ': ' + termValue;
      if (sizeTerm !== null) {
        tooltipTitle += '<br/>' + sizeTerm + ': ' + sizeValue;
      }
      return tooltipTitle;
    }

    if (resp) {
      // helper function to get column id
      const getColumnIdByAggId = function getColumnIdByAggId(aggId) {
        return resp.columns.find(function(col) {
          return col.id.split('-')[2] === aggId;
        }).id;
      };

      function getColumnNameFromColumnId(columnId) {
        return resp.columns.find(colObj => colObj.id === columnId).name;
      }

      $scope.vis.aggs.aggs.forEach(agg => {
        if (agg.__schema.name === 'first') {
          // firstSecondBucketId is the secondary node in a node-node
          // it also has a schema name of 'first', so set it if the first node is already set
          //
          // The metric used to return both primary and secondary nodes will always contain a colon,
          // since it will take the form of "metric: order", for example, "DestIP: Descending"
          // This might look confusing in a tooltip, so only the term name is used here
          if (firstFirstBucketId) {
            firstSecondBucketId = getColumnIdByAggId(agg.id);
            secondaryNodeTermName = getColumnNameFromColumnId(firstSecondBucketId).split(':')[0];
          } else {
            firstFirstBucketId = getColumnIdByAggId(agg.id);
            primaryNodeTermName = getColumnNameFromColumnId(firstFirstBucketId).split(':')[0];
          }
        } else if (agg.__schema.name === 'second') {
          secondBucketId = getColumnIdByAggId(agg.id);
        } else if (agg.__schema.name === 'colornode') {
          colorBucketId = getColumnIdByAggId(agg.id);
        } else if (agg.__schema.name === 'size_node') {
          nodeSizeId = getColumnIdByAggId(agg.id);
          nodeSizeTermName = getColumnNameFromColumnId(nodeSizeId);
        } else if (agg.__schema.name === 'size_edge') {
          edgeSizeAggId = agg.id;
        }
      });

      // Getting edge size id here to ensure all other buckets were located in the aggs already (future-proofing
      // in case the order of the aggs being returned changes)
      if (edgeSizeAggId) {
        if (firstFirstBucketId && (firstSecondBucketId || secondBucketId)) {
          edgeSizeId = 'col-5-' + edgeSizeAggId;
          edgeSizeTermName = getColumnNameFromColumnId(edgeSizeId);
        }
      }

      // Get the buckets of the aggregation
      const buckets = resp.rows;
      const colorDicc = {};
      const usedColors = [];

      // It is neccessary to add a timeout in order to have more than 1 net in the same dashboard
      $timeout(function() {
        networkId = 'net_' + $scope.$id;
        loadingId = 'loading_' + $scope.$parent.$id;
        $('#' + loadingId).hide();

        // Single NODE or NODE-NODE Type
        if ((firstFirstBucketId || firstSecondBucketId) && !secondBucketId) {
          $scope.initialShows();
          $('.secondNode').show();

          /// DATA PARSED AND BUILDING NODES
          const dataParsed = [];
          // Iterate the buckets
          let i = 0;
          let dataNodes = buckets.map(function(bucket) {
            const result = $.grep(dataParsed, function(e) {
              return e.keyFirstNode === bucket[firstFirstBucketId];
            });

            // first time we've parsed a node with this id
            if (result.length === 0) {
              dataParsed[i] = {};

              dataParsed[i].keyFirstNode = bucket[firstFirstBucketId];

              const value = bucket[nodeSizeId];

              // Don't show nodes under the value
              if ($scope.vis.params.minCutMetricSizeNode > value) {
                dataParsed.splice(i, 1);
                return;
              }

              dataParsed[i].valorSizeNode = value;
              dataParsed[i].nodeColorValue = 'default';
              dataParsed[i].nodeColorKey = 'default';
              if (!dataParsed[i].relationWithSecondNode) {
                dataParsed[i].relationWithSecondNode = [];
              }

              // Iterate rows and choose the edge size
              if (firstSecondBucketId) {
                let sizeEdgeVal = 0.1;

                if (edgeSizeId) {
                  sizeEdgeVal = bucket[edgeSizeId];
                }

                const relation = {
                  keySecondNode: bucket[firstSecondBucketId],
                  countMetric: bucket[nodeSizeId],
                  widthOfEdge: sizeEdgeVal,
                };
                dataParsed[i].relationWithSecondNode.push(relation);
              }

              if (colorBucketId) {
                if (colorDicc[bucket[colorBucketId]]) {
                  dataParsed[i].nodeColorKey = bucket[colorBucketId];
                  dataParsed[i].nodeColorValue = colorDicc[bucket[colorBucketId]];
                } else {
                  //repeat to find a NO-REPEATED color
                  while (true) {
                    const confirmColor = randomColor();
                    if (usedColors.indexOf(confirmColor) === -1) {
                      colorDicc[bucket[colorBucketId]] = confirmColor;
                      dataParsed[i].nodeColorKey = bucket[colorBucketId];
                      dataParsed[i].nodeColorValue = colorDicc[bucket[colorBucketId]];
                      usedColors.push(confirmColor);
                      break;
                    }
                  }
                }
              }

              let colorNodeFinal = $scope.vis.params.firstNodeColor;
              // Assign color and the content of the popup
              if (dataParsed[i].nodeColorValue !== 'default') {
                colorNodeFinal = dataParsed[i].nodeColorValue;
              }

              i++;

              // Return the node totally built
              const nodeReturn = {
                id: i,
                key: bucket[firstFirstBucketId],
                color: colorNodeFinal,
                shape: $scope.vis.params.shapeFirstNode,
                value: value,
                font: {
                  color: $scope.vis.params.labelColor,
                },
              };

              // If activated, show the labels
              if ($scope.vis.params.showLabels) {
                nodeReturn.label = bucket[firstFirstBucketId];
              }

              // If activated, show the popups
              if ($scope.vis.params.showPopup) {
                nodeReturn.title = getTooltipTitle(
                  primaryNodeTermName,
                  bucket[firstFirstBucketId],
                  nodeSizeTermName,
                  nodeReturn.value
                );
              }

              return nodeReturn;
            } else if (result.length === 1) {
              // we already have this node id in dataNodes, so update with new info
              const dataParsedNodeExist = result[0];
              //Iterate rows and choose the edge size
              if (firstSecondBucketId) {
                let sizeEdgeVal = 0.1;
                if (edgeSizeId) {
                  sizeEdgeVal = bucket[edgeSizeId];
                }

                const relation = {
                  keySecondNode: bucket[firstSecondBucketId],
                  countMetric: bucket[nodeSizeId],
                  widthOfEdge: sizeEdgeVal,
                };
                dataParsedNodeExist.relationWithSecondNode.push(relation);
              }
              return undefined;
            }
          });

          // Clean "undefined" out of the array
          dataNodes = dataNodes.filter(Boolean);

          // BUILDING EDGES AND SECONDARY NODES
          const dataEdges = [];
          for (let n = 0; n < dataParsed.length; n++) {
            // Find in the array the node with the keyFirstNode
            const result = $.grep(dataNodes, function(e) {
              return e.key === dataParsed[n].keyFirstNode;
            });
            if (result.length === 0) {
              console.log('Network Plugin Error: Node not found');
            } else if (result.length === 1) {
              // Found the node, access to its id
              if (firstSecondBucketId) {
                for (let r = 0; r < dataParsed[n].relationWithSecondNode.length; r++) {
                  // Find in the relations the second node to relate
                  const nodeOfSecondType = $.grep(dataNodes, function(e) {
                    return e.key === dataParsed[n].relationWithSecondNode[r].keySecondNode;
                  });

                  if (nodeOfSecondType.length === 0) {
                    // This is the first time this secondary node has been processed
                    i++;
                    const secondaryNode = {
                      id: i,
                      key: dataParsed[n].relationWithSecondNode[r].keySecondNode,
                      label: dataParsed[n].relationWithSecondNode[r].keySecondNode,
                      color: $scope.vis.params.secondNodeColor,
                      font: {
                        color: $scope.vis.params.labelColor,
                      },
                      shape: $scope.vis.params.shapeSecondNode,
                    };
                    if ($scope.vis.params.showPopup) {
                      secondaryNode.title = getTooltipTitle(
                        secondaryNodeTermName,
                        dataParsed[n].relationWithSecondNode[r].keySecondNode
                      );
                    }
                    // Add a new secondary node
                    dataNodes.push(secondaryNode);

                    // Create a new edge between a primary and secondary node
                    const edge = {
                      from: result[0].id,
                      to: dataNodes[dataNodes.length - 1].id,
                      value: dataParsed[n].relationWithSecondNode[r].widthOfEdge,
                    };
                    if ($scope.vis.params.showPopup && edgeSizeId) {
                      edge.title = getTooltipTitle(
                        edgeSizeTermName,
                        dataParsed[n].relationWithSecondNode[r].widthOfEdge
                      );
                    }
                    dataEdges.push(edge);
                  } else if (nodeOfSecondType.length === 1) {
                    // The secondary node being processed already exists,
                    //    only a new edge needs to be created
                    const enlace = {
                      from: result[0].id,
                      to: nodeOfSecondType[0].id,
                      value: dataParsed[n].relationWithSecondNode[r].widthOfEdge,
                    };
                    if ($scope.vis.params.showPopup && edgeSizeId) {
                      enlace.title = getTooltipTitle(
                        edgeSizeTermName,
                        dataParsed[n].relationWithSecondNode[r].widthOfEdge
                      );
                    }
                    dataEdges.push(enlace);
                  } else {
                    console.log('Network Plugin Error: Multiple nodes with same id found');
                  }
                }
              }
            } else {
              console.log('Network Plugin Error: Multiple nodes with same id found');
            }
          }

          const container = document.getElementById(networkId);
          // container.style.height = String(container.getBoundingClientRect().height);
          // container.height = String(container.getBoundingClientRect().height);
          const data = {
            nodes: dataNodes,
            edges: dataEdges,
          };

          // Options controlled by user directly
          const options1 = {
            // height: container.getBoundingClientRect().height.toString(),
            physics: {
              barnesHut: {
                gravitationalConstant: $scope.vis.params.gravitationalConstant,
                springConstant: $scope.vis.params.springConstant,
              },
            },
            edges: {
              arrowStrikethrough: false,
              smooth: {
                type: $scope.vis.params.smoothType,
              },
              scaling: {
                min: $scope.vis.params.minEdgeSize,
                max: $scope.vis.params.maxEdgeSize,
              },
            },
            nodes: {
              physics: $scope.vis.params.nodePhysics,
              scaling: {
                min: $scope.vis.params.minNodeSize,
                max: $scope.vis.params.maxNodeSize,
              },
            },
            layout: {
              improvedLayout: !(dataEdges.length > 200),
            },
            interaction: {
              hover: true,
              tooltipDelay: 50,
            },
            manipulation: {
              enabled: true,
            },
          };

          let options2 = null;

          switch ($scope.vis.params.posArrow) {
            case 'from':
              options2 = {
                edges: {
                  arrows: {
                    from: {
                      enabled: $scope.vis.params.displayArrow,
                      scaleFactor: $scope.vis.params.scaleArrow,
                      type: $scope.vis.params.shapeArrow,
                    },
                  },
                },
              };
              break;
            case 'middle':
              options2 = {
                edges: {
                  arrows: {
                    middle: {
                      enabled: $scope.vis.params.displayArrow,
                      scaleFactor: $scope.vis.params.scaleArrow,
                      type: $scope.vis.params.shapeArrow,
                    },
                  },
                },
              };
              break;
            case 'to':
              options2 = {
                edges: {
                  arrows: {
                    to: {
                      enabled: $scope.vis.params.displayArrow,
                      scaleFactor: $scope.vis.params.scaleArrow,
                      type: $scope.vis.params.shapeArrow,
                    },
                  },
                },
              };
              break;
            default:
              options2 = {
                edges: {
                  arrows: {
                    from: {
                      enabled: $scope.vis.params.displayArrow,
                      scaleFactor: $scope.vis.params.scaleArrow,
                      type: $scope.vis.params.shapeArrow,
                    },
                  },
                },
              };
              break;
          }

          const options = angular.merge(options1, options2);
          console.log('Network Plugin: Create network now');
          const network = new Network(container, data, options);

          network.on('afterDrawing', function() {
            $('#' + loadingId).hide();

            // Draw the color legend if Node Color is activated
            if (colorBucketId && $scope.vis.params.showColorLegend) {
              $scope.drawColorLegend(usedColors, colorDicc);
            }
          });

          // NODE-RELATION Type
        } else if (secondBucketId && !firstSecondBucketId) {
          $scope.initialShows();
          $('.secondNode').hide();

          if (colorBucketId) {
            // Check if "Node Color" is the last selection
            if (colorBucketId <= secondBucketId) {
              $scope.errorNodeColor();
              return;
            }
          }

          // DATA PARSED AND BUILDING NODES
          const dataParsed = [];
          // Iterate the buckets
          let i = 0;
          let dataNodes = buckets.map(function(bucket) {
            const result = $.grep(dataParsed, function(e) {
              return e.keyNode === bucket[firstFirstBucketId];
            });
            // first time we've parsed a node with this id
            if (result.length === 0) {
              dataParsed[i] = {};
              dataParsed[i].keyNode = bucket[firstFirstBucketId];

              const value = bucket[nodeSizeId];

              // Don't show nodes under the value
              if ($scope.vis.params.minCutMetricSizeNode > value) {
                dataParsed.splice(i, 1);
                return;
              }

              dataParsed[i].valorSizeNode = value;
              dataParsed[i].nodeColorValue = 'default';
              dataParsed[i].nodeColorKey = 'default';
              dataParsed[i].relationWithSecondField = [];

              // Add relation edges
              let sizeEdgeVal = 0.1;
              if (edgeSizeId) {
                sizeEdgeVal = bucket[edgeSizeId];
              }

              // Get the color of the node, save in the dictionary
              if (colorBucketId) {
                if (colorDicc[bucket[colorBucketId]]) {
                  dataParsed[i].nodeColorKey = bucket[colorBucketId];
                  dataParsed[i].nodeColorValue = colorDicc[bucket[colorBucketId]];
                } else {
                  // repeat to find a NO-REPEATED color
                  while (true) {
                    const confirmColor = randomColor();
                    if (usedColors.indexOf(confirmColor) === -1) {
                      colorDicc[bucket[colorBucketId]] = confirmColor;
                      dataParsed[i].nodeColorKey = bucket[colorBucketId];
                      dataParsed[i].nodeColorValue = colorDicc[bucket[colorBucketId]];
                      usedColors.push(confirmColor);
                      break;
                    }
                  }
                }
              }

              const relation = {
                keyRelation: bucket[secondBucketId],
                countMetric: bucket[nodeSizeId],
                widthOfEdge: sizeEdgeVal,
              };
              dataParsed[i].relationWithSecondField.push(relation);

              let colorNodeFinal = $scope.vis.params.firstNodeColor;
              if (dataParsed[i].nodeColorValue !== 'default') {
                colorNodeFinal = dataParsed[i].nodeColorValue;
              }

              i++;

              // Return the node totally built
              const nodeReturn = {
                id: i,
                key: bucket[firstFirstBucketId],
                color: colorNodeFinal,
                shape: $scope.vis.params.shapeFirstNode,
                value: value,
                font: {
                  color: $scope.vis.params.labelColor,
                },
              };

              // If activated, show the labels
              if ($scope.vis.params.showLabels) {
                nodeReturn.label = bucket[firstFirstBucketId];
              }

              // If activated, show the popups
              if ($scope.vis.params.showPopup) {
                nodeReturn.title = getTooltipTitle(
                  primaryNodeTermName,
                  bucket[firstFirstBucketId],
                  nodeSizeTermName,
                  nodeReturn.value
                );
              }

              return nodeReturn;
            } else if (result.length === 1) {
              // we already have this node id in dataNodes, so update with new info
              const dataParsedNodeExist = result[0];
              let sizeEdgeVal = 0.1;
              if (edgeSizeId) {
                sizeEdgeVal = bucket[edgeSizeId];
              }

              const relation = {
                keyRelation: bucket[secondBucketId],
                countMetric: bucket[nodeSizeId],
                widthOfEdge: sizeEdgeVal,
              };
              dataParsedNodeExist.relationWithSecondField.push(relation);
              return undefined;
            }
          });

          // BUILDING EDGES
          // Clean "undefinded" in the array
          dataNodes = dataNodes.filter(Boolean);
          const dataEdges = [];

          // Iterate parsed nodes
          for (let n = 0; n < dataParsed.length; n++) {
            // Obtain id of the node
            const NodoFrom = $.grep(dataNodes, function(e) {
              return e.key === dataParsed[n].keyNode;
            });
            if (NodoFrom.length === 0) {
              console.log('Network Plugin Error: Node not found');
            } else if (NodoFrom.length === 1) {
              const idFrom = NodoFrom[0].id;
              // Iterate relations that have with the second field selected
              for (let p = 0; p < dataParsed[n].relationWithSecondField.length; p++) {
                // Iterate again the nodes
                for (let z = 0; z < dataParsed.length; z++) {
                  // Check that we don't compare the same node
                  if (dataParsed[n] !== dataParsed[z]) {
                    const NodoTo = $.grep(dataNodes, function(e) {
                      return e.key === dataParsed[z].keyNode;
                    });
                    if (NodoTo.length === 0) {
                      console.log('Network Plugin Error: Node not found');
                    } else if (NodoTo.length === 1) {
                      const idTo = NodoTo[0].id;
                      // Have relation?
                      const sameRelation = $.grep(dataParsed[z].relationWithSecondField, function(
                        e
                      ) {
                        return (
                          e.keyRelation === dataParsed[n].relationWithSecondField[p].keyRelation
                        );
                      });
                      if (sameRelation.length === 1) {
                        // Nodes have a relation, creating the edge
                        const edgeExist = $.grep(dataEdges, function(e) {
                          return (
                            (e.to === idFrom && e.from === idTo) ||
                            (e.to === idTo && e.from === idFrom)
                          );
                        });
                        if (edgeExist.length === 0) {
                          // The size of the edge is the total of the common
                          const sizeEdgeTotal =
                            sameRelation[0].widthOfEdge +
                            dataParsed[n].relationWithSecondField[p].widthOfEdge;
                          const edge = {
                            from: idFrom,
                            to: idTo,
                            value: sizeEdgeTotal,
                          };
                          dataEdges.push(edge);
                        }
                      }
                    } else {
                      console.log('Network Plugin Error: Multiples nodes with same id found');
                    }
                  }
                }
              }
            } else {
              console.log('Network Plugin Error: Multiples nodes with same id found');
            }
          }

          // Creation of the network
          const container = document.getElementById(networkId);
          // Set the Height
          // container.style.height = String(container.getBoundingClientRect().height);
          // container.height = String(container.getBoundingClientRect().height);
          // Set the Data
          const data = {
            nodes: dataNodes,
            edges: dataEdges,
          };
          // Set the Options
          const options = {
            // height: container.getBoundingClientRect().height.toString(),
            physics: {
              barnesHut: {
                gravitationalConstant: $scope.vis.params.gravitationalConstant,
                springConstant: $scope.vis.params.springConstant,
                springLength: 500,
              },
            },
            edges: {
              arrows: {
                to: {
                  enabled: $scope.vis.params.displayArrow,
                  scaleFactor: $scope.vis.params.scaleArrow,
                  type: $scope.vis.params.shapeArrow,
                },
              },
              arrowStrikethrough: false,
              smooth: {
                type: $scope.vis.params.smoothType,
              },
              scaling: {
                min: $scope.vis.params.minEdgeSize,
                max: $scope.vis.params.maxEdgeSize,
              },
            },
            interaction: {
              hideEdgesOnDrag: true,
              hover: true,
              tooltipDelay: 100,
            },
            nodes: {
              physics: $scope.vis.params.nodePhysics,
              scaling: {
                min: $scope.vis.params.minNodeSize,
                max: $scope.vis.params.maxNodeSize,
              },
            },
            layout: {
              improvedLayout: false,
            },
            manipulation: {
              enabled: true,
            },
          };

          console.log('Network Plugin: Create network now');
          const network = new Network(container, data, options);

          network.on('afterDrawing', function() {
            $('#' + loadingId).hide();
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
