'use strict';

angular.module('semdeePortal.controllers')
    .controller('searchController',
        ['$rootScope', '$scope', '$semanticSpace',
        function($rootScope, $scope, $semanticSpace) {
        /**
         * VARs DEFINITION
         */
        var currentSpace;

        // Semantic spaces initialization
        $semanticSpace.getAllSpaces().then(function(spaces) {
            $rootScope.shared.spaces = spaces;
        }, function(res) {
            alert('Error while loading user spaces' + JSON.stringify(res));
        });

        $scope.selectedSpace = function(){
            var space = $rootScope.shared.space;

            $scope.resetSearch();

            // unload any previously selected space
            if(currentSpace) {
                $semanticSpace.unloadSpace($rootScope.shared.space.id).then(function() {
                    console.log("space " + currentSpace.id + " unloaded");
                });
            }

            $semanticSpace.loadSpace(space.id)
                .then(function(){
                    console.log("Space "+space.id+" is loaded");

                    currentSpace = space;
                }, function() {
                    alert("Error while loading space. Please check server state!");
                });
        };

        $scope.searchSpace = function(spaceId, query){
            $scope.resetSearch();
            $scope.searchQuery = query;

            $semanticSpace.searchSpace(spaceId,query)
                .then(function(resultDocs){
                //    console.log(resultDocs);
                    $scope.searchResult = resultDocs.data;
                }, function(){
                    console.log("Couldn't start search for space "+spaceId+" and query "+query);
                });
        };

        $scope.resetSearch = function () {

            $scope.query = undefined;
            $scope.searchResult = undefined;
            $scope.searchQuery = undefined;
            $scope.currentPageDocsList = 1;
        };

        // automatically unload semantic space when the user leaves this view
        $scope.$on('$locationChangeStart', function () {
            if (currentSpace) {
                console.log("unloading search");
                $semanticSpace.unloadSpace($rootScope.shared.space.id);
            }
        });

        // automatically select the current space on page load
        if($rootScope.shared.space) {
            $scope.selectedSpace();
        }

    }]);