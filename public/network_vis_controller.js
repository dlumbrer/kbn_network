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



    $scope.$watch('esResponse', function (resp, oldResp) {
      if (resp) {

        if($scope.vis.aggs.bySchemaName['first'].length >= 1 && !$scope.vis.aggs.bySchemaName['second']){ //This is when we have 2 nodes
            $("#mynetwork").show();
            $("#errorHtml").hide();
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
            var datosParseados = [];
            // Iterando en cada bucket, osea en cada autor me voy construyendo los nodos que son de autor
            var i = 0;
            var dataNodes2 = buckets.map(function(bucket) {

              datosParseados[i] = {};
              datosParseados[i].nombreAutor = bucket.key;


              //Las metricas son para el tamaño del nodo y enlaces
              if(metricsAgg_sizeNode){
                // Use the getValue function of the aggregation to get the value of a bucket -- IMPORTANTE, saco el valor de la metrica, que me da el tamaño del nodo de su respectivo bucket
                var value = metricsAgg_sizeNode.getValue(bucket);

                /* TO FIX IT
                var min = 5,
                  max = 300;
                min = Math.min(min, value);
                max = Math.max(max, value);
                //var sizeVal = (value - min) / (max - min) * (32*2 - 12/2) + 12/2;
                */

                var sizeVal = Math.min($scope.vis.params.maxCutMetricSizeNode, value);
              }else{
                var sizeVal = 20;
              }

              datosParseados[i].valorSizeNode = sizeVal;
              datosParseados[i].nodeColorValue = "default";


              //Me recorro los subbuckets de cada autor, que son los repositorios que ha participado, aquí es dodne busco el TAMAÑO DEL ENLACE
              if($scope.vis.aggs.bySchemaName['first'].length > 1){
                datosParseados[i].commitsEnRepos = bucket[secondFieldAggId].buckets.map(function(buck) {
                  if(metricsAgg_sizeEdge){
                    var value_sizeEdge = metricsAgg_sizeEdge.getValue(buck);

                    /* TO FIX IT
                    var min = 0.1,
                      max = 20;
                    var valor = (((value_sizeEdge - 1) * (max - min)) / (200 - 1)) + min
                    var sizeEdgeVal = Math.min(max, valor);
                    */

                    var sizeEdgeVal = Math.min($scope.vis.params.maxCutMetricSizeEdge, value_sizeEdge);
                  }else{
                    var sizeEdgeVal = 0.1;
                  }

                  //Saco el color del nodo y guardo el color en el diccionario de colores para que no se repita
                  if(colorNodeAggId && buck[colorNodeAggId].buckets.length > 0){
                    if(colorDicc[buck[colorNodeAggId].buckets[0].key]){
                      datosParseados[i].nodeColorValue = colorDicc[buck[colorNodeAggId].buckets[0].key];
                    }else{
                      //repito hasta encontrar un color NO utilizado
                      while(true){
                        var confirmColor = randomColor();
                        if(usedColors.indexOf(confirmColor) == -1){
                          colorDicc[buck[colorNodeAggId].buckets[0].key] = confirmColor;
                          datosParseados[i].nodeColorValue = colorDicc[buck[colorNodeAggId].buckets[0].key];
                          usedColors.push(confirmColor);
                          break;
                        }
                      }

                    }
                  }

                  return {
                    repositorio: buck.key,
                    commits: buck.doc_count,
                    widthOfEdge: sizeEdgeVal
                  };
                });
              }

              //COLOR AHORA
              if(datosParseados[i].nodeColorValue != "default"){
                var colorNodeFinal = datosParseados[i].nodeColorValue;
              }else{
                var colorNodeFinal = $scope.vis.params.firstNodeColor;
              }

              i++;
              //SI ESTA ACTIVADO EL OCULTAR LOS LABELS, PONGO EL HOVER
              if($scope.vis.params.hideLabels){
                return {
                  id: i,
                  key: bucket.key,
                  //label: bucket.key,
                  title: bucket.key,
                  color: colorNodeFinal,
                  shape: $scope.vis.params.shapeFirstNode,
                  //Tamño del nodo
                  //size: sizeVal
                  value: sizeVal
                };
              }else{
                return {
                  id: i,
                  key: bucket.key,
                  label: bucket.key,
                  //title: bucket.key,
                  color: colorNodeFinal,
                  shape: $scope.vis.params.shapeFirstNode,
                  //Tamño del nodo
                  //size: sizeVal
                  value: sizeVal
                };
              }
            });
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////


            var dataEdges2 = [];

            for(var n = 0; n<datosParseados.length; n++){
              //Busco en el array de nodos el del autor
              var result = $.grep(dataNodes2, function(e){ return e.key == datosParseados[n].nombreAutor;   });
              if (result.length == 0) {
                console.log("---------------------------------------------NO ENCONTRADO");
              } else if (result.length == 1) {
                //ENCONTRE EL NODO DEL AUTOR, ACCEDO A SU ID CON RESULT.ID
                if($scope.vis.aggs.bySchemaName['first'].length > 1){
                  for(var r = 0; r<datosParseados[n].commitsEnRepos.length; r++){
                    //Busco en el array de nodos si está el nodo de repositorio
                    var nodorepo = $.grep(dataNodes2, function(e){ return e.key == datosParseados[n].commitsEnRepos[r].repositorio;   });
                    if (nodorepo.length == 0) {
                      //NO EXISTE EL NODO DE ESE REPO, LO CREO Y AÑADO A LA BASE DE NODOS
                      i++;
                      var nuevoNodo = {
                        id : i,
                        key: datosParseados[n].commitsEnRepos[r].repositorio,
                        label : datosParseados[n].commitsEnRepos[r].repositorio,
                        color: $scope.vis.params.secondNodeColor,
                        shape: $scope.vis.params.shapeSecondNode
                      };
                      //AÑADO EL NUEVO NODO
                      dataNodes2.push(nuevoNodo);
                      //CREO EL ENLACE Y LO AÑADO
                      var enlace = {
                        from : result[0].id,
                        to : dataNodes2[dataNodes2.length-1].id,
                        value: datosParseados[n].commitsEnRepos[r].widthOfEdge
                      }
                      dataEdges2.push(enlace);

                    } else if (nodorepo.length == 1) {
                      //EXISTE EL REPO, HAGO SOLO LA RELACION
                      //CREO EL ENLACE Y LO AÑADO
                      var enlace = {
                        from : result[0].id,
                        to : nodorepo[0].id,
                        value: datosParseados[n].commitsEnRepos[r].widthOfEdge
                      }
                      dataEdges2.push(enlace);
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
            var nodes2 = new visN.DataSet(dataNodes2);
            var edges2 = new visN.DataSet(dataEdges2);

            // create a network
            var container = document.getElementById('mynetwork');
            container.style.height = container.getBoundingClientRect().height;
            container.height = container.getBoundingClientRect().height;
            var data = {
              nodes: nodes2,
              edges: edges2
            };
            //SI HAY MUCHOS ENLACES, CAMBIAMOS LA FISICA PARA QUE LOS NODOS ESTÉN PARADOS Y NO EN CONTINUO MOVIMIENTO
            var options = {};
            var options2 = {height: container.getBoundingClientRect().height.toString()};
            if(dataEdges2.length > 200){
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
                    springConstant:0.02
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

            new ResizeSensor(container, function() {
                console.log('Diiiv');
                //network.setSize('150px', '150px');
                network.setSize('100%', container.getBoundingClientRect().height.toString());
            });
            /*new ResizeSensor(document.body, function() {
                console.log('BODYYY');
                //network.setSize('100%', container.getBoundingClientRect().height.toString());
            });*/

            //network.setSize('100%', container.getBoundingClientRect().height.toString());

            ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        }else if($scope.vis.aggs.bySchemaName['first'].length == 1 && $scope.vis.aggs.bySchemaName['second']){
          $("#mynetwork").show();
          $("#errorHtml").hide();
           // Retrieve the id of the configured tags aggregation
          // El id de los buckets (que los hemos llamado tags) para luego buscarlos en resp.aggregations[id].buckets
          var firstFieldAggId = $scope.vis.aggs.bySchemaName['first'][0].id;
          var secondFieldAggId = $scope.vis.aggs.bySchemaName['second'][0].id;

          if($scope.vis.aggs.bySchemaName['colornode']){
            var colorNodeAggId = $scope.vis.aggs.bySchemaName['colornode'][0].id;
            var colorNodeAggName = $scope.vis.aggs.bySchemaName['colornode'][0].params.field.displayName;
            var colorDicc = {};
            var usedColors = [];
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

          var datosParseados = [];
          // Transform all buckets into tag objects -- iterando en cada bucket
          var i = 0;
          var dataNodes2 = buckets.map(function(bucket) {

            datosParseados[i] = {};
            datosParseados[i].nombreAutor = bucket.key;

            //Las metricas son para el tamaño del nodo y enlaces
            if(metricsAgg_sizeNode){
              // Use the getValue function of the aggregation to get the value of a bucket -- IMPORTANTE, saco el valor de la metrica, que me da el tamaño del nodo de su respectivo bucket
              var value = metricsAgg_sizeNode.getValue(bucket);

              /* TO FIX IT
              var min = 5,
                max = 300;
              min = Math.min(min, value);
              max = Math.max(max, value);
              //var sizeVal = (value - min) / (max - min) * (32*2 - 12/2) + 12/2;
              */

              var sizeVal = Math.min($scope.vis.params.maxCutMetricSizeNode, value);
            }else{
              var sizeVal = 20;
            }

            datosParseados[i].valorSizeNode = sizeVal;
            datosParseados[i].nodeColorValue = "default";


            //Depende de la prioridad tendremos que sacar unos buckets u otros
            if(bucket[secondFieldAggId]){
              var orderId = secondFieldAggId;
            }else{
              var orderId = firstFieldAggId;
            }

            datosParseados[i].commitsEnRepos = bucket[orderId].buckets.map(function(buck) {
              if(metricsAgg_sizeEdge){
                var value_sizeEdge = metricsAgg_sizeEdge.getValue(buck);

                /* TO FIX IT
                var min = 0.1,
                  max = 20;
                var valor = (((value_sizeEdge - 1) * (max - min)) / (200 - 1)) + min
                var sizeEdgeVal = Math.min(max, valor);
                */

                var sizeEdgeVal = Math.min($scope.vis.params.maxCutMetricSizeEdge, value_sizeEdge);
              }else{
                var sizeEdgeVal = 0.1;
              }

              //Saco el color del nodo y guardo el color en el diccionario de colores para que no se repita
              if(colorNodeAggId && buck[colorNodeAggId].buckets.length > 0){
                if(colorDicc[buck[colorNodeAggId].buckets[0].key]){
                  datosParseados[i].nodeColorValue = colorDicc[buck[colorNodeAggId].buckets[0].key];
                }else{
                  while(true){
                    var confirmColor = randomColor();
                    if(usedColors.indexOf(confirmColor) == -1){
                      colorDicc[buck[colorNodeAggId].buckets[0].key] = confirmColor;
                      datosParseados[i].nodeColorValue = colorDicc[buck[colorNodeAggId].buckets[0].key];
                      usedColors.push(confirmColor);
                      break;
                    }
                  }

                }
              }

              return {
                repositorio: buck.key,
                commits: buck.doc_count,
                widthOfEdge: sizeEdgeVal
              };
            });

            //COLOR AHORA
            if(datosParseados[i].nodeColorValue != "default"){
              var colorNodeFinal = datosParseados[i].nodeColorValue;
            }else{
              var colorNodeFinal = $scope.vis.params.firstNodeColor;
            }


            i++;
            //SI ESTA ACTIVADO EL OCULTAR LOS LABELS, PONGO EL HOVER
            if($scope.vis.params.hideLabels){
              return {
                id: i,
                key: bucket.key,
                //label: bucket.key,
                title: bucket.key,
                color: colorNodeFinal,
                shape: $scope.vis.params.shapeFirstNode,
                //Tamño del nodo
                //size: sizeVal
                value: sizeVal
              };
            }else{
              return {
                id: i,
                key: bucket.key,
                label: bucket.key,
                //title: bucket.key,
                color: colorNodeFinal,
                shape: $scope.vis.params.shapeFirstNode,
                //Tamño del nodo
                //size: sizeVal
                value: sizeVal
              };
            }
          });

          //console.log(datosParseados);

          var dataEdges2 = [];

          //Recorro autores
          for(var n = 0; n<datosParseados.length; n++){
            //Saco su id del nodo
            var NodoFrom = $.grep(dataNodes2, function(e){ return e.key == datosParseados[n].nombreAutor;   });
            if (NodoFrom.length == 0) {
              alert("ERROR, NODO NO ENCONTRADO");
            } else if (NodoFrom.length == 1) {
              var id_from = NodoFrom[0].id;
              //Recorro respos en los que ha participado
              for(var p = 0; p<datosParseados[n].commitsEnRepos.length; p++){
                //Recorro otra vez autores
                for(var z = 0; z<datosParseados.length; z++){
                  //Compruebo que no se compara el mismo autor
                  if(datosParseados[n] != datosParseados[z]){
                      var NodoTo = $.grep(dataNodes2, function(e){ return e.key == datosParseados[z].nombreAutor;   });
                      if (NodoTo.length == 0) {
                        alert("ERROR, NODO NO ENCONTRADO");
                      } else if (NodoTo.length == 1) {
                        var id_to = NodoTo[0].id;
                        //han hecho commit en el mismo repo
                        var mismoRepo = $.grep(datosParseados[z].commitsEnRepos, function(e){ return e.repositorio == datosParseados[n].commitsEnRepos[p].repositorio;   });
                        if (mismoRepo.length == 1) {
                          //HAN HECHO COMMIT AL MISMO REPO, AÑADO ENLACE
                          var existeEnlace = $.grep(dataEdges2, function(e){ return (e.to == id_from && e.from == id_to) || (e.to == id_to && e.from == id_from);   });
                          if (existeEnlace.length == 0) {
                            //EL TAMAÑO TOTAL DEL ENLACE ES LA SUMA DE LOS DOS QUE TIENEN EN COMUN
                            var sizeEdgeTotal = mismoRepo[0].widthOfEdge + datosParseados[n].commitsEnRepos[p].widthOfEdge;
                            var enlace = {
                              from : id_from,
                              to : id_to,
                              value: sizeEdgeTotal
                            };
                            dataEdges2.push(enlace);
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


          var nodes2 = new visN.DataSet(dataNodes2);

          var edges2 = new visN.DataSet(dataEdges2);

          // create a network
          var container = document.getElementById('mynetwork');
          container.style.height = container.getBoundingClientRect().height;
          container.height = container.getBoundingClientRect().height;
          var data = {
            nodes: nodes2,
            edges: edges2
          };

          //SI HAY MUCHOS ENLACES, CAMBIAMOS LA FISICA
          var options = {};
          var options2 = {height: container.getBoundingClientRect().height.toString()};
          if(dataEdges2.length > 200){
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
              physics:{
                "minVelocity": 0.75,
                "solver": "barnesHut",
                barnesHut:{
                  springLength: 400,
                  gravitationalConstant: -50000,
                  springConstant:0.02
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

          new ResizeSensor(container, function() {
              console.log('Diiiv');
              //network.setSize('150px', '150px');
              network.setSize('100%', container.getBoundingClientRect().height.toString());
          });
        }else{

          $("#mynetwork").hide();
          $("#errorHtml").html("<h1>Data Error: You can only choose Node-Node or Node-Relation</h1>");
          $("#errorHtml").show();
        }
      }

    });
  });

});
