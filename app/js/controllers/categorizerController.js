'use strict';

angular.module("semdeePortal.controllers")
    .controller("categorizerController",

    ['cfpLoadingBar', '$scope', '$semanticSpace', 'categorizerService', '$category',
        '$categoryGroup', '$documents', '$rootScope','$filter',

        function (cfpLoadingBar, $scope, $semanticSpace, categorizerService, $category,
                  $categoryGroup, $documents, $rootScope, $filter) {

            $scope = $rootScope;

            /* initializing vars for display only */
            $scope.view = undefined;
            $scope.wizard = {step:1};
            $scope.predicate = 'beginDate';
            $scope.reverse = 'false';

            /* end display vars*/
            $scope.catName = [];
            $scope.groupName = undefined;
            $scope.catdocuments = [];//list
            $scope.searchResult = [];
            $scope.searchNotFound = false;
            $scope.selectAll = false;
            $scope.categoriesAll = [];
            $scope.categorizers = [];
            $scope.groups = [];
            $scope.activeCategorizer = undefined;
            $scope.chart = {
                title: 'Categorizer',
                type: 'bubble-chart',
                data: []
            };
            $scope.run = false;


            $scope.categoryName = undefined;
            $scope.categorySelected = undefined;

            $scope.listCategory = {};//list

            $scope.launchNewCategorizer = function(){
                $scope.selectedSpace();
                $('#launchNewCategorizerModal').modal('show');
                $scope.triggerView('new');
            }
            /**
             * Display functions - only used to trigger visibility on elements
             */
            $scope.triggerView = function(viewType){
                // Hide active categorizer when we launch categorization process
                if(viewType == 'new') {
                    $scope.activeCategorizer = undefined;
                    $scope.categoryName = undefined;
                    $scope.chartDocuments = undefined;
                    $scope.wizard.step = 1;
                }
                $scope.view = viewType;
            };

            $scope.dispCategToGroup = function (groupId){
                if ( !groupId ){
                    $scope.showForm = undefined;
                }
                else {
                    $scope.showForm = groupId;
                }
            };
            $scope.wizardForward = function(){$scope.wizard.step += 1;};
            $scope.wizardBackward = function(){$scope.wizard.step -= 1;};
            $scope.wizardGoto = function(step) {
                // can't select a future step
                if($scope.wizard.step >= step) {
                    $scope.wizard.step = step;
                }
            };

            // Semantic spaces initialization
            $semanticSpace.getAllSpaces().then(function (spaces) {
                $rootScope.shared.spaces = spaces;
            }, function (res) {
                alert('Error while loading user spaces' + JSON.stringify(res));
            });

            /**
             * lorsque l'on ajoute une categorie au doc
             * @param document
             */
            $scope.updateDoc = function (document) {
                console.log('update one doc');
                var documents = [];
                documents.push(document);
                $documents.updateDocs(documents).then(function () {
                }, function () {
                    $scope.categoriesAll = [];
                });
            };

            $scope.updateDocs = function(){
                var documents = [];
                console.log("update docs");
                if($scope.catdocuments!=undefined){
                    console.log("docs definis [OK]");
                    $scope.catdocuments.forEach(function (doc) {
                        if (doc.select) {
                            documents.push(doc);
                        }
                    });
                    $documents.updateDocs(documents).then(function () {

                        $scope.catdocuments.forEach(function (doc) {
                            doc.select = false;
                        });
                        $scope.categoriesAll = [];
                    }, function () {
                        $scope.categoriesAll = [];
                    });
                }
                console.log("aucun docs definis");

            };
             $scope.onSelectCognitiveSpaceAdvance = function(){

                 $scope.selectedSpace();
             }
            /**
             * lorsque l'on selectionne un espace semantique
             * @param space
             */
            $scope.selectedSpace = function () {

                // reset search query
                $scope.query = undefined;
                $scope.searchResult = [];
                $scope.currentPageDocsPage = 1;
                $scope.searchNotFound = false;


                //     cfpLoadingBar.start();
                $scope.resetSpaceScope();
                var space = $rootScope.shared.space;

                $scope.triggerView('browse');

                var categoriesDico = {};

                if (!space){

                    $scope.categorizers = [];
                    $scope.currentPageResultsPage = 1;
                    $scope.listCategory = {};
                    $scope.groups = [];
                    $scope.catdocuments = [];
                    $scope.currentPageCatsPage = 1;
                    $scope.currentPageCatsSelectedPage = 1;
                    $scope.currentPageDocsPage = 1;
                    $scope.currentPageDocsSelectedPage = 1;
                    $scope.currentPageCatsResultPage = 1;
                }
                else {
                    //alert("space is selected spaceId=" + space.id);
                    // retrieving all previous categorizers results for this space
                    categorizerService.getAllCategorizers(space.id).then(function (categorizers) {//OK
                        $scope.categorizers = categorizers;
                        $scope.currentPageResultsPage = 1;
                    }, function (res) {
                        alert('Error while loading user categorization: ' + JSON.stringify(res));
                    });

                    $categoryGroup.getCategoryGroupsOfSpace(space.id).then(function (groups) {//OK
                        $scope.listCategory = {};
                        // retrieve categories for each groups
                        groups.forEach(function (group) {
                            group.categories = [];
                            $categoryGroup.getCategories(group.id).then(function (categories) {//ok
                                for (var i = 0; i < categories.length; i++) {
                                    var cat = categories[i];
                                    group.categories.push(cat);
                                    categoriesDico[cat.id] = cat;

                                    $scope.listCategory[cat.id] = {
                                        id: cat.id,
                                        label: cat.label,
                                        groupid: group.id,
                                        running: false
                                    };
                                }

                                $scope.groups = groups;

                                /////////////////////////////////////////////
                                // this is to get documents of each category
                                //alert('start loading docs for categories');
                                for (var i=0; i<categories.length; i++){
                                    var myCat = categories[i];
                                    //alert('start loading docs for category id:=' + myCat.id);
                                    $category.getCategoryDocuments(myCat.id).then(function (docs){
                                        //console.log('start loading docs for category id:=' + categories[i].id);
                                        for (var j=0; j<docs.length; j++){
                                            var doc = docs[j]
                                            doc["select"] = false;
                                            doc["categories"] = [];
                                            if (doc.idCategories == undefined)
                                                doc["idCategories"] = [];
                                            for (var h=0; h<doc.idCategories.length; h++){
                                                doc.categories.push(categoriesDico[doc.idCategories[h]]);
                                            }
                                            $scope.catdocuments.push(doc);
                                        }
                                        //alert('loaded ' + docs.length + ' documents for category ');
                                    });
                                }
                                $scope.currentPageCatsPage = 1;
                                $scope.currentPageCatsSelectedPage = 1;
                                $scope.currentPageDocsPage = 1;
                                $scope.currentPageDocsSelectedPage = 1;
                                $scope.currentPageCatsResultPage = 1;
                                //////////////////////////////////////////////

                            });
                        });
                    }, function (res) {
                        alert("Error while loading category groups and categories");
                    });



                    // todo: this to be commented later ...
                    /*$semanticSpace.getDocuments(space.id).then(function (docs) {
                        console.log('start loading docs space.id=' + space.id);

                        for (var i = 0; i < docs.length; i++) {
                            var doc = docs[i];
                            doc["select"] = false;
                            doc["categories"] = [];
                            for (var j = 0; j < doc.idCategories.length; j++) {
                                doc.categories.push(categoriesDico[doc.idCategories[j]]);
                            }

                        }

                        $scope.catdocuments = docs;
                        $scope.currentPageCatsPage = 1;
                        $scope.currentPageCatsSelectedPage = 1;
                        $scope.currentPageDocsPage = 1;
                        $scope.currentPageDocsSelectedPage = 1;
                        $scope.currentPageCatsResultPage = 1;

                        console.log('docs loaded');
                        //  cfpLoadingBar.complete();
                    });*/
                }
            };

            $scope.resetSpaceScope = function(){
                // contains all groups and their categories defined for a specific space
               // $('.pull-left.filter-option').html('Select a group'); //TODO search a better way to fix this issue

                $scope.group = undefined;
                $scope.groups = [];
                console.log('reset docs');
                // contains all documents of a space linked to certain categories
                $scope.catdocuments = [];
                // contains all previous categorization results
                $scope.categorizers = [];
                // contains the active categorizer
                $scope.activeCategorizer = undefined;
                //
                $scope.wizard.step = 1;
                $scope.currentPageCatsPage = 1;
                $scope.currentPageCatsSelectedPage = 1;
                $scope.currentPageDocsPage = 1;
                $scope.currentPageDocsSelectedPage = 1;
                $scope.currentPageCatsResultPage = 1;
                $scope.search = {};


                $scope.categorySelected = undefined;
            };

            /**
             * lance le categorizer
             */
            $scope.runCategorizer = function () {

                var space = $rootScope.shared.space;
                if (!space) {
                    console.log("erreur pas d'espace semantique selectionné");
                    return;
                }
                categorizerService
                    .runCategorizer(
                    $scope.catdocuments,
                    $scope.group.id,
                    $scope.label,
                    space.id)
                    .then(
                    function (categorizer) {

                        $scope.categorizers.push(categorizer);
                        // Next categorizer will start on step 1
                        //$scope.wizard.step = 1;
                        // goto tab browse
                        $scope.view = 'browse';
                        alert("categorizer is done with id: " + categorizer.id);
                    }, function() {
                        alert('An error occured when running categorizing operation.');
                    }
                );

                $scope.triggerView('browse');
            };



            //$scope.runCategory = function (category) {
            //
            //    var space = $rootScope.shared.space;
            //    if (!space) {
            //        console.log("erreur pas d'espace semantique selectionné");
            //        return;
            //    }
            //    categorizerService.runCategorizer(
            //        $scope.catdocuments,
            //        category.groupid,
            //        category.label,
            //        space.id)
            //        .then(
            //        function (categorizer) {
            //
            //            $scope.categorizers.push(categorizer);
            //            // Next categorizer will start on step 1
            //            //$scope.wizard.step = 1;
            //            category.running = true;
            //        }, function() {
            //            alert('An error occured when running categorizing operation.');
            //        }
            //    );
            //
            //   // $scope.triggerView('browse');
            //};

            $scope.runCategory = function () {
                debugger;
                var space = $rootScope.shared.space;
                if (!space) {
                    console.log("Error: no space selectioned");
                    return;
                }
                // get groupid
                var groupid = undefined;
                var label = '';

                console.log($scope.listCategory);
                console.log($scope.catdocuments);

                var filterDocumentByCategory = $filter('filterDocumentByCategory');
                angular.forEach($scope.listCategory, function(value, key) {

                    var filtered = filterDocumentByCategory($scope.catdocuments,value );
                    if (filtered.length>0) {

                        if (angular.isUndefined(groupid)) {
                            groupid = value.groupid;
                        }
                        if (label != '') {
                            label += ' / ';
                        }
                        label += value.label;
                    }
                });

                categorizerService.runCategorizer(
                    $scope.catdocuments,
                    groupid,
                    label,
                    space.id)
                    .then(
                    function (categorizer) {

                        $scope.categorizers.push(categorizer);
                        // Next categorizer will start on step 1
                        $scope.wizard.step = 1;
                        //category.running = true;

                        $scope.triggerView('browse');
                        $scope.view = 'browse';

                        $('#launchNewCategorizerModal').modal('toggle');

                        //reload tree node
                        if ($scope.activeNode != undefined){
                            $scope.activeNode.load(true).then(function(){
                                $scope.activeNode.setExpanded();
                            })
                        }

                        alert("categorizer is done with id: " + categorizer.id);
                    }, function() {
                        alert('An error occured when running categorizing operation.');
                    }
                );

                // $scope.triggerView('browse');
            };

            //ajoute les categories avec le bouton + et l'envoie au serveur
            $scope.addCategory = function (groupId) {
                var catName = $scope.catName[groupId];

                if(catName) {

                    for (var i = 0; i < $scope.listCategory.length; i++) {
                        if ($scope.listCategory[i].label == catName && groupId==$scope.listCategory[i].categoryGroupId) {
                            $scope.catName[groupId] = undefined;
                            return;
                        }
                    }

                    $category.addCategory(catName, groupId)
                        .then(function (newCategory) {
                            // adding this category to her group
                            $scope.groups.forEach(function(group){
                                if ( group.id === groupId ){
                                    group.categories.push(newCategory);
                                    $scope.listCategory.push(newCategory);
                                }
                            })
                            $scope.catName = [];
                            $scope.showForm = undefined;
                        });
                }

            };

            $scope.searchSpace = function(spaceId, query){

                $scope.query = query;
                // reset search result
                //  $scope.query = undefined;
                $scope.searchResult = [];
                $scope.searchNotFound = false;
                $scope.currentPageDocsPage = 1;


                $semanticSpace.searchSpace(spaceId, query)
                    .then(function(resultDocs){
                        $scope.searchResult = resultDocs.data;
                        if (resultDocs.data.length==0){
                            $scope.searchNotFound = true;
                        }
                    }, function(){
                        console.log("Couldn't start search for space "+spaceId+" and query "+query);
                    });
            };


            /* new task case M16:
             Create and delete categories (also create a control or a warning to avoid creating 2 categories with same name)
             */
            // new task: do not use group

            $scope.createCategory = function (categoryName){

                var catName = categoryName;

                if(catName) {

                    var existCategory = false;

                    angular.forEach($scope.listCategory, function(value, key) {

                        if (existCategory == false
                            && value.label == catName) {// found this category
                            $scope.categoryName = '';

                            existCategory = true;

                        }
                    });

                    if (existCategory){
                        alert('This category name is existing, please enter other name');
                        return;
                    }

                    var groupDefault = undefined;

                    // find first groupid
                    for (var i = 0; i < $scope.groups.length; i++) {
                        if (angular.isUndefined(groupDefault)){
                            groupDefault = $scope.groups[i];
                            break;
                        }
                    }

                    if (angular.isUndefined(groupDefault)){// there is not group

                        // create default group
                        $categoryGroup
                            .addGroup("Default",$rootScope.shared.space.id)
                            .then(
                            function (newGroup) {

                                groupDefault = newGroup;
                                $scope.groups.push(newGroup);

                                $category.addCategory(catName, groupDefault.id)
                                    .then(function (newCategory) {
                                        // adding this category to her category list
                                        //$scope.listCategory.push(newCategory);

                                        $scope.listCategory[newCategory.id] = {
                                            id:newCategory.id,
                                            label:newCategory.label,
                                            groupid:groupDefault.id,
                                            running:false
                                        }

                                        $scope.categoryName = undefined;
                                    });


                            }
                        );
                    }
                    else{
                        // insert this category into first group
                        $category
                            .addCategory(catName, groupDefault.id)
                            .then(function (newCategory) {
                                // adding this category to her category list
                                //$scope.listCategory.push(newCategory);

                                $scope.listCategory[newCategory.id] = {
                                    id:newCategory.id,
                                    label:newCategory.label,
                                    groupid:groupDefault.id
                                }

                                $scope.categoryName = undefined;
                            });
                    }
                }
            };

            $scope.deleteCategory = function(cat){

                // verify this category contains document?
                for(var i=0;i<$scope.catdocuments.length;i++){
                    if ($scope.catdocuments[i].idCategories.indexOf(cat.id) >= 0){
                        alert('There is some document that you have added to this category, you can not delete it');
                        return;
                    }
                }

                $category
                    .deleteCategory(cat.id)
                    .then(function (res) {

                        // reload list categories
                        $scope.categorySelected = undefined;
                        delete $scope.listCategory[cat.id];

                    });
            };


            // click on category in list category (column 1 of step 2)
            $scope.selectCategory = function(category){

                $scope.categorySelected = category;
            }

            /**
             * lorsque l'on ajoute une categorie au doc
             * @param document
             */
            $scope.updateDocument = function (document) {
                console.log('update one document');
                console.log(document);

                //$documents.updateDocuments([document]).then(
                categorizerService.addDocumentToCategories([document]).then(
                    function () {
                        console.log("OK");
                    },
                    function () {
                        console.log("Faille");
                    });

            };
            $scope.removeDocument = function(doc){

                console.log('removeDocument '+doc.id);

                if (angular.isDefined($scope.categorySelected)){

                    for(var i=0;i<$scope.catdocuments.length;i++){
                        if ($scope.catdocuments[i].id == doc.id ){
                            var index = $scope.catdocuments[i].idCategories.indexOf($scope.categorySelected.id);
                            if (index>=0){// found this category in selected document
                                $scope.catdocuments[i].idCategories.splice(index, 1);
                                $scope.updateDocument($scope.catdocuments[i]);
                            }
                            return;
                        }
                    }
                }


            };

            /////////////////////
            // Changed by Murat
            /////////////////////
            $scope.addDocument = function(doc){

                console.log('addDocument '+doc.id);
                //alert('adding this doc: ' + doc.id);

                if (angular.isDefined($scope.categorySelected)){

                    // find the doc in catdocuments
                    //alert('finding the doc id =' + doc.id);
                    var indexDoc = -1;
                    for (var i=0; i<$scope.catdocuments.length; i++){

                        if ($scope.catdocuments[i].id == doc.id){
                            indexDoc = i;
                            //alert('doc ' + doc.id + ' is found');
                            break;
                        }
                    }

                    // if doc is not found in catDocuments, push it to the list.
                    if (indexDoc == -1){
                        // push the document in the catDocuments

                        $scope.catdocuments.push(doc);
                        indexDoc = $scope.catdocuments.length-1;
                        if (doc.idCategories == undefined)
                            doc["idCategories"] = [];
                        $category.getDocumentCategories(doc.id).then(function (cats){
                            for (var i=0; i<cats.length; i++){
                                var cat = cats[i];
                                doc.idCategories.push(cat.id);
                            }
                        });
                        //alert('doc ' + doc.id + ' is not found. so pushed in.');
                    }

                    var indexCat = $scope.catdocuments[indexDoc].idCategories.indexOf($scope.categorySelected.id);
                    if (indexCat < 0){// not found this category in selected document
                        $scope.catdocuments[indexDoc].idCategories.push($scope.categorySelected.id);
                        $scope.updateDocument($scope.catdocuments[indexDoc]);
                    }

                    return;


                    /*for(var i=0;i<$scope.catdocuments.length;i++){


                        if ($scope.catdocuments[i].id == doc.id ){

                            var index = $scope.catdocuments[i].idCategories.indexOf($scope.categorySelected.id);
                            if (index < 0){// not found this category in selected document
                                $scope.catdocuments[i].idCategories.push($scope.categorySelected.id);
                                $scope.updateDocument($scope.catdocuments[i]);
                            }
                            return;
                        }
                    }*/
                }
                else{
                    alert('Please select a category');
                }

            };


            $scope.addGroup = function () {
                if ( $scope.groupName ){
                    for (var i = 0; i < $scope.groups.length; i++) {
                        if ($scope.groups[i].label == $scope.groupName) {
                            return;
                        }
                    }
                    $categoryGroup.addGroup($scope.groupName, $rootScope.shared.space.id).then(function (newGroup) {
                        $scope.groups.push(newGroup);
                        $scope.group=newGroup;
                        $scope.group.categories = [];
                        $scope.groupName=undefined;
                    });
                }
            };

            //recupere les resultats du categorizer selectionné
            $scope.getCategorizerResult = function (categorizer) {
                if($scope.activeCategorizer == categorizer) {
                    $scope.activeCategorizer = undefined;
                } else {
                    categorizerService.getCategoriesDocumentsCategorizer(categorizer.id).then(function (res) {
                        // Setting some var

                        $scope.chart = {
                            data: [],
                            title: '',
                            type: 'donut-chart'
                        };
                        $scope.run = true;
                        // Resetting some var
                        $scope.activeCategorizer = categorizer; // Used to know which monitoring is active
                        $scope.category = undefined;
                        $scope.chartDocuments = undefined;
                        $scope.currentPageCategDetailsPages = 1;
                        $scope.categoryName = undefined;
                        // Creating a table that will fetch chart data
                        $category.getCategoriesDetail(Object.keys(res)).then(function (categoriesDetail) {
                            var keys = Object.keys(res);
                            for (var i = 0; i < keys.length; i++) {
                                var cat = categoriesDetail[keys[i]];
                                $scope.chart.data.push({ id: cat.id,
                                    value: res[cat.id].length,
                                    label: cat.label,
                                    docs: res[cat.id]
                                });
                            }
                            $scope.chart.title = categorizer.label;
                        });
                    }, function (res) {
                        alert('Unknown error occurred when try to connect to server: ' + JSON.stringify(res));
                    });
                }
            };
            /**
             * event
             */
            $scope.$on('chart.onClick', function (angularEvent, event) {
              if (event.id == 0){
                  return;
              }

              // hide form "edit cluster name"
              $scope.showEditClusterForm = false;

              // no need to reload data if selected category is the same
              if ($scope.activeCluster == event) {
                  $scope.activeCluster = undefined;
              } else {
                  $scope.activeCluster = event;
                  debugger;

                  $scope.paginationOptions = {
                     pageNumber: 1,
                     pageSize: 25,
                     sort: null
                   };
                   var categoryId= event.id;
                   var categorizerId = event.categoryId;
                   categorizerService.getCategoryDocCountOfCategorizer(categorizerId,
                     categoryId)
                   .then(function(res){
                     $scope.gridOptions.totalItems = res.data;
                     //alert("total items: " + res.data);
                   });

                   categorizerService.getCategoryDocumentsCategorizerByPage(
                     categorizerId, categoryId,
                     scope.paginationOptions.pageNumber, scope.paginationOptions.pageSize)
                     .then(function (res) {
                       $scope.documents = res.data;
                       alert("total docs length: " + res.data.length);
                   }, function (res) {
                       alert('Could not load documents for category ' + event.label);
                   });

              }

              $scope.$apply();

                /*if($scope.categoryName == event.label) {
                    $scope.chartDocuments = undefined;
                    $scope.currentPageCategDetailsPages = 1;
                    $scope.categoryName = undefined;
                } else {
                    $scope.chartDocuments = [];
                    $scope.currentPageCategDetailsPages = 1;
                    $scope.categoryName = event.label;

                    event.docs.forEach(function (docId) {
                        $documents.getDocumentById(docId).then(function (res) {
                            $scope.chartDocuments.push(res);
                        });
                    });
                }
                $scope.$apply();*/
            });

            /**
             * watch
             */
            $scope.$watch("selectAll", function () {
                for (var i = 0; i < $scope.catdocuments.length; i++) {
                    $scope.catdocuments[i]['select'] = $scope.selectAll;
                }
            }, true);

            $scope.$watch("categoriesAll", function () {
                for (var j = 0; j < $scope.catdocuments.length; j++) {
                    if ( $scope.catdocuments[j].select ){
                        $scope.catdocuments[j].categories = [];
                        for (var i = 0; i < $scope.categoriesAll.length; i++) {
                            $scope.catdocuments[j].categories.push($scope.categoriesAll[i]);
                        }
                    }
                }
                $scope.updateDocs();
            }, true);

            // automatically selects current semantic space on page load
            //$scope.$watch("shared.space",function(){
            //    if($rootScope.shared.space) {
            //        $scope.selectedSpace();
            //    };
            //})


            $scope.deleteCategorize = function(categorizer){
                console.log(categorizer);
                alert('Missing API delete categorizer')
            };
        }]);
