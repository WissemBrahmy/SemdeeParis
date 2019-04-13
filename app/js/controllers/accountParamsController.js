/*
This is controller to update and get crawl source parameters.
1. Twitter parameters
2. Google parameters
3. Bing parameters
*/
'use strict';

angular.module('semdeePortal.controllers')
    .controller('accountParamsController',
    ['$scope', '$config','$accountParams','$location',
    function ($scope, $config, $accountParams,$location) {

        $scope.twitterParameters = {};
        $scope.twitterOriginalParams = {};
        $scope.twitterDispParams = [];

        $scope.facebookParameters = {};
        $scope.facebookOriginalParams = {};
        $scope.facebookDispParams = [];

        $scope.googleParameters = {};
        $scope.googleOriginalParams = {};
        $scope.googleDispParams = [];

        $scope.bingParameters = {};
        $scope.bingOriginalParams = {};
        $scope.bingDispParams = [];

        /**
         * FUNCTIONS DEFINITION
         */

        /*  twitter */
        $scope.getTwitterParams = function(){
          debugger;
            $accountParams.getTwitterParams().then(function (params) {
                $scope.twitterParameters = params;
                $scope.twitterOriginalParams = angular.copy($scope.twitterParameters);
            }, function (params) {
                alert('Error while loading parameters');
            });
        };

        $scope.updateTwitterParams = function () {
            debugger;
            var updated = [];
            for (var i=0;i<$scope.twitterParameters.length;i++){
                if ($scope.twitterParameters[i].paramValue != $scope.twitterOriginalParams[i].paramValue){
                    updated.push($scope.twitterParameters[i]);
                }
            }

            if (updated.length == 0){
              console.log('nothing to update '+JSON.stringify(updated));
              return;
            }
            console.log('updating '+JSON.stringify(updated));
            $accountParams.updateTwitterParams(updated).then(function(res){
                //$scope.getAllParams();
                $location.path('/home')
            });
        };

        /*  facebook */
        $scope.getFacebookParams = function(){
          debugger;
            $accountParams.getFacebookParams().then(function (params) {
                $scope.facebookParameters = params;
                $scope.facebookOriginalParams = angular.copy($scope.facebookParameters);
            }, function (params) {
                alert('Error while loading parameters');
            });
        };

        $scope.updateFacebookParams = function () {
            debugger;
            var updated = [];
            for (var i=0;i<$scope.facebookParameters.length;i++){
                if ($scope.facebookParameters[i].paramValue != $scope.facebookOriginalParams[i].paramValue){
                    updated.push($scope.facebookParameters[i]);
                }
            }

            if (updated.length == 0){
              console.log('nothing to update '+JSON.stringify(updated));
              return;
            }
            console.log('updating '+JSON.stringify(updated));
            $accountParams.updateFacebookParams(updated).then(function(res){
                //$scope.getAllParams();
                $location.path('/home')
            });
        };

        /*  google */
        $scope.getGoogleParams = function(){
            $accountParams.getGoogleParams().then(function (params) {
                $scope.googleParameters = params;
                $scope.googleOriginalParams = angular.copy($scope.googleParameters);
            }, function (params) {
                alert('Error while loading parameters');
            });
        };

        $scope.updateGoogleParams = function () {
            var updated = [];
            for (var i=0;i<$scope.googleParameters.length;i++){
                if ($scope.googleParameters[i].paramValue != $scope.googleOriginalParams[i].paramValue){
                    updated.push($scope.googleParameters[i]);
                }
            }

            if (updated.length == 0){
              console.log('nothing to update '+JSON.stringify(updated));
              return;
            }

            console.log('updating '+JSON.stringify(updated));

            $accountParams.updateGoogleParams(updated).then(function(res){
                //$scope.getAllParams();
                $location.path('/home')
            });
        };

        /*  Bing` */
        $scope.getBingParams = function(){
            $accountParams.getBingParams().then(function (params) {
                $scope.bingParameters = params;
                $scope.bingOriginalParams = angular.copy($scope.bingParameters);
            }, function (params) {
                alert('Error while loading parameters');
            });
        };


        $scope.updateBingParams = function () {
            var updated = [];
            for (var i=0;i<$scope.bingParameters.length;i++){
                if ($scope.bingParameters[i].paramValue != $scope.bingOriginalParams[i].paramValue){
                    updated.push($scope.bingParameters[i]);
                }
            }

            if (updated.length == 0){
              console.log('nothing to update '+JSON.stringify(updated));
              return;
            }
            console.log('updating '+JSON.stringify(updated));
            $accountParams.updateBingParams(updated).then(function(res){
                //$scope.getAllParams();
                //$location.path('/home')
            });
        };

        // update all account parameters
        $scope.updateAllAccountParams = function () {
          $scope.updateTwitterParams();
          $scope.updateGoogleParams();
          $scope.updateBingParams();
          $location.path('/home');
        };

        /**
         * FUNCTION CALL
         */
        $scope.getTwitterParams();
        $scope.getFacebookParams();
        $scope.getGoogleParams();
        $scope.getBingParams();

}]);
