define(function (require) {
  const _ = require('lodash');

  require('ui/modules').get('kibana/network_vis')
  .directive('networkVisParams', function () {
    return {
      restrict: 'E',
      template: require('plugins/network_vis/network_vis_params.html'),
      link: function ($scope) {
        const params = $scope.vis.params;
        console.log(params);
        if($scope.vis.aggs.bySchemaName['first'].length == 1 && $scope.vis.aggs.bySchemaName['second']){
          $scope.vis.params.nodeNode = false;
        }else{
          $scope.vis.params.nodeNode = true;
        }
      }
    };
  });
});
