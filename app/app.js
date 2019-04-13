'use strict';
var g_interval = null; // interval update crawl infos

angular.module("semdeePortal.controllers",[]);
angular.module("semdeePortal.services",[]);
angular.module("semdeePortal.directives",[]);
angular.module("semdeePortal.filters",[]);

angular.module('semdeePortal', [
    'ngRoute',
    'semdeePortal.controllers',
    'semdeePortal.directives',
    'semdeePortal.config',
    'semdeePortal.services',
    'semdeePortal.filters',
    'angular-loading-bar',
    'angularUtils.directives.dirPagination',
    'nya.bootstrap.select',
    'ui.tree',
    'ngDialog',
    'ngCookies',
    // by wissem
    'ngCsvImport',
    // UI grid view
    'ui.grid', 'ui.grid.cellNav', 'ui.grid.edit', 'ui.grid.resizeColumns',
    'ui.grid.pinning', 'ui.grid.selection', 'ui.grid.moveColumns', 'ui.grid.exporter',
    'ui.grid.importer', 'ui.grid.grouping', 'ui.grid.pagination',
    'rzModule'
    //'ngDragDrop',
]);


angular.module('semdeePortal')
    .controller('menuController',['$scope', '$location','$crawl','$semanticSpace',
        function ($scope,$location,$crawl,$semanticSpace){

        $scope.routeIs = function(routeName) {
            return $location.path() === routeName;
        };

        $scope.expandMenu = function(){
            var menu = jQuery('#menu');
            var mainDiv = jQuery('#main-div');
            var dur = 250;
            if (menu.hasClass('menu-unfold')){
                jQuery('.menu-divtext').hide();
                jQuery('#logobox').hide();
                jQuery('#logo span').hide();
                jQuery('#filterTree').hide();
                jQuery('#treeBar').hide();
                jQuery('#tree').hide('slow');
                menu.toggleClass('menu-unfold').animate({width:"4em"},dur);
                mainDiv.animate({marginLeft:"4em"},dur);
            }
            else {
                //jQuery('#logo').hide();
                menu.toggleClass('menu-unfold').animate({width:"24em"},dur,function(){
                    jQuery('#logo span').show();
                    jQuery('.menu-divtext').show();
                    jQuery('#logobox').show();
                    jQuery('#filterTree').show();
                    jQuery('#treeBar').show();
                    jQuery('#tree').show('slow');
                });
                mainDiv.animate({marginLeft:"24em"},dur);
            }
        }

        //expand menu on left
        $scope.expandMenu();

    }])
    .config(['$routeProvider', '$httpProvider', 'cfpLoadingBarProvider', 'paginationTemplateProvider', function ($routeProvider, $httpProvider, cfpLoadingBarProvider, paginationTemplateProvider){
        $routeProvider.when("/home", {
            templateUrl:"app/templates/home.html",
            controller:"homeController"
        });

        $routeProvider.when("/crawl", {
            templateUrl:"app/templates/crawl.html",
            controller:"crawlController"
        });

        $routeProvider.when("/space", {
            templateUrl:"app/templates/space.html",
            controller:"spaceController"
        });

        $routeProvider.when("/search", {
            templateUrl:"app/templates/search.html",
            controller:"searchController"
        });

        $routeProvider.when("/relcontent", {
            templateUrl:"app/templates/relatedContent.html",
            controller:"relatedContentController"
        });

        $routeProvider.when("/home/categorizer", {
            templateUrl:"app/templates/categorizer.html",
            controller:"categorizerController"
        });

        $routeProvider.when("/monitoring", {
            templateUrl:"app/templates/monitoring.html",
            controller:"monitoringController"
        });

        $routeProvider.when("/params", {
            templateUrl:"app/templates/params.html",
            controller:"paramsController"
        });

        $routeProvider.when("/crawlSourceParams", {
            templateUrl:"app/templates/crawlSourceParams.html",
            controller:"accountParamsController"
        });

        $routeProvider.when("/stopWords", {
            templateUrl:"app/templates/stopwords.html",
            controller:"stopWordsController"
        });

        $routeProvider.when("/regex", {
            templateUrl:"app/templates/regex.html",
            controller:"regexController"
        });

        $routeProvider.when("/schedule", {
            templateUrl:"app/templates/schedules.html",
            controller:"scheduleController"
        });

        $routeProvider.when("/tagger", {
            templateUrl:"app/templates/tagger.html",
            controller:"taggerController"
        });

        $routeProvider.when("/auth", {
            templateUrl:"app/templates/auth.html",
            controller:"authController"
        });

        $routeProvider.when("/profile", {
            templateUrl:"app/templates/profile.html",
            controller:"authController"
        });

        $routeProvider.when("/signup", {
            templateUrl:"app/templates/signUp.html",
            controller:"authController"
        });


        $routeProvider.otherwise({redirectTo: '/home'});

        cfpLoadingBarProvider.includeSpinner = true;

        paginationTemplateProvider.setPath('app/templates/dirPagination.tpl.html');
    }])
    .run(
        ['$rootScope', '$location','$auth', '$semanticSpace', '$crawl', '$documents','$config', '$cookies','$interval',

        function ($rootScope, $location,$auth, $semanticSpace, $crawl , $documents,$config, $cookies, $interval) {

            var isLoggedIn = function (){

                if ($cookies!=null) {

                    if (angular.isDefined($cookies.semdee_auth)) {

                        var user = angular.fromJson($cookies.semdee_auth);
                        if (user) {

                            $rootScope.currentUser = user;

                            return true;
                        }
                    }
                }
                return false;
            };
            var getTokenFromCookie = function(){

                if (angular.isDefined($cookies.semdee_auth)) {
                    var user = angular.fromJson($cookies.semdee_auth); //get id from cookie
                    //console.log(user);
                    if (user) {
                        return user.token;
                    }
                }
                return null;
            };

            $rootScope.logout = function () {
                $auth.logOut();
                window.location.reload(true);
            };

            $rootScope.$on('$routeChangeStart', function (event, next) {

                console.log('next ' + JSON.stringify(next));

                if (g_interval != null){
                    $interval.cancel(g_interval);
                }

                if (next.$$route && next.$$route.originalPath != "/auth") {
                    $rootScope.requestedRoute = next.$$route.originalPath;
                }

                // get token from cookie
                $config.api.token = getTokenFromCookie();

                /*
                 * When user open a URL is not public, if user do not login yet, we redirect user to login page.
                 * Before redirect user to login page, we try to make a auto-login based on data of cookies
                 */
                $auth.isRoutePublic($rootScope.requestedRoute)
                    .then(function (res) {

                        console.log("isRoutePublic");

                        var loggedIn = isLoggedIn($cookies, $rootScope);

                        if (res == false && !$rootScope.currentUser) {

                            if (!loggedIn){

                                $auth.autoAuth().then(function (data) {
                                    console.log("Auto login return token : " + (data ? data.token : null));

                                    if (data) { // login OK
                                        $rootScope.currentUser = data;

                                        $location.path($rootScope.requestedRoute).search({p: $rootScope.requestedRoute});
                                    } else { //not login yet
                                        $location.path('/auth').search({p: $rootScope.requestedRoute});
                                    }
                                }, function (data) {
                                    alert("Error connect to server: " + data)
                                });
                            }

                        }else{ // go to public page
                            $location.path($rootScope.requestedRoute);//.search({p: $rootScope.requestedRoute});
                        }
                    });

            });

            // Defining var scope that will hold current selected space
            $rootScope.shared = {};
            if ($config.api.token) {
                $semanticSpace.getAllSpaces().then(function (spaces) {
                    $rootScope.shared.spaces = spaces;
                    console.log("semantic spaces loaded in menu");
                }, function (res) {
                    alert('Error while loading user spaces' + JSON.stringify(res));
                });
            }

            // automatically unload semantic space when the app is closed
            var onBeforeUnloadHandler = function (event) {
                if ($rootScope.shared.space) {
                    $semanticSpace.unloadSpace($rootScope.shared.space.id);
                }
            };

            // Method available in the rootScope, allowing a user to go to a document source (internal or external)
            $rootScope.goToDocument = function (document) {

                console.log("goToDocument - controller related content (run)");
                $rootScope.selDoc =  document;

                $documents.goToDocument(document).then(function () {
                    console.log("document loaded");
                }, function () {
                    alert("Couldn't go to document");
                });
            };

            $rootScope.openDocumentDialog = function(doc){
                $rootScope.activeDocumentModal = doc;
                $('#viewDocumentModal').modal("show");
            }
        }
    ]);
