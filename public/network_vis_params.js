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
      }
    };
  });
});
