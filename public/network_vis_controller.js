define(function (require) {
  // get the kibana/table_vis module, and make sure that it requires the "kibana" module if it
  // didn't already
  const module = require('ui/modules').get('kibana/network_vis', ['kibana']);

  const visN = require('vis');
  const randomColor = require('randomcolor');

  // add a controller to tha module, which will transform the esResponse into a
  // tabular format that we can pass to the table directive
  module.controller('KbnNetworkVisController', function ($scope, Private) {
    //const tabifyAggResponse = Private(require('ui/agg_response/tabify/tabify'));

    $scope.$watch('esResponse', function (resp, oldResp) {
      if (resp) {

        if($scope.vis.params.showAuthorRepoRelationship){ //------------->  Autores y repos son nodos

            // Retrieve the id of the configured tags aggregation
            // El id de los buckets (que los hemos llamado tags) para luego buscarlos en resp.aggregations[id].buckets
            var firstFieldAggId = $scope.vis.aggs.bySchemaName['first'][0].id;
            var secondFieldAggId = $scope.vis.aggs.bySchemaName['second'][0].id;

            if($scope.vis.aggs.bySchemaName['colornode']){
              var colorNodeAggId = $scope.vis.aggs.bySchemaName['colornode'][0].id;
              var colorNodeAggName = $scope.vis.aggs.bySchemaName['colornode'][0].params.field.displayName;
              var colorDicc = {};
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
                var min = 5,
                  max = 300;
                min = Math.min(min, value);
                max = Math.max(max, value);
                var sizeVal = (value - min) / (max - min) * (32*2 - 12/2) + 12/2;
              }else{
                var sizeVal = 20;
              }

              datosParseados[i].valorSizeNode = sizeVal;
              datosParseados[i].nodeColorValue = "default";


              //Me recorro los subbuckets de cada autor, que son los repositorios que ha participado, aquí es dodne busco el TAMAÑO DEL ENLACE
              datosParseados[i].commitsEnRepos = bucket[secondFieldAggId].buckets.map(function(buck) {
                if(metricsAgg_sizeEdge){
                  var value_sizeEdge = metricsAgg_sizeEdge.getValue(buck);
                  var min = 0.1,
                    max = 20;
                  var valor = (((value_sizeEdge - 1) * (max - min)) / (200 - 1)) + min

                  var sizeEdgeVal = Math.min(max, valor);
                }else{
                  var sizeEdgeVal = 1;
                }

                //Saco el color del nodo y guardo el color en el diccionario de colores para que no se repita
                if(colorNodeAggId && buck[colorNodeAggId].buckets.length > 0){
                  if(colorDicc[buck[colorNodeAggId].buckets[0].key]){
                    datosParseados[i].nodeColorValue = colorDicc[buck[colorNodeAggId].buckets[0].key];
                  }else{
                    colorDicc[buck[colorNodeAggId].buckets[0].key] = randomColor();
                    datosParseados[i].nodeColorValue = colorDicc[buck[colorNodeAggId].buckets[0].key];
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
              return {
                id: i,
                label: bucket.key,
                color: colorNodeFinal,
                shape: $scope.vis.params.shapeFirstNode,
                //Tamño del nodo
                size: sizeVal
              };
            });
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////


            var dataEdges2 = [];

            for(var n = 0; n<datosParseados.length; n++){
              //Busco en el array de nodos el del autor
              var result = $.grep(dataNodes2, function(e){ return e.label == datosParseados[n].nombreAutor;   });
              if (result.length == 0) {
                console.log("---------------------------------------------NO ENCONTRADO");
              } else if (result.length == 1) {
                //ENCONTRE EL NODO DEL AUTOR, ACCEDO A SU ID CON RESULT.ID

                for(var r = 0; r<datosParseados[n].commitsEnRepos.length; r++){
                  //Busco en el array de nodos si está el nodo de repositorio
                  var nodorepo = $.grep(dataNodes2, function(e){ return e.label == datosParseados[n].commitsEnRepos[r].repositorio;   });
                  if (nodorepo.length == 0) {
                    //NO EXISTE EL NODO DE ESE REPO, LO CREO Y AÑADO A LA BASE DE NODOS
                    i++;
                    var nuevoNodo = {
                      id : i,
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
                      width: datosParseados[n].commitsEnRepos[r].widthOfEdge
                    }
                    dataEdges2.push(enlace);

                  } else if (nodorepo.length == 1) {
                    //EXISTE EL REPO, HAGO SOLO LA RELACION
                    //CREO EL ENLACE Y LO AÑADO
                    var enlace = {
                      from : result[0].id,
                      to : nodorepo[0].id,
                      width: datosParseados[n].commitsEnRepos[r].widthOfEdge
                    }
                    dataEdges2.push(enlace);
                  } else {
                    console.log("/////////////////////////////////////////////MULTIPLES ENCONTRADOS")
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
            var data = {
              nodes: nodes2,
              edges: edges2
            };
            //SI HAY MUCHOS ENLACES, CAMBIAMOS LA FISICA PARA QUE LOS NODOS ESTÉN PARADOS Y NO EN CONTINUO MOVIMIENTO
            var options = {};
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
                physics:{
                  barnesHut:{
                    gravitationalConstant: -60000,
                    springConstant:0.02
                  }
                },
                "edges": {
                  "smooth": {
                    "forceDirection": "none",
                    "type": "continuous"
                  }
                },
              };
            }
            var network = new visN.Network(container, data, options2);
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        }else if($scope.vis.params.showAuthorSameRepoRelationship){
          //  alert("RELAICON ENTRE AUTORES");
           // Retrieve the id of the configured tags aggregation
          // El id de los buckets (que los hemos llamado tags) para luego buscarlos en resp.aggregations[id].buckets
          var firstFieldAggId = $scope.vis.aggs.bySchemaName['first'][0].id;
          var secondFieldAggId = $scope.vis.aggs.bySchemaName['second'][0].id;

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
          var buckets = resp.aggregations[firstFieldAggId].buckets;

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
              var min = 5,
                max = 300;
              min = Math.min(min, value);
              max = Math.max(max, value);
              var sizeVal = (value - min) / (max - min) * (32*2 - 12/2) + 12/2;
            }else{
              var sizeVal = 20;
            }
            datosParseados[i].valorSizeNode = sizeVal;


            datosParseados[i].commitsEnRepos = bucket[secondFieldAggId].buckets.map(function(buck) {
                return {
                  repositorio: buck.key,
                  commits: buck.doc_count
                };
            });

            i++;
            return {
              id: i,
              label: bucket.key,
              color: $scope.vis.params.firstNodeColor,
              shape: $scope.vis.params.shapeFirstNode,
              size: sizeVal
            };
          });

          //console.log(datosParseados);

          var dataEdges2 = [];

          //Recorro autores
          for(var n = 0; n<datosParseados.length; n++){
            console.log("n="+n);
            //Saco su id del nodo
            var NodoFrom = $.grep(dataNodes2, function(e){ return e.label == datosParseados[n].nombreAutor;   });
            if (NodoFrom.length == 0) {
              alert("ERROR, NODO NO ENCONTRADO");
            } else if (NodoFrom.length == 1) {
              var id_from = NodoFrom[0].id;
              //Recorro respos en los que ha participado
              for(var p = 0; p<datosParseados[n].commitsEnRepos.length; p++){
                console.log("p="+p);
                //Recorro otra vez autores
                for(var z = 0; z<datosParseados.length; z++){
                  console.log("z="+z);
                  //Compruebo que no se compara el mismo autor
                  if(datosParseados[n] != datosParseados[z]){
                      var NodoTo = $.grep(dataNodes2, function(e){ return e.label == datosParseados[z].nombreAutor;   });
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
                            var enlace = {
                              from : id_from,
                              to : id_to
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
          var data = {
            nodes: nodes2,
            edges: edges2
          };

          //SI HAY MUCHOS ENLACES, CAMBIAMOS LA FISICA
          var options = {};
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
              physics:{
                barnesHut:{
                  gravitationalConstant: -60000,
                  springConstant:0.02
                },
                "minVelocity": 0.75,
                "solver": "barnesHut",
                barnesHut:{
                  springLength: 400,
                  gravitationalConstant: -50000
                }
              },
              "edges": {
                "smooth": {
                  "forceDirection": "none",
                  "type": "continuous"
                }
              },
              interaction: {
                hideEdgesOnDrag: true,
              }
            }
          }
          var network = new visN.Network(container, data, options2);
        }else if($scope.vis.params.showRepoSameAuthorRelationship){
        //  alert("RELACION ENTRE REPOSITORIOS")
        // Retrieve the id of the configured tags aggregation
         // El id de los buckets (que los hemos llamado tags) para luego buscarlos en resp.aggregations[id].buckets
         var firstFieldAggId = $scope.vis.aggs.bySchemaName['first'][0].id;
         var secondFieldAggId = $scope.vis.aggs.bySchemaName['second'][0].id;

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
         var buckets = resp.aggregations[firstFieldAggId].buckets;

         var datosParseados = [];
         var dataNodes2 = [];

         var m = 0;
         for(var i = 0; i<buckets.length; i++){
           var reposBuckets = buckets[i][secondFieldAggId].buckets;
           for(var n = 0; n<reposBuckets.length; n++){
             var existeRepo = $.grep(datosParseados, function(e){ return e.repositorio == reposBuckets[n].key;   });
             if (existeRepo.length == 0) {
               //Si no existe el nodo del repo, lo guardo en los datos parseados
               datosParseados[m] = {};
               datosParseados[m].repositorio = reposBuckets[n].key;
               datosParseados[m].autores = [];
               datosParseados[m].autores.push(buckets[i].key);
               var nodo = {
                 id: m+1,
                 label: reposBuckets[n].key,
                 color: $scope.vis.params.secondNodeColor,
                 shape: $scope.vis.params.shapeSecondNode
               }
               dataNodes2.push(nodo);
               m++;

             } else if (existeRepo.length == 1) {
               existeRepo[0].autores.push(buckets[i].key);
             } else {
               alert("ERROR, MULTIPLES REPOS ENCONTRADOS");
             }
           }
         }


         var dataEdges2 = [];

         for(var i = 0; i<datosParseados.length; i++){
           var nodoFrom = $.grep(dataNodes2, function(e){ return e.label == datosParseados[i].repositorio;   });
           if (nodoFrom.length == 1) {
             id_from = nodoFrom[0].id;
           } else {
             alert("ERROR, MULTIPLES REPOS ENCONTRADOS");
           }

           for(var n=0; n<datosParseados[i].autores.length; n++){
             for(var k = 0; k<datosParseados.length; k++){
               if(datosParseados[i] != datosParseados[k]){
                 for(var a = 0; a<datosParseados[k].autores.length; a++){
                   if(datosParseados[i].autores[n] == datosParseados[k].autores[a]){
                     var nodoTo = $.grep(dataNodes2, function(e){ return e.label == datosParseados[k].repositorio;   });
                     if (nodoTo.length == 1) {
                       id_to = nodoTo[0].id;
                       var existeEnlace = $.grep(dataEdges2, function(e){ return (e.to == id_from && e.from == id_to) || (e.to == id_to && e.from == id_from);   });
                       if (existeEnlace.length == 0) {
                         var enlace = {
                           from : id_from,
                           to : id_to
                         };
                         dataEdges2.push(enlace);
                       }
                     } else {
                       alert("ERROR, MULTIPLES REPOSTO ENCONTRADOS");
                     }
                   }
                 }
               }
             }
           }
         }


         var nodes2 = new visN.DataSet(dataNodes2);

         var edges2 = new visN.DataSet(dataEdges2);

         // create a network
         var container = document.getElementById('mynetwork');
         var data = {
           nodes: nodes2,
           edges: edges2
         };
         //SI HAY MUCHOS ENLACES, CAMBIAMOS LA FISICA
         var options = {};
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
         }
         var network = new visN.Network(container, data, options);
        }
      }

    });
  });

});
