'use strict';

angular.module('semdeePortal.controllers')
    .controller('relatedContentController',
    ['$rootScope', '$scope', '$semanticSpace',
    function($rootScope, $scope, $semanticSpace) {
        /**
         * VARs DEFINITION
         */
        var currentSpace;
        $scope.searchStart = true;

        // Semantic spaces initialization
        $semanticSpace.getAllSpaces().then(function(spaces) {
            $rootScope.shared.spaces = spaces;
        }, function(res) {
            alert('Error while loading user spaces' + JSON.stringify(res));
        });

        /**
         * SPACES FUNCTIONS DEFINITION
         */
        $scope.selectedSpace = function(){
            $scope.currentPageDocsList = 1;
            $scope.search = {};
            $scope.resetRelatedDoc();

            var newSpace = $rootScope.shared.space;

            // unload any previously selected space
            if(currentSpace) {
                $semanticSpace.unloadSpace($rootScope.shared.space.id).then(function() {
                    console.log('space ' + currentSpace.id + ' unloaded')
                });
            }

            // load the new space
            $semanticSpace.loadSpace(newSpace.id)
                .then(function (res) {
                    currentSpace = newSpace;

                    console.log('Space ' + newSpace.id + ' is loaded');

                    // retrieving documents of loaded space
                    $semanticSpace.getDocuments(newSpace.id)
                        .then(function (docs) {
                            $scope.documents = docs;
                        }, function (docs) {
                            alert('Couldn\'t retrieve documents for space ' + newSpace.label);
                        });
                }, function () {
                    alert('Error while loading space. Please check server state!');
                });
        };


        $scope.getRelatedContent = function(spaceId,doc){

            $scope.resetRelatedDoc();

            $scope.relatedDoc = doc;
            $scope.searchStart = true;
            // trying to find related content for document that bears id : docId
            //$semanticSpace.searchSpace(spaceId,doc.url)
            $semanticSpace.relatedContent(spaceId,doc.id)
                .then(function(resultDocs){
                    $scope.relatedContent = resultDocs.data;
                    $scope.searchStart = false;
                }, function(){
                    console.log("Couldn't start search for space "+spaceId);
                    $scope.searchStart = false;
                });
        };

        $scope.resetRelatedDoc = function() {

            $scope.relatedContent = undefined;
            $scope.relatedDoc = undefined;
            $scope.currentPageRelatedDocsList = 1;
        };

        // automatically unload semantic space when the user leaves this view
        $scope.$on('$locationChangeStart', function () {
            if (currentSpace) {
                console.log("unloading related");
                $semanticSpace.unloadSpace($rootScope.shared.space.id);
            }
        });

        // automatically selects current semantic space on page load
        if($rootScope.shared.space) {
            $scope.selectedSpace();
        }
    }]);