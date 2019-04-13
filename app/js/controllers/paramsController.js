'use strict';

angular.module('semdeePortal.controllers')
    .controller('paramsController',
    ['$scope', '$config','$params','$location',
    function ($scope, $config, $params,$location) {

        $scope.parameters = {};
        $scope.originalParams = {};
        $scope.dispParams = [];

        /**
         * FUNCTIONS DEFINITION
         */
        $scope.getAllParams = function(){
          debugger;
            $params.getAllParams().then(function (params) {

                $scope.parameters = params;
                $scope.originalParams = angular.copy($scope.parameters);
            }, function (params) {
                alert('Error while loading parameters');
            });
        };

        $scope.getAllParams();
        // Calling the API to get profiling result, ie Categories created

        $scope.updateParams = function () {
          debugger;
            var updated = [];
            for (var i=0;i<$scope.parameters.length;i++){
                if ($scope.parameters[i].paramValue != $scope.originalParams[i].paramValue){
                    updated.push($scope.parameters[i]);
                }
            }
            console.log('updating '+JSON.stringify(updated));
            $params.updateParams(updated).then(function(res){
                //$scope.getAllParams();
                $location.path('/home')
            });
        };
}]);
