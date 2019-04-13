'use strict';
//,['ui.grid', 'ui.grid.cellNav', 'ui.grid.edit', 'ui.grid.resizeColumns',
//    'ui.grid.pinning', 'ui.grid.selection', 'ui.grid.moveColumns', 'ui.grid.exporter', 'ui.grid.importer', 'ui.grid.grouping']

//var app = angular.module('app', ['ngAnimate', 'ngTouch', 'ui.grid', 'ui.grid.selection', 'ui.grid.exporter']);

angular.module("semdeePortal.controllers")
    .controller('homeController',
    ['$rootScope', '$scope', '$location', '$interval', '$crawl', '$monitoring', '$documents', '$semanticSpace', '$config', '$filter', '$fancyTree', '$route', '$tagger', '$params', '$accountParams', '$timeout', 'categorizerService', '$regexService',
        function ($rootScope, $scope, $location, $interval, $crawl, $monitoring, $documents, $semanticSpace, $config, $filter, $fancyTree, $route, $tagger, $params, $accountParams, $timeout, categorizerService, $regexService) {

            var scope = $rootScope;

            // load parameters
            $params.getAllParams().then(function (res) {
                scope.allParameters = res;
            })

            // load user crawl source parameters
            $accountParams.getTwitterParams().then(function (res) {
                scope.twitterParameters = res;
            })
            $accountParams.getFacebookParams().then(function (res) {
                scope.facebookParameters = res;
            })
            $accountParams.getGoogleParams().then(function (res) {
                scope.googleParameters = res;
            })
            $accountParams.getBingParams().then(function (res) {
                scope.bingParameters = res;
            })

            /**
             * Pagination options
             */
            if ($scope.paginationOptions == undefined) {
                $scope.paginationOptions = {
                    pageNumber: 1,
                    pageSize: 25,
                    sort: null
                };
            }

            scope.isClusterActive = false;
            scope.isCategoryActive = false;

            scope.paginationOptions = $scope.paginationOptions;

            /**
             * GIRD OPTIONS
             */
            $scope.gridOptions = {
                paginationPageSizes: [25, 50, 75],
                paginationPageSize: 25,
                useExternalPagination: true,
                useExternalSorting: true,

                data: [],
                enableColumnResizing: true,
                enableFiltering: true,
                enableGridMenu: true,
                enableRowSelection: true,
                enableFullRowSelection: true,
                enableSelectAll: false,
                multiSelect: false,
                noUnselect: true,
                exporterMenuPdf: false,
                //minRowsToShow : 20,
                //rowTemplate : "<div class='draggable' _draggable='true' data-row='{{{id:row.entity.id,title:row.entity.title}|json}}'><div style='cursor: pointer' ng-repeat=\"(colRenderIndex, col) in colContainer.renderedColumns track by col.uid\" ui-grid-one-bind-id-grid=\"rowRenderIndex + '-' + col.uid + '-cell'\"  class=\"ui-grid-cell\"  ng-class=\"{ 'ui-grid-row-header-cell': col.isRowHeader }\" role=\"{{col.isRowHeader ? 'rowheader' : 'gridcell'}}\" ui-grid-cell></div></div>",
                columnDefs: [
                    { name: 'id', field: 'id', width: 70 },
                    { name: 'title', field: 'title', width: '10%', cellTooltip: function (r, c) { return r.entity.title } },
                    { name: 'description', field: 'description', width: '40%', cellTooltip: function (r, c) { return r.entity.description } },
                    { name: 'RgxSearchResult', field: 'rgxSearchResult', width: '20%', visible: false, cellTooltip: function (r, c) { return r.entity.rgxSearchResult } },
                    { name: 'url', field: 'url', width: '10%', cellTooltip: function (r, c) { return r.entity.url } },
                    { name: 'tags', field: 'tags', width: '10%', visible: false, cellTooltip: function (r, c) { return r.entity.tags } },
                    { name: 'source', field: 'source', width: '10%', visible: false },
                    { name: 'author', field: 'author', width: '10%', visible: false, cellTooltip: function (r, c) { return r.entity.author } },
                    { name: 'shortDescription', field: 'shortDescription', width: '10%', visible: false, cellTooltip: function (r, c) { return r.entity.shortDescription } },
                    { name: 'editDate', field: 'eDate', width: '10%', visible: false, cellFilter: 'date:"dd-MMM-yyyy"' },
                    { name: 'fetchDate', field: 'fetchDate', width: '10%', visible: false, cellFilter: 'date:"dd-MMM-yyyy"' },
                    { name: 'language', field: 'language', width: '10%', visible: false },
                    { name: 'crawlId', field: 'crawlId', width: '10%', visible: false },
                    { name: 'distance', field: 'distance', width: '10%', visible: false },
                    { name: 'proximity', field: 'proximity', width: '10%' },
                    { name: 'webSource', field: 'webSource', width: '10%', visible: false },
                    //{ name:'age', width:100, enableCellEdit: true, aggregationType:uiGridConstants.aggregationTypes.avg, treeAggregationType: uiGridGroupingConstants.aggregation.AVG },
                    //{ name:'friends[0].name', displayName:'1st friend', width:150, enableCellEdit: true },
                    //{ name:'friends[1].name', displayName:'2nd friend', width:150, enableCellEdit: true },
                    //{ name:'friends[2].name', displayName:'3rd friend', width:150, enableCellEdit: true },
                    //{ name:'agetemplate',field:'age', width:150, cellTemplate: '<div class="ui-grid-cell-contents"><span>Age 2:{{COL_FIELD}}</span></div>' },
                    //{ name:'Is Active',field:'isActive', width:150, type:'boolean' },
                    //{ name:'Join Date',field:'registered', cellFilter:'date', width:150, type:'date', enableFiltering:false },
                    //{ name:'Month Joined',field:'registered', cellFilter: 'date:"MMMM"', filterCellFiltered:true, sortCellFiltered:true, width:150, type:'date' }
                ],

                /*exporterAllDataFn: function() {
                 //$scope.paginationOptions.pageNumber = 1;
                 //$scope.paginationOptions.pageSize = $scope.gridOptions.totalItems;
                 setTimeout(function()
                   {
                     $scope.getAllPages().then(function(res)
                     {
                       $scope.JSONToCSVConvertor(res, "semdee export", true);
                     });
                   },100);
                   //             return getAllPages().then(function(res){
                    //return res;
                 //});
               },*/

                onRegisterApi: function (gridApi) {
                    // for a single filter
                    $scope.gridApi = gridApi;
                    gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
                        $scope.paginationOptions.pageNumber = newPage;
                        $scope.paginationOptions.pageSize = pageSize;
                        getPage();
                    });


                    /**
                     * getPage() function for pagination.
                     * This function gets the next/previous page according to the
                     * selected grid.
                     */
                    var getPage = function () {
                        //debugger;
                        var nodeType = scope.activeNode.data.type;
                        var node = scope.activeNode;

                        if (nodeType === "ROOT1") {
                            //scope.launchNewCrawl();
                        } else if (nodeType === "CRAWL") {
                            if (scope.filterValue === "") {
                                $crawl.getCrawlResultByPage({ id: scope.activeNode.data.id },
                                    $scope.paginationOptions.pageNumber, $scope.paginationOptions.pageSize)
                                    .then(function (res) {

                                        scope.documents = res.data;
                                    });
                            }
                            else {
                                $crawl.searchCrawlDocuments(scope.activeNode.data.id,
                                    scope.filterValue, $scope.paginationOptions.pageNumber, $scope.paginationOptions.pageSize)
                                    .then(function (res) {
                                        scope.documents = res.data;
                                    });
                            }
                        } else if (nodeType === "RGXSEARCH") {
                            if (scope.filterValue === "") {
                                $regexService.getRgxSearchResultByPage(scope.activeNode.data.id,
                                    $scope.paginationOptions.pageNumber, $scope.paginationOptions.pageSize)
                                    .then(function (res) {

                                        scope.documents = res.data;
                                    });
                            }
                            else {
                                $regexService.searchRgxSearchDocuments(scope.activeNode.data.id,
                                    scope.filterValue, $scope.paginationOptions.pageNumber, $scope.paginationOptions.pageSize)
                                    .then(function (res) {
                                        scope.documents = res.data;
                                    });
                            }
                        }else if (nodeType === "SPACE") {
                            if (scope.filterValue === "") {
                                $semanticSpace.getDocumentsByPage(scope.activeNode.data.id,
                                    $scope.paginationOptions.pageNumber, $scope.paginationOptions.pageSize)
                                    .then(function (res) {
                                        scope.documents = res.data;
                                    });
                            }
                            else {
                                $semanticSpace.searchSpaceDocuments(scope.activeNode.data.id,
                                    scope.filterValue, $scope.paginationOptions.pageNumber, $scope.paginationOptions.pageSize)
                                    .then(function (res) {
                                        scope.documents = res.data;
                                    });
                            }

                        } else if (nodeType == "MONITOR") {

                            if (!scope.isClusterActive) {
                                // if no cluster is active.
                                var getClusterDetails = function (myClusters, clusterId) {
                                    for (var i = 0; i < myClusters.length; i++) {
                                        if (myClusters[i].id == clusterId) {
                                            return myClusters[i];
                                        }
                                    }
                                }
                                var monitoringDocs = [];
                                if (scope.filterValue === "") {
                                    // there is no filter

                                    //get all document of monitoring
                                    $monitoring.getDocsFromMonitoringByPage(scope.activeNode.data.id,
                                        $scope.paginationOptions.pageNumber, $scope.paginationOptions.pageSize)
                                        .then(function (res) {
                                            //scope.clusterdocuments = res;
                                            var keys = Object.keys(res.data);
                                            for (var i = 0; i < keys.length; ++i) {
                                                var clusterId = keys[i];
                                                var clus = getClusterDetails(scope.ClusterOfMonitor, keys[i]);
                                                var docs = res.data[keys[i]];
                                                for (var j = 0; j < docs.length; ++j) {
                                                    var doc = docs[j];
                                                    doc.clusterName = clus.label;
                                                    doc.clusterTags = clus.tags;
                                                    monitoringDocs.push(doc);
                                                }
                                            }
                                            scope.clusterdocuments = monitoringDocs;
                                        });
                                } else { // if (scope.filterValue != "")
                                    // there is filter, so get pages from filtered result.

                                    $monitoring.searchMonitoringDocuments(scope.activeNode.data.id,
                                        scope.filterValue, $scope.paginationOptions.pageNumber, $scope.paginationOptions.pageSize)
                                        .then(function (res) {
                                            var keys = Object.keys(res.data);
                                            for (var i = 0; i < keys.length; ++i) {
                                                var clusterId = keys[i];
                                                var clus = getClusterDetails(scope.ClusterOfMonitor, keys[i]);
                                                var docs = res.data[keys[i]];
                                                for (var j = 0; j < docs.length; ++j) {
                                                    var doc = docs[j];
                                                    doc.clusterName = clus.label;
                                                    doc.clusterTags = clus.tags;
                                                    monitoringDocs.push(doc);
                                                }
                                            }
                                            scope.clusterdocuments = monitoringDocs;
                                        });
                                }

                            }
                            else { // if cluster is active
                              //  debugger;
                                if (scope.filterValue === "") {
                                    // there is no filter
                                    var clusterId = $scope.activeCluster.id;
                                    $monitoring.getDocsFromClusterByPage(clusterId,
                                        $scope.paginationOptions.pageNumber, $scope.paginationOptions.pageSize)
                                        .then(function (res) {
                                            scope.documents = res.data;
                                        });
                                } else {
                                    // there is filter
                                    var clusterId = $scope.activeCluster.id;
                                    $monitoring.searchClusterDocuments(clusterId, scope.filterValue,
                                        $scope.paginationOptions.pageNumber, $scope.paginationOptions.pageSize)
                                        .then(function(res){
                                            scope.documents = res.data;
                                        });
                                }
                            } //else
                        } else if (nodeType === "CLUSTER") {
                            scope.isClusterActive = true;
                            $monitoring.getDocsFromClusterByPage(scope.activeNode.data.id,
                                $scope.paginationOptions.pageNumber, $scope.paginationOptions.pageSize)
                                .then(function (res) {
                                    scope.documents = res.data;
                                });

                        } else if (nodeType == "CATEGORY") {
                            scope.isCategoryActive = true;

                            var categoryId = node.data.id;
                            var categorizerId = node.parent.data.id;

                            categorizerService.getCategoryDocumentsCategorizerByPage(categorizerId, categoryId,
                                $scope.paginationOptions.pageNumber, $scope.paginationOptions.pageSize)
                                .then(function (res) {
                                    scope.documents = res.data;
                                    //alert("total docs length: " + res.data.length);
                                });

                        } else if (nodeType === "CATEGORIZER") {
                            if (scope.isCategoryActive) {

                                var categoryId = $scope.activeCluster.id;
                                var categorizerId = node.data.id;

                                categorizerService.getCategoryDocumentsCategorizerByPage(categorizerId, categoryId,
                                    $scope.paginationOptions.pageNumber, $scope.paginationOptions.pageSize)
                                    .then(function (res) {
                                        scope.documents = res.data;
                                        //alert("total docs length: " + res.data.length);
                                    });

                            } else {
                                var getCategoryDetails = function (myCategories, categoryId) {
                                    for (var i = 0; i < myCategories.length; i++) {
                                        if (myCategories[i].categoryId == categoryId) {
                                            return myCategories[i];
                                        }
                                    }
                                }
                                var catdocs = [];
                                // Now, get the documents by page and push it the grid
                                categorizerService.getCategoriesDocumentsCategorizerByPage(scope.activeNode.data.id,
                                    $scope.paginationOptions.pageNumber, $scope.paginationOptions.pageSize)
                                    .then(function (res) {
                                        var keys = Object.keys(res);
                                        for (var i = 0; i < keys.length; ++i) {
                                            var cat = getCategoryDetails(scope.allCategories, keys[i]);
                                            var docs = res[keys[i]];
                                            for (var j = 0; j < docs.length; ++j) {
                                                var doc = docs[j];
                                                doc.clusterName = cat.label;
                                                doc.clusterTags = cat.tags;
                                                catdocs.push(doc);
                                            }
                                        }
                                        scope.clusterdocuments = catdocs;
                                    });

                            }
                        }
                    }; // end of getPage();

                    gridApi.selection.on.rowSelectionChanged($scope, function (row) {

                        scope.activeDocument = row.entity;

                        //turn on drag for row
                        window.setTimeout(function () {
                            $('.document-title-drag').remove();
                            $('.ui-grid-row').css('cursor', 'auto');

                            $("div.ui-grid-row-selected:eq(0)").draggable({
                                revert: true,
                                helper: "clone",
                                cursorAt: { top: -5, left: -5 },
                                zIndex: 1000,
                                connectToFancytree: true,   // let Fancytree accept drag events
                                appendTo: "body",
                                addClasses: false,
                                start: function (e) {
                                    if (!$(this).find('.document-title-drag').text()) {
                                        return false;
                                    }
                                },
                                //drag:function(e){
                                //}
                            }).find('.ui-grid-cell').append("<div class='document-title-drag'>" + scope.activeDocument.title + "</div>");

                            $("div.ui-grid-row-selected:eq(0)").css('cursor', 'move');

                        }, 100)
                    });


                }
            }


            /*******************************************************************************/
            /*******************************************************************************/
            /* export as original data, */
            /*******************************************************************************/
            /*******************************************************************************/
            /* if this is the way you wanna. */
            /*******************************************************************************/
            /*******************************************************************************/
            /* it calls the service of crawl, */
            /*******************************************************************************/
            /*******************************************************************************/
            /* be serious nothing is droll.*/

            /**
             * exportAsOriginalData function.
             * export the cluster or category as original data.
             */
            $scope.exportAsOriginalData = function () {
                //alert("in exportAsOriginalData() function");
              //  debugger;
                var nodeType = scope.activeNode.data.type;
                var node = scope.activeNode;

                if (nodeType === "MONITOR") {

                    if (scope.isClusterActive) {
                        // if isClusterActive
                        var clusteringId = node.data.id;
                        var clusterId = $scope.activeCluster.id;
                        $crawl.addClusterAsCrawl(clusteringId, clusterId);
                    } //if
                } else if (nodeType === "CLUSTER") {
                    var clusteringId = node.parent.data.id;
                    var clusterId = node.data.id;
                    $crawl.addClusterAsCrawl(clusteringId, clusterId);
                } else if (nodeType === "CATEGORY") {
                    scope.isCategoryActive = true;
                    var categoryId = node.data.id;
                    var categorizerId = node.parent.data.id;
                    $crawl.addCategoryAsCrawl(categorizerId, categoryId);
                } else if (nodeType === "CATEGORIZER") {
                    if (scope.isCategoryActive) {
                        var categoryId = $scope.activeCluster.id;
                        var categorizerId = node.data.id;
                        $crawl.addCategoryAsCrawl(categorizerId, categoryId);
                    }
                }

            } // exportAsOriginalData()

            /*******************************************************************************/
            /*******************************************************************************/
            /* export button clicks, */
            /*******************************************************************************/
            /*******************************************************************************/
            /* then this function works. */
            /*******************************************************************************/
            /*******************************************************************************/
            /* Though it calls others, */
            /*******************************************************************************/
            /*******************************************************************************/
            /* Here everything starts. */

            /**
             * exportAllData function.
             * export all data as csv.
             */
            $scope.exportAllData = function () {
                //alert("in exportAllData() function");
                setTimeout(function () {
                    $scope.getAllPages().then(function (res) {
                        $scope.JSONToCSVConvertor(res, "semdee export", true);
                    });
                }, 100);

            } // exportAllData()

            $scope.downloadCSVFile = function () {
                //create sample hidden link in document, to accept Blob returned in the response from back end

                var downloadLink = document.createElement("a");

                document.body.appendChild(downloadLink);
                downloadLink.style = "display: none";

                var nodeType = scope.activeNode.data.type;
                var node = scope.activeNode;

                if (nodeType === "CRAWL") {
                    var crawlId = node.data.id;
                    return $crawl.downloadCsvFile(crawlId).then(function (result) {
                        //debugger;
                        var fName = "crawl_" + crawlId + ".csv"
                        var file = new Blob([result], { type: 'application/csv' });
                        var fileURL = (window.URL || window.webkitURL).createObjectURL(file);
                        downloadLink.href = fileURL;
                        downloadLink.download = fName;
                        downloadLink.click();
                    });

                } else if (nodeType === "RGXSEARCH") {
                    var id = node.data.id;
                    return $regexService.downloadCsvFile(id).then(function (result) {
                    //    debugger;
                        var fName = "regex_search_" + id + ".csv"
                        var file = new Blob([result], { type: 'application/csv' });
                        var fileURL = (window.URL || window.webkitURL).createObjectURL(file);
                        downloadLink.href = fileURL;
                        downloadLink.download = fName;
                        downloadLink.click();
                    });

                } else if (nodeType === "SPACE") {

                    var spaceId = node.data.id;
                    return $semanticSpace.downloadCsvFile(spaceId).then(function (result) {

                        var fName = "space_" + spaceId + ".csv"
                        var file = new Blob([result], { type: 'application/csv' });
                        var fileURL = (window.URL || window.webkitURL).createObjectURL(file);
                        downloadLink.href = fileURL;
                        downloadLink.download = fName;
                        downloadLink.click();
                    });

                } else if (nodeType == "MONITOR") {

                    if (!scope.isClusterActive) {
                        var monitoringId = node.data.id;
                        return $monitoring.downloadCsvFile(monitoringId).then(function (result) {
                            //debugger;
                            var fName = "clustering_" + monitoringId + ".csv"
                            var file = new Blob([result], { type: 'application/csv' });
                            var fileURL = (window.URL || window.webkitURL).createObjectURL(file);
                            downloadLink.href = fileURL;
                            downloadLink.download = fName;
                            downloadLink.click();
                        });

                    } else { // if isClusterActive
                        var clusterId = $scope.activeCluster.id;
                        return $monitoring.downloadClusterCsvFile(clusterId).then(function (result) {
                          //  debugger;
                            var fName = "cluster_" + clusterId + ".csv"
                            var file = new Blob([result], { type: 'application/csv' });
                            var fileURL = (window.URL || window.webkitURL).createObjectURL(file);
                            downloadLink.href = fileURL;
                            downloadLink.download = fName;
                            downloadLink.click();
                        });
                    } //else

                } else if (nodeType === "CLUSTER") {
                    //debugger;
                    scope.isClusterActive = true;
                    var clusterId = node.data.id;
                    return $monitoring.downloadClusterCsvFile(clusterId).then(function (result) {
                      //  debugger;
                        var fName = "cluster_" + clusterId + ".csv"
                        var file = new Blob([result], { type: 'application/csv' });
                        var fileURL = (window.URL || window.webkitURL).createObjectURL(file);
                        downloadLink.href = fileURL;
                        downloadLink.download = fName;
                        downloadLink.click();
                    });

                } else if (nodeType == "CATEGORY") {
                    scope.isCategoryActive = true;

                    var categoryId = node.data.id;
                    var categorizerId = node.parent.data.id;
                    return categorizerService.downloadCategoryCsvFile(categorizerId, categoryId)
                        .then(function (result) {
                          //  debugger;
                            var fName = "category_" + categoryId + ".csv"
                            var file = new Blob([result], { type: 'application/csv' });
                            var fileURL = (window.URL || window.webkitURL).createObjectURL(file);
                            downloadLink.href = fileURL;
                            downloadLink.download = fName;
                            downloadLink.click();
                        });

                } else if (nodeType === "CATEGORIZER") {
                    if (scope.isCategoryActive) {
                        var categoryId = $scope.activeCluster.id;
                        var categorizerId = node.data.id;
                        return categorizerService.downloadCategoryCsvFile(categorizerId, categoryId)
                            .then(function (result) {
                            //    debugger;
                                var fName = "category_" + categoryId + ".csv"
                                var file = new Blob([result], { type: 'application/csv' });
                                var fileURL = (window.URL || window.webkitURL).createObjectURL(file);
                                downloadLink.href = fileURL;
                                downloadLink.download = fName;
                                downloadLink.click();
                            });

                    } else { // if (!isCategoryActive)
                        var categorizerId = node.data.id;
                        return categorizerService.downloadCsvFile(categorizerId).then(function (result) {
                            //debugger;
                            var fName = "categorizer_" + categorizerId + ".csv"
                            var file = new Blob([result], { type: 'application/csv' });
                            var fileURL = (window.URL || window.webkitURL).createObjectURL(file);
                            downloadLink.href = fileURL;
                            downloadLink.download = fName;
                            downloadLink.click();
                        });
                    }
                }

            };

            /*******************************************************************************/
            /*******************************************************************************/
            /* Json is a format of JS, */
            /*******************************************************************************/
            /*******************************************************************************/
            /* Got to convert it to CS. (csv) */
            /*******************************************************************************/
            /*******************************************************************************/
            /* When called for duty, */
            /*******************************************************************************/
            /*******************************************************************************/
            /* deed is done without sligthest BS. */
            /**
             * JSON2CSVConvertor
             * Get documents as json and convert it to CSV format.
             * Used when exporting all data with an external button.
             */
            $scope.JSONToCSVConvertor = function (JSONData, ReportTitle, ShowLabel) {
              //  debugger;
                //If JSONData is not an object then JSON.parse will parse the JSON string in an Object
                var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;

                var CSV = '';
                //Set Report title in first row or line

                CSV += ReportTitle + '\r\n\n';

                //This condition will generate the Label/Header
                if (ShowLabel) {
                    var row = "";

                    //This loop will extract the label from 1st index of on array
                    for (var index in arrData[0]) {

                        //Now convert each value to string and comma-seprated
                        row += index + ',';
                    }

                    row = row.slice(0, -1);

                    //append Label row with line break
                    CSV += row + '\r\n';
                }

                //1st loop is to extract each row
                for (var i = 0; i < arrData.length; i++) {
                    var row = "";

                    //2nd loop will extract each column and convert it in string comma-seprated
                    for (var index in arrData[i]) {
                        row += '"' + arrData[i][index] + '",';
                    }

                    row.slice(0, row.length - 1);

                    //add a line break after each row
                    CSV += row + '\r\n';
                }

                if (CSV == '') {
                    alert("Invalid data");
                    return;
                }

                //Generate a file name
                var fileName = "MyReport_";
                //this will remove the blank-spaces from the title and replace it with an underscore
                fileName += ReportTitle.replace(/ /g, "_");

                //Initialize file format you want csv or xls
                var uri = 'data:text/csv;charset=utf-8,' + escape(CSV);

                // Now the little tricky part.
                // you can use either>> window.open(uri);
                // but this will not work in some browsers
                // or you will not get the correct file extension

                //this trick will generate a temp <a /> tag
                var link = document.createElement("a");
                link.href = uri;

                //set the visibility hidden so it will not effect on your web-layout
                link.style = "visibility:hidden";
                link.download = fileName + ".csv";

                //this part will append the anchor tag and remove it after automatic click
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }

            /*******************************************************************************/
            /*******************************************************************************/
            /* How can you get all pages, */
            /*******************************************************************************/
            /*******************************************************************************/
            /* without calling this function. */
            /*******************************************************************************/
            /*******************************************************************************/
            /* whether it is clustering, categorizer, space or crawl, */
            /*******************************************************************************/
            /*******************************************************************************/
            /* it gives you all with perfection. */
            /**
             * getAllPages() function for export data as CSV.
             * This function gets the next/previous page according to the
             * selected grid.
             */
            $scope.getAllPages = function () {
              //  debugger;
                //var dfr = $.Deferred();
                //var ret = dfr.promise();

                var exportedData = [];
                var nodeType = scope.activeNode.data.type;
                var node = scope.activeNode;

                if (nodeType === "CRAWL") {
                    return $crawl.getCrawlResult({ id: scope.activeNode.data.id })
                        .then(function (res) {
                            exportedData = res.data;
                            return Promise.all(exportedData);
                        });
                } else if (nodeType === "SPACE") {
                  //  debugger;
                    return $semanticSpace.getSpaceDocuments2({ id: scope.activeNode.data.id })
                        .then(function (res) {
                            exportedData = res.data;
                            return Promise.all(exportedData);
                        });
                } else if (nodeType == "MONITOR") {

                    if (!scope.isClusterActive) {
                        var getClusterDetails = function (myClusters, clusterId) {
                            for (var i = 0; i < myClusters.length; i++) {
                                if (myClusters[i].id == clusterId) {
                                    return myClusters[i];
                                }
                            }
                        }

                        var monitoringDocs = [];

                        var dfr = $.Deferred();
                        var ret = dfr.promise();

                        //get all documents of monitoring
                        return $monitoring.getDocsFromMonitoring(scope.activeNode.data.id)
                            .then(function (res) {

                                //scope.clusterdocuments = res;
                                var keys = Object.keys(res.data);
                                for (var i = 0; i < keys.length; ++i) {
                                    var clusterId = keys[i];
                                    var clus = getClusterDetails(scope.ClusterOfMonitor, keys[i]);
                                    var docs = res.data[keys[i]];
                                    for (var j = 0; j < docs.length; ++j) {
                                        var doc = docs[j];
                                        doc.clusterName = clus.label;
                                        doc.clusterTags = clus.tags;
                                        monitoringDocs.push(doc);
                                    }
                                }
                                exportedData = monitoringDocs;
                                return Promise.all(exportedData);
                            });

                    } else { // if isClusterActive
                        var clusterId = $scope.activeCluster.id;
                        return $monitoring.getDocsFromCluster(clusterId)
                            .then(function (res) {
                                exportedData = res.data;
                                return Promise.all(exportedData);

                            });

                    } //else
                } else if (nodeType === "CLUSTER") {
                    scope.isClusterActive = true;
                    return $monitoring.getDocsFromCluster(scope.activeNode.data.id)
                        .then(function (res) {
                            exportedData = res.data;
                            return Promise.all(exportedData);
                        });

                } else if (nodeType == "CATEGORY") {
                    scope.isCategoryActive = true;

                    var categoryId = node.data.id;
                    var categorizerId = node.parent.data.id;

                    return categorizerService.getCategoryDocumentsCategorizer(categorizerId, categoryId)
                        .then(function (res) {
                            exportedData = res.data;
                            //alert("total docs length: " + res.data.length);
                            return Promise.all(exportedData);
                        });

                } else if (nodeType === "CATEGORIZER") {
                    if (scope.isCategoryActive) {

                        var categoryId = $scope.activeCluster.id;
                        var categorizerId = node.data.id;

                        return categorizerService.getCategoryDocumentsCategorizer(categorizerId, categoryId)
                            .then(function (res) {
                                exportedData = res.data;
                                //alert("total docs length: " + res.data.length);
                                return Promise.all(exportedData);
                            });

                    } else { // if (!isCategoryActive)
                        var getCategoryDetails = function (myCategories, categoryId) {
                            for (var i = 0; i < myCategories.length; i++) {
                                if (myCategories[i].categoryId == categoryId) {
                                    return myCategories[i];
                                }
                            }
                        }
                        var catdocs = [];
                        // Now, get the documents by page and push it the grid
                        return categorizerService.getCategoriesDocumentsCategorizer(scope.activeNode.data.id)
                            .then(function (res) {
                                var keys = Object.keys(res);
                                for (var i = 0; i < keys.length; ++i) {
                                    var cat = getCategoryDetails(scope.allCategories, keys[i]);
                                    var docs = res[keys[i]];
                                    for (var j = 0; j < docs.length; ++j) {
                                        var doc = docs[j];
                                        doc.clusterName = cat.label;
                                        doc.clusterTags = cat.tags;
                                        catdocs.push(doc);
                                    }
                                }
                                exportedData = catdocs;
                                return Promise.all(exportedData);
                            });

                    }
                }
                //var deferred = $q.defer();
                //deferred.resolve(exportedData);
                //return Promise.all(exportedData);
            }; // end of getAllPages();

            /**
            ********************************************************************************
            ********************************************************************************
                 ***********************************************************************
                     ***************************************************************
                      Search function for document display on id, title and ulr fields.
                            1. Crawl documents
                            2. Space documents
                            3. Categorizer documents
                            4. Category documents
                            5. Clustering documents
                            6. Cluster documents

                      The search is cleared by the below function: $scope.clearFilter().
                      ***************************************************************
                  ***********************************************************************
            ********************************************************************************
            ********************************************************************************
            **/

            $scope.filter = function () {
              //  debugger;
                //alert("now I am searching with the following value: " + this.filterValue);
                var nodeType = scope.activeNode.data.type;
                var filterValue = this.filterValue + "";
                if (filterValue === "") {
                    alert("nothing to be done");
                    return;
                }
                scope.filterValue = filterValue;
                //scope.gridOptions.columnDefs[3].visible=false;
                if (nodeType === "ROOT1") {
                    //scope.launchNewCrawl();

                } else if (nodeType === "CRAWL") {
                    //alert("search in the CRAWL documents");
                    $scope.paginationOptions = {
                        pageNumber: 1,
                        pageSize: 25,
                        sort: null
                    };
                    $scope.gridOptions.paginationCurrentPage = scope.paginationOptions.pageNumber;
                    $scope.gridOptions.paginationPageSize = scope.paginationOptions.pageSize;

                    $crawl.searchCrawlDocCount(scope.activeNode.data.id,
                        filterValue)
                        .then(function (res) {

                            $scope.gridOptions.totalItems = res.data;
                        });

                    $crawl.searchCrawlDocuments(scope.activeNode.data.id,
                        filterValue, $scope.paginationOptions.pageNumber, $scope.paginationOptions.pageSize)
                        .then(function (res) {

                            scope.documents = res.data;
                        });

                } else if (nodeType === "RGXSEARCH") {
                    //alert("search in the CRAWL documents");
                    //scope.gridOptions.columnDefs[3].visible=true;
                    $scope.paginationOptions = {
                        pageNumber: 1,
                        pageSize: 25,
                        sort: null
                    };
                    $scope.gridOptions.paginationCurrentPage = scope.paginationOptions.pageNumber;
                    $scope.gridOptions.paginationPageSize = scope.paginationOptions.pageSize;

                    $regexService.searchRgxSearchDocCount(scope.activeNode.data.id,
                        filterValue)
                        .then(function (res) {
                            $scope.gridOptions.totalItems = res.data;
                        });

                    $regexService.searchRgxSearchDocuments(scope.activeNode.data.id,
                        filterValue, $scope.paginationOptions.pageNumber, $scope.paginationOptions.pageSize)
                        .then(function (res) {

                            scope.documents = res.data;
                        });

                } else if (nodeType === "SPACE") {

                    //alert("search in the SPACE documents");

                    $scope.paginationOptions = {
                        pageNumber: 1,
                        pageSize: 25,
                        sort: null
                    };

                    $scope.gridOptions.paginationCurrentPage = scope.paginationOptions.pageNumber;
                    $scope.gridOptions.paginationPageSize = scope.paginationOptions.pageSize;

                    $semanticSpace.searchSpaceDocCount(scope.activeNode.data.id, filterValue)
                        .then(function (res) {
                            $scope.gridOptions.totalItems = res.data;
                        });

                    $semanticSpace.searchSpaceDocuments(scope.activeNode.data.id,
                        filterValue, $scope.paginationOptions.pageNumber, $scope.paginationOptions.pageSize)
                        .then(function (res) {

                            scope.documents = res.data;
                        });

                } else if (nodeType === "MONITOR") {


                    $scope.paginationOptions = {
                        pageNumber: 1,
                        pageSize: 25,
                        sort: null
                    };

                    if (!scope.isClusterActive) {
                        // check if cluster view is active, if not search in the monitoring
                        // if yes, search in the cluster.
                        //alert("search in the CLUSTERING documents");
                        var getClusterDetails = function (myClusters, clusterId) {
                            for (var i = 0; i < myClusters.length; i++) {
                                if (myClusters[i].id == clusterId) {
                                    return myClusters[i];
                                }
                            }
                        }

                        $scope.gridOptions4.paginationCurrentPage = scope.paginationOptions.pageNumber;
                        $scope.gridOptions4.paginationPageSize = scope.paginationOptions.pageSize;
                        var monitoringDocs = [];

                        $monitoring.searchMonitoringDocCount(scope.activeNode.data.id, filterValue)
                            .then(function (res) {
                                $scope.gridOptions4.totalItems = res.data;
                            });

                        $monitoring.searchMonitoringDocuments(scope.activeNode.data.id,
                            filterValue, $scope.paginationOptions.pageNumber, $scope.paginationOptions.pageSize)
                            .then(function (res) {
                                var keys = Object.keys(res.data);
                                for (var i = 0; i < keys.length; ++i) {
                                    var clusterId = keys[i];
                                    var clus = getClusterDetails(scope.ClusterOfMonitor, keys[i]);
                                    var docs = res.data[keys[i]];
                                    for (var j = 0; j < docs.length; ++j) {
                                        var doc = docs[j];
                                        doc.clusterName = clus.label;
                                        doc.clusterTags = clus.tags;
                                        monitoringDocs.push(doc);
                                    }
                                }
                                scope.clusterdocuments = monitoringDocs;
                            });
                    }
                    else { // if cluster view is active
                        //alert("search in the CLUSTER documents");
                        var clusterId = $scope.activeCluster.id;

                        $monitoring.searchClusterDocCount(clusterId, filterValue)
                        .then(function (res) {
                            $scope.gridOptions.totalItems = res.data;
                        });

                        $monitoring.searchClusterDocuments(clusterId,filterValue,
                            $scope.paginationOptions.pageNumber, $scope.paginationOptions.pageSize)
                            .then(function (res) {
                                scope.documents = res.data;
                            });

                    } //else

                } else if (nodeType === "CLUSTER") {
                    //alert("search in the CLUSTER documents");
                    clusterId = scope.activeNode.data.id;
                    scope.isClusterActive = true;
                    $scope.paginationOptions = {
                        pageNumber: 1,
                        pageSize: 25,
                        sort: null
                    };

                    $monitoring.searchClusterDocCount(clusterId, filterValue)
                    .then(function (res) {
                        $scope.gridOptions.totalItems = res.data;
                        });

                    $monitoring.searchClusterDocuments(clusterId,filterValue,
                        $scope.paginationOptions.pageNumber, $scope.paginationOptions.pageSize)
                        .then(function (res) {
                            scope.documents = res.data;
                        });

                } else if (nodeType === "CATEGORIZER") {

                    alert("search in the CATEGORIZER documents");

                    $scope.paginationOptions = {
                        pageNumber: 1,
                        pageSize: 25,
                        sort: null
                    };

                    $scope.gridOptions4.paginationCurrentPage = $scope.paginationOptions.pageNumber;
                    $scope.gridOptions4.paginationPageSize = $scope.paginationOptions.pageSize;

                    categorizerService.searchDocCountOfCategorizer(scope.activeNode.data.id, filterValue)
                        .then(function (res) {
                            $scope.gridOptions4.totalItems = res.data;
                        });
                    var getCategoryDetails = function (myCategories, categoryId) {
                        for (var i = 0; i < myCategories.length; i++) {
                            if (myCategories[i].categoryId == categoryId) {
                                return myCategories[i];
                            }
                        }
                    }

                    categorizerService.searchCategorizerDocuments(scope.activeNode.data.id,
                        filterValue, $scope.paginationOptions.pageNumber, $scope.paginationOptions.pageSize)
                        .then(function (res) {
                            var catdocs = [];
                            var keys = Object.keys(res.data);
                            for (var i = 0; i < keys.length; ++i) {
                                var cat = getCategoryDetails(scope.allCategories, keys[i]);
                                var docs = res.data[keys[i]];
                                for (var j = 0; j < docs.length; ++j) {
                                    var doc = docs[j];
                                    doc.clusterName = cat.label;
                                    doc.clusterTags = cat.tags;
                                    catdocs.push(doc);
                                }
                            }
                            scope.clusterdocuments = catdocs;
                        });


                } else if (nodeType === "CATEGORY") {
                    alert("search in the CATEGORY documents");
                }
                $scope.gridApi.grid.refresh();
            };

            /**
            ********************************************************************************
            ================================================================================
            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

                            Clear the search and display the original documents.
                            See the search function above: $scope.filter()

            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
            ================================================================================
            ********************************************************************************
            **/
            $scope.clearFilter = function () {
                if (this.filterValue === "") {
                    alert("nothing to be done!");
                    return;
                }
                var nodeType = scope.activeNode.data.type;
                this.filterValue = "";
                scope.filterValue = "";
                //alert("filter value is cleared");
                if (nodeType === "ROOT1") {
                    //scope.launchNewCrawl();

                } else if (nodeType === "CRAWL") {
                    //alert("search in the CRAWL documents");
                    $scope.paginationOptions = {
                        pageNumber: 1,
                        pageSize: 25,
                        sort: null
                    };
                    $scope.gridOptions.paginationCurrentPage = $scope.paginationOptions.pageNumber;
                    $scope.gridOptions.paginationPageSize = $scope.paginationOptions.pageSize;
                    $crawl.getCrawlResultCount({ id: scope.activeNode.data.id })
                        .then(function (res) {
                            $scope.gridOptions.totalItems = res.data;
                        });

                    $crawl.getCrawlResultByPage({ id: scope.activeNode.data.id },
                        $scope.paginationOptions.pageNumber, $scope.paginationOptions.pageSize)
                        .then(function (res) {
                            scope.documents = res.data;
                        });
                } else if (nodeType === "RGXSEARCH") {
                    //alert("search in the CRAWL documents");
                    $scope.paginationOptions = {
                        pageNumber: 1,
                        pageSize: 25,
                        sort: null
                    };
                    $scope.gridOptions.paginationCurrentPage = $scope.paginationOptions.pageNumber;
                    $scope.gridOptions.paginationPageSize = $scope.paginationOptions.pageSize;
                    $regexService.getRgxSearchResultCount(scope.activeNode.data.id)
                        .then(function (res) {
                            $scope.gridOptions.totalItems = res.data;
                        });

                    $regexService.getRgxSearchResultByPage(scope.activeNode.data.id,
                        $scope.paginationOptions.pageNumber, $scope.paginationOptions.pageSize)
                        .then(function (res) {
                            scope.documents = res.data;
                        });
                }else if (nodeType === "SPACE") {
                  //  debugger;
                    $scope.paginationOptions = {
                        pageNumber: 1,
                        pageSize: 25,
                        sort: null
                    };

                    $scope.gridOptions.paginationCurrentPage = $scope.paginationOptions.pageNumber;
                    $scope.gridOptions.paginationPageSize = $scope.paginationOptions.pageSize;
                    $semanticSpace.getDocumentCount(scope.activeNode.data.id)
                        .then(function (res) {
                            $scope.gridOptions.totalItems = res.data;
                        });

                    $semanticSpace.getDocumentsByPage(scope.activeNode.data.id,
                        $scope.paginationOptions.pageNumber, $scope.paginationOptions.pageSize)
                        .then(function (res) {
                            scope.documents = res.data;
                        });

                } else if (nodeType === "MONITOR") {

                    //alert("clear filter in the CLUSTERING documents");
                    // TODO here it is like first load page function in treeService.js
                    // but beaware that cluster node can be active, so add an extra if.
                    if (!scope.isClusterActive) {
                        // cluster view is NOT active
                        scope.paginationOptions = {
                            pageNumber: 1,
                            pageSize: 25,
                            sort: null
                        };
                        scope.gridOptions4.paginationCurrentPage = scope.paginationOptions.pageNumber;
                        scope.gridOptions4.paginationPageSize = scope.paginationOptions.pageSize;
                        var nbDocsOfMonitoring = 0;
                        scope.ClusterOfMonitor.forEach(function(cluster, index) {
                            nbDocsOfMonitoring += cluster.nbDocs;
                        });
                        scope.gridOptions4.totalItems = nbDocsOfMonitoring;

                        var getClusterDetails = function (myClusters, clusterId) {
                            for (var i = 0; i < myClusters.length; i++) {
                                if (myClusters[i].id == clusterId) {
                                    return myClusters[i];
                                }
                            }
                        }
                        var monitoringDocs = [];
                        //get all document of monitoring
                        $monitoring.getDocsFromMonitoringByPage(scope.activeNode.data.id,
                            scope.paginationOptions.pageNumber, scope.paginationOptions.pageSize)
                            .then(function (res) {
                                //scope.clusterdocuments = res;
                                var keys = Object.keys(res.data);
                                for (var i = 0; i < keys.length; ++i) {
                                    var clusterId = keys[i];
                                    var clus = getClusterDetails(scope.ClusterOfMonitor, keys[i]);
                                    var docs = res.data[keys[i]];
                                    for (var j = 0; j < docs.length; ++j) {
                                        var doc = docs[j];
                                        doc.clusterName = clus.label;
                                        doc.clusterTags = clus.tags;
                                        monitoringDocs.push(doc);
                                    }
                                }
                                scope.clusterdocuments = monitoringDocs;
                                //alert("monitoring docs by page: " + scope.clusterdocuments.length);
                            }, function () { alert("Load document failed") })

                    } else { // cluster view is active.
                        //debugger;
                        scope.paginationOptions = {
                            pageNumber: 1,
                            pageSize: 25,
                            sort: null
                        };
                        scope.gridOptions.paginationCurrentPage = scope.paginationOptions.pageNumber;
                        scope.gridOptions.paginationPageSize = scope.paginationOptions.pageSize;
                        var clusterId = $scope.activeCluster.id;
                        //scope.activeCluster = scope.activeNode.data;
                        //$scope.activeCluster = node.data;
                        $monitoring.getDocCountFromCluster(clusterId)
                            .then(function (res) {
                                scope.gridOptions.totalItems = res.data;
                                scope.nbDocsOfCluster = res.data;
                            });

                        $monitoring.getDocsFromClusterByPage(clusterId,
                            scope.paginationOptions.pageNumber, scope.paginationOptions.pageSize)
                            .then(function (res) {
                                scope.documents = res.data;
                            });
                    }
                } else if (nodeType === "CLUSTER") {
                    //alert("clear filter in the CLUSTER documents");
                    scope.paginationOptions = {
                        pageNumber: 1,
                        pageSize: 25,
                        sort: null
                    };
                    scope.gridOptions.paginationCurrentPage = scope.paginationOptions.pageNumber;
                    scope.gridOptions.paginationPageSize = scope.paginationOptions.pageSize;
                    //scope.activeCluster = scope.activeNode.data;
                    var clusterId = scope.activeNode.data.id;
                    //$scope.activeCluster = node.data;
                    $monitoring.getDocCountFromCluster(clusterId)
                        .then(function (res) {
                            scope.gridOptions.totalItems = res.data;
                            scope.nbDocsOfCluster = res.data;
                        });

                    $monitoring.getDocsFromClusterByPage(clusterId,
                        scope.paginationOptions.pageNumber, scope.paginationOptions.pageSize)
                        .then(function (res) {
                            scope.documents = res.data;
                        });

                } else if (nodeType === "CATEGORIZER") {
                    //alert("search in the CATEGORIZER documents");
                    var getCategoryDetails = function (myCategories, categoryId) {
                        for (var i = 0; i < myCategories.length; i++) {
                            if (myCategories[i].categoryId == categoryId) {
                                return myCategories[i];
                            }
                        }
                    }

                    scope.paginationOptions = {
                        pageNumber: 1,
                        pageSize: 25,
                        sort: null
                    };
                    $scope.gridOptions4.paginationCurrentPage = $scope.paginationOptions.pageNumber;
                    $scope.gridOptions4.paginationPageSize = $scope.paginationOptions.pageSize;

                    var docCountOfCategorizer = 0;

                    for (var i = 0; i < scope.allCategories.length; i++) {
                        var cat = scope.allCategories[i];
                        docCountOfCategorizer += cat.nbdocs;
                    }
                    scope.gridOptions4.totalItems = docCountOfCategorizer;

                    var catdocs = [];
                    // Now, get the documents by page and push it the grid
                    categorizerService.getCategoriesDocumentsCategorizerByPage(scope.activeNode.data.id,
                        $scope.paginationOptions.pageNumber, $scope.paginationOptions.pageSize)
                        .then(function (res) {
                            var keys = Object.keys(res);
                            for (var i = 0; i < keys.length; ++i) {
                                var cat = getCategoryDetails(scope.allCategories, keys[i]);
                                var docs = res[keys[i]];
                                for (var j = 0; j < docs.length; ++j) {
                                    var doc = docs[j];
                                    doc.clusterName = cat.label;
                                    doc.clusterTags = cat.tags;
                                    catdocs.push(doc);
                                }
                            }
                            scope.clusterdocuments = catdocs;
                        });

                } else if (nodeType === "CATEGORY") {
                    alert("search in the CATEGORY documents");

                }
                $scope.gridApi.grid.refresh();

            };

            scope.gridOptions = $scope.gridOptions;

            $scope.gridOptions4 = jQuery.extend(true, {}, $scope.gridOptions); //JSON.parse(JSON.stringify($scope.gridOptions));
            scope.gridOptions4 = $scope.gridOptions4;


            $scope.gridOptions4.columnDefs.splice(2, 0,
                { name: 'clusterName', field: 'clusterName', width: 150, enableColumnMenu: false },
                { name: 'clusterTags', field: 'clusterTags', width: 150, enableColumnMenu: false, cellTooltip: function (r, c) { return r.entity.clusterTags } }
            );

            $fancyTree.build(); //Build tree

            $fancyTree.contextMenu(); // build context menu on tree

            scope.initTree = function () {
                //pre-load lazy node
                $fancyTree.getNodeByKey("ROOT1").load(true).then(function () {
                    $fancyTree.getNodeByKey("ROOT2").load(true).then(function () {
                        $fancyTree.getNodeByKey("ROOT2").setExpanded().then(function () {
                            //$fancyTree.getNodeByKey("ROOT2").setExpanded().then(function(){
                            $fancyTree.resize();
                            //$fancyTree.getNodeByKey("ROOT2").setActive();
                            scope.sortDirAsc = false;
                            scope.sortTree(1); //sort by date
                            //$fancyTree.getNodeByKey("ROOT2").setActive(false);
                            //});
                        });
                    })
                })
            };

            scope.initTree();

            // resize tree height when scroll document to fit to bottom of document
            angular.element(document).on('scroll', function () {
                $fancyTree.resize();
            })
            //set height for grid by window
            $scope.grid1Height = ($(window).height() - 130) * 2 / 3; //set height = 2/3 window
            $scope.grid3Height = ($(window).height() - 130); //set height = window height

            /**
             * count number of document of a space
             * @param spaceId
             * @returns {number}
             */
            scope.getNbDocsOfSpace = function (spaceId) {
                var nbDocsOfSpace = 0;
                var space = scope.allSpaces[spaceId];
                if (space != null) {
                    space.crawlIds.forEach(function (crawlid, index) {
                        nbDocsOfSpace += scope.allCrawls[crawlid].volume;
                    });
                }
                return nbDocsOfSpace;
            }


            /**
             * show / hide chart div
             * @param show
             */
            scope.showHideChart = function () {
                scope.showChart = !scope.showChart;
            }

            scope.onChartFilter = function (chartFilter) {
                var tmp = scope.chart.alldata;
                if (chartFilter > 1) {
                    tmp.sort(function (a, b) {
                        return chartFilter == 2 ? (b.value - a.value) : (a.value - b.value)
                    });
                    scope.chart.data = tmp.slice(0, 10);
                } else {
                    scope.chart.data = tmp;
                }

                scope.documents = null;
                scope.activeCluster = null;
                scope.chartFilter = chartFilter;
            }

            /**
             *
             * @param node
             * @returns {boolean}
             */
            scope.onNewButton = function () {

                var nodeType = scope.activeNode.data.type;

                if (nodeType === "ROOT1") {
                    scope.launchNewCrawl();
                } else if (nodeType === "CRAWL") {
                    scope.createSpaceFromCrawl();
                } else if (nodeType === "ROOT2") {
                  //  debugger;
                    scope.createNewSpace();
                } else if (nodeType === "SPACE_SC") {
                    scope.createSmartCluster();
                } else if (nodeType === "SPACE_AC") {
                    scope.launchNewCategorizer();//$location.path('/home/categorizer')
                } else if (nodeType === "SPACE_MC" || nodeType === "FOLDER") {
                    scope.createManualCluster();
                }

            }


            /**
             *
             */
            scope.onMenuGetData = function () {
                $fancyTree.getNodeByKey("ROOT1").setActive();
                scope.onNewButton();
            }
            scope.onMenuImportData = function () {
                $fancyTree.getNodeByKey("ROOT1").setActive();
                scope.onImportButton();
            }
            scope.onMenuAddFiles = function () {
                //$fancyTree.getNodeByKey("ROOT1").setActive();
                scope.onUploadButton();
            }

            scope.onMenuAddEmailFiles = function(){
                 scope.onUploadEmailButton();
            }
            scope.onMenuTagger = function () {
                scope.onTaggerButton();
            }

            scope.onMenuCreateSpace = function () {
                $fancyTree.getNodeByKey("ROOT2").setActive();
                scope.onNewButton();
            }
            scope.onMenuRegexSearch = function () {
                //alert("going to regex search");
                //debugger;
                scope.newRegexSearch();
            }

            scope.onMenuCreateCluster = function () {
                scope.createSmartCluster();
            }
            scope.onMenuCreateAdvancedCluster = function () {
                scope.launchNewCategorizer();
            }
            scope.onMenuDeepSearch = function () {
                $('#searchModal').on('show.bs.modal',
                    function () {
                        scope.initDeepSearchForm();
                    }
                ).modal("show");
            }
            scope.onMenuExportCluster = function () {
                $scope.expError = false;
                $('#exportModal').modal("show");
            }
            scope.exportCluster = function () {
                var space = scope.shared.space;
                if (space.id) {
                    var dfr = $.Deferred();
                    var ret = dfr.promise();
                    var tmp = [];

                    $monitoring.getAllMonitorings(space.id).then(function (res) {
                        var len = res.length;
                        if (len == 0) {
                            dfr.resolve([]);
                        }
                        var cnt = 0;
                        res.forEach(function (monitor) {
                            $monitoring.getClustersFromMonitoring(monitor.id).then(function (res) {
                                tmp = tmp.concat(res.data);
                                if (++cnt == len) {
                                    //console.log("resolve", tmp);
                                    dfr.resolve(tmp);
                                }
                            }, function () { dfr.reject(res) });
                        });

                    }, function () { dfr.reject(res) });

                    $.when(dfr).then(function (res) {
                        if (res.length) {
                            //clear screen
                            scope.showChart = false;
                            scope.documents = null;
                            //set data
                            scope.exportclusters = res;
                            scope.exportSpaceName = scope.allSpaces[space.id].label;
                            //close dialog
                            $('#exportModal').modal("hide");
                        } else {
                            $scope.expError = "No data found";
                        }

                    }, function (err) {
                        $scope.expError = "An error occurred while exporting";
                    });

                }




            }
            /**
             *
             * @param node
             */
            scope.onDeleteButton = function () {
                $('#confirmDeleteModal').modal("show");
            }

            scope.onConfirmDelete = function () {
                $('#confirmDeleteModal').modal("hide");

                var nodeType = scope.activeNode.data.type;
                var nodeId = scope.activeNode.data.id;
                if (nodeType === "SPACE") {
                    scope.myDeleteSpace(nodeId)
                } else if (nodeType === "MONITOR") {
                    scope.myDeleteMonitoring(nodeId)
                } else if (nodeType === "CATEGORIZER") {
                    scope.myDeleteCategorize(nodeId)
                } else if (nodeType === "FOLDER") {
                    scope.myDeleteManualCluster(nodeId);
                } else if (nodeType === "CRAWL") {
                    scope.myDeleteCrawl(nodeId);
                }
            }

            /**
             *
             */
            scope.onRenameButton = function () {
                scope.clusterName = scope.activeNode.title;
                $('#renameClusterModal').modal("show");
            }




            scope.onExportButton = function () {
                var id = scope.activeNode.data.id;
                $monitoring.getClustersFromMonitoring(id).then(function (res) {
                    //clear screen
                    scope.showChart = false;
                    scope.documents = null;
                    //set data
                    scope.exportclusters = res.data;
                    scope.exportSpaceName = scope.activeNode.title;

                }, function (err) {
                    alert("Export failed!!!")
                });
            }

            /**
             *
             */
            scope.deepSearch = function (text, spaceId) {
                if (spaceId && text) {
                    $semanticSpace.searchSpace(spaceId, text).then(function (res) {
                        //clear screen
                        scope.showChart = false;
                        scope.documents = null;
                        scope.reldocuments = null;
                        scope.exportclusters = null;
                        scope.clusterdocuments = null;
                        scope.activeDocument = null;
                        //set data
                        scope.documents = res.data;
                        scope.isSearchDocunemts = true;
                        scope.searchSpaceName = scope.allSpaces[spaceId].label;
                        window.scrollTo(0, 0); // scroll to top
                        //close
                        $('#searchModal').modal("hide");
                    }, function (err) {
                        alert("Searching failed");
                        $('#searchModal').modal("hide");
                    });
                }
            }

            /**
             *
             */
            scope.onDefaultParameters = function () {
                alert("Set these values to defualt (waiting for response from Semdee)");
            }

            /**
             *
             * @param node
             */
            scope.onConnectToTwitter = function () {
                scope.connectToTwitter(true);
            }
            scope.onDisconnectTwitter = function () {
                scope.connectToTwitter(false);
            }

            /**
             *
             * @param node
             */

            scope.onCloneButton = function () {
                var nodeType = scope.activeNode.data.type;
                if (nodeType === "SPACE") {
                    scope.createNewSpaceFromOldSpace(scope.activeSpace);
                } else if (nodeType === "CRAWL") {
                    scope.createNewCrawlFromOldCrawl(scope.activeCrawl);
                }

            }
            /**
             *
             */
            scope.renameCluster = function (nodeType, name) {
                if (nodeType == 'CLUSTER') {
                    var clusterId = scope.activeNode.data.nodeId;
                    var monitorId = scope.activeNode.data.monitorId;
                    $monitoring.renameCluster(monitorId, clusterId, name).then(function () {
                        $('#renameClusterModal').modal("toggle");
                        var parent = scope.activeNode.getParent();
                        parent.load(true).then(function () {
                            parent.setExpanded();
                        });

                    })
                } else {
                    alert("Sorry, API is under construction!!!")
                    $('#renameClusterModal').modal("toggle");
                }
            }
            /**
             *
             */
            scope.renameCrawl = function (crawlName) {
                var crawlId = scope.activeNode.data.id;

                $crawl.renameCrawl(crawlId, crawlName).then(function (res) {
                    $('#renameCrawlModal').modal("hide");
                    var parent = scope.activeNode.getParent();
                    parent.load(true).then(function () {
                        parent.setExpanded();
                    });
                }, function (res) {
                    alert("Error occurse while rename crawl: " + res);
                })
            }
            /**
             *
             */
            scope.createManualCluster = function (clusterName) {
                if (clusterName) {
                    var node = { id: 0, title: clusterName, type: "FOLDER", spaceId: scope.activeNode.data.id, folder: true }
                    scope.activeNode.addChildren(node)
                    scope.activeNode.setExpanded();
                }
                $('#addClusterModal').modal("toggle");
            }
            /**
             * get all related documents for a document
             */
            scope.getRelatedContent = function (spaceId, doc) {
                scope.reldocuments = [];
                // trying to find related content for document that bears id : docId
                //$semanticSpace.searchSpace(spaceId,doc.url)
                $semanticSpace.relatedContent(spaceId, doc.id).then(function (resultDocs) {
                    scope.reldocuments = resultDocs.data;
                });
            }

            /**
             *
             * @param categorizerId
             */
            scope.myDeleteCategorize = function (categorizerId) {
                console.log("deleteCategorize: " + categorizerId);
                var parent = scope.activeNode.getParent();
                categorizerService.removeCategorizer(categorizerId).then(function (res) {
                    parent.load(true).then(function () {
                        parent.setExpanded();
                    }
                    )
                }, function (err) {
                    alert("Error while remove categorizer: " + err);
                });
            };

            /**
             *
             * @param monitoring
             */
            scope.myDeleteMonitoring = function (monitoringId) {
                var parent = scope.activeNode.getParent();
                $monitoring.deleteMonitoring(monitoringId).then(function () {
                    scope.activeNode.remove();
                    parent.setActive();
                }, function (err) {
                    //alert("Deleting failed: "+err)
                    // TODO: check how in case error 500 but monitoring is still removed
                    scope.activeNode.remove();
                    parent.setActive();

                });

            };

            /**
             *
             * @param space
             */
            scope.myDeleteSpace = function (spaceId) {
                var parent = scope.activeNode.getParent();
                $semanticSpace.deleteSpace(spaceId).then(function (res) {

                    // remove this space
                    scope.allSpaces.forEach(function (item, idx) {
                        if (item.id == spaceId) {
                            scope.allSpaces.pop(idx);
                            return;
                        }
                    })
                    scope.activeNode.remove();
                    scope.activeSpace = null;
                    parent.setActive();

                }, function (err) {
                    alert("Delete failed: " + err)
                    scope.refreshTree();
                });
            }

            window.alert = function (msg) {
                $scope.alertMessaage = msg;
                $('#alertModal').modal('show');
            }
            /**
             *
             */
            scope.myDeleteManualCluster = function (nodeId) {
                var parent = scope.activeNode.getParent();
                scope.activeNode.remove();
                parent.setActive();

            }
            scope.myDeleteCrawl = function (crawlId) {
                var parent = scope.activeNode.getParent();
                $crawl.removeCrawl(crawlId).then(
                    function (res) {
                        if (res.data == true) {
                            scope.activeNode.remove();
                            // remove this crawl
                            scope.allCrawls.forEach(function (item, idx) {
                                if (item.id == crawlId) {
                                    scope.allCrawls.pop(idx);
                                    scope.activeCrawl = null;
                                    return;
                                }
                            })
                            parent.setActive();

                        }
                        else {
                            //var spaceName = null;
                            //scope.allSpaces.forEach(function(space){
                            //    var crawlIds = space.crawlIds;
                            //    crawlIds.forEach(function(id){
                            //        if (id ==  crawlId){
                            //            spaceName = scope.allSpaces[space.id].label;
                            //        }
                            //    })
                            //    if (spaceName!=null) return;
                            //})

                            alert("You cannot delete a crawl which is being used by a space! So please delete space first !");
                        }

                    }, function (err) {
                        alert("Delete failed: " + err);
                    }
                );

            }
            /**
             *
             */
            scope.createSpaceFromCrawl = function () {
                var crawl = scope.allCrawls[scope.activeNode.data.id];
                scope.createNewSpaceFromCrawl(crawl);
            }

            /**
             *
             */
            //scope.monitorparams={};
            scope.getParameter = function (name) {
                var ret;
                scope.allParameters.forEach(function (item, idex) {
                    if (item.paramName == name) {
                        ret = 1 * item.paramValue; //return number inseat of string
                        return;
                    }
                })
                return ret;
            }
            scope.setParameter = function (name, value) {
                scope.allParameters.forEach(function (item, idex) {
                    if (item.paramName == name) {
                        item.paramValue = value;
                        return;
                    }
                })
            }

            // for monitoring parameters
            scope.monitoringParams = {

                space: null,
                spaces: [],

                simthreshold: { // for Document proximity
                    value: 0,
                    options: {
                        floor: 0,
                        ceil: 10,
                        step: 0.01,
                        precision: 2,
                        disabled: true,
                        onChange: function () {
                            scope.monitoringParams.simthreshold.recommendedValue = false;
                        }
                    },
                    sliderValue: 0,
                    recommendedValue: false,
                },

                minNbrDocInCluster: { // for Min Nbr of doc in a cluster
                    options: {
                        floor: 1,
                        ceil: 0,
                        step: 1,
                        disabled: false
                    },
                    sliderValue: 0
                },
                clusterProximity: {// for Cluster proximity
                    options: {
                        floor: 0,
                        ceil: 1,
                        step: 0.01,
                        precision: 2,
                        disabled: false
                    },
                    sliderValue: 0
                },

                statisticsSpace: { // for Cognitive Space Statistics
                    nbrOfDocs: 0,
                    created: ''
                },

                // will be remove when API get parameter statistics is fixed
                showAdvancedParameters: false,
                minNbDocInCluster: 0,
                maxNbDocInCluster: 0,
                nbOfCluster: 0,
                mean: 0,
                stdev: 0,
                mincard: {
                    options: {
                        floor: 0,
                        ceil: 10,
                        step: 1,
                        disabled: true
                    },
                    sliderValue: 0
                },
                mergecos: {
                    options: {
                        floor: 0,
                        ceil: 1,
                        step: 0.1,
                        precision: 1,
                        disabled: true
                    },
                    sliderValue: 0
                },
                kvalue: {
                    options: {
                        floor: 0,
                        ceil: 10,
                        step: 1,
                        disabled: true
                    },
                    sliderValue: 0
                },
                numthreads: {
                    options: {
                        floor: 0,
                        ceil: 100,
                        step: 1,
                        disabled: true
                    },
                    sliderValue: 0
                },
                // end will be remove when API get parameter statistics is fixed
            };



            scope.initMonitoringParams = function () {

                scope.monitoringParams.showAdvancedParameters = false;
                $('#advancedParams').removeClass('fa-rotate-270').addClass('fa-rotate-90');

                scope.monitoringParams.simthreshold.recommendedValue = false;

                scope.monitoringParams.simthreshold.sliderValue = scope.getParameter('min_proximity_of_documents');
                scope.monitoringParams.simthreshold.options.disabled = true;

                scope.monitoringParams.mincard.sliderValue = scope.getParameter('min_doc_by_cluster');
                scope.monitoringParams.mergecos.sliderValue = scope.getParameter('min_proximity_of_clusters');
                scope.monitoringParams.kvalue.sliderValue = scope.getParameter('num_of_initial_samples');
                //scope.monitoringParams.numthreads.sliderValue =  scope.getParameter('numthreads');


                scope.monitoringParams.minNbDocInCluster = 0;
                scope.monitoringParams.maxNbDocInCluster = 0;
                scope.monitoringParams.nbOfCluster = 0;

                scope.monitoringParams.space = null;
                scope.monitoringParams.spaces = [];

                // this variable scope.allSpaces from treeService.js (tree loaded)
                scope.allSpaces.forEach(function (item, idx) {
                    if (item != null) {
                        scope.monitoringParams.spaces.push(item);
                    }
                });

                if (scope.activeSpace) {
                    scope.monitoringParams.space = scope.activeSpace;
                    scope.onSelectCognitiveSpace();
                }
                else {
                    $('#cbxSpaceMonitoring button.dropdown-toggle span.pull-left.filter-option').text('Select a cognitive space');
                    $('#cbxSpaceMonitoring div.dropdown-menu.open div.bs-searchbox input.form-control').val('');
                }
                // get All spaces
                /*$semanticSpace.getAllSpaces().then(
                    function(spaces) {
                        scope.monitoringParams.spaces = spaces;
                    },
                    function() {
                        alert("Couldn't retrieve spaces list you should check server availability");
                    }
                );*/
            }

            scope.createSmartCluster = function () {

                scope.initMonitoringParams();

                //file monitorParamsModal.html
                $('#launchMonitoringModal').modal().show();

                // refresh Slider
                $timeout(function () {
                    scope.$broadcast('rzSliderForceRender');
                });
            };

            scope.onSelectCognitiveSpace = function () {

                if (scope.monitoringParams.space) {
                    scope.activeSpace = scope.monitoringParams.space;
                    scope.monitoringParams.simthreshold.recommendedValue = false;
                    scope.monitoringParams.simthreshold.options.disabled = false;
                    scope.monitoringParams.simthreshold.sliderValue = scope.getParameter('min_proximity_of_documents');
                    scope.monitoringParams.minNbrDocInCluster.sliderValue = scope.getParameter('min_doc_by_cluster');

                    //get parameter values (get Computed Monitoring  Parameters of space)
                    //$monitoring.getComputeMonitoringParameters(scope.activeNode.data.spaceId).then(
                    $monitoring.launchComputeMonitoringParameters(scope.monitoringParams.space.id).then(
                        function (res) {
                            if (res.data != null) {

                                scope.monitoringParams.simthreshold.options.floor = isNaN(res.data.min) ? 0 : Math.round(res.data.min * 100) / 100;
                                scope.monitoringParams.simthreshold.options.ceil = isNaN(res.data.max) ? 0 : Math.round(res.data.max * 100) / 100;
                                scope.monitoringParams.simthreshold.value = isNaN(res.data.simthreshold) ? 0 : Math.round(res.data.simthreshold * 100) / 100;

                                if (scope.monitoringParams.simthreshold.options.floor >= scope.monitoringParams.simthreshold.options.ceil) {
                                    scope.monitoringParams.simthreshold.options.disabled = true;
                                }
                                //scope.monitoringParams.mincard.value = isNaN(res.data.mincard) ? 0 : Math.round(res.data.mincard * 100) / 100;
                                scope.monitoringParams.mean = isNaN(res.data.mean) ? 0 : Math.round(res.data.mean * 100) / 100;
                                scope.monitoringParams.stdev = isNaN(res.data.stdev) ? 0 : Math.round(res.data.stdev * 100) / 100;

                            }

                        }, function (res) {
                            alert('Launch Computed Monitoring Parameters for a Space failed');
                        }
                    );

                    // for Statistics table
                    scope.monitoringParams.statisticsSpace.created = scope.monitoringParams.space.creationDate;

                    /* $semanticSpace.getNbDocuments(scope.monitoringParams.space.id).then(
                          function(nbrDocs){
                              scope.monitoringParams.statisticsSpace.nbrOfDocs = nbrDocs;

                              //3) "Minimum number of document in a cluster" is from 1 to "number of document in the space".
                              scope.monitoringParams.minNbrDocInCluster.options.ceil = nbrDocs;

                          },
                          function(res){
                              console.log(res);
                          }
                      );
                      */

                    var nbrDocs = 0;
                    if (scope.activeSpace.crawlIds) {
                        scope.activeSpace.crawlIds.forEach(
                            function (crawlId, idx) {
                                nbrDocs += scope.allCrawls[crawlId].volume;
                            }
                        );
                    }
                    scope.monitoringParams.statisticsSpace.nbrOfDocs = nbrDocs;
                    scope.monitoringParams.minNbrDocInCluster.options.ceil = nbrDocs;
                    scope.monitoringParams.minNbrDocInCluster.options.floor = 1;


                }
            }




            scope.onClickRecommendedValue = function () {

                if (scope.monitoringParams.simthreshold.recommendedValue == true) {

                    scope.monitoringParams.simthreshold.sliderValue = scope.monitoringParams.simthreshold.value;
                    // refresh Slider
                    $timeout(function () {
                        scope.$broadcast('rzSliderForceRender');
                    });

                }
            }


            scope.onClickShowAdvanced = function (event) {

                scope.monitoringParams.showAdvancedParameters = !scope.monitoringParams.showAdvancedParameters;

                if (scope.monitoringParams.showAdvancedParameters) {
                    $(event.target).removeClass('fa-rotate-90').addClass('fa-rotate-270');
                    $('#advancedParams').removeClass('fa-rotate-90').addClass('fa-rotate-270'); //click on link
                    // refresh Slider
                    $timeout(function () {
                        scope.$broadcast('rzSliderForceRender');
                    });
                }
                else {
                    $(event.target).removeClass('fa-rotate-270').addClass('fa-rotate-90');
                    $('#advancedParams').removeClass('fa-rotate-270').addClass('fa-rotate-90'); //
                }

            }

            scope.getMonitoringParams = function () {
              //  debugger;
                scope.setParameter('min_proximity_of_documents', scope.monitoringParams.simthreshold.sliderValue);
                scope.setParameter('min_doc_by_cluster', scope.monitoringParams.minNbrDocInCluster.sliderValue);
                var data = [];
                scope.allParameters.forEach(function (item) {
                    if (item.paramName == "min_proximity_of_documents") {
                        data.push(item);
                    }
                    if (item.paramName == "min_doc_by_cluster") {
                        data.push(item);
                    }
                })
                return data;
            }

            scope.onClickCompute = function () {

                if (scope.monitoringParams.space) {
                    // save parameters before compute
                    var data = scope.getMonitoringParams();

                    $params.updateParams(angular.toJson(data)).then(
                        function (data) {

                            // Creation  of the json to be passed to the API
                            var json = {
                                spaceId: scope.monitoringParams.space.id,
                                autoComputeParams: scope.monitoringParams.simthreshold.recommendedValue ? 1 : 0
                            };
                            // Calling the API to launch a monitoring
                            $monitoring.launchMonitoring(json).then(function (monitoring) {

                                console.log(monitoring);

                                $monitoring.getClustersFromMonitoring(monitoring.id)
                                    .then(function (res) {

                                        scope.monitoringParams.minNbDocInCluster = res.minNbrDocs;
                                        scope.monitoringParams.maxNbDocInCluster = res.maxNbrDocs;
                                        scope.monitoringParams.nbOfCluster = res.numClusters;

                                        // detete this monitoring:
                                        $monitoring.deleteMonitoring(monitoring.id).then(function () {
                                            console.log("deleteMonitoring OK");

                                        }, function (err) {
                                            //alert("Deleting failed: "+err)
                                            // TODO: check how in case error 500 but monitoring is still removed
                                            console.log('Delete monitoring failed');
                                        });

                                    }, function (err) {
                                        //alert("Deleting failed: "+err)
                                        // TODO: check how in case error 500 but monitoring is still removed
                                        alert('get Clusters From Monitoring failed');
                                    });

                            }, function (res) {
                                alert('Create Smart Cluster failed');
                            });


                        },
                        function (res) {
                            alert('Update Params failed');
                        });
                }

            }


            scope.launchMonitoring = function () {
                //debugger;
                if (scope.monitoringParams.space) {



                    // save parameters before launch
                    var data = scope.getMonitoringParams();
                    $params.updateParams(angular.toJson(data)).then(
                        function (data) {

                            // Creation  of the json to be passed to the API
                            var json = {
                                spaceId: scope.monitoringParams.space.id,
                                minProximityOfDocuments: scope.monitoringParams.simthreshold.sliderValue,
                                //autoComputeParams: scope.monitoringParams.simthreshold.recommendedValue ? 1 : 0,
                                // add new
                                minDocByCluster: scope.monitoringParams.minNbrDocInCluster.sliderValue
                                //clusterProximity:scope.monitoringParams.clusterProximity.sliderValue
                            };
                            console.log(json);
                            // Calling the API to launch a monitoring
                            $monitoring.launchMonitoring(json).then(function (monitoring) {
                                //reload tree node
                                scope.activeNode.load(true).then(function () {
                                    scope.sortDirAsc = false;
                                    scope.sortTree(1); //date
                                    scope.activeNode.setExpanded();
                                });

                            }, function (res) {

                                //reload tree node
                                scope.activeNode.load(true).then(function () {
                                    scope.sortDirAsc = false;
                                    scope.sortTree(1); //date
                                    scope.activeNode.setExpanded();
                                })

                                alert('Create Smart Cluster failed');

                            });

                            $('#launchMonitoringModal').modal('toggle');

                        },
                        function (res) {
                            alert('update Params failed');
                        });
                }
            };



            /**
             * Event click on chart item
             */
            scope.$on('chart.onClick', function (angularEvent, event) {
              //  debugger;
                if (event.id == 0) {
                    return;
                }
                //clear screen
                scope.documents = null;
                scope.clusterdocuments = null;
                scope.reldocuments = null;
                scope.activeDocument = null;
                scope.showMonitoringStatistics = false;
                scope.showCategorizerStatistics = false;

                // no need to reload data if selected category is the same
                if (scope.activeCluster == event) {
                    scope.activeCluster = undefined;
                    scope.documents = undefined;
                } else {

                    scope.activeCluster = event;
                    $scope.activeCluster = event;
                    if (event.type == 'MONITOR') {
                      //  debugger;
                        scope.isClusterActive = true;
                        $scope.paginationOptions = {
                            pageNumber: 1,
                            pageSize: 25,
                            sort: null
                        };
                        $scope.gridOptions.paginationCurrentPage = scope.paginationOptions.pageNumber;
                        $scope.gridOptions.paginationPageSize = scope.paginationOptions.pageSize;
                        var clusterId = event.id;
                        $monitoring.getDocCountFromCluster(clusterId)
                            .then(function (res) {
                                $scope.gridOptions.totalItems = res.data;
                                scope.nbDocsOfCluster = res.data;

                            });

                        $monitoring.getDocsFromClusterByPage(clusterId,
                            $scope.paginationOptions.pageNumber, $scope.paginationOptions.pageSize)
                            .then(function (res) {
                                scope.documents = res.data;
                                // for group Monitoring Statistics
                                scope.showMonitoringStatistics = true;
                            }, function () { alert("Load clusters failed") });
                    }
                    if (event.type == 'CATEGORIZER') {
                        //debugger;
                        scope.isCategoryActive = true;
                        var dfr = $.Deferred();
                        $scope.paginationOptions = {
                            pageNumber: 1,
                            pageSize: 25,
                            sort: null
                        };
                        $scope.gridOptions.paginationCurrentPage = scope.paginationOptions.pageNumber;
                        $scope.gridOptions.paginationPageSize = scope.paginationOptions.pageSize;

                        var categoryId = event.id;
                        var categorizerId = event.categorizerId;
                        categorizerService.getCategoryDocCountOfCategorizer(categorizerId,
                            categoryId)
                            .then(function (res) {
                                $scope.gridOptions.totalItems = res.data;
                                scope.nbDocsOfCategory = res.data;
                                //alert("total items: " + res.data);
                            });

                        categorizerService.getCategoryDocumentsCategorizerByPage(
                            categorizerId, categoryId,
                            $scope.paginationOptions.pageNumber, $scope.paginationOptions.pageSize)
                            .then(function (res) {
                                scope.documents = res.data;
                                scope.showCategorizerStatistics = true;
                            }, function (res) {
                                alert('Could not load documents for category ' + event.label);
                            });
                        /*$documents.getDocumentByIdArray(event.docs).then(function (res) {
                            scope.documents = res;
                            scope.nbDocsOfCategory = scope.documents.length;
                        },function(){alert("Load clusters failed")});*/
                    }

                }

                scope.$apply();
            });


            //--- Gird Related Documents
            $scope.gridOptions2 = {
                data: [],
                enableGridMenu: false,
                enableFiltering: true,
                enableRowSelection: true,
                enableFullRowSelection: true,
                enableSelectAll: false,
                multiSelect: false,
                noUnselect: true,
                exporterMenuPdf: false,
                exporterMenuCsv: false,
                rowTemplate: $scope.gridOptions.rowTemplate,

                columnDefs: [
                    { name: 'url', field: 'url', width: 70, enableColumnMenu: false },
                    { name: 'description', field: 'description', width: 430, enableColumnMenu: false, cellTooltip: function (r, c) { return r.entity.title } }
                ],

                onRegisterApi: function (gridApi) {
                    gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                        scope.activeDocument = row.entity;
                    });

                }
            }
            //--- Gird Cluster for export
            $scope.gridOptions3 = {
                //minRowsToShow: 20,
                data: [],
                enableGridMenu: true,
                enableFiltering: true,
                enableRowSelection: false,
                enableFullRowSelection: false,
                enableSelectAll: false,
                multiSelect: false,
                noUnselect: true,
                exporterMenuPdf: false,
                exporterMenuCsv: true,
                rowTemplate: $scope.gridOptions.rowTemplate,

                columnDefs: [
                    { name: 'id', field: 'id', width: 70, enableColumnMenu: false },
                    { name: 'label', field: 'label', width: 150, enableColumnMenu: false, },
                    { name: 'tags', field: 'tags', width: 300, enableColumnMenu: false, },
                    { name: 'density', field: 'density', width: 150, enableColumnMenu: false, },
                    { name: 'nbDocs', field: 'nbDocs', width: 100, enableColumnMenu: false, },
                    { name: 'links', field: 'links', width: 200, enableColumnMenu: false, cellTooltip: function (r, c) { return r.entity.links } },
                    { name: 'documents', field: 'documents', width: 100, enableColumnMenu: false, },
                    { name: 'monitoringId', field: 'monitoringId', width: 70, enableColumnMenu: false, },
                    { name: 'nodeId', field: 'nodeId', width: 70, enableColumnMenu: false, },

                ],

            }

            /**
             *
             */
            scope.$watch("documents", function (newVal, oldVal) {

                //if (!newVal)return;
                //$scope.gridOptions.minRowsToShow = scope.activeNode? (scope.activeNode.data.spaceId ? 10 : 10):10;
                $scope.gridOptions.data = newVal;

                angular.element('#frameContent').attr('srcdoc', ''); // clear frame content for Firefox
                angular.element('#frameContent').removeAttr('src'); // clear frame content for Firefox
                window.scrollTo(0, 0);

                //set row can be draggalbe
                //window.setTimeout(function(){
                //    angular.element(".ui-grid-row-selected").draggable({revert:true,helper: "clone"});
                //    console.log(setTimeout)
                //    //$(".draggable").draggable({
                //    //    revert: true, //"invalid",
                //    //    helper: "clone",
                //        cursorAt: { top: -5, left: -5 },
                //        zIndex: -1,
                //        connectToFancytree: true,   // let Fancytree accept drag events
                //    //});
                //},100)
                //

            });
            /**
             *
             */
            scope.$watch("clusterdocuments", function (newVal, oldVal) {

                if (scope.activeNode && scope.activeNode.data.type === "CATEGORIZER") {
                    $scope.gridOptions4.columnDefs[2].name = "CategoryName";
                    $scope.gridOptions4.columnDefs[3].name = "CategoryTags";
                } else {
                    $scope.gridOptions4.columnDefs[2].name = "clusterName";
                    $scope.gridOptions4.columnDefs[3].name = "ClusterTags";
                }

                $scope.gridOptions4.data = newVal;
            })
            /**
             *
             */
            scope.$watch("reldocuments", function (newVal, oldVal) {
                $scope.gridOptions2.data = newVal;
            })

            /**
             *
             */
            scope.$watch("exportclusters", function (newVal, oldVal) {
                $scope.gridOptions3.data = newVal;
                window.scrollTo(0, 0);
            })

            /**
             * sync shared.space and allSpaces
             */
            scope.$watch("allSpaces.length", function (newVal, oldVal) {
                if (scope.allSpaces.length) {
                    scope.shared.spaces = [];
                    scope.allSpaces.forEach(function (item, idx) {
                        scope.shared.spaces.push(item);
                    })
                }
            })

            /**
             *
             */
            scope.$watch("activeDocumentModal", function (newVal) {

                var iframe = angular.element('#frameContentModal');

                if (!newVal) {
                    // clear frame
                    iframe.removeAttr('src');
                    iframe.removeAttr('srcdoc');
                    return;
                }

                //set actvie document for dialog
                var actDoc = scope.activeDocumentModal = newVal;

                // set URL for frame for show content of selected document
                if (actDoc.url && actDoc.url.toUpperCase().indexOf('HTTP') >= 0) {
                    angular.element('#docLoadingModal').show(); // show progress icon
                    iframe.attr('src', actDoc.url);
                    iframe.attr('sandbox', "");
                } else {
                    iframe.attr('srcdoc', (actDoc.description || actDoc.shortDescription));
                    //var url = $config.api.url + $config.api.uri.documents + '/' + actDoc.id + '/download?token=' + $config.api.token;
                    //url = 'https://docs.google.com/viewer?url=' +encodeURIComponent(url)+'&embedded=true';
                    //actDoc.url = url;
                    //iframe.removeAttr("sandbox");
                    //iframe.attr('src',actDoc.url);
                }

            });
            /**
             *
             */
            scope.$watch("activeDocument", function (newVal, oldVal) {

                var iframe = angular.element('#frameContent');;

                if (!newVal) {
                    // clear frame
                    iframe.removeAttr('src');
                    iframe.removeAttr('srcdoc');
                    return;
                }

                var actDoc = scope.activeDocument = newVal;

                // set URL for frame for show content of selected document
                if (actDoc.url && actDoc.url.toUpperCase().indexOf('HTTP') >= 0) {
                    angular.element('#docLoading').show(); // show progress icon
                    iframe.attr('src', actDoc.url);
                    iframe.attr('sandbox', '');
                } else {
                    iframe.attr('srcdoc', (actDoc.description || actDoc.shortDescription));
                    //var url = $config.api.url + $config.api.uri.documents + '/' + actDoc.id + '/download?token=' + $config.api.token;
                    //url = 'https://docs.google.com/viewer?url=' +encodeURIComponent(url)+'&embedded=true';
                    //actDoc.url = url;
                    //iframe.removeAttr('sandbox');
                    //iframe.attr('src',actDoc.url);
                }

                //get related documen and tags of document when space selected
                var spaceId = scope.activeNode.data.spaceId ? scope.activeNode.data.spaceId : scope.isSearchDocunemts ? scope.shared.space.id : null;
                if (spaceId) {
                    //get related docs
                    scope.getRelatedContent(spaceId, actDoc);
                    // get tags
                    var docId = actDoc.id;
                    $tagger.launchTaggerWithInternalDocument(spaceId, docId).then(function (tags) {
                        var tmp = [];
                        tags.forEach(function (tag) {
                            tmp.push(tag.label);
                        });
                        scope.activeDocument.tags = tmp;
                    });
                }
            })
            /**
             *
             * @param val
             */
            scope.filterTree = function (val) {
                $fancyTree.filter(val);
            }

            /**
             *
             * @type {{sortType: number}}
             */

            scope.sortTree = function (sortType) {
                console.log("scope.sortDirAsc", scope.sortDirAsc)
                $fancyTree.sortBy(sortType);
            }

            /**
             *
             */
            scope.refreshTree = function () {
                scope.initTree();
            }

            /************************* DEEP SEARCH **********************/
            scope.uploadFrm = {
                searchType: 1,
                searchQuery: null,
                searchFile: null,
                searchUrl: null,

                file: false,
                fileContent: null,
                myFile: null,
                fileName: null,

                // constants
                queryType: 1,
                fileType: 2,
                urlType: 3
            }
            scope.initDeepSearchForm = function () {
                scope.uploadFrm.searchType = 1;
                scope.uploadFrm.searchQuery = null;
                scope.uploadFrm.searchFile = null;
                scope.uploadFrm.searchUrl = null;

                scope.uploadFrm.file = false;
                scope.uploadFrm.fileContent = null;
                scope.uploadFrm.myFile = null;
                scope.uploadFrm.fileName = null;
            }
            scope.onChangeSearchType = function () {

                switch (scope.uploadFrm.searchType) {

                    case scope.uploadFrm.queryType:
                        scope.uploadFrm.searchFile = null;
                        scope.uploadFrm.searchUrl = null;
                        scope.uploadFrm.fileName = null;
                        scope.uploadFrm.fileContent = null;
                        scope.uploadFrm.myFile = null;
                        $('#searchQuery').focus();
                        break;

                    case scope.uploadFrm.fileType:
                        scope.uploadFrm.searchQuery = null;
                        scope.uploadFrm.searchUrl = null;
                        break;

                    case scope.uploadFrm.urlType:
                        scope.uploadFrm.searchQuery = null;
                        scope.uploadFrm.searchFile = null;
                        scope.uploadFrm.fileName = null;
                        scope.uploadFrm.fileContent = null;
                        scope.uploadFrm.myFile = null;
                        $('#searchUrl').focus();
                        break;
                }
            }
            scope.deepSearchWithType = function (spaceId) {

                if (spaceId) {

                    if (scope.uploadFrm.searchType == scope.uploadFrm.queryType) {

                        $semanticSpace.searchSpace(spaceId, scope.uploadFrm.searchQuery).then(
                            function (res) {
                                //clear screen
                                scope.showChart = false;
                                scope.reldocuments = null;
                                scope.clusterdocuments = null;
                                scope.exportclusters = null;
                                scope.activeDocument = null;
                                //set data
                                scope.documents = res.data;
                                scope.isSearchDocunemts = true;
                                scope.searchSpaceName = scope.allSpaces[spaceId].label;
                                //close
                                $('#searchModal').modal("hide");
                            }, function (err) {
                                alert("Searching failed");
                                $('#searchModal').modal("hide");
                            }
                        );
                    }
                    else {

                        alert("Missing API Deep search on file or url");
                        if (scope.uploadFrm.searchType == scope.uploadFrm.fileType) {

                        }
                        else if (scope.uploadFrm.searchType == scope.uploadFrm.urlType) {

                        }

                        $('#searchModal').modal("hide");
                    }
                }
            }

            // Checking crawls state
            //TODO we should use WebSockets!

            /*
            g_interval = $interval(function() {

                console.log("$interval is called from tree Service");
                if ($config.api.token == null){
                    $rootScope.allCrawls = {};
                }
                else {
                    scope.allCrawls.forEach(
                        function (crawl, idx) {

                            if (crawl.status != 2){

                                $crawl.updateCrawlInfos(crawl).then(
                                    function(res){
                                        // We can update the state and store it
                                        crawl.status = res.status;
                                        crawl.volume = res.volume;
                                        crawl.beginDate = res.beginDate;

                                        if (crawl.status == 2){
                                            // We can remove image loading....
                                            //var node = $fancyTree.getNodeByKey("CRAWL_"+crawl.id,"ROOT1");
                                            //if (node) {
                                            //    $(node.span).children().remove('img');
                                            //}

                                            // remove icon waiting on tree
                                            $('#CRAWLIMG'+crawl.id).remove();
                                        }
                                    }
                                );

                            }
                        }
                    );
                }

            }, $config.api.pollInterval);
            */

        }]);
