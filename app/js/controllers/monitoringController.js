'use strict';

angular.module('semdeePortal.controllers')

    .controller('monitoringController',

        ['$scope', '$rootScope', '$monitoring', '$semanticSpace','$crawl',
        function($scope, $rootScope, $monitoring, $semanticSpace, $crawl) {

            // we need clear selected space, because we need to get all crawls from service to calculate percentager on total documents of spaces
            $rootScope.shared.space = undefined;
            /**
             * VARs DEFINITION
             */
          //  $scope.Math=Math;
            // Monitorings initialization
            $scope.monitorings = [];
            $scope.chart = {
                data: [],
                title: '',
                type: 'donut-chart'
            };
            $scope.showEditClusterForm = false;
            $scope.clusterName = '';
            // Semantic spaces initialization
            $semanticSpace.getAllSpaces().then(function (spaces) {
                $rootScope.shared.spaces = spaces;
            }, function (res) {
                alert('Error while loading user spaces ' + JSON.stringify(res));
            });
            /**
             * FUNCTIONS DEFINITION
             */
            // selecting a semantic space
            $scope.selectedSpace = function () {

                $scope.currentPageMonitoringList = 1;
                $scope.resetSelectedMonitoring();
                $scope.getAllMonitorings($rootScope.shared.space.id);
                // get total document of a crawl)
                $scope.getNbDocsOfSpace($rootScope.shared.space);
            };

            $scope.nbDocsOfSpace = 0;
            $scope.nbDocsOfMonitoring = 0;

            $scope.getNbDocsOfSpace = function(space){
                $scope.nbDocsOfSpace = 0;

                if (space != null){
                    space.crawlIds.forEach(function(crawlid, index) {
                        $crawl.getCrawl(crawlid).then(
                            function(crawl){
                                $scope.nbDocsOfSpace +=  crawl.volume;
                            }
                        )

                    });
                }
            }

            $scope.getAllMonitorings = function (spaceId) {

                $monitoring.getAllMonitorings(spaceId).then(function (monitorings) {
                    $scope.monitorings = monitorings;
                }, function (res) {
                    alert('Error while loading user monitorings ' + JSON.stringify(res));
                });
            };

            /* invoked when browsing one monitoring detail */
            $scope.selectMonitoring = function (monitoring) {

                if ($scope.activeMonitoring == monitoring) {

                    $scope.resetSelectedMonitoring();
                } else {

                    $scope.resetSelectedMonitoring();
                    $scope.activeMonitoring = monitoring; // Used to know which monitoring is active
                    // get total numbers of documents in Clustering
                    $scope.nbDocsOfMonitoring = 0;
                    $monitoring.getClustersFromMonitoring(monitoring.id).then(
                        function (res) {
                            $scope.chart = {
                                data: [],
                                title: '',
                                type: 'donut-chart'
                            };
                            // calculate document percent
                            res.data.forEach(function(cluster, index) {
                                $scope.nbDocsOfMonitoring += cluster.nbDocs;
                            });
                            // Creating a table that will fetch chart data
                            res.data.forEach(function(cluster) {

                                var tags = cluster.tags.split(' '); tags.pop();

                                $scope.chart.data.push({
                                    id: cluster.id,
                                    value: cluster.nbDocs,
                                    label: cluster.label,
                                    tags:tags,
                                    nodeId: cluster.nodeId,
                                    // for bubble chart
                                    percent:$scope.nbDocsOfMonitoring>0 ? Math.round(cluster.nbDocs*100/$scope.nbDocsOfMonitoring):0,
                                });
                            });
                        }, function (res) {
                            alert('Error while loading monitoring clusters ' + JSON.stringify(res));
                        });
                }
            };

            $scope.deleteMonitoring = function(monitoring) {
                $monitoring.deleteMonitoring(monitoring.id).then(
                    function(){
                        //refresh
                        $scope.selectedSpace();
                    },
                    function(){
                        alert("Error while deleting monitoring");
                    }
                );
            };

            // Event thrown when the user click on a chart part
            // Call the API to get documents of a category
            $scope.$on('chart.onClick', function (angularEvent, event) {
              debugger;
                if (event.id == 0){
                    return;
                }

                // hide form "edit cluster name"
                $scope.showEditClusterForm = false;
                // no need to reload data if selected cluster is the same
                if ($scope.activeCluster == event) {
                    $scope.activeCluster = undefined;
                } else {
                    $scope.activeCluster = event;
                    $monitoring.getDocsFromClusterByPage(event.id)
                    .then(function (res) {

                        $scope.documents = res.data;
                        $scope.currentPageDocsList = 1;
                    }, function (res) {
                        alert('Couldn\'t load documents for cluster ' + event.label);
                    });
                }

                $scope.$apply();
            });

            // click on icon edit cluster show edit cluster form
            $scope.editCluster = function(){
                if (angular.isDefined($scope.activeCluster)){
                    $scope.clusterName = '';
                    $scope.showEditClusterForm = true;
                }
            };

             // close form "edit cluster" with action type=1 ==> save, otherwise ==> cancel
            $scope.closeEditClusterForm = function(act){

                $scope.showEditClusterForm = false;
                if (act){// save new cluster name
                    if (angular.isDefined($scope.activeCluster)) {
                        if ($scope.clusterName) {
                            $monitoring.renameCluster($scope.activeMonitoring.id, $scope.activeCluster.nodeId, $scope.clusterName)
                                .then(function(){
                                    //refresh chart after rename
                                    var tmp = $scope.activeMonitoring;
                                    $scope.activeMonitoring = null; // force work, not reset
                                    $scope.selectMonitoring(tmp);
                                })
                        }
                    }
                }
                else{// cancel
                    $scope.clusterName = '';
                }
            };

            // Launching the modal allowing a user to launch a new monitoring
            $scope.launchMonitoring = function () {
              debugger;
                $scope.isLoading = true;
                // Creation  of the json to be passed to the API
                var json = {
                    spaceId: $rootScope.shared.space.id

                };

                // Calling the API to launch a monitoring
                $monitoring.launchMonitoring(json).then(function (monitoring) {
                    // Adding the new monitoring to the list
                    $scope.monitorings.push(monitoring);
                    $scope.isLoading = false;
                }, function (res) {
                    $scope.isLoading = false;
                    alert('Error while launching monitoring ' + JSON.stringify(res));
                });
            };

            $scope.resetSelectedMonitoring = function () {

                $scope.activeMonitoring = undefined;
                $scope.activeCluster = undefined;
                $scope.documents = undefined;
            };

            // automatically selects current semantic space on page load
            if ($rootScope.shared.space) {
                $scope.selectedSpace();
            }
 }]);
