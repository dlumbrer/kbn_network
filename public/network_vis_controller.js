define(function (require) {
  // get the kibana/table_vis module, and make sure that it requires the "kibana" module if it
  // didn't already
  const module = require('ui/modules').get('kibana/network_vis', ['kibana']);

  const visN = require('vis');
  const randomColor = require('randomcolor');
  const ElementQueries = require('css-element-queries/src/ElementQueries');
  const ResizeSensor = require('css-element-queries/src/ResizeSensor');


  // add a controller to tha module, which will transform the esResponse into a
  // tabular format that we can pass to the table directive
  module.controller('KbnNetworkVisController', function ($scope, $sce, Private) {
    //const tabifyAggResponse = Private(require('ui/agg_response/tabify/tabify'));

    $scope.errorNodeColor = function(){
      $("#mynetwork").hide();
      $("#loading").hide();
      $("#errorHtml").html("<h1><strong>ERROR</strong>: Node Color must be the LAST selection</h1>");
      $("#errorHtml").show();

    }


   $scope.$watchMulti(['esResponse', 'vis.params'], function ([resp]) {
      if (resp) {
        $("#loading").hide();
        if($scope.vis.aggs.bySchemaName['first'].length >= 1 && !$scope.vis.aggs.bySchemaName['second']){ //This is when we have 2 nodes
            $("#mynetwork").show();
            $("#loading").show();
            $("#errorHtml").hide();
            $(".secondNode").show();
            // Retrieve the id of the configured tags aggregation
            // El id de los buckets (que los hemos llamado tags) para luego buscarlos en resp.aggregations[id].buckets
            var firstFieldAggId = $scope.vis.aggs.bySchemaName['first'][0].id;
            if($scope.vis.aggs.bySchemaName['first'].length > 1){
              var secondFieldAggId = $scope.vis.aggs.bySchemaName['first'][1].id;
            }

            if($scope.vis.aggs.bySchemaName['colornode']){
              var colorNodeAggId = $scope.vis.aggs.bySchemaName['colornode'][0].id;
              var colorNodeAggName = $scope.vis.aggs.bySchemaName['colornode'][0].params.field.displayName;
              var colorDicc = {};
              var usedColors = [];
            }

            //Names of the terms that have been selected
            var firstFieldAggName = $scope.vis.aggs.bySchemaName['first'][0].params.field.displayName;
            if($scope.vis.aggs.bySchemaName['first'].length > 1){
              var secondFieldAggName = $scope.vis.aggs.bySchemaName['first'][1].params.field.displayName;
            }


            // Retrieve the metrics aggregation configured
            //Si hay mas de una metrica habría $scope.vis.aggs.bySchemaName['size_node'][x] siendo x=0,1,2 el numero de metricas que haya
            if($scope.vis.aggs.bySchemaName['size_node']){
              var metricsAgg_sizeNode = $scope.vis.aggs.bySchemaName['size_node'][0];
            }
            if($scope.vis.aggs.bySchemaName['size_edge']){
              var metricsAgg_sizeEdge = $scope.vis.aggs.bySchemaName['size_edge'][0];
            }

            console.log(metricsAgg_sizeNode);
            console.log(metricsAgg_sizeEdge);

            // Get the buckets of that aggregation
            // Saco los buckets con el id de los buckets sacado antes
            var buckets = resp.aggregations[firstFieldAggId].buckets;


            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            var dataParsed = [];
            // Iterando en cada bucket, osea en cada objeto me voy construyendo los nodos que son del primer nodo
            var i = 0;
            var dataNodes = buckets.map(function(bucket) {

              dataParsed[i] = {};
              dataParsed[i].keyFirstNode = bucket.key;


              //Las metricas son para el tamaño del nodo y enlaces
              if(metricsAgg_sizeNode){
                // Use the getValue function of the aggregation to get the value of a bucket -- IMPORTANTE, saco el valor de la metrica, que me da el tamaño del nodo de su respectivo bucket
                var value = metricsAgg_sizeNode.getValue(bucket);
                var sizeVal = Math.min($scope.vis.params.maxCutMetricSizeNode, value);

                //No show nodes under the value
                if($scope.vis.params.minCutMetricSizeNode > value){
                  return;
                }
              }else{
                var sizeVal = 20;
              }

              dataParsed[i].valorSizeNode = sizeVal;
              dataParsed[i].nodeColorValue = "default";
              dataParsed[i].nodeColorKey = "default";


              //Me recorro los subbuckets de cada keyFirstNode, que son los keySecondNodes que tiene relación, aquí es dodne busco el TAMAÑO DEL ENLACE
              if($scope.vis.aggs.bySchemaName['first'].length > 1){
                dataParsed[i].relationWithSecondNode = bucket[secondFieldAggId].buckets.map(function(buck) {
                  if(metricsAgg_sizeEdge){
                    var value_sizeEdge = metricsAgg_sizeEdge.getValue(buck);
                    var sizeEdgeVal = Math.min($scope.vis.params.maxCutMetricSizeEdge, value_sizeEdge);
                  }else{
                    var sizeEdgeVal = 0.1;
                  }

                  //Saco el color del nodo y guardo el color en el diccionario de colores para que no se repita
                  if(colorNodeAggId && buck[colorNodeAggId].buckets.length > 0){
                    if(colorDicc[buck[colorNodeAggId].buckets[0].key]){
                      dataParsed[i].nodeColorKey = buck[colorNodeAggId].buckets[0].key;
                      dataParsed[i].nodeColorValue = colorDicc[buck[colorNodeAggId].buckets[0].key];
                    }else{
                      //repito hasta encontrar un color NO utilizado
                      while(true){
                        var confirmColor = randomColor();
                        if(usedColors.indexOf(confirmColor) == -1){
                          colorDicc[buck[colorNodeAggId].buckets[0].key] = confirmColor;
                          dataParsed[i].nodeColorKey = buck[colorNodeAggId].buckets[0].key;
                          dataParsed[i].nodeColorValue = colorDicc[buck[colorNodeAggId].buckets[0].key];
                          usedColors.push(confirmColor);
                          break;
                        }
                      }

                    }
                  }

                  return {
                    keySecondNode: buck.key,
                    countMetric: buck.doc_count,
                    widthOfEdge: sizeEdgeVal
                  };
                });
              }

              //COLOR Y LO QUE VAYA EN EL POPUP AHORA
              var inPopup = "<p>" + bucket.key + "</p>"
              if(dataParsed[i].nodeColorValue != "default"){
                var colorNodeFinal = dataParsed[i].nodeColorValue;
                inPopup += "<p>" + dataParsed[i].nodeColorKey + "</p>";
              }else{
                var colorNodeFinal = $scope.vis.params.firstNodeColor;
              }

              i++;
              //Return the node totally builded
              var nodeReturn = {
                id: i,
                key: bucket.key,
                color: colorNodeFinal,
                shape: $scope.vis.params.shapeFirstNode,
                //size: sizeVal
                value: sizeVal
              }

              //Si no esta activado el ocultar labels se las pongo
              if($scope.vis.params.showLabels){
                nodeReturn.label = bucket.key;
              }

              //Si esta activado el show popups se los añado
              if($scope.vis.params.showPopup){
                nodeReturn.title = inPopup;
              }

              return nodeReturn;
            });
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////

            dataNodes = dataNodes.filter(Boolean);
            var dataEdges = [];

            for(var n = 0; n<dataParsed.length; n++){
              //Busco en el array de nodos el del keyFirstNode
              var result = $.grep(dataNodes, function(e){ return e.key == dataParsed[n].keyFirstNode;   });
              if (result.length == 0) {
                console.log("---------------------------------------------NO ENCONTRADO");
              } else if (result.length == 1) {
                //ENCONTRE EL NODO, ACCEDO A SU ID CON RESULT.ID
                if($scope.vis.aggs.bySchemaName['first'].length > 1){
                  for(var r = 0; r<dataParsed[n].relationWithSecondNode.length; r++){
                    //Busco en el array de nodos si está el nodo de keySecondNode
                    var nodeOfSecondType = $.grep(dataNodes, function(e){ return e.key == dataParsed[n].relationWithSecondNode[r].keySecondNode;   });
                    if (nodeOfSecondType.length == 0) {
                      //NO EXISTE EL NODO (Segundo), LO CREO Y AÑADO A LA BASE DE NODOS
                      i++;
                      var newNode = {
                        id : i,
                        key: dataParsed[n].relationWithSecondNode[r].keySecondNode,
                        label : dataParsed[n].relationWithSecondNode[r].keySecondNode,
                        color: $scope.vis.params.secondNodeColor,
                        shape: $scope.vis.params.shapeSecondNode
                      };
                      //AÑADO EL NUEVO NODO
                      dataNodes.push(newNode);
                      //CREO EL ENLACE Y LO AÑADO
                      var edge = {
                        from : result[0].id,
                        to : dataNodes[dataNodes.length-1].id,
                        value: dataParsed[n].relationWithSecondNode[r].widthOfEdge
                      }
                      dataEdges.push(edge);

                    } else if (nodeOfSecondType.length == 1) {
                      //EXISTE EL Nodo (Segundo), HAGO SOLO LA RELACION
                      //CREO EL ENLACE Y LO AÑADO
                      var enlace = {
                        from : result[0].id,
                        to : nodeOfSecondType[0].id,
                        value: dataParsed[n].relationWithSecondNode[r].widthOfEdge
                      }
                      dataEdges.push(enlace);
                    } else {
                      console.log("/////////////////////////////////////////////MULTIPLES ENCONTRADOS")
                    }
                  }
                }

              } else {
                console.log("/////////////////////////////////////////////MULTIPLES ENCONTRADOS");
              }
            }


            ////////////////////////////////////CONSTRUCCION DE LA RED CON LA LIBRERIA VIS.js//////////////////////////////////
            var nodesDataSet = new visN.DataSet(dataNodes);
            var edgesDataSet = new visN.DataSet(dataEdges);

            // create a network
            var container = document.getElementById('mynetwork');
            container.style.height = container.getBoundingClientRect().height;
            container.height = container.getBoundingClientRect().height;
            var data = {
              nodes: nodesDataSet,
              edges: edgesDataSet
            };
            //SI HAY MUCHOS ENLACES, CAMBIAMOS LA FISICA PARA QUE LOS NODOS ESTÉN PARADOS Y NO EN CONTINUO MOVIMIENTO
            var options = {};
            var options2 = {height: container.getBoundingClientRect().height.toString()};
            if(dataEdges.length > 200){
              var options = {
                "edges": {
                  "smooth": {
                    "forceDirection": "none",
                    "type": "continous"
                  }
                },
                "physics": {
                  "minVelocity": 0.75,
                  "solver": "repulsion"
                }
              }

              var options2 = {
                height: container.getBoundingClientRect().height.toString(),
                physics:{
                  barnesHut:{
                    gravitationalConstant: -35000,
                    springConstant:0.01
                  }
                },
                "edges": {
                  "smooth": {
                    "forceDirection": "none",
                    "type": "continuous"
                  },
                  scaling:{
                    min:$scope.vis.params.minEdgeSize,
                    max:$scope.vis.params.maxEdgeSize
                  }
                },
                nodes: {
                  scaling:{
                    min:$scope.vis.params.minNodeSize,
                    max:$scope.vis.params.maxNodeSize
                  }
                },
                layout: {
                  improvedLayout: false
                },
                interaction: {
                  hover: true
                }
              };
            }
            console.log("Create network now");
            var network = new visN.Network(container, data, options2);

            for (i = 0; i < $(".vis-container" ).length; i++) {
               if($(".vis-container")[i].children[0].children[1] && $(".vis-container")[i].children[0].children[1].id == "mynetwork"){
                 var viscontainer = $(".vis-container")[i];
               }
            };
            new ResizeSensor(viscontainer, function() {
                network.setSize('100%', viscontainer.clientHeight);
            });

            //LEGEND OF NODE COLORS///////////
            network.on("afterDrawing", function (canvasP) {
              $("#loading").hide();
              if($scope.vis.aggs.bySchemaName['colornode'] && $scope.vis.params.showColorLegend){
                var canvas = document.getElementsByTagName("canvas")[0];
                var context = canvas.getContext("2d");

                context.fillStyle="#FFE8D6";
                var totalheight = usedColors.length * 25
                context.fillRect(canvas.width*(-2)-10, canvas.height*(-2)-18, 350, totalheight);

                context.fillStyle = "black";
                context.font = "bold 30px Arial";
                context.textAlign = "start";
                context.fillText("LEGEND OF COLORS:", canvas.width*(-2), canvas.height*(-2));

                var p=canvas.height*(-2) + 40;
                for(var key in colorDicc){
                  context.fillStyle = colorDicc[key];
                  context.font = "bold 20px Arial";
                  context.fillText(key, canvas.width*(-2), p);
                  p = p +22;
                }
              }
            });
            ///////////////////////////////////
            /*new ResizeSensor(document.body, function() {
                console.log('BODYYY');
                //network.setSize('100%', container.getBoundingClientRect().height.toString());
            });*/

            //network.setSize('100%', container.getBoundingClientRect().height.toString());

            ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        }else if($scope.vis.aggs.bySchemaName['first'].length == 1 && $scope.vis.aggs.bySchemaName['second']){
          $("#mynetwork").show();
          $("#loading").show();
          $("#errorHtml").hide();
          $(".secondNode").hide();
           // Retrieve the id of the configured tags aggregation
          // El id de los buckets (que los hemos llamado tags) para luego buscarlos en resp.aggregations[id].buckets
          var firstFieldAggId = $scope.vis.aggs.bySchemaName['first'][0].id;
          var secondFieldAggId = $scope.vis.aggs.bySchemaName['second'][0].id;

          if($scope.vis.aggs.bySchemaName['colornode']){
            var colorNodeAggId = $scope.vis.aggs.bySchemaName['colornode'][0].id;
            var colorNodeAggName = $scope.vis.aggs.bySchemaName['colornode'][0].params.field.displayName;
            var colorDicc = {};
            var usedColors = [];

            //Compruebo que NodeColor es la ultima
            if($scope.vis.aggs.indexOf($scope.vis.aggs.bySchemaName['colornode'][0]) <= $scope.vis.aggs.indexOf($scope.vis.aggs.bySchemaName['second'][0])){
              $scope.errorNodeColor();
              return;
            }
          }

          //Nombres de los campos donde has buscado
          var firstFieldAggName = $scope.vis.aggs.bySchemaName['first'][0].params.field.displayName;
          var secondFieldAggName = $scope.vis.aggs.bySchemaName['second'][0].params.field.displayName;

          // Retrieve the metrics aggregation configured
          //Si hay mas de una metrica habría $scope.vis.aggs.bySchemaName['size_node'][x] siendo x=0,1,2 el numero de metricas que haya
          if($scope.vis.aggs.bySchemaName['size_node']){
            var metricsAgg_sizeNode = $scope.vis.aggs.bySchemaName['size_node'][0];
          }
          if($scope.vis.aggs.bySchemaName['size_edge']){
            var metricsAgg_sizeEdge = $scope.vis.aggs.bySchemaName['size_edge'][0];
          }

          // Get the buckets of that aggregation
          // Saco los buckets con el id de los buckets sacado antes
          if(resp.aggregations[firstFieldAggId]){
            var buckets = resp.aggregations[firstFieldAggId].buckets;
          }else{
            var buckets = resp.aggregations[secondFieldAggId].buckets;
          }

          var dataParsed = [];
          // Transform all buckets into tag objects -- iterando en cada bucket
          var i = 0;
          var dataNodes = buckets.map(function(bucket) {

            dataParsed[i] = {};
            dataParsed[i].keyNode = bucket.key;

            //Las metricas son para el tamaño del nodo y enlaces
            if(metricsAgg_sizeNode){
              // Use the getValue function of the aggregation to get the value of a bucket -- IMPORTANTE, saco el valor de la metrica, que me da el tamaño del nodo de su respectivo bucket
              var value = metricsAgg_sizeNode.getValue(bucket);
              var sizeVal = Math.min($scope.vis.params.maxCutMetricSizeNode, value);
            }else{
              var sizeVal = 20;
            }

            dataParsed[i].valorSizeNode = sizeVal;
            dataParsed[i].nodeColorValue = "default";
            dataParsed[i].nodeColorKey = "default";


            //Depende de la prioridad tendremos que sacar unos buckets u otros
            if(bucket[secondFieldAggId]){
              var orderId = secondFieldAggId;
            }else{
              var orderId = firstFieldAggId;
            }

            dataParsed[i].relationWithSecondField = bucket[orderId].buckets.map(function(buck) {
              if(metricsAgg_sizeEdge){
                var value_sizeEdge = metricsAgg_sizeEdge.getValue(buck);
                var sizeEdgeVal = Math.min($scope.vis.params.maxCutMetricSizeEdge, value_sizeEdge);
              }else{
                var sizeEdgeVal = 0.1;
              }

              //Saco el color del nodo y guardo el color en el diccionario de colores para que no se repita
              if(colorNodeAggId && buck[colorNodeAggId].buckets.length > 0){
                if(colorDicc[buck[colorNodeAggId].buckets[0].key]){
                  dataParsed[i].nodeColorKey = buck[colorNodeAggId].buckets[0].key;
                  dataParsed[i].nodeColorValue = colorDicc[buck[colorNodeAggId].buckets[0].key];
                }else{
                  while(true){
                    var confirmColor = randomColor();
                    if(usedColors.indexOf(confirmColor) == -1){
                      colorDicc[buck[colorNodeAggId].buckets[0].key] = confirmColor;
                      dataParsed[i].nodeColorValue = colorDicc[buck[colorNodeAggId].buckets[0].key];
                      usedColors.push(confirmColor);
                      break;
                    }
                  }

                }
              }

              return {
                keyRelation: buck.key,
                countMetric: buck.doc_count,
                widthOfEdge: sizeEdgeVal
              };
            });

            var inPopup = "<p>" + bucket.key + "</p>"
            if(dataParsed[i].nodeColorValue != "default"){
              var colorNodeFinal = dataParsed[i].nodeColorValue;
              inPopup += "<p>" + dataParsed[i].nodeColorKey + "</p>";
            }else{
              var colorNodeFinal = $scope.vis.params.firstNodeColor;
            }


            i++;
            //Return the node totally builded
            var nodeReturn = {
              id: i,
              key: bucket.key,
              color: colorNodeFinal,
              shape: $scope.vis.params.shapeFirstNode,
              //size: sizeVal
              value: sizeVal
            }

            //Si no esta activado el ocultar labels se las pongo
            if($scope.vis.params.showLabels){
              nodeReturn.label = bucket.key;
            }

            //Si esta activado el show popups se los añado
            if($scope.vis.params.showPopup){
              nodeReturn.title = inPopup;
            }

            return nodeReturn;
          });

          //console.log(dataParsed);

          var dataEdges = [];

          //Recorro nodos
          for(var n = 0; n<dataParsed.length; n++){
            //Saco su id del nodo
            var NodoFrom = $.grep(dataNodes, function(e){ return e.key == dataParsed[n].keyNode;   });
            if (NodoFrom.length == 0) {
              alert("ERROR, NODO NO ENCONTRADO");
            } else if (NodoFrom.length == 1) {
              var id_from = NodoFrom[0].id;
              //Recorro relaciones que tiene con el segundo campo elegido
              for(var p = 0; p<dataParsed[n].relationWithSecondField.length; p++){
                //Recorro otra vez nodos
                for(var z = 0; z<dataParsed.length; z++){
                  //Compruebo que no se compara el mismo nodo
                  if(dataParsed[n] != dataParsed[z]){
                      var NodoTo = $.grep(dataNodes, function(e){ return e.key == dataParsed[z].keyNode;   });
                      if (NodoTo.length == 0) {
                        alert("ERROR, NODO NO ENCONTRADO");
                      } else if (NodoTo.length == 1) {
                        var id_to = NodoTo[0].id;
                        //Tienen relación ambos nodos
                        var sameRelation = $.grep(dataParsed[z].relationWithSecondField, function(e){ return e.keyRelation == dataParsed[n].relationWithSecondField[p].keyRelation;   });
                        if (sameRelation.length == 1) {
                          //Tienen relación ambos, AÑADO ENLACE
                          var edgeExist = $.grep(dataEdges, function(e){ return (e.to == id_from && e.from == id_to) || (e.to == id_to && e.from == id_from);   });
                          if (edgeExist.length == 0) {
                            //EL TAMAÑO TOTAL DEL ENLACE ES LA SUMA DE LOS DOS QUE TIENEN EN COMUN
                            var sizeEdgeTotal = sameRelation[0].widthOfEdge + dataParsed[n].relationWithSecondField[p].widthOfEdge;
                            var edge = {
                              from : id_from,
                              to : id_to,
                              value: sizeEdgeTotal
                            };
                            dataEdges.push(edge);
                          }
                        }
                      } else {
                        alert("ERROR, MULTIPLES NODOS ENCONTRADOS");
                      }
                  }
                }
              }

            } else {
              alert("ERROR, MULTIPLES NODOS ENCONTRADOS");
            }

          }


          var nodesDataSet = new visN.DataSet(dataNodes);

          var edgesDataSet = new visN.DataSet(dataEdges);

          // create a network
          var container = document.getElementById('mynetwork');
          container.style.height = container.getBoundingClientRect().height;
          container.height = container.getBoundingClientRect().height;
          var data = {
            nodes: nodesDataSet,
            edges: edgesDataSet
          };

          //SI HAY MUCHOS ENLACES, CAMBIAMOS LA FISICA
          var options = {};
          var options2 = {height: container.getBoundingClientRect().height.toString()};
          if(dataEdges.length > 200){
            var options = {
              "edges": {
                "smooth": {
                  "forceDirection": "none",
                  "type": "continuous"
                }
              },
              "physics": {
                "minVelocity": 0.75,
                "solver": "repulsion"
              }
            }

            var options2 = {
              height: container.getBoundingClientRect().height.toString(),
              physics: {
                //stabilization: false,
                barnesHut: {
                  gravitationalConstant: -3500,
                  springConstant: 0.001,
                  springLength: 500
                }
              },
              "edges": {
                "smooth": {
                  //"forceDirection": "none",
                  "type": "continuous"
                },
                scaling:{
                  min:$scope.vis.params.minEdgeSize,
                  max:$scope.vis.params.maxEdgeSize
                }
              },
              interaction: {
                hideEdgesOnDrag: true,
                hover: true
              },
              nodes: {
                scaling:{
                  min:$scope.vis.params.minNodeSize,
                  max:$scope.vis.params.maxNodeSize
                }
              },
              layout: {
                improvedLayout: false
              }
            }
          }
          console.log("Create network now");
          var network = new visN.Network(container, data, options2);

          for (i = 0; i < $(".vis-container" ).length; i++) {
             if($(".vis-container")[i].children[0].children[1] && $(".vis-container")[i].children[0].children[1].id == "mynetwork"){
               var viscontainer = $(".vis-container")[i];
             }
          };
          new ResizeSensor(viscontainer, function() {
              network.setSize('100%', viscontainer.clientHeight);
          });


          //LEGEND OF NODE COLORS///////////
          network.on("afterDrawing", function (canvasP) {
            $("#loading").hide();
            if($scope.vis.aggs.bySchemaName['colornode'] && $scope.vis.params.showColorLegend){
              var canvas = document.getElementsByTagName("canvas")[0];
              var context = canvas.getContext("2d");

              context.fillStyle="#FFE8D6";
              var totalheight = usedColors.length * 25
              context.fillRect(canvas.width*(-2)-10, canvas.height*(-2)-18, 350, totalheight);

              context.fillStyle = "black";
              context.font = "bold 30px Arial";
              context.textAlign = "start";
              context.fillText("LEGEND OF COLORS:", canvas.width*(-2), canvas.height*(-2));

              var p=canvas.height*(-2) + 40;
              for(var key in colorDicc){
                context.fillStyle = colorDicc[key];
                context.font = "bold 20px Arial";
                context.fillText(key, canvas.width*(-2), p);
                p = p +22;
              }
            }
          });
          ///////////////////////////////////

        }else{

          $("#mynetwork").hide();
          $("#loading").hide();
          $("#errorHtml").html("<h1><strong>ERROR</strong>: You can only choose Node-Node or Node-Relation</h1>");
          $("#errorHtml").show();
        }
      }

    });
  });

});
