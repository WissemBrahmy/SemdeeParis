'use strict';

angular.module('semdeePortal.controllers')
    .controller('spaceController',
    ['$rootScope', '$scope', '$crawl', '$semanticSpace', '$tagger','$fancyTree', '$stopWordsService',
    function($rootScope, $scope, $crawl, $semanticSpace, $taggerService, $fancyTree, $stopWordsService) {
        /**
         * VARs DEFINITION
         */
        $scope = $rootScope;

        // define default filtering most recent space goes first.
        $scope.predicate = 'creationDate';
        $scope.reverse = 'false';
        $scope.viewMode = 'list';
        $scope.chartActive = false;

        $scope.chart = {
            data: [],
            title: '',
            type: undefined
        };

        $scope.chart2 = {
            tags:[],
            type: undefined
        };

        // Crawls loading
        // $crawl.getAllCrawls(true).then(function(crawls) {
        //    $scope.crawls = crawls;
        //    // spaces loading
        //    $semanticSpace.getAllSpaces().then(function(spaces) {
        //        $rootScope.shared.spaces = spaces;
        //        // automatically selects current semantic space on page load
        //        if($rootScope.shared.space) {
        //            $scope.setActiveSpace($rootScope.shared.space);
        //        }
        //    }, function() {
        //        alert("Couldn't retrieve spaces list you should check server availability");
        //    });
        //}, function() {
        //    alert("Couldn't retrieve spaces list you should check server availability");
        //});

        /**
         * SPACES FUNCTIONS DEFINITION
         */
        $scope.createNewSpaceFromOldSpace = function(space) {
            // retrieving crawls of selected crawl
            var crawls = [];
            var stopWordLists = [];

            space.crawlIds.forEach(function (crawlId) {
                crawls.push($scope.allCrawls[crawlId]);
            });
            $scope.spaceForm = {
                label: 'Clone of '+space.label,
                crawls: crawls,
                swlists: stopWordLists
            };
            if(!$scope.$$phase) {
                $scope.$apply();//scope.$digest();
            }
            $('#createNewSpaceModal').modal('show');
        };

        $scope.createNewSpaceFromCrawl = function(crawl) {
            // retrieving crawls of selected crawl
            var crawls = [crawl];
            var stopWordLists = [];
            $scope.spaceForm = {
                label: crawl.query,
                crawls: crawls,
                swlists: stopWordLists
            };
            $('#createNewSpaceModal').modal('show');
        };
        //$scope.deleteSpace = function(space) {
        //
        //    $semanticSpace.deleteSpace(space.id).then(
        //        function(res){
        //            if (res) {
        //                console.log("Delete space ok");
        //                // reload spaces
        //                $semanticSpace.getAllSpaces().then(function(spaces) {
        //                    $rootScope.shared.spaces = spaces;
        //
        //                }, function() {
        //                    alert("Couldn't retrieve spaces list you should check server availability");
        //                });
        //            }
        //        },
        //        function(res){
        //            alert("Error while deleting space");
        //        }
        //
        //    );
        //};

        $scope.setActiveSpace = function(newSpace) {

            // reseting view type to fallback on default
            $scope.viewMode = 'list';

            // si on reselectionne le space deja actif => ça le déselectionne

            /*if (newSpace == $scope.activeSpace) {

             $rootScope.shared.space = undefined;
             $scope.activeSpace = undefined;
             $scope.chart.title = undefined;
             $scope.chart.data = [];
             }
             else {

             // setting active space
             $rootScope.shared.space = newSpace;
             $scope.activeSpace = newSpace;

             // preparing chart for active space
             $scope.chart.title = newSpace.label;
             $scope.chart.data = [];
             newSpace.crawlIds.forEach(function (crawlId) {
             var crawl = $scope.crawls[crawlId];
             $scope.chart.data.push({id: crawl.id, value: crawl.volume, label: crawl.query});
             });
             }*/
            if (newSpace == $scope.activeSpace){
                $rootScope.shared.space = undefined;
                $scope.activeSpace = undefined;
            }
            else {
                $scope.chartActive = false;
                // preparing chart for active space
                $scope.chart = {
                    data: [],
                    title: newSpace.label,
                    type: 'bubble-chart'
                };

                // setting active space
                $rootScope.shared.space = newSpace;
                $scope.activeSpace = newSpace;

                newSpace.crawlIds.forEach(function (crawlId) {
                    var crawl = $scope.crawls[crawlId];
                    $scope.chart.data.push({id: crawl.id, value: crawl.volume, label: crawl.query});
                });
                // get data from space id for cloud chart
                // Calling the API to launch a tagger

                $taggerService.launchTagger($rootScope.shared.space.id).then(function (tags) {

                    // preparing chart for active space tags
                    $scope.chart2 = {
                        tags:[],
                        type: 'cloud-chart'
                    };

                    // Creating a table that will fetch chart data
                    tags.forEach(function (tag) {
                        $scope.chart2.tags.push({
                            value: tag.frequency,
                            label: tag.label
                        });
                    });

                    $scope.chartActive = true;
                }, function (res) {
                    alert('Error while launching tagging operation ' + JSON.stringify(res));
                });

            }
        };

        // Form validation
        $scope.validateCreateNewSpace = function() {
            // Creation the json to be passed to the API
            var json = {
                label: $scope.spaceForm.label,
                crawlIds: [],
                stopwordsIds:[]
            };

            $scope.spaceForm.crawls.forEach(function(crawl) {
                json.crawlIds.push(crawl.id);
            });

            // this is for the stop word lists
            $scope.spaceForm.swls.forEach(function(list) {
                json.stopwordsIds.push(list.id);
            });

            // We can make our space creation request
            $semanticSpace.createSpace1(json).then(function(res) {
                $rootScope.shared.spaces.push(res.data);

                //load tree
                $fancyTree.getNodeByKey("ROOT2").load(true).then(function(){
                    $fancyTree.getNodeByKey("ROOT2").setExpanded();
                    $fancyTree.getNodeByKey("ROOT2").setActive();
                    $scope.sortDirAsc = false;
                    $scope.sortTree(1); //date
                });


            }, function(res) {
                // Hiding the modal
                alert('Unknown error occurred when try to connect to server: ' + JSON.stringify(res));

                $('#createNewSpaceModal').modal('toggle');
            });
            // Hiding the modal
            $('#createNewSpaceModal').modal('toggle');
        };

        /**
         *
         */
        $("#createNewSpaceModal").on("shown.bs.modal", function() {
            document.activeElement.blur();
            $('#label').focus();
        });

        // Launching the modal allowing a user to create a new space
        $scope.createNewSpace = function() {
          debugger;
          $scope.stopWordLists = {};
          // going to load the stop word lists.
          $stopWordsService.getStopWordLists().then(function(swLists) {
            debugger;
    			   $scope.stopWordLists = swLists;
    			}, function(res) {
    				alert('Error while loading stop word lists. Please check server state');
    			});

          $scope.spaceForm = {
              label: '',
              crawls: [],
              swlists: []
          };

          $('#createNewSpaceModal').modal('show');
        };

        $scope.nbDocsOfSpace = function(space) {
            var nbDocs = 0;

            if($scope.crawls) {
                space.crawlIds.forEach(function (crawlId) {
                    nbDocs += $scope.crawls[crawlId].volume;
                });
            }

            return nbDocs;
        };

    }]);
