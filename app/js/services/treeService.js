/**
 * treeService.js
 *
 * @description : build FancyTree
 *
 */

'use strict';

angular.module('semdeePortal.services')
  .service('$fancyTree',
    ['$q', '$rootScope', '$semanticSpace', '$crawl', '$documents', '$location', '$monitoring', 'categorizerService', '$category', '$filter', '$tagger', '$route', '$regexService',
      function($q, $rootScope, $semanticSpace, $crawl, $documents, $location, $monitoring, categorizerService, $category, $filter, $taggerService, $route, $regexService) {

        var scope = $rootScope;

        scope.allCrawls = [];
        scope.allSpaces = [];

        /**
         * Build tree
         */
        this.build = function() {
          $("#tree").fancytree({
            extensions: ["dnd", "filter"],
            filter: {
              autoApply: false, // Re-apply last filter if lazy data is loaded
              counter: true, // Show a badge with number of matching child nodes near parent icons
              fuzzy: false, // Match single characters in order, e.g. 'fb' will match 'FooBar'
              hideExpandedCounter: true, // Hide counter badge, when parent is expanded
              highlight: true, // Highlight matches by wrapping inside <mark> tags
              mode: "dimm" // Grayout unmatched nodes (pass "hide" to remove unmatched node instead)
            },
            dnd: {
              autoExpandMS: 400,
              draggable: { // modify default jQuery draggable options
                zIndex: 1000,
                scroll: false,
                containment: "parent",
                revert: "invalid",
              },
              preventRecursiveMoves: true, // Prevent dropping nodes on own descendants
              preventVoidMoves: true, // Prevent dropping nodes 'before self', etc.

              dragStart: function(node, data) {
                // This function MUST be defined to enable dragging for the tree.
                // Return false to cancel dragging of node.
                //    if( data.originalEvent.shiftKey ) ...
                //    if( node.isFolder() ) { return false; }
                return false;
              },
              dragEnter: function(node, data) {
                /* data.otherNode may be null for non-fancytree droppables.
                 * Return false to disallow dropping on node. In this case
                 * dragOver and dragLeave are not called.
                 * Return 'over', 'before, or 'after' to force a hitMode.
                 * Return ['before', 'after'] to restrict available hitModes.
                 * Any other return value will calc the hitMode from the cursor position.
                 */
                // Prevent dropping a parent below another parent (only sort
                // nodes under the same parent):
                //    if(node.parent !== data.otherNode.parent){
                //      return false;
                //    }
                // Don't allow dropping *over* a node (would create a child). Just
                // allow changing the order:
                //    return ["before", "after"];
                // Accept everything:
                // Only accept drag from document list over node SAPCE_MC & FOLDER
                if (data.otherNode || ( /*node.data.type!="SPACE_MC" &&*/ node.data.type != "FOLDER")) {
                  return false;
                } else {
                  return 'over';
                }
              },
              dragExpand: function(node, data) {
                // return false to prevent auto-expanding parents on hover
              },
              dragOver: function(node, data) {},
              dragLeave: function(node, data) {},
              dragStop: function(node, data) {},
              dragDrop: function(node, data) {
                // This function MUST be defined to enable dropping of items on the tree.
                // data.hitMode is 'before', 'after', or 'over'.
                // We could for example move the source to the new target:
                //data.otherNode.moveTo(node, data.hitMode);
                //var doc  = angular.fromJson($(data.draggable.element).attr('data-row'))
                var doc = scope.activeDocument;
                node.addChildren({
                  id: doc.id,
                  title: doc.title
                });
                node.setExpanded();

              }
            },

            activate: function(event, data) {
              var node = data.node;
              setActiveNode(node);
              scope.isClusterActive = false;
              scope.isCategoryActive = false;
              scope.filterValue = "";
              var deferred = new $.Deferred();
              data.result = deferred.promise();
              scope.activeCluster = null;
              scope.gridOptions.columnDefs[3].visible=false;
              switch (node.data.type) {

                case 'ROOT1':
                  {
                    break;
                  }
                case 'CRAWL':
                  {
                  //  debugger;
                    scope.filterValue = "";
                    scope.paginationOptions = {
                      pageNumber: 1,
                      pageSize: 25,
                      sort: null
                    };
                    scope.gridOptions.paginationCurrentPage = scope.paginationOptions.pageNumber;
                    scope.gridOptions.paginationPageSize = scope.paginationOptions.pageSize;
                    $crawl.getCrawlResultCount({
                      id: node.data.id
                    })
                    .then(function(res) {
                      scope.gridOptions.totalItems = res.data;
                    });

                    $crawl.getCrawlResultByPage({
                        id: node.data.id
                      },
                      scope.paginationOptions.pageNumber, scope.paginationOptions.pageSize)
                    .then(function(res) {
                      scope.documents = res.data;
                    });
                    break;
                  }
                case 'CRAWL_RG':
                  {
                    break;
                  }
                case 'RGXSEARCH':
                  {
                    scope.gridOptions.columnDefs[3].visible=true;
                    scope.filterValue = "";
                    scope.paginationOptions = {
                      pageNumber: 1,
                      pageSize: 25,
                      sort: null
                    };
                    scope.gridOptions.paginationCurrentPage = scope.paginationOptions.pageNumber;
                    scope.gridOptions.paginationPageSize = scope.paginationOptions.pageSize;
                    $regexService.getRgxSearchResultCount(node.data.id)
                    .then(function(res) {
                      scope.gridOptions.totalItems = res.data;
                    });

                    $regexService.getRgxSearchResultByPage(node.data.id,
                      scope.paginationOptions.pageNumber, scope.paginationOptions.pageSize)
                    .then(function(res) {
                      scope.documents = res.data;
                    });
                    break;

                  }

                case 'SPACE':
                  {
                //    debugger;
                    scope.paginationOptions = {
                      pageNumber: 1,
                      pageSize: 25,
                      sort: null
                    };

                    scope.gridOptions.paginationCurrentPage = scope.paginationOptions.pageNumber;
                    scope.gridOptions.paginationPageSize = scope.paginationOptions.pageSize;
                    $semanticSpace.getDocumentCount(node.data.id)
                    .then(function(res) {
                      scope.gridOptions.totalItems = res.data;
                    });

                    $semanticSpace.getDocumentsByPage(node.data.id,
                      scope.paginationOptions.pageNumber, scope.paginationOptions.pageSize)
                    .then(function(res) {
                      scope.documents = res.data;
                    });
                    $semanticSpace.getSpace(node.data.id)
                    .then(function(res) {
                      scope.nbDocsOfSpace = node.data.volume;
                      scope.chart = {
                        data: [],
                        type: 'cloud-chart'
                      };

                      var myTags = JSON.parse(res.data.tags);
                      for (var h = 0; h < myTags.length; ++h) {
                        scope.chart.data.push({
                          value: myTags[h].frequency,
                          label: myTags[h].label
                        });
                      };
                    });
                    break;
                  }
                case 'SPACE_SC':
                  {
                    //var dfr = $.Deferred();
                    //var docs = dfr.promise();
                    //var tmp = [];
                    //var cnt = 0;
                    //var nbClusters = 0;
                    //$monitoring.getAllMonitorings(node.data.id).then(function (monitors) {
                    //    monitors.forEach(function (monitor, index) {
                    //        $monitoring.getClustersFromMonitoring(monitor.id).then(function (clusters) {
                    //            nbClusters += clusters.data.length;
                    //            clusters.data.forEach(function (cluster, index) {
                    //                $monitoring.getDocsFromCluster(cluster.id).then(function (res) {
                    //                    tmp = tmp.concat(res.data);
                    //                    console.log("cnt "+nbClusters,cnt);
                    //                    if (++cnt >= nbClusters) {
                    //                        dfr.resolve(tmp);
                    //                    }
                    //                });
                    //            })
                    //        });
                    //    })
                    //
                    //});
                    //
                    //$.when(dfr).then(function(res){
                    //    scope.documents = res;
                    //})

                    break;
                  }
                case 'SPACE_AC':
                  {
                    break;
                  }
                case 'SPACE_MC':
                  {
                    break;
                  }
                case 'CLUSTER':
                  {
                  //  debugger;
                    scope.isClusterActive = true;
                    scope.paginationOptions = {
                      pageNumber: 1,
                      pageSize: 25,
                      sort: null
                    };
                    scope.gridOptions.paginationCurrentPage = scope.paginationOptions.pageNumber;
                    scope.gridOptions.paginationPageSize = scope.paginationOptions.pageSize;
                    scope.activeCluster = node.data;
                    //$scope.activeCluster = node.data;
                    $monitoring.getDocCountFromCluster(node.data.id)
                    .then(function(res) {
                      scope.gridOptions.totalItems = res.data;
                      scope.nbDocsOfCluster = res.data;
                    });

                    $monitoring.getDocsFromClusterByPage(node.data.id,
                      scope.paginationOptions.pageNumber, scope.paginationOptions.pageSize)
                    .then(function(res) {
                      scope.documents = res.data;
                    });
                    break;
                  }
                case 'MONITOR':
                  {
                  //  debugger;

                    var nbDocsOfMonitoring = 0;
                    var nbDocsOfMonitoring2 = 0;
                    scope.ClusterOfMonitor = [];
                    var grandParentNode = node.getParent().getParent();

                    $monitoring.getClustersFromMonitoring(node.data.id).then(function(res) {
                      scope.nbOfClusters = res.data.length;
                      scope.nbDocsOfSpace = grandParentNode.data.nbdoc;

                      scope.ClusterOfMonitor = res.data;
                      scope.chart = {
                        data: [],
                        title: '',
                        type: 'donut-chart',
                        alldata: [] // backup for filter
                      };
                      // calculate document percent
                      res.data.forEach(function(cluster, index) {
                        nbDocsOfMonitoring += cluster.nbDocs;
                        if (cluster.label != "Rest")
                          nbDocsOfMonitoring2 += cluster.nbDocs;
                      });

                      // Creating a table that will fetch chart data
                      res.data.forEach(function(cluster) {
                        var links = [];
                        //  links.push({id:12,sourceId:23,destId:34,weight:78});
                        //   links.push({id:112,sourceId:213,destId:314,weight:718});
                        var tags = cluster.tags.split(' ');
                        tags.pop();
                        scope.chart.data.push({
                          id: cluster.id,
                          type: node.data.type,
                          value: cluster.nbDocs,
                          label: cluster.label + ' (' + cluster.tags.getSomeWords(0, 3) + ')',
                          tags: tags,
                          nodeId: cluster.nodeId,
                          // for bubble chart
                          percent: nbDocsOfMonitoring > 0 ? Math.round(cluster.nbDocs * 100 / nbDocsOfMonitoring) : 0,
                          // show in table "Monitoring Statistics" when click on chart
                          density: cluster.density,
                          nbDocs: cluster.nbDocs,
                          //links:cluster.links
                          links: links
                        });
                      });

                      //back up for restore when filter on chart
                      scope.chart.alldata = scope.chart.data;
                      scope.nbDocsOfMonitoring = nbDocsOfMonitoring;
                      scope.gridOptions4.totalItems = nbDocsOfMonitoring;

                      scope.paginationOptions = {
                        pageNumber: 1,
                        pageSize: 25,
                        sort: null
                      };
                      scope.gridOptions4.paginationCurrentPage = scope.paginationOptions.pageNumber;
                      scope.gridOptions4.paginationPageSize = scope.paginationOptions.pageSize;

                      var getClusterDetails = function(myClusters, clusterId) {
                        for (var i = 0; i < myClusters.length; i++) {
                          if (myClusters[i].id == clusterId) {
                            return myClusters[i];
                          }
                        }
                      }
                      var monitoringDocs = [];
                      //get all document of monitoring
                      $monitoring.getDocsFromMonitoringByPage(node.data.id,
                          scope.paginationOptions.pageNumber, scope.paginationOptions.pageSize)
                        .then(function(res) {
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
                        }, function() {
                          alert("Load document failed")
                        })

                    }, function() {
                      alert("Load clusters failed")
                    });

                    break;
                  }
                case 'CATEGORIZER':
                  {
                //    debugger;
                    // get categories of categorizer and push it to the data
                    scope.paginationOptions = {
                      pageNumber: 1,
                      pageSize: 25,
                      sort: null
                    };
                    scope.gridOptions4.paginationCurrentPage = scope.paginationOptions.pageNumber;
                    scope.gridOptions4.paginationPageSize = scope.paginationOptions.pageSize;
                    var grandParentNode = node.getParent().getParent();
                    var docCountOfCategorizer = 0;
                    categorizerService.getCategoriesOfCategorizer(node.data.id).then(function(res) {
                      scope.allCategories = res;
                      scope.nbOfCategories = res.length;
                      scope.nbDocsOfSpace = grandParentNode.data.nbdoc;
                      scope.chart = {
                        data: [],
                        alldata: [],
                        title: '',
                        type: 'donut-chart'
                      }

                      for (var i = 0; i < scope.allCategories.length; i++) {
                        var cat = scope.allCategories[i];
                        //$category.getCategoriesDetail
                        var tagString1 = [];
                        var myTags = JSON.parse(cat.tags);
                        for (var h = 0; h < myTags.length; ++h) {
                          tagString1.push(myTags[h].label);
                        }
                        scope.chart.data.push({
                          id: cat.categoryId,
                          categorizerId: cat.categorizerId,
                          type: node.data.type,
                          value: cat.nbdocs, // number of docs
                          label: cat.label,
                          density: cat.density,
                          tags: tagString1,
                          docs: [] // array of docs ID
                        });
                        docCountOfCategorizer += cat.nbdocs;
                      }
                      scope.gridOptions4.totalItems = docCountOfCategorizer;
                      scope.nbDocsOfCategorizer = docCountOfCategorizer;
                    });

                    var getCategoryDetails = function(myCategories, categoryId) {
                      for (var i = 0; i < myCategories.length; i++) {
                        if (myCategories[i].categoryId == categoryId) {
                          return myCategories[i];
                        }
                      }
                    }

                    var getTags = function(tags) {

                    }
                    var catdocs = [];
                    // Now, get the documents by page and push it the grid
                    categorizerService.getCategoriesDocumentsCategorizerByPage(node.data.id,
                      scope.paginationOptions.pageNumber, scope.paginationOptions.pageSize)
                    .then(function(res) {
                      var keys = Object.keys(res);
                      for (var i = 0; i < keys.length; ++i) {
                        var cat = getCategoryDetails(scope.allCategories, keys[i]);
                        var docs = res[keys[i]];
                        for (var j = 0; j < docs.length; ++j) {
                          var doc = docs[j];
                          doc.clusterName = cat.label;
                          var tagString = '';
                          var myTags = JSON.parse(cat.tags);
                          for (var h = 0; h < myTags.length; ++h) {
                            tagString += myTags[h].label + ' ';
                          }
                          doc.clusterTags = tagString;
                          catdocs.push(doc);
                        }
                      }
                      scope.clusterdocuments = catdocs;
                    });
                    //alert(catdocs.length);
                    /*
                    // get all the documents of categorizer
                    categorizerService.getCategoriesDocumentsCategorizer(node.data.id).then(function (res) {
                        scope.allCategories = res;
                        // Setting some var
                        scope.chart = {
                            data: [],
                            alldata:[],
                            title: '',
                            type: 'donut-chart'
                        };

                        // Creating a table that will fetch chart data, and get document of categorizer
                        var catdocs=[];
                        var tabReq = [];
                        var getCateoryFromDocId = function(catDocs,categoriesDetail,docId){
                            var keys = Object.keys(res);
                            for (var i=0; i<keys.length; i++){
                                for (var j=0;j< catDocs[keys[i]].length;j++){
                                    if (catDocs[keys[i]][j]==docId){
                                        return categoriesDetail[keys[i]];
                                    }
                                }
                            }
                        }
                        $taggerService.launchTaggerWithCategorizer(node.data.spaceId,node.data.id).then(function(tagRes){

                            $category.getCategoriesDetail(Object.keys(res)).then(function (categoriesDetail) {
                                var keys = Object.keys(res);

                                for (var i = 0; i < keys.length; i++) {
                                    var cat = categoriesDetail[keys[i]];
                                    scope.chart.data.push({
                                        id: cat.id,
                                        type: node.data.type,
                                        value: res[cat.id].length, // number of docs
                                        label: cat.label,
                                        docs: res[cat.id] // array of docs ID
                                    });

                                    //get doc detail by ID array, and add 2 new columns
                                    var req = $documents.getDocumentByIdArray(res[cat.id]).then(function(res){
                                        res.forEach(function(doc){
                                            var tmp = getCateoryFromDocId(scope.allCategories,categoriesDetail,doc.id);
                                            tmp.tags = getTagsStringByCategoryId(tmp.id,tagRes);
                                            doc.clusterName = tmp.label;
                                            doc.clusterTags = tmp.tags;
                                            catdocs.push(doc);
                                        });
                                    })
                                    tabReq.push(req);

                                }; //end for

                                $q.all(tabReq).then(function(res){
                                    scope.chart.title = '';//node.title//categorizer.label;
                                    scope.chart.alldata  = scope.chart.data;
                                    scope.clusterdocuments = catdocs;
                                },function(){alert("Load document failed")});
                            });
                        },function(){alert("Load tags categories failed")});

                    },function(){alert("Load categories failed")});*/
                    break;
                  }
                case 'CATEGORY':
                  {
                  //  debugger;
                    scope.isCategoryActive = true;
                    scope.paginationOptions = {
                      pageNumber: 1,
                      pageSize: 25,
                      sort: null
                    };
                    scope.gridOptions.paginationCurrentPage = scope.paginationOptions.pageNumber;
                    scope.gridOptions.paginationPageSize = scope.paginationOptions.pageSize;
                    var categoryId = node.data.id;
                    var categorizerId = node.parent.data.id;
                    categorizerService.getCategoryDocCountOfCategorizer(categorizerId,
                      categoryId)
                    .then(function(res) {
                      scope.gridOptions.totalItems = res.data;

                      //alert("total items: " + res.data);
                    });

                    categorizerService.getCategoryDocumentsCategorizerByPage(node.parent.data.id, node.data.id,
                      scope.paginationOptions.pageNumber, scope.paginationOptions.pageSize)
                    .then(function(res) {
                      scope.documents = res.data;
                      //alert("total docs length: " + res.data.length);
                    });


                    break;
                    // get list documents id array
                    /*var docIds = scope.allCategories[node.data.id];

                    $documents.getDocumentByIdArray(docIds).then(function (res) {
                        scope.documents = res;
                    },function(){alert("Load document failed")});*/

                    //break;
                  }
              }

              return deferred.resolve();
            },

            /////////////////////////////////////////////////////////////////////////////////////////
            /////////////////////////////////////////////////////////////////////////////////////////
            /////////////////////////////////////////////////////////////////////////////////////////
            lazyLoad: function(event, data) {
            //  debugger;
              var node = data.node;
              var deferred = new $.Deferred();
              data.result = deferred.promise();

              switch (node.data.type) {
                case 'ROOT1':
                  { //load all crawls
                    $crawl.getAllCrawls().then(function(res) {
                      scope.allCrawls = [];
                      var treeData = [];
                      res.forEach(function(item, idx) {
                        scope.allCrawls[item.id] = item; // use crawl id as index of array
                        treeData.push({
                          id: item.id,
                          type: 'CRAWL',
                          title: item.query + ' <span class="fancytree-subtitle">(' + $filter('date')(item.beginDate, 'dd MMM yyyy HH:mm') + ')</span>',
                          key: 'CRAWL_' + item.id,
                          folder: true,
                          nbdoc: item.volume,
                          status: item.status,
                          children: [
                            // for regular expressions
                            {
                              type: 'CRAWL_RG',
                              title: "Personal Data",
                              id: item.id,
                              crawlId: item.id,
                              folder: true,
                              lazy: true,
                              key: 'CRAWL_RG_' + item.id
                            }
                          ],
                        });
                      });
                      return deferred.resolve(treeData);
                    }, function(err) {
                      return deferred.reject(new Error(err));
                    });
                    break;
                  }

                  //
                  // regular expressions
                case 'CRAWL_RG':
                  {
                  //  debugger;
                    var treeData = []
                    $regexService.getAllRegexSearches(node.data.id).then(function(res) {
                      res.forEach(function(item, idx) {
                        //if (item.nbrclusters >= 0) {
                        //if (item.numClusters >= 0) {
                        treeData.push({
                          id: item.id,
                          crawlId: node.data.id,
                          type: 'RGXSEARCH',
                          //title: $filter('date')(item.beginDate,'dd MMM yyyy HH:mm') /*+ ' - ' +item.minCard+'-'*/ + ' <span class="fancytree-subtitle">('+$filter('number')(item.simthreshold, 2)+')</span>',
                          title: item.label + ' <span class="fancytree-subtitle">('+ $filter('date')(item.date,'dd MMM yyyy HH:mm')  + ')</span>',
                          key: 'RGXSEARCH_' + item.id,
                          folder: true,
                          nbdoc: item.volume,
                          status: item.status,
                          //lazy: true
                          //status: item.status,
                          //minDocByCluster: item.minDocByCluster,
                          //minProximityOfDocuments: item.minProximityOfDocuments,
                          //minProximityOfClusters: item.minProximityOfClusters,
                          //numOfInitialSamples: item.numOfInitialSamples
                        });
                        //}
                      });
                      return deferred.resolve(treeData);
                    }, function(err) {
                      return deferred.reject(new Error(err));
                    });
                    break;
                  }
                case 'ROOT2':
                  { //load all spaces
                    $semanticSpace.getAllSpaces().then(function(res) {
                      scope.allSpaces = [];
                      var treeData = [];
                      res.forEach(function(item, idx) {
                        scope.allSpaces[item.id] = item; // use space id as index of array
                        treeData.push({
                          id: item.id,
                          spaceId: item.id,
                          type: 'SPACE',
                          title: item.label,
                          key: 'SPACE_' + item.id,
                          folder: true,
                          status: item.status,
                          children: [{
                              type: 'SPACE_SC',
                              title: "Clusters",
                              id: item.id,
                              spaceId: item.id,
                              folder: true,
                              lazy: true,
                              key: 'SPACE_SC_' + item.id
                            },
                            {
                              type: 'SPACE_AC',
                              title: "Categories",
                              id: item.id,
                              spaceId: item.id,
                              folder: true,
                              lazy: true,
                              key: 'SPACE_AC_' + item.id
                            },
                            //{type:'SPACE_MC', title:"Manual Clusters",  id:item.id, spaceId: item.id, folder:true, lazy:true,key:'SPACE_MC_'+item.id}
                          ],
                          nbdoc: item.volume //scope.getNbDocsOfSpace(item.id)
                        });
                      });

                      return deferred.resolve(treeData);
                    }, function(err) {
                      return deferred.reject(new Error(err));
                    });
                    break;
                  }

                case 'SPACE_SC':
                  {
                    var treeData = []
                    $monitoring.getAllMonitorings(node.data.id).then(function(res) {
                      res.forEach(function(item, idx) {
                        //if (item.nbrclusters >= 0) {
                        if (item.numClusters >= 0) {
                          treeData.push({
                            id: item.id,
                            spaceId: node.data.id,
                            type: 'MONITOR',
                            //title: $filter('date')(item.beginDate,'dd MMM yyyy HH:mm') /*+ ' - ' +item.minCard+'-'*/ + ' <span class="fancytree-subtitle">('+$filter('number')(item.simthreshold, 2)+')</span>',
                            title: $filter('date')(item.beginDate, 'dd MMM yyyy HH:mm') /*+ ' - ' +item.minDocByCluster+'-'*/ + ' <span class="fancytree-subtitle">(' + $filter('number')(item.minProximityOfDocuments, 2) + ')</span>',
                            key: 'MONITOR_' + item.id,
                            folder: true,
                            lazy: true,
                            status: item.status,
                            minDocByCluster: item.minDocByCluster,
                            minProximityOfDocuments: item.minProximityOfDocuments,
                            minProximityOfClusters: item.minProximityOfClusters,
                            numOfInitialSamples: item.numOfInitialSamples
                          });
                        }
                      });
                      return deferred.resolve(treeData);
                    }, function(err) {
                      return deferred.reject(new Error(err));
                    });
                    break;
                  }

                case 'SPACE_AC':
                  {
                    var treeData = [];
                    data.result = categorizerService.getAllCategorizers(node.data.id).then(function(res) {
                      res.forEach(function(item, idx) {
                        treeData.push({
                          id: item.id,
                          spaceId: node.data.id,
                          type: 'CATEGORIZER',
                          title: $filter('date')(item.beginDate, 'dd MMM yyyy HH:mm') + ' <span class="fancytree-subtitle">(' + item.label + ')</span>',
                          key: 'CATEGORIZER_' + item.id,
                          folder: true,
                          lazy: true,
                          status: item.status
                        });
                      });
                      return deferred.resolve(treeData);
                    }, function(err) {
                      return deferred.reject(new Error(err));
                    });
                    break;

                  }

                case 'SPACE_MC':
                  {
                    return deferred.resolve([])
                    break;
                  }

                case 'MONITOR':
                  {
                    var treeData = [];
                    $monitoring.getClustersFromMonitoring(node.data.id).then(function(res) {
                      res.data.forEach(function(item, idx) {
                      //  debugger;
                        treeData.push({
                          id: item.id,
                          spaceId: node.data.spaceId,
                          monitorId: node.data.id,
                          nodeId: item.nodeId,
                          type: 'CLUSTER',
                          title: item.label + ' <span class="fancytree-subtitle">(' + item.tags.getSomeWords(0, 3) + ')</span>',
                          key: 'CLUSTER_' + item.id,
                          folder: true,
                          nbdoc: item.nbDocs,
                        });
                      });
                      return deferred.resolve(treeData);
                    }, function(err) {
                      return deferred.reject(new Error(err));
                    });
                    break;
                  }

                case 'CATEGORIZER':
                  {
                    //debugger;
                    var treeData = [];
                    categorizerService.getCategoriesOfCategorizer(node.data.id).then(function(res) {
                      scope.allCategories = res;
                      for (var i = 0; i < scope.allCategories.length; ++i) {
                        var cat = scope.allCategories[i];
                        var tagString = "";
                        var myTags = JSON.parse(cat.tags);
                        for (var j = 0; j < myTags.length && j < 3; ++j) {
                          tagString += myTags[j].label + ' ';
                        }
                        treeData.push({
                          id: cat.categoryId,
                          spaceId: node.data.spaceId,
                          type: 'CATEGORY',
                          title: cat.label + ' <span class="fancytree-subtitle">(' + tagString + ')</span>',
                          key: 'CATEGORY_' + cat.categoryId,
                          folder: true,
                        });
                      }
                      return deferred.resolve(treeData);
                    }, function(err) {
                      return deferred.reject(new Error(err));
                    });
                    /*categorizerService.getCategoriesDocumentsCategorizer(node.data.id).then(function (res) {

                        scope.allCategories = res;

                        //get detail of groupe in Categorizer
                        $category.getCategoriesDetail(Object.keys(res)).then(function (categoriesDetail) {
                            //get tags of categoryzer
                            $taggerService.launchTaggerWithCategorizer(node.data.spaceId,node.data.id).then(function(tagRes){
                                var keys = Object.keys(res);
                                for (var i = 0; i < keys.length; i++) {
                                    var cat = categoriesDetail[keys[i]];
                                    cat.tags = getTagsStringByCategoryId(cat.id,tagRes);
                                    treeData.push({
                                        id: cat.id,
                                        spaceId: node.data.spaceId,
                                        type: 'CATEGORY',
                                        title: cat.label + ' <span class="fancytree-subtitle">(' + cat.tags.getSomeWords(0,3) + ')</span>',
                                        key: 'CATEGORY_' + cat.id,
                                        folder: true,
                                    });
                                }
                                return deferred.resolve(treeData);

                            },deferred.reject)
                        },deferred.reject);

                    },function(err){
                        return deferred.reject(new Error(err));
                    });*/
                    break;
                  }
              }
            },
            click: function(event, data) {},
            focus: function(event, data) {
              if (data.targetType == "title") { //reload page when node focus
                data.node.setActive(false);
                data.node.setActive(true);
              }
              $(data.node.span).find('.fancytree-title').removeClass('darkblue blue');
            },
            expand: function(event, data) {},
            select: function(event, data) {},
            createNode: function(event, data) {
              if (data.node.data.type == "CRAWL" && data.node.data.status != 2) {
                $(data.node.span).last().append(' <img id="CRAWLIMG' + data.node.data.id + '" src="public/image/loader.gif" title="Running...">')
              } else if (data.node.data.type == "ROOT" || data.node.data.type == "ROOT1" || data.node.data.type == "ROOT2" || data.node.data.type == "SPACE_SC" || data.node.data.type == "SPACE_AC") {
                $(data.node.span).find('.fancytree-title').addClass('darkblue');
              } else {
                $(data.node.span).find('.fancytree-title').addClass('blue');
              }
            },
            renderNode: function(event, data) {},
            loadError: function(e, data) {},
            blurTree: function(e, data) {

            },
            blur: function(e, data) {
              if (data.node.data.type == "ROOT" || data.node.data.type == "ROOT1" || data.node.data.type == "ROOT2" || data.node.data.type == "SPACE_SC" || data.node.data.type == "SPACE_AC") {
                $(data.node.span).find('.fancytree-title').addClass('darkblue');
              } else {
                $(data.node.span).find('.fancytree-title').addClass('blue');
              }
            }

          });

          var setActiveNode = function(node) {

            //reset gloabl varaibes
            scope.activeCluster = null;
            scope.activeDocument = null;
            scope.activeSpace = null;
            scope.activeCrawl = null;
            scope.documents = null;
            scope.reldocuments = null;
            scope.clusterdocuments = null;
            scope.chart = null;
            scope.chartFilter = 1;
            scope.showChart = true;
            scope.exportclusters = null;
            scope.isSearchDocunemts = false;
            angular.element("#searchString").val("");
            scope.showMonitoringStatistics = false;
            scope.showCategorizerStatistics = false;

            // set active node, convert html to text for node title
            scope.activeNode = node;
            scope.activeNode.title = $('<div>' + scope.activeNode.title + '</div>').text();

            //set active Space for seleted node
            if (node.data.spaceId) {
              scope.activeSpace = scope.allSpaces[node.data.spaceId];
            }
            //set actice Crawl of selected CRAWL node
            if (node.data.type == "CRAWL") {
              scope.activeCrawl = scope.allCrawls[node.data.id];
            }
            //update data model
            if (!scope.$$phase) {
              scope.$apply(); //scope.$digest();
            }

            // ennable/disabke buttons on button bar
            enableButtons(scope.activeNode);

            console.log("scope.activeNode", scope.activeNode)
            console.log("scope.activeSpace", scope.activeSpace)
            console.log("scope.activeCrawl", scope.activeCrawl)
            console.log("scope.activeDocument", scope.activeDocument);
            console.log("scope.activeCluster", scope.activeCluster);
            console.log("scope.shared.space", scope.shared.space);
          }
        }

        /**
         *
         * @returns {*}
         */
        this.getActiveNode = function() {
          return $("#tree").fancytree("getActiveNode");
        }


        /**
         *
         * @param key
         * @returns {*|FancytreeNode|null|jQuery}
         */
        this.getNodeByKey = function(key) {
        //  debugger
          var mmtree = $("#tree").fancytree("getTree").getNodeByKey(key);
          return mmtree
        }
        /**
         *
         * @param sortBy
         */

        this.sortBy = function(sortType) {
          var cmp = function(a, b) {

            if (a == null) return 0;
            if (b == null) return 0;

            if (sortType == 1) { //Date
              a = a.data.id;
              b = b.data.id;
            } else if (sortType == 2) { //Distacne
            } else if (sortType == 3) { // Nb.Documents
              a = a.data.nbdoc;
              b = b.data.nbdoc;
            } else { //sort by tile
              a = a.title ? a.title.toLowerCase().trim() : '';
              b = b.title ? b.title.toLowerCase().trim() : '';
            }
            if (scope.sortDirAsc) {
              return a > b ? 1 : a < b ? -1 : 0;
            } else {
              return a < b ? 1 : a > b ? -1 : 0;
            }
          };
          var node = $("#tree").fancytree("getActiveNode");
          if (node) {
            node.sortChildren(cmp, false);
          }
          scope.sortDirAsc = !scope.sortDirAsc;
        }
        /**
         *
         */
        this.filter = function(match) {
          var tree = $("#tree").fancytree("getTree");
          var n,
            opts = {
              autoExpand: true,
              //leavesOnly: true
            }
          if (!match) {
            tree.clearFilter();
          } else {
            // Pass a string to perform case insensitive matching
            n = tree.filterNodes(match, opts);
          }
        }
        /**
         *
         */
        this.resize = function() {
          $("#tree .fancytree-container").height(0);
          var treeHeight = $('body').height() > $(document).height() ? $('body').height() : $(document).height();
          $("#tree .fancytree-container").height(treeHeight - $('#menuFolder').height() - $('.login-row').height() - 10);
        }

        /**
         *  build context menu for tree
         */
        this.contextMenu = function() {

          $(document).contextmenu({

            target: "#context-menu",

            before: function(e) {

              enableItems(this, false); //disalbe all

              var node = $("#tree").fancytree("getActiveNode");
              if (node) {
                var nodeType = node.data.type;
                if (nodeType === "ROOT1") {
                  enableItems(this, "#get,#import,#sort1,#sort2,#sort4")
                } else if (nodeType === "CRAWL") {
                  enableItems(this, "#add_to,#delete,#clone,#rename")
                } else if (nodeType === "ROOT2") {
                  enableItems(this, "#add_space,#sort1,#sort2,#sort4")
                } else if (nodeType === "SPACE") {
                  enableItems(this, "#clone,#delete,#rename")
                } else if (nodeType === "SPACE_SC") {
                  enableItems(this, "#add_monitor,#sort1,#sort2")
                } else if (nodeType === "SPACE_AC") {
                  enableItems(this, "#add_categorizer,#sort1,#sort2")
                } else if (nodeType === "SPACE_MC") {
                  enableItems(this, "#add_folder,#sort1,#sort2")
                } else if (nodeType === "MONITOR") {
                  enableItems(this, "#sort1,#sort2,#sort4,#delete,#rename")
                } else if (nodeType === "CLUSTER") {
                  enableItems(this, "#rename")
                } else if (nodeType === "CATEGORIZER") {
                  enableItems(this, "#sort1,#sort2,#delete,#rename")
                } else if (nodeType === "CATEGORY") {
                  enableItems(this, "#rename")
                } else if (nodeType === "FOLDER") {
                  enableItems(this, "#add_folder,#delete")
                }
              } else {
                enableItems(this, "#nonode");
                return true;
              }
              return true;
            },

            onItem: function(context, e) {

              if ($(e.target).parent().hasClass('disabled')) {
                return false;
              } else {
                var cmd = $(e.target).attr("href");

                if (cmd == "#get" || cmd == "#add_to" || cmd == "#add_crawl" || cmd == "#add_space" ||
                  cmd == "#add_categorizer" || cmd == "#add_monitor" || cmd == "#add_folder") {
                  scope.onNewButton();
                } else if (cmd == "#import") {
                  scope.onImportButton()
                } else if (cmd == "#rename") {
                  scope.onRenameButton();
                } else if (cmd == "#delete") {
                  scope.onDeleteButton();
                } else if (cmd == "#clone") {
                  scope.onCloneButton();
                } else if (cmd == "#sort1") {
                  scope.sortTree();
                } else if (cmd == "#sort2") {
                  scope.sortTree(1);
                } else if (cmd == "#sort3") {
                  scope.sortTree(2);
                } else if (cmd == "#sort4") {
                  scope.sortTree(3);
                } else {
                  //alert("Command not found!")
                }

                this.closemenu();

                if (!scope.$$phase) {
                  scope.$apply();
                }
                return false;
              }

            },
          });

          var enableItems = function(menu, items) {
            if (menu) {
              if (items) {
                var items = items.split(",");
                for (var i = 0; i < items.length; i++) {
                  var item = menu.getMenu().find("li a[href=" + items[i] + "]").parent();
                  item.removeClass("disabled hide")
                }
              } else {
                if (items === undefined) {
                  menu.getMenu().find("li").removeClass("disabled hide") //enable all
                } else if (items === false) {
                  menu.getMenu().find("li").addClass("disabled hide") //disable all
                }

              }
              $(menu).hide();
            }
          }

        }

        /**
         * enable/disabled buttons by node selected
         */
        var enableButtons = function(node) {
          var nodeType = node.data.type;
          var btnNew = angular.element("#btnNew");
          var btnClone = angular.element("#btnClone");
          var btnDelete = angular.element("#btnDelete");
          var btnChart = angular.element("#btnChart");
          var btnRename = angular.element("#btnRename");
          var btnImport = angular.element("#btnImport");
          var searchString = angular.element("#searchString");
          var btnExport = angular.element("#btnExport");

          if (nodeType === "ROOT1") {
            btnNew.removeClass("disabled");
            btnClone.addClass("disabled");
            btnDelete.addClass("disabled");
            btnChart.addClass("disabled");
            btnRename.addClass("disabled");
            btnImport.removeClass("disabled");
            btnExport.addClass("disabled");
          } else if (nodeType === "ROOT2") {
            btnNew.removeClass("disabled");
            btnClone.addClass("disabled");
            btnDelete.addClass("disabled");
            btnChart.addClass("disabled");
            btnRename.addClass("disabled");
            btnImport.addClass("disabled");
            btnExport.addClass("disabled");
          } else if (nodeType === "CRAWL") {
            btnNew.addClass("disabled");
            btnClone.removeClass("disabled");
            btnDelete.removeClass("disabled");
            btnChart.addClass("disabled");
            btnRename.removeClass("disabled");
            btnImport.addClass("disabled");
            btnExport.addClass("disabled");
          } else if (nodeType === "SPACE") {
            btnNew.addClass("disabled");
            btnClone.removeClass("disabled");
            btnDelete.removeClass("disabled");
            btnChart.removeClass("disabled");
            btnRename.addClass("disabled");
            btnImport.addClass("disabled");
            btnExport.addClass("disabled");
          } else if (nodeType === "SPACE_SC") {
            btnNew.removeClass("disabled");
            btnClone.addClass("disabled");
            btnDelete.addClass("disabled");
            btnChart.addClass("disabled");
            btnRename.addClass("disabled");
            btnImport.addClass("disabled");
            btnExport.addClass("disabled");
          } else if (nodeType === "SPACE_AC") {
            btnNew.removeClass("disabled");
            btnClone.addClass("disabled");
            btnDelete.addClass("disabled");
            btnChart.addClass("disabled");
            btnRename.addClass("disabled");
            btnImport.addClass("disabled");
            btnExport.addClass("disabled");
          } else if (nodeType === "SPACE_MC") {
            btnNew.removeClass("disabled");
            btnClone.addClass("disabled");
            btnDelete.addClass("disabled");
            btnChart.addClass("disabled");
            btnRename.addClass("disabled");
            btnImport.addClass("disabled");
            btnExport.addClass("disabled");
          } else if (nodeType === "MONITOR") {
            btnNew.addClass("disabled");
            btnClone.addClass("disabled");
            btnDelete.removeClass("disabled");
            btnChart.removeClass("disabled");
            btnRename.addClass("disabled");
            btnImport.addClass("disabled");
            btnExport.removeClass("disabled");
          } else if (nodeType === "CLUSTER") {
            btnNew.addClass("disabled");
            btnClone.addClass("disabled");
            btnDelete.addClass("disabled");
            btnChart.addClass("disabled");
            btnRename.removeClass("disabled")
            btnImport.addClass("disabled");
            btnExport.addClass("disabled");
          } else if (nodeType === "CATEGORIZER") {
            btnNew.addClass("disabled");
            btnClone.addClass("disabled");
            btnDelete.removeClass("disabled");
            btnChart.removeClass("disabled");
            btnRename.addClass("disabled");
            btnImport.addClass("disabled");
            btnExport.addClass("disabled");
          } else if (nodeType === "CATEGORY") {
            btnNew.addClass("disabled");
            btnClone.addClass("disabled");
            btnDelete.addClass("disabled");
            btnChart.addClass("disabled");
            btnRename.addClass("disabled");
            btnImport.addClass("disabled");
            btnExport.addClass("disabled");
          } else if (nodeType === "FOLDER") {
            btnNew.removeClass("disabled");
            btnClone.addClass("disabled");
            btnDelete.removeClass("disabled");
            btnChart.addClass("disabled");
            btnRename.addClass("disabled");
            btnImport.addClass("disabled");
            btnExport.addClass("disabled");
          } else {
            btnNew.addClass("disabled");
            btnClone.addClass("disabled");
            btnDelete.addClass("disabled");
            btnChart.addClass("disabled");
            btnRename.addClass("disabled");
            btnImport.addClass("disabled");
            btnExport.addClass("disabled");
          }

          if (btnChart.hasClass('disabled')) {
            btnChart.addClass("hide");
          } else {
            btnChart.removeClass("hide");
          }
          var searchString = angular.element("#searchString");

          if (nodeType === "SPACE" ||
            nodeType === "CLUSTER" ||
            nodeType === "CATEGORY") {
            searchString.show();
          } else {
            searchString.hide();
          }
        }

        var getTagsStringByCategoryId = function(catId, res) {
          var str = [];
          res[catId].forEach(function(item) {
            str.push(item.label);
          });
          return str.join(' ');
        };

      }
    ]);


// get some words in string -----------------------------------------------
String.prototype.getSomeWords = function(f, t) {
  return this.split(/\s+/).slice(f, t).join(' ');
};
