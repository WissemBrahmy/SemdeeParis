'use strict';

angular.module('semdeePortal.controllers')
    .controller('taggerController', 
    	['$scope', '$rootScope', '$tagger', '$semanticSpace','$uploadService',
    	 function($scope, $rootScope, $tagger, $semanticSpace, $uploadService) {

        /**
         * VARs DEFINITION
         */

        // Initialization of the chart
        $scope.chart = {
            data: [],
            title: '',
            type: 'cloud-chart'
        };

        // Semantic spaces initialization
        $semanticSpace.getAllSpaces().then(function(spaces) {
            $rootScope.shared.spaces = spaces;
        }, function(res) {
            alert('Error while loading user spaces ' + JSON.stringify(res));
        });

        // Launching the modal allowing a user to launch a new tagger
        $scope.launchTagger = function() {
            $scope.isLoading = true;

            // Calling the API to launch a tagger
            $tagger.launchTagger($rootScope.shared.space.id).then(function (tags) {
                $scope.activeTagger = true;

                $scope.chart = {
                    data: [],
                    title: '',
                    type: 'cloud-chart'
                };

                // Creating a table that will fetch chart data
                tags.forEach(function(tag) {
                    $scope.chart.data.push({
                        value: tag.frequency,
                        label: tag.label
                    });
                });

                $scope.isLoading = false;
            }, function (res) {
                $scope.isLoading = false;
                alert('Errror while launching tagging operation ' + JSON.stringify(res));
            });
        };
        
        // select file to upload on server
        $scope.chooseFile = function(){
        	$scope.isLoadingFile = !0;
	        var file = $scope.myFile;
	        console.log('file is ' );
	        console.dir(file);
	        
	        $uploadService.uploadFileToUrl(file).then(
        		function(res){
        			$scope.isLoadingFile = !1;
        		}
        		,function(res){
        			$scope.isLoadingFile = !1
        			, alert("Errror while launching tagging this file operation " + JSON.stringify(res))
        		}
	        );
	    };

        $scope.link = '';

        $scope.launchLink = function(){

            $scope.isLoadingLink = true;
            // Calling the API to launch a tagger
            $tagger.launchTaggerWithExternalDocument(

                $rootScope.shared.space.id, $scope.link ).then(

                function (tags) {

                    $scope.activeTagger = true;

                    $scope.chart = {
                        data: [],
                        title: '',
                        type: 'cloud-chart'
                    };

                    // Creating a table that will fetch chart data
                    tags.forEach(function(tag) {
                        $scope.chart.data.push({
                            value: tag.frequency,
                            label: tag.label
                        });
                    });

                $scope.isLoadingLink = false;
            }, function (res) {
                $scope.isLoadingLink = false;
                alert('Errror while launching tagging operation ' + JSON.stringify(res));
            });

        };

    }]);