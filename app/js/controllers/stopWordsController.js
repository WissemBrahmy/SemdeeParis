'use strict';

angular.module('semdeePortal.controllers')
    .controller('stopWordsController',
    ['$scope', '$config', '$params', '$location', '$stopWordsService',
    function ($scope, $config, $params, $location, $stopWordsService) {

            $scope.stopWordListsSepllings = {};
            $scope.originalListsSepllings = {};
            $scope.dispListsSepllings = [];
            $scope.originalStopWords = "";
            $scope.editStopWordsFrm = {
                label: null,
                id: null,
                stopWords: ""
            };

            $scope.deleteStopWordsFrm = {
                label: null,
                id: null,
                num: null
            };

            $scope.newStopWordsFrm = {
                label: null,
                id: null,
                stopwords: null
            };

            $scope.init = function(){
                $scope.editStopWordsFrm.label = null;
                $scope.editStopWordsFrm.id = null;
                $scope.editStopWordsFrm.stopWords = [];
            }

            $scope.editStopWordsList = function (id){
                debugger;
                var index = -1;
                for (var i in $scope.stopWordListsSepllings){
                    var list = $scope.stopWordListsSepllings[i];
                    if (list.id == id){
                        index = i;
                        break;
                    }
                }
                $scope.editStopWordsFrm.label = $scope.stopWordListsSepllings[index].label;
                $scope.editStopWordsFrm.id = id;
                $scope.editStopWordsFrm.stopWords = "";
                for (var i in $scope.stopWordListsSepllings[index].spellings){
                    $scope.editStopWordsFrm.stopWords += $scope.stopWordListsSepllings[index].spellings[i] + "\n";
                }
                $scope.originalStopWords = $scope.editStopWordsFrm.stopWords;
                $('#editStopWordsModal').modal("show");
            }

            $scope.deleteStopWordsList = function (id){
                debugger;
                var index = -1;
                for (var i in $scope.stopWordListsSepllings){
                    var list = $scope.stopWordListsSepllings[i];
                    if (list.id == id){
                        index = i;
                        break;
                    }
                }
                $scope.deleteStopWordsFrm.label = $scope.stopWordListsSepllings[index].label;
                $scope.deleteStopWordsFrm.id = id;
                $scope.deleteStopWordsFrm.num = $scope.stopWordListsSepllings[index].spellings.length;
                $('#deleteStopWordListModal').modal("show");
            }

            $scope.addStopWordList = function (){
                debugger;

                $scope.newStopWordsFrm.label = "";
                $scope.newStopWordsFrm.id = "";
                $scope.newStopWordsFrm.stopWords = "";
                $('#newStopWordListModal').modal("show");
            }

            /**
             * FUNCTIONS DEFINITION
             */
            $scope.getAllStopWordsLists = function () {
                debugger;
                $stopWordsService.getStopWordListsWithSpellings().then(function (lists) {

                    $scope.stopWordListsSepllings = lists;
                    $scope.originalListsSepllings = angular.copy($scope.stopWordListsSepllings);
                }, function (lists) {
                    alert('Error while loading stop words lists');
                });
            };

            // Calling the API to get stop words lists.
            $scope.getAllStopWordsLists();


            $scope.updateStopWords = function () {
                debugger;
                if ($scope.originalStopWords == $scope.editStopWordsFrm.stopWords)
                    return;
                $stopWordsService.updateStopWordsList(
                    $scope.editStopWordsFrm.id,
                    $scope.editStopWordsFrm.stopWords
                ).then(function(res){
                  $('#editStopWordsModal').modal('toggle');
                  $scope.getAllStopWordsLists();

                });;
            };

            $scope.onDeleteStopWordList = function (id) {
                debugger;
                $stopWordsService.deleteStopWordList(id).then(function(res){
                  $('#deleteStopWordListModal').modal('toggle');
                  $scope.getAllStopWordsLists();

                });
            };

            $scope.onAddStopWordList = function () {
                debugger;
                var label = $scope.newStopWordsFrm.label;
                var stopWords = $scope.newStopWordsFrm.stopWords;
                $stopWordsService.addStopWordListWithSpellings(label, stopWords)
                .then(function(res){
                  $('#newStopWordListModal').modal('toggle');
                  $scope.getAllStopWordsLists();

                });
            };

        }
    ]);
