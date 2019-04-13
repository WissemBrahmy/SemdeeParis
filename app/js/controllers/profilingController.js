'use strict';

angular.module('semdeePortal.controllers')
    .controller('profilingController',
    ['$scope', '$config', '$interval','$profiling','cfpLoadingBar','$document', '$semanticSpace', '$timeout',
    function ($scope, $config, $interval, $profiling,cfpLoadingBar,$document,$semanticSpace, $timeout) {
            /**
             * VARs DEFINITION
             */

            $scope.chart = {
                data: [],
                title: '',
                type: 'donut-chart'
            };

            // Form initilization
            $scope.profilingForm = {};

            // Semantic spaces initialization
            $scope.spaces = [];

            $semanticSpace.getAllSpaces().then(function(spaces) {
                $scope.spaces = spaces;
            }, function(res) {
                alert('Error while loading user spaces' + JSON.stringify(res));
            });

            // Taggers initialization
            $scope.profilings = [];

            $profiling.getAllProfilings().then(function(profilings) {
                $scope.profilings = profilings;
            }, function(res) {
                alert('Error while loading user profilings' + JSON.stringify(res));
            });

            /**
             * FUNCTIONS DEFINITION
             */
            // Calling the API to get profiling result, ie Categories created
            $scope.getProfilingResult = function(profiling) {
                $profiling.getPersonFromProfiling(profiling.id).then(function(data) {
                    // Setting some var
                    $scope.documents = [];
                    $scope.chart = {
                        data: [],
                        title: '',
                        type: 'donut-chart'
                    };

                    // Resetting some var
                    $scope.activeProfiling = profiling; // Used to know which profiling is active
                    $scope.document = $scope.person = undefined;

                    // Creating a table that will fetch chart data
                    data.forEach(function(person) {
                        $scope.chart.data.push({ id: person.id, value: person.nbDocs, label: person.label });
                    });

                    // Scroll to the good area
                    $timeout(function() {
                        $scope.scrollTo('profilingDetail');
                    });
                }, function(res) {
                    alert('Unknown error occurred when try to connect to server: ' + JSON.stringify(res));
                });
            };

            // Loading doc description in zone 3
            $scope.loadDocument = function(document) {
                cfpLoadingBar.start();
                $scope.document = document;
                $timeout(function() {
                    $scope.scrollTo('documentDetail');
                });
                cfpLoadingBar.complete();
            };

            // Checking profiling state
            //TODO we should use WebSockets!
            $interval(function() {
                $scope.profilings.forEach(function(profiling) {
                    // If this profiling is not finished, we need to check its state
                    if(profiling.status != 2) {
                        $profiling.updateMonitoringInfo(profiling);
                    }
                })
            }, $config.api.pollInterval);

            // Event thrown when the user click on a chart part
            // Call the API to get documents of a person
            $scope.$on('chart.onClick', function(angularEvent, event){
                cfpLoadingBar.start();

                $scope.document = undefined;
                $scope.person = event.label;

                $profiling.getDocsFromPerson(event.id).then(function(data) {
                    $scope.documents = data;

                    // Auto scroll to the good area
                    $timeout(function() {
                        $scope.scrollTo('documentsList');
                    });
                    cfpLoadingBar.complete();
                }, function(res) {
                    alert('Unknown error occurred when try to connect to server: ' + JSON.stringify(res));
                });
            });

            //
            $scope.scrollTo = function(elementId) {
                var element = angular.element(document.getElementById(elementId));
                $document.duScrollToElementAnimated(element);
            };

            // Launching the modal allowing a user to launch a new profiling
            $scope.launchNewProfiling = function() {
                $('#launchNewProfilingModal').modal('show');
            };

            // Form validation
            $scope.validateLaunchNewProfiling = function() {
                // Creation the json to be passed to the API
                var json = {
                    label: $scope.profilingForm.label,
                    spaceId: $scope.profilingForm.space.id
                };

                // Calling the API to launch a profiling
                $profiling.launchProfiling(json).then(function (profiling) {
                    // Adding the new profiling to the list
                    $scope.profilings.push(profiling);

                    // Resetting the form
                    $scope.profilingForm = {};

                    // Hiding the modal
                    $('#launchNewProfilingModal').modal('toggle');
                }, function (res) {
                    // Hiding the modal
                    alert('Unknown error occurred when try to connect to server: ' + JSON.stringify(res));

                    $('#launchNewProfilingModal').modal('toggle');
                });
            };
        }
    ]);