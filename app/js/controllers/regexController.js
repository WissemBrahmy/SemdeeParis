'use strict';

angular.module('semdeePortal.controllers')
    .controller('regexController',
    ['$rootScope', '$scope', '$config', '$params', '$location', '$regexService',
    function ($rootScope, $scope, $config, $params, $location, $regexService) {


            $scope = $rootScope;

            $scope.regexListsSepllings = {};
            $scope.originalListsSepllings = {};
            $scope.dispListsSepllings = [];
            $scope.originalRegexes = "";
            $scope.editRegexesFrm = {
                label: null,
                id: null,
                regexes: ""
            };

            $scope.deleteRegexesFrm = {
                label: null,
                id: null,
                num: null
            };

            $scope.newRegexesFrm = {
                label: null,
                id: null,
                regexes: null
            };

            $scope.init = function(){
                $scope.editRegexesFrm.label = null;
                $scope.editRegexesFrm.id = null;
                $scope.editRegexesFrm.regexes = [];
            }

            $scope.editRegexesList = function (id){
                //debugger;
                var index = -1;
                for (var i in $scope.regexListsSepllings){
                    var list = $scope.regexListsSepllings[i];
                    if (list.id == id){
                        index = i;
                        break;
                    }
                }
                $scope.editRegexesFrm.label = $scope.regexListsSepllings[index].label;
                $scope.editRegexesFrm.id = id;
                $scope.editRegexesFrm.regexes = "";
                for (var i in $scope.regexListsSepllings[index].spellings){
                    $scope.editRegexesFrm.regexes += $scope.regexListsSepllings[index].spellings[i] + "\n";
                }
                $scope.originalRegexes = $scope.editRegexesFrm.regexes;
                $('#editRegexesModal').modal("show");
            }

            $scope.deleteRegexesList = function (id){
                //debugger;
                var index = -1;
                for (var i in $scope.regexListsSepllings){
                    var list = $scope.regexListsSepllings[i];
                    if (list.id == id){
                        index = i;
                        break;
                    }
                }
                $scope.deleteRegexesFrm.label = $scope.regexListsSepllings[index].label;
                $scope.deleteRegexesFrm.id = id;
                $scope.deleteRegexesFrm.num = $scope.regexListsSepllings[index].spellings.length;
                $('#deleteRegexListModal').modal("show");
            }

            $scope.addRegexList = function (){
              //  debugger;

                $scope.newRegexesFrm.label = "";
                $scope.newRegexesFrm.id = "";
                $scope.newRegexesFrm.regexes = "";
                $('#newRegexListModal').modal("show");
            }

            /**
             * FUNCTIONS DEFINITION
             */
            $scope.getAllRegexesLists = function () {
                //debugger;
                $regexService.getRegexListsWithSpellings().then(function (lists) {

                    $scope.regexListsSepllings = lists;
                    $scope.regexListsSepllings = angular.copy($scope.regexListsSepllings);
                }, function (lists) {
                    alert('Error while loading regex lists');
                });
            };

            // Calling the API to get regex lists.
            $scope.getAllRegexesLists();


            // Launching the modal allowing a user to create a new space
            $scope.newRegexSearch = function() {
              //debugger;
              $scope.regexLists = {};
              // going to load regexlists.
              $regexService.getRegexLists().then(function(rgxLists) {
              //  debugger;
                 $scope.regexLists = rgxLists;
              }, function(res) {
                alert('Error while loading regex lists. Please check server state');
              });

              $scope.regexSearchForm = {
                  label: '',
                  crawls: {},
                  rgxlists: []
              };

              $('#newRegexSearchModal').modal('show');
            };

            // Form validation
            $scope.validateNewRegexSearch = function() {
                // Creation the json to be passed to the API
                var json = {
                    label: $scope.regexSearchForm.label,
                    crawlId: -1,
                    regexListIds:[]
                };

                //debugger;
                //$scope.regexSearchForm.crawls.forEach(function(crawl) {
                //    json.crawlIds.push(crawl.id);
                //});
                json.crawlId = $scope.regexSearchForm.crawls.id;

                // this is for regex lists
                $scope.regexSearchForm.rgxlists.forEach(function(list) {
                    json.regexListIds.push(list.id);
                });

                // We can make our new regex search request
                $regexService.newRegexSearch(json).then(function(res) {
                    // TODO: there we should push the new search to the tree ...
                    //$rootScope.shared.spaces.push(res.data);

                    //load tree
                    /*$fancyTree.getNodeByKey("ROOT2").load(true).then(function(){
                        $fancyTree.getNodeByKey("ROOT2").setExpanded();
                        $fancyTree.getNodeByKey("ROOT2").setActive();
                        $scope.sortDirAsc = false;
                        $scope.sortTree(1); //date
                    });*/


                }, function(res) {
                    // Hiding the modal
                    alert('Unknown error occurred when try to connect to server: ' + JSON.stringify(res));

                    //$('#newRegexSearchModal').modal('toggle');
                });
                // Hiding the modal
                $('#newRegexSearchModal').modal('toggle');
            };

            $scope.updateRegexes = function () {
                //debugger;
                if ($scope.originalRegexes == $scope.editRegexesFrm.regexes)
                    return;
                $regexService.updateRegexesList(
                    $scope.editRegexesFrm.id,
                    $scope.editRegexesFrm.regexes
                ).then(function(res){
                  $('#editRegexesModal').modal('toggle');
                  $scope.getAllRegexesLists();

                });;
            };

            $scope.onDeleteRegexList = function (id) {
              //  debugger;
                $regexService.deleteRegexList(id).then(function(res){
                  $('#deleteRegexListModal').modal('toggle');
                  $scope.getAllRegexesLists();

                });
            };

            $scope.onAddRegexList = function () {
              //  debugger;
                var label = $scope.newRegexesFrm.label;
                var regexes = $scope.newRegexesFrm.regexes;
                $regexService.addRegexListWithSpellings(label, regexes)
                .then(function(res){
                  $('#newRegexListModal').modal('toggle');
                  $scope.getAllRegexesLists();

                });
            };

        }
    ]);
