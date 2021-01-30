/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import _ from 'lodash';

import randomColor from 'randomcolor';
import { Network } from 'vis-network';
import $ from 'jquery';

import AggConfigResult from './data_load/agg_config_result';
import { getNotifications, getFormatService } from './services';

// KbnNetworkVis AngularJS controller
function KbnNetworkVisController($scope, config, $timeout) {

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

  $scope.$watchMulti(['esResponse', 'visParams'], function([resp]) {
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
        return resp.tables[0].columns.find(function(col) {
          return col.id.split('-')[2] === aggId;
        }).id;
      };

      function getColumnNameFromColumnId(columnId) {
        return resp.tables[0].columns.find(colObj => colObj.id === columnId).name;
      }

      resp.aggs.aggs.forEach(agg => {
        if (agg.schema === 'first') {
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
        } else if (agg.schema === 'second') {
          secondBucketId = getColumnIdByAggId(agg.id);
        } else if (agg.schema === 'colornode') {
          colorBucketId = getColumnIdByAggId(agg.id);
        } else if (agg.schema === 'size_node') {
          nodeSizeId = getColumnIdByAggId(agg.id);
          nodeSizeTermName = getColumnNameFromColumnId(nodeSizeId);
        } else if (agg.schema === 'size_edge') {
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
      const buckets = resp.tables[0].rows;
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
              if ($scope.visParams.minCutMetricSizeNode > value) {
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

              let colorNodeFinal = $scope.visParams.firstNodeColor;
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
                shape: $scope.visParams.shapeFirstNode,
                value: value,
                font: {
                  color: $scope.visParams.labelColor,
                },
              };

              // If activated, show the labels
              if ($scope.visParams.showLabels) {
                nodeReturn.label = bucket[firstFirstBucketId];
              }

              // If activated, show the popups
              if ($scope.visParams.showPopup) {
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
                      color: $scope.visParams.secondNodeColor,
                      font: {
                        color: $scope.visParams.labelColor,
                      },
                      shape: $scope.visParams.shapeSecondNode,
                    };
                    if ($scope.visParams.showPopup) {
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
                    if ($scope.visParams.showPopup && edgeSizeId) {
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
                    if ($scope.visParams.showPopup && edgeSizeId) {
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
                gravitationalConstant: $scope.visParams.gravitationalConstant,
                springConstant: $scope.visParams.springConstant,
              },
            },
            edges: {
              arrowStrikethrough: false,
              smooth: {
                type: $scope.visParams.smoothType,
              },
              scaling: {
                min: $scope.visParams.minEdgeSize,
                max: $scope.visParams.maxEdgeSize,
              },
            },
            nodes: {
              physics: $scope.visParams.nodePhysics,
              scaling: {
                min: $scope.visParams.minNodeSize,
                max: $scope.visParams.maxNodeSize,
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

          switch ($scope.visParams.posArrow) {
            case 'from':
              options2 = {
                edges: {
                  arrows: {
                    from: {
                      enabled: $scope.visParams.displayArrow,
                      scaleFactor: $scope.visParams.scaleArrow,
                      type: $scope.visParams.shapeArrow,
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
                      enabled: $scope.visParams.displayArrow,
                      scaleFactor: $scope.visParams.scaleArrow,
                      type: $scope.visParams.shapeArrow,
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
                      enabled: $scope.visParams.displayArrow,
                      scaleFactor: $scope.visParams.scaleArrow,
                      type: $scope.visParams.shapeArrow,
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
                      enabled: $scope.visParams.displayArrow,
                      scaleFactor: $scope.visParams.scaleArrow,
                      type: $scope.visParams.shapeArrow,
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
            if (colorBucketId && $scope.visParams.showColorLegend) {
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
              if ($scope.visParams.minCutMetricSizeNode > value) {
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

              let colorNodeFinal = $scope.visParams.firstNodeColor;
              if (dataParsed[i].nodeColorValue !== 'default') {
                colorNodeFinal = dataParsed[i].nodeColorValue;
              }

              i++;

              // Return the node totally built
              const nodeReturn = {
                id: i,
                key: bucket[firstFirstBucketId],
                color: colorNodeFinal,
                shape: $scope.visParams.shapeFirstNode,
                value: value,
                font: {
                  color: $scope.visParams.labelColor,
                },
              };

              // If activated, show the labels
              if ($scope.visParams.showLabels) {
                nodeReturn.label = bucket[firstFirstBucketId];
              }

              // If activated, show the popups
              if ($scope.visParams.showPopup) {
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
                gravitationalConstant: $scope.visParams.gravitationalConstant,
                springConstant: $scope.visParams.springConstant,
                springLength: 500,
              },
            },
            edges: {
              arrows: {
                to: {
                  enabled: $scope.visParams.displayArrow,
                  scaleFactor: $scope.visParams.scaleArrow,
                  type: $scope.visParams.shapeArrow,
                },
              },
              arrowStrikethrough: false,
              smooth: {
                type: $scope.visParams.smoothType,
              },
              scaling: {
                min: $scope.visParams.minEdgeSize,
                max: $scope.visParams.maxEdgeSize,
              },
            },
            interaction: {
              hideEdgesOnDrag: true,
              hover: true,
              tooltipDelay: 100,
            },
            nodes: {
              physics: $scope.visParams.nodePhysics,
              scaling: {
                min: $scope.visParams.minNodeSize,
                max: $scope.visParams.maxNodeSize,
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
            if (colorBucketId && $scope.visParams.showColorLegend) {
              $scope.drawColorLegend(usedColors, colorDicc);
            }
          });
        } else {
          $scope.errorNodeNodeRelation();
        }
      });
    }
  });


//   class KbnNetworkError {
//     constructor(message) {
//       this.message = message;
//     }
//   }

//   const getConfig = (...args) => config.get(...args);

//   handlebars.registerHelper('encodeURIComponent', encodeURIComponent);

//   // controller methods

//   const createTemplateContext = function (column, row, totalHits, table) {

//     // inject column value references
//     const templateContext = { total: totalHits };
//     _.forEach(column.template.paramsCols, function (templateParamCol) {
//       templateContext[`col${templateParamCol}`] = row[templateParamCol].value;
//     });

//     // inject column total references
//     _.forEach(column.template.paramsTotals, function (templateParamTotal) {
//       if (table.columns[templateParamTotal].total === undefined) {
//         table.columns[templateParamTotal].total = computeColumnTotal(templateParamTotal, column.template.totalFunc, table);
//       }
//       templateContext[`total${templateParamTotal}`] = table.columns[templateParamTotal].total;
//     });

//     return templateContext;
//   };

//   const findSplitColIndex = function (table) {
//     if (table !== null) {
//       return _.findIndex(table.columns, col => col.aggConfig.schema === 'splitcols');
//     }
//     else {
//       return -1;
//     }
//   };

//   const getRealColIndex = function (colIndex, splitColIndex) {
//     if (splitColIndex !== -1 && colIndex >= splitColIndex && $scope.vis.params.computedColsPerSplitCol) {
//       return colIndex + 1;
//     }
//     else {
//       return colIndex;
//     }
//   };

//   const getOriginalColIndex = function (colIndex, splitColIndex) {
//     if (splitColIndex !== -1 && colIndex > splitColIndex && $scope.vis.params.computedColsPerSplitCol) {
//       return colIndex - 1;
//     }
//     else {
//       return colIndex;
//     }
//   };

//   const findColIndexByTitle = function (columns, colTitle, input, inputType, splitColIndex) {

//     let columnIndex = -1;
//     for (let i = 0; i < columns.length; i++) {
//       if (columns[i].title === colTitle) {
//         columnIndex = i;
//         break;
//       }
//     }

//     if (columnIndex !== -1) {
//       return getOriginalColIndex(columnIndex, splitColIndex);
//     }
//     else {
//       throw new KbnNetworkError(`Column with label '${colTitle}' does not exist, in ${inputType}: ${input}`);
//     }
//   };

//   const createFormula = function (inputFormula, formulaType, splitColIndex, columns, totalFunc) {

//     if (!inputFormula) {
//       return undefined;
//     }

//     let realFormula = inputFormula;

//     // convert col[0] syntax to col0 syntax
//     realFormula = realFormula.replace(/col\[(\d+)\]/g, 'col$1');

//     // convert col['colTitle'] syntax to col0 syntax
//     realFormula = realFormula.replace(/col\['([^\]]+)'\]/g, (match, colTitle) => 'col' + findColIndexByTitle(columns, colTitle, inputFormula, formulaType, splitColIndex));

//     // set the right column index, depending splitColIndex
//     const colRefRegex = /col(\d+)/g;
//     realFormula = realFormula.replace(colRefRegex, (match, colIndex) => 'col' + getRealColIndex(parseInt(colIndex), splitColIndex));

//     // extract formula param cols
//     const formulaParamsCols = [];
//     const currentCol = columns.length;
//     let regexMatch;
//     while ((regexMatch = colRefRegex.exec(realFormula)) !== null) {
//       let colIndex = parseInt(regexMatch[1]);
//       if (colIndex >= currentCol) {
//         colIndex = getOriginalColIndex(colIndex, splitColIndex);
//         throw new KbnNetworkError(`Column number ${colIndex} does not exist, in ${formulaType}: ${inputFormula}`);
//       }
//       formulaParamsCols.push(colIndex);
//     }

//     // convert total[0] syntax to total0 syntax
//     realFormula = realFormula.replace(/total\[(\d+)\]/g, 'total$1');

//     // convert total['colTitle'] syntax to total0 syntax
//     realFormula = realFormula.replace(/total\['([^\]]+)'\]/g, (match, colTitle) => 'total' + findColIndexByTitle(columns, colTitle, inputFormula, formulaType, splitColIndex));

//     // set the right total index, depending splitColIndex
//     const totalRefRegex = /total(\d+)/g;
//     realFormula = realFormula.replace(totalRefRegex, (match, colIndex) => 'total' + getRealColIndex(parseInt(colIndex), splitColIndex));

//     // add 'row' param for functions that require whole row
//     realFormula = realFormula.replace(/(col)\s*\(/g, '$1(row, ');
//     realFormula = realFormula.replace(/(sumSplitCols)\s*\(/g, '$1(row');

//     // check 'sumSplitCols/countSplitCols' functions condition
//     if ((realFormula.indexOf('sumSplitCols') !== -1 || realFormula.indexOf('countSplitCols') !== -1) && splitColIndex === -1) {
//       throw new KbnNetworkError(`sumSplitCols() and countSplitCols() functions must be used with a "Split cols" bucket, in ${formulaType}: ${inputFormula}`);
//     }

//     // extract formula param totals
//     const formulaParamsTotals = [];
//     while ((regexMatch = totalRefRegex.exec(realFormula)) !== null) {
//       let colIndex = parseInt(regexMatch[1]);
//       if (colIndex >= currentCol) {
//         colIndex = getOriginalColIndex(colIndex, splitColIndex);
//         throw new KbnNetworkError(`Column number ${colIndex} does not exist, in ${formulaType}: ${inputFormula}`);
//       }
//       formulaParamsTotals.push(colIndex);
//     }

//     // create formula parser with custom functions
//     const parser = new Parser();
//     parser.functions.now = function () {
//       return Date.now();
//     };
//     parser.functions.indexOf = function (strOrArray, searchValue, fromIndex) {
//       return strOrArray.indexOf(searchValue, fromIndex);
//     };
//     parser.functions.lastIndexOf = function (strOrArray, searchValue, fromIndex) {
//       if (fromIndex) {
//         return strOrArray.lastIndexOf(searchValue, fromIndex);
//       }
//       else {
//         return strOrArray.lastIndexOf(searchValue);
//       }
//     };
//     parser.functions.replace = function (str, substr, newSubstr) {
//       return str.replace(substr, newSubstr);
//     };
//     parser.functions.replaceRegexp = function (str, regexp, newSubstr) {
//       return str.replace(new RegExp(regexp, 'g'), newSubstr);
//     };
//     parser.functions.search = function (str, regexp) {
//       return str.search(regexp);
//     };
//     parser.functions.substring = function (str, indexStart, indexEnd) {
//       return str.substring(indexStart, indexEnd);
//     };
//     parser.functions.toLowerCase = function (str) {
//       return str.toLowerCase();
//     };
//     parser.functions.toUpperCase = function (str) {
//       return str.toUpperCase();
//     };
//     parser.functions.trim = function (str) {
//       return str.trim();
//     };
//     parser.functions.encodeURIComponent = function (str) {
//       return encodeURIComponent(str);
//     };
//     parser.functions.sort = function (array, compareFunction) {
//       if (!Array.isArray(array)) {
//         array = [array];
//       }
//       return array.sort(compareFunction);
//     };
//     parser.functions.uniq = function (array) {
//       if (!Array.isArray(array)) {
//         array = [array];
//       }
//       return _.uniq(array);
//     };
//     parser.functions.isArray = function (value) {
//       return Array.isArray(value);
//     };
//     parser.functions.col = function (row, colRef, defaultValue) {
//       try {
//         let colIndex = colRef;
//         if (typeof colRef === 'string') {
//           colIndex = findColIndexByTitle(columns, colRef, inputFormula, formulaType, splitColIndex);
//         }
//         if (colIndex < currentCol) {
//           colIndex = getRealColIndex(colIndex, splitColIndex);
//           const colValue = row[colIndex].value;
//           return colValue !== undefined ? colValue : defaultValue;
//         }
//         else {
//           return defaultValue;
//         }
//       }
//       catch (e) {
//         return defaultValue;
//       }
//     };
//     parser.functions.sumSplitCols = function (row) {
//       let splitCol = splitColIndex;
//       let sum = 0;
//       while (splitCol < currentCol && columns[splitCol].formula === undefined) {
//         sum += row[splitCol].value;
//         splitCol++;
//       }
//       return sum;
//     };
//     parser.functions.countSplitCols = function () {
//       let splitCol = splitColIndex;
//       let count = 0;
//       while (splitCol < currentCol && columns[splitCol].formula === undefined) {
//         count++;
//         splitCol++;
//       }
//       return count;
//     };

//     // parse formula and return final formula object
//     try {
//       return {
//         expression: parser.parse(realFormula),
//         paramsCols: formulaParamsCols,
//         paramsTotals: formulaParamsTotals,
//         totalFunc: totalFunc,
//         formulaType: formulaType,
//         inputFormula: inputFormula
//       };
//     }
//     catch (e) {
//       throw new KbnNetworkError(`${e.message}, invalid expression in ${formulaType}: ${inputFormula}`);
//     }
//   };

//   const computeFormulaValue = function (formula, row, totalHits, table, cellValue) {
//     try {
//       const formulaParams = { total: totalHits, row: row, value: cellValue };

//       // inject column value references
//       _.forEach(formula.paramsCols, function (formulaParamCol) {
//         formulaParams[`col${formulaParamCol}`] = row[formulaParamCol].value;
//       });

//       // inject column total references
//       _.forEach(formula.paramsTotals, function (formulaParamTotal) {
//         if (table.columns[formulaParamTotal].total === undefined) {
//           table.columns[formulaParamTotal].total = computeColumnTotal(formulaParamTotal, formula.totalFunc, table);
//         }
//         formulaParams[`total${formulaParamTotal}`] = table.columns[formulaParamTotal].total;
//       });

//       const value = formula.expression.evaluate(formulaParams);
//       return value;
//     }
//     catch (e) {
//       throw new KbnNetworkError(`${e.message}, invalid expression in ${formula.formulaType}: ${formula.inputFormula}`);
//     }
//   };

//   const createTemplate = function (computedColumn, splitColIndex, columns, totalFunc) {

//     if (!computedColumn.applyTemplate) {
//       return undefined;
//     }

//     // convert old col.i.value syntax and manage 'split cols' case
//     let realTemplate = computedColumn.template.replace(/col\.(\d+)\.value\s*\}\}/g, 'col$1}}');

//     // convert col[0] syntax to col0 syntax
//     realTemplate = realTemplate.replace(/col\[(\d+)\]\s*\}\}/g, 'col$1}}');

//     // convert col['colTitle'] syntax to col0 syntax
//     realTemplate = realTemplate.replace(/col\['([^\]]+)'\]\s*\}\}/g, (match, colTitle) => 'col' + findColIndexByTitle(columns, colTitle, computedColumn.template, 'template', splitColIndex) + '}}');

//     // set the right column index, depending splitColIndex
//     const colRefRegex = /col(\d+)\s*\}\}/g;
//     realTemplate = realTemplate.replace(colRefRegex, (match, colIndex) => 'col' + getRealColIndex(parseInt(colIndex), splitColIndex) + '}}');

//     // add template param cols
//     const templateParamsCols = [];
//     let regexMatch;
//     while ((regexMatch = colRefRegex.exec(realTemplate)) !== null) {
//       const colIndex = parseInt(regexMatch[1]);
//       templateParamsCols.push(colIndex);
//     }

//     // convert total[0] syntax to total0 syntax
//     realTemplate = realTemplate.replace(/total\[(\d+)\]\s*\}\}/g, 'total$1}}');

//     // convert total['colTitle'] syntax to total0 syntax
//     realTemplate = realTemplate.replace(/total\['([^\]]+)'\]\s*\}\}/g, (match, colTitle) => 'total' + findColIndexByTitle(columns, colTitle, computedColumn.template, 'template', splitColIndex) + '}}');

//     // set the right total index, depending splitColIndex
//     const totalRefRegex = /total(\d+)\s*\}\}/g;
//     realTemplate = realTemplate.replace(totalRefRegex, (match, colIndex) => 'total' + getRealColIndex(parseInt(colIndex), splitColIndex) + '}}');

//     // add template param totals
//     const templateParamsTotals = [];
//     while ((regexMatch = totalRefRegex.exec(realTemplate)) !== null) {
//       const colIndex = parseInt(regexMatch[1]);
//       templateParamsTotals.push(colIndex);
//     }

//     // return final template object
//     return {
//       compiledTemplate: handlebars.compile(realTemplate),
//       paramsCols: templateParamsCols,
//       paramsTotals: templateParamsTotals,
//       totalFunc: totalFunc
//     };
//   };

//   const renderCell = function (contentType) {
//     let result = this.column.fieldFormatter.convert(this.value);
//     if (this.templateContext !== undefined) {
//       this.templateContext.value = result;
//       result = this.column.template.compiledTemplate(this.templateContext);
//     }
//     if (contentType !== 'html') {
//       result = result.replace(/<(?:.|\n)*?>/gm, '');
//     }
//     else {
//       result = { 'markup': result, 'class': this.column.dataAlignmentClass };
//     }
//     return result;
//   };

//   /** create a new data table column for specified computed column */
//   const createColumn = function (computedColumn, index, totalHits, splitColIndex, columns, showTotal, totalFunc, aggs) {

//     const fieldFormats = getFormatService();
//     const FieldFormat = fieldFormats.getType(computedColumn.format);
//     const fieldFormatParamsByFormat = {
//       'string': {},
//       'number': { pattern: computedColumn.pattern },
//       'date': { pattern: computedColumn.datePattern }
//     };
//     const fieldFormatParams = fieldFormatParamsByFormat[computedColumn.format];
//     const aggSchema = (computedColumn.format === 'number') ? 'metric' : 'bucket';
//     const aggType = (computedColumn.format === 'number') ? 'count' : 'filter';

//     // create new column object
//     const newColumn = {
//       id: `computed-col-${index}`,
//       aggConfig: aggs.createAggConfig({ schema: aggSchema, type: aggType }),
//       title: computedColumn.label,
//       fieldFormatter: new FieldFormat(fieldFormatParams, getConfig),
//       dataAlignmentClass: `text-${computedColumn.alignment}`,
//       formula: createFormula(computedColumn.formula, 'computed column', splitColIndex, columns, totalFunc),
//       template: createTemplate(computedColumn, splitColIndex, columns, totalFunc),
//       cellComputedCssFormula: createFormula(computedColumn.cellComputedCss, 'Cell computed CSS', splitColIndex, columns, totalFunc)
//     };

//     // check that computed column formula is defined
//     if (newColumn.formula === undefined) {
//       throw new KbnNetworkError(`Computed column 'Formula' is required`);
//     }

//     // remove the created AggConfig from real aggs
//     aggs.aggs.pop();

//     // define aggConfig identifiers
//     newColumn.aggConfig.id = `1.computed-column-${index}`;
//     newColumn.aggConfig.key = `computed-column-${index}`;

//     // if computed column formula is just a simple column reference (ex: col0), then copy its aggConfig to get filtering feature
//     const simpleColRefMatch = newColumn.formula.expression.toString().match(/^\s*col(\d+)\s*$/);
//     if (simpleColRefMatch) {
//       const simpleColRefIndex = simpleColRefMatch[1];
//       const simpleColRef = columns[simpleColRefIndex];
//       if (simpleColRef.aggConfig.isFilterable()) {
//         newColumn.aggConfig = simpleColRef.aggConfig;
//         newColumn.meta = simpleColRef.meta;
//       }
//     }

//     // add alignment options
//     if (computedColumn.applyAlignmentOnTotal) {
//       newColumn.totalAlignmentClass = newColumn.dataAlignmentClass;
//     }
//     if (computedColumn.applyAlignmentOnTitle) {
//       newColumn.titleAlignmentClass = newColumn.dataAlignmentClass;
//     }

//     // process "computeTotalUsingFormula" option
//     if (showTotal && computedColumn.computeTotalUsingFormula) {
//       const totalFormula = computedColumn.formula.replace(/col(\[|\d+)/g, 'total$1')
//         .replace(/col\s*\(\s*(\d+)[^)]*\)/g, 'total$1');
//       newColumn.totalFormula = createFormula(totalFormula, 'computed total', splitColIndex, columns, totalFunc);
//     }

//     // add "total" formatter function
//     newColumn.totalFormatter = function (contentType) {
//       return function (value) {
//         const self = { value: value, column: newColumn };
//         if (computedColumn.applyTemplate && computedColumn.applyTemplateOnTotal) {
//           self.templateContext = { total: totalHits };
//         }
//         return renderCell.call(self, contentType);
//       };
//     };

//     return newColumn;
//   };

//   const createComputedCell = function (column, row, totalHits, table) {
//     const value = computeFormulaValue(column.formula, row, totalHits, table);
//     const parent = row.length > 0 && row[row.length - 1];
//     const newCell = new AggConfigResult(column.aggConfig, parent, value, value);
//     newCell.column = column;
//     if (column.template !== undefined) {
//       newCell.templateContext = createTemplateContext(column, row, totalHits, table);
//     }
//     if (column.cellComputedCssFormula !== undefined) {
//       newCell.cssStyle = computeFormulaValue(column.cellComputedCssFormula, row, totalHits, table, value);
//     }
//     newCell.toString = renderCell;
//     return newCell;
//   };

//   const addComputedColumnToTables = function (tables, index, newColumn, totalHits) {
//     _.forEach(tables, function (table) {
//       if (table.tables) {
//         addComputedColumnToTables(table.tables, index, newColumn, totalHits);
//         return;
//       }

//       // add new computed column and its cells
//       newColumn = _.clone(newColumn);
//       table.columns.push(newColumn);
//       _.forEach(table.rows, function (row) {
//         const newCell = createComputedCell(newColumn, row, totalHits, table);
//         row.push(newCell);
//         row[newColumn.id] = newCell.value;
//       });

//       // compute total if totalFormula is present
//       if (newColumn.totalFormula) {
//         newColumn.total = computeFormulaValue(newColumn.totalFormula, null, totalHits, table);
//       }

//     });
//   };

//   const processLinesComputedFilter = function (tables, linesComputedFilterFormula, totalHits) {
//     return _.filter(tables, function (table) {
//       if (table.tables) {
//         table.tables = processLinesComputedFilter(table.tables, linesComputedFilterFormula, totalHits);
//         return table.tables.length > 0;
//       }

//       table.rows = _.filter(table.rows, function (row) {
//         return computeFormulaValue(linesComputedFilterFormula, row, totalHits, table);
//       });
//       return table.rows.length > 0;
//     });
//   };

//   const processRowsComputedCss = function (table, rowsComputedCssFormula, totalHits) {
//     if (table.tables) {
//       table.tables.forEach(function (subTable) {
//         processRowsComputedCss(subTable, rowsComputedCssFormula, totalHits);
//       });
//     }
//     else {
//       table.rows.forEach(function (row) {
//         row.cssStyle = computeFormulaValue(rowsComputedCssFormula, row, totalHits, table);
//       });
//     }
//   };

//   const processRowsComputedOptions = function (tableGroups, columns, params, splitColIndex, totalHits) {
//     // process lines computed filter
//     if (params.linesComputedFilter) {
//       const linesComputedFilterFormula = createFormula(params.linesComputedFilter, 'Rows computed filter', splitColIndex, columns, params.totalFunc);
//       tableGroups.tables = processLinesComputedFilter(tableGroups.tables, linesComputedFilterFormula, totalHits);
//     }

//     // process rows computed CSS
//     if (params.rowsComputedCss) {
//       const rowsComputedCssFormula = createFormula(params.rowsComputedCss, 'Rows computed CSS', splitColIndex, columns, params.totalFunc);
//       processRowsComputedCss(tableGroups, rowsComputedCssFormula, totalHits);
//     }
//   };

//   const isInt = (item) => {
//     return /^ *[0-9]+ *$/.test(item);
//   };

//   const hideColumns = function (tables, hiddenColumns, splitColIndex) {
//     // recursively call sub-tables
//     _.forEach(tables, function (table) {
//       if (table.tables) {
//         hideColumns(table.tables, hiddenColumns, splitColIndex);
//         return;
//       }

//       if (splitColIndex !== -1 && table.rows.length > 0) {
//         table.refRowWithHiddenCols = _.clone(table.rows[0]);
//       }

//       // retrieve real col indices
//       let hiddenColumnIndices = _.map(hiddenColumns, function (item) {
//         try {
//           if (!isInt(item)) {
//             item = findColIndexByTitle(table.columns, item, item, 'hidden column', splitColIndex);
//           }
//           return getRealColIndex(parseInt(item), splitColIndex);
//         }
//         catch (e) {
//           return table.columns.length;
//         }
//       });

//       // sort from higher to lower index and keep uniq indices
//       hiddenColumnIndices = _.uniq(hiddenColumnIndices.sort((a, b) => b - a));

//       // remove hidden columns
//       _.forEach(hiddenColumnIndices, function (colToRemove) {
//         if (colToRemove < table.columns.length) {
//           table.columns.splice(colToRemove, 1);
//           _.forEach(table.rows, function (row) {
//             row.splice(colToRemove, 1);
//           });
//         }
//       });
//     });
//   };

//   const shouldShowPagination = function (tables, perPage) {
//     return tables.some(function (table) {
//       if (table.tables) {
//         return shouldShowPagination(table.tables, perPage);
//       }
//       else {
//         return table.rows.length > perPage;
//       }
//     });
//   };

//   const rowContainsFilterTerm = function (row, termToFind, filterCaseSensitive) {
//     return row.some(function (cell) {
//       if (cell.column && cell.column.id === 'add-row-numbers-col') {
//         return false;
//       }
//       let cellValue = cell.toString();
//       if (typeof cellValue === 'string') {
//         if (!filterCaseSensitive) {
//           cellValue = cellValue.toLowerCase();
//         }
//         return cellValue.includes(termToFind);
//       }
//       return false;
//     });
//   };

//   const filterTableRows = function (tables, activeFilterTerms, filterCaseSensitive) {
//     const filteredTables = _.map(tables, (table) => _.clone(table));
//     return _.filter(filteredTables, function (table) {
//       if (table.tables) {
//         table.tables = filterTableRows(table.tables, activeFilterTerms, filterCaseSensitive);
//         return table.tables.length > 0;
//       }
//       else {
//         table.rows = _.filter(table.rows, function (row) {
//           return activeFilterTerms.every(function (filterTerm) {
//             return rowContainsFilterTerm(row, filterTerm, filterCaseSensitive);
//           });
//         });
//         return table.rows.length > 0;
//       }
//     });
//   };

//   const findFirstDataTable = function (table) {
//     if (table.tables) {
//       if (table.tables.length > 0) {
//         return findFirstDataTable(table.tables[0]);
//       }
//       else {
//         return null;
//       }
//     }
//     else {
//       return table;
//     }
//   };

//   const DEFAULT_METRIC_VALUE = 0;

//   const splitCols = function (table, splitColIndex, totalHits) {

//     // process only real tables (with rows)
//     if (table.tables) {
//       _.forEach(table.tables, function (table) {
//         splitCols(table, splitColIndex, totalHits);
//       });
//       return;
//     }

//     // define ref row for computed columns
//     const refRowForComputedColumn = (table.refRowWithHiddenCols !== undefined) ? table.refRowWithHiddenCols : _.clone(table.rows[0]);
//     for (let i = 0; i < refRowForComputedColumn.length; i++) {
//       const cell = refRowForComputedColumn[i];
//       if (cell.column !== undefined) {
//         refRowForComputedColumn[i] = createComputedCell(cell.column, refRowForComputedColumn, totalHits, table);
//       }
//       else if (cell.type === 'metric') {
//         refRowForComputedColumn[i] = new AggConfigResult(cell.aggConfig, null, DEFAULT_METRIC_VALUE, DEFAULT_METRIC_VALUE, cell.filters);
//       }
//     }

//     // initialize new column headers
//     const newCols = [];
//     for (let i = 0; i < splitColIndex; i++) {
//       newCols.push(table.columns[i]);
//     }

//     // compute new table rows
//     const newRows = [];
//     let newRow = null;
//     const newColNamePrefixes = [];
//     const newColDefaultMetrics = [];
//     const metricsCount = table.columns.length - 1 - splitColIndex;

//     _.forEach(table.rows, function (row) {

//       // detect if we should create a row
//       let createNewRow = (newRow === null);
//       if (!createNewRow) {
//         for (let i = 0; i < splitColIndex; i++) {
//           if (row[i].value !== newRow[i].value) {
//             createNewRow = true;
//             break;
//           }
//         }
//       }

//       // create a new row
//       if (createNewRow) {
//         newRow = [];
//         for (let i = 0; i < splitColIndex; i++) {
//           newRow.push(row[i]);
//           newRow[table.columns[i].id] = row[i].value;
//         }
//         newRows.push(newRow);
//       }

//       // split col
//       const rowSplitColValue = row[splitColIndex].toString();
//       let newColIndex = _.indexOf(newColNamePrefixes, rowSplitColValue);

//       // create new col
//       if (newColIndex === -1) {
//         newColNamePrefixes.push(rowSplitColValue);
//         newColIndex = newColNamePrefixes.length - 1;
//         for (let i = splitColIndex + 1; i < row.length; i++) {
//           const newCol = _.clone(table.columns[i]);
//           newCol.title = metricsCount > 1 ? rowSplitColValue + ' - ' + newCol.title : rowSplitColValue;
//           newCols.push(newCol);
//           let newColDefaultMetric;
//           if (newCol.formula === undefined) {
//             newColDefaultMetric = new AggConfigResult(row[i].aggConfig, null, DEFAULT_METRIC_VALUE, DEFAULT_METRIC_VALUE, row[i].filters);
//           }
//           else {
//             newColDefaultMetric = createComputedCell(newCol, refRowForComputedColumn, totalHits, table);
//           }
//           newColDefaultMetrics.push(newColDefaultMetric);
//           for (let j = 0; j < newRows.length - 1; j++) {
//             newRows[j].push(newColDefaultMetric);
//           }
//         }
//       }

//       // add new col metrics
//       for (let i = 0; i < metricsCount; i++) {
//         newRow[splitColIndex + (newColIndex * metricsCount) + i] = row[splitColIndex + 1 + i];
//       }
//       for (let i = 0; i < newColDefaultMetrics.length; i++) {
//         const targetCol = splitColIndex + i;
//         if (newRow[targetCol] === undefined) {
//           newRow[targetCol] = newColDefaultMetrics[i];
//         }
//       }
//     });

//     // update rows
//     table.rows = newRows;

//     // update cols
//     table.columns = newCols;
//   };

//   const notifyError = function (errorMessage) {
//     const title = $scope.vis.type.title + ' Error';
//     getNotifications().toasts.addDanger({ title, text: errorMessage });
//   };

//   const colToStringWithHighlightResults = function (initialToString, scope, contentType) {
//     let result = initialToString.call(this, contentType);
//     if ($scope.filterHighlightRegex !== null && contentType === 'html' && (!this.column || this.column.id !== 'add-row-numbers-col')) {
//       if (typeof result === 'string') {
//         result = { 'markup': result };
//       }
//       if (result.markup.indexOf('<span') === -1) {
//         result.markup = `<span>${result.markup}</span>`;
//       }
//       result.markup = result.markup.replace(/>([^<>]+)</g, function (match, group) {
//         return '>' + group.replace($scope.filterHighlightRegex, '<mark>$1</mark>') + '<';
//       });
//     }
//     return result;
//   };

//   const addRowNumberColumn = function (table, aggs) {
//     if (table.tables) {
//       table.tables.forEach(subTable => addRowNumberColumn(subTable, aggs));
//     }
//     else {
//       // add row number column in first position
//       const fieldFormats = getFormatService();
//       const fieldFormat = fieldFormats.getInstance('number');
//       const newColumn = {
//         id: 'add-row-numbers-col',
//         aggConfig: aggs.createAggConfig({ schema: 'bucket', type: 'filter' }),
//         title: '#',
//         fieldFormatter: fieldFormat,
//         dataAlignmentClass: 'text-left'
//       };
//       table.columns.unshift(newColumn);
//       let i = 1;
//       // add row number cells in first position
//       table.rows.forEach(row => {
//         const newCell = new AggConfigResult(newColumn.aggConfig, null, i, i);
//         newCell.column = newColumn;
//         newCell.toString = renderCell;
//         row.unshift(newCell);
//         row[newColumn.id] = newCell.value;
//         ++i;
//       });
//     }
//   };

//   // filter scope methods
//   $scope.doFilter = function () {
//     $scope.activeFilter = $scope.vis.filterInput;
//   };

//   $scope.enableFilterInput = function () {
//     $scope.filterInputEnabled = true;
//   };

//   $scope.disableFilterInput = function () {
//     $scope.filterInputEnabled = false;
//     $scope.activeFilter = $scope.vis.filterInput = '';
//   };

//   $scope.showFilterInput = function () {
//     return !$scope.visState.params.filterBarHideable || $scope.filterInputEnabled;
//   };

//   // init controller state
//   $scope.activeFilter = $scope.vis.filterInput = '';

//   const uiStateSort = ($scope.uiState) ? $scope.uiState.get('vis.params.sort') : {};
//   _.assign($scope.visParams.sort, uiStateSort);

//   $scope.sort = $scope.visParams.sort;
//   $scope.$watchCollection('sort', function (newSort) {
//     $scope.uiState.set('vis.params.sort', newSort);
//   });


//   /** process filter submitted by user and refresh displayed table */
//   const processFilterBarAndRefreshTable = function () {

//     if ($scope.tableGroups !== undefined) {
//       let tableGroups = $scope.esResponse;
//       const params = $scope.visParams;

//       // init filterInput & filterHighlightRegex
//       if ($scope.vis.filterInput === undefined) {
//         $scope.vis.filterInput = $scope.activeFilter;
//       }
//       $scope.filterHighlightRegex = null;

//       // process filter bar
//       if (params.showFilterBar && $scope.showFilterInput() && $scope.activeFilter !== undefined && $scope.activeFilter !== '') {

//         // compute activeFilterTerms
//         const activeFilter = params.filterCaseSensitive ? $scope.activeFilter : $scope.activeFilter.toLowerCase();
//         let activeFilterTerms = [activeFilter];
//         if (params.filterTermsSeparately) {
//           activeFilterTerms = activeFilter.replace(/ +/g, ' ').split(' ');
//         }

//         // compute filterHighlightRegex
//         if (params.filterHighlightResults) {
//           const filterHighlightRegexString = '(' + _.sortBy(activeFilterTerms, term => term.length * -1).map(term => _.escapeRegExp(term)).join('|') + ')';
//           $scope.filterHighlightRegex = new RegExp(filterHighlightRegexString, 'g' + (!params.filterCaseSensitive ? 'i' : ''));
//         }

//         // filter table rows to display
//         tableGroups = _.clone(tableGroups);
//         tableGroups.tables = filterTableRows(tableGroups.tables, activeFilterTerms, params.filterCaseSensitive);
//       }

//       // check if there are rows to display
//       const hasSomeRows = tableGroups.tables.some(function haveRows(table) {
//         if (table.tables) return table.tables.some(haveRows);
//         return table.rows.length > 0;
//       });

//       // set conditional css classes
//       const showPagination = hasSomeRows && params.perPage && shouldShowPagination(tableGroups.tables, params.perPage);
//       $scope.tableVisContainerClass = {
//         'hide-pagination': !showPagination,
//         'hide-export-links': params.hideExportLinks,
//         'striped-rows': params.stripedRows
//       };
//       $scope.isDarkTheme = getConfig('theme:darkMode');

//       // update $scope
//       $scope.hasSomeRows = hasSomeRows;
//       if (hasSomeRows) {
//         $scope.tableGroups = tableGroups;
//       }

//       // force render if 'Highlight results' is enabled
//       if (hasSomeRows && $scope.filterHighlightRegex !== null) {
//         tableGroups.tables.some(function cloneFirstRow(table) {
//           if (table.tables) return table.tables.some(cloneFirstRow);
//           if (table.rows.length > 0) {
//             const clonedRow = _.clone(table.rows[0]);
//             table.columns.forEach(function (column) {
//               if (table.rows[0][column.id] !== undefined) {
//                 clonedRow[column.id] = table.rows[0][column.id];
//               }
//             });
//             table.rows[0] = clonedRow;
//             return true;
//           }
//           return false;
//         });
//       }
//     }

//   };

//   // listen activeFilter field changes, to filter results
//   $scope.$watch('activeFilter', processFilterBarAndRefreshTable);


//   /**
//    * Recreate the entire table when:
//    * - the underlying data changes (esResponse)
//    * - one of the view options changes (vis.params)
//    */
//   $scope.$watch('renderComplete', function watchRenderComplete() {

//     try {

//       if ($scope.esResponse && $scope.esResponse.newResponse) {

//         // init tableGroups
//         $scope.hasSomeRows = null;
//         $scope.tableGroups = null;
//         $scope.esResponse.newResponse = false;
//         const tableGroups = $scope.esResponse;
//         const totalHits = $scope.esResponse.totalHits;
//         const aggs = $scope.esResponse.aggs;
//         const params = $scope.visParams;

//         // validate that 'Split cols' is the last bucket
//         const firstTable = findFirstDataTable(tableGroups);
//         let splitColIndex = findSplitColIndex(firstTable);
//         if (splitColIndex !== -1) {
//           const lastBucketIndex = _.findLastIndex(firstTable.columns, col => col.aggConfig.type.type === 'buckets');
//           if (splitColIndex !== lastBucketIndex) {
//             throw new KbnNetworkError('"Split cols" bucket must be the last one');
//           }
//         }

//         // no data to display
//         if (totalHits === 0 || firstTable === null) {
//           $scope.hasSomeRows = false;
//           return;
//         }

//         // process 'Split cols' bucket: transform rows to cols
//         if (splitColIndex !== -1 && !params.computedColsPerSplitCol) {
//           splitCols(tableGroups, splitColIndex, totalHits);
//         }

//         // add computed columns
//         _.forEach(params.computedColumns, function (computedColumn, index) {
//           if (computedColumn.enabled) {
//             const newColumn = createColumn(computedColumn, index, totalHits, splitColIndex, firstTable.columns, params.showTotal, params.totalFunc, aggs);
//             addComputedColumnToTables(tableGroups.tables, index, newColumn, totalHits);
//           }
//         });

//         // process rows computed options : lines computed filter and rows computed CSS (no split cols)
//         if (splitColIndex === -1) {
//           processRowsComputedOptions(tableGroups, firstTable.columns, params, splitColIndex, totalHits);
//         }

//         // remove hidden columns
//         if (params.hiddenColumns) {
//           hideColumns(tableGroups.tables, params.hiddenColumns.split(','), splitColIndex);
//         }

//         // process 'Split cols' bucket: transform rows to cols
//         if (splitColIndex !== -1 && params.computedColsPerSplitCol) {
//           splitColIndex = findSplitColIndex(firstTable);
//           splitCols(tableGroups, splitColIndex, totalHits);
//         }

//         // process rows computed options : lines computed filter and rows computed CSS (split cols)
//         if (splitColIndex !== -1) {
//           processRowsComputedOptions(tableGroups, firstTable.columns, params, -1, totalHits);
//         }

//         // add total label
//         if (params.showTotal && params.totalLabel !== '') {
//           tableGroups.tables.forEach(function setTotalLabel(table) {
//             if (table.tables)
//               table.tables.forEach(setTotalLabel);
//             else
//               table.totalLabel = params.totalLabel;
//           });
//         }

//         // add row number column
//         if (params.addRowNumberColumn) {
//           addRowNumberColumn(tableGroups, aggs);
//         }

//         // prepare filter highlight results rendering
//         if (params.showFilterBar && params.filterHighlightResults) {
//           tableGroups.tables.forEach(function redefineColToString(table) {
//             if (table.tables) {
//               table.tables.forEach(redefineColToString);
//             }
//             else {
//               table.rows.forEach(function (row) {
//                 row.forEach(function (col) {
//                   col.toString = colToStringWithHighlightResults.bind(col, col.toString, $scope);
//                 });
//               });
//             }
//           });
//         }

//         // process filter bar
//         processFilterBarAndRefreshTable();
//       }

//       $scope.renderComplete();

//     }
//     catch (e) {
//       if (e instanceof KbnNetworkError) {
//         notifyError(e.message);
//       }
//       else {
//         throw e;
//       }
//     }
//   });

}

export { KbnNetworkVisController };