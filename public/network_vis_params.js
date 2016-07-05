define(function (require) {
  const _ = require('lodash');

  require('ui/modules').get('kibana/network_vis')
  .directive('networkVisParams', function () {
    return {
      restrict: 'E',
      template: require('plugins/network_vis/network_vis_params.html'),
      link: function ($scope) {
        $scope.$watchMulti([
          'vis.params.showAuthorRepoRelationship',
          'vis.params.showAuthorSameRepoRelationship',
          'vis.params.showRepoSameAuthorRelationship'
        ], function () {
          if (!$scope.vis) return;

          const params = $scope.vis.params;
          console.log(params);
          $scope.onlyOne = function(param){
            if(param == 'showAuthorRepoRelationship'){
              params.showAuthorSameRepoRelationship = false;
              params.showRepoSameAuthorRelationship = false;
            }
            if(param == 'showAuthorSameRepoRelationship'){
              params.showAuthorRepoRelationship = false;
              params.showRepoSameAuthorRelationship = false;
            }
            if(param == 'showRepoSameAuthorRelationship'){
              params.showAuthorRepoRelationship = false;
              params.showAuthorSameRepoRelationship = false;
            }
          }

        });
      }
    };
  });
});
