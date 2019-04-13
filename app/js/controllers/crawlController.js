'use strict';
function valueIfNull(value){
	return value==''? null:value;
}

angular.module('semdeePortal.controllers')

    .controller('crawlController',

    	['$scope', '$config', '$interval', '$crawl','$rootScope','$twitterService','$fancyTree','$stopWordsService',

		function($scope, $config, $interval, $crawl, $rootScope, $twitterService, $fancyTree, $stopWordsService) {

			$scope = $rootScope;

			$rootScope.isCrawlForm = true;
			/**
			 * VARs DEFINITION
			 */
			$scope.showCrawlsList = true;
			$rootScope.shared.space = undefined;

			// define default filtering most recent space goes first.
			$scope.predicate = 'beginDate';
			$scope.reverse = 'false';
		   // $rootScope.shared.space = undefined;

			$scope.crawls = {};
			$scope.schedules = {};

      // for stop word lists.
			/*$scope.stopWordLists = {};
			$stopWordsService.getStopWordLists().then(function(swLists) {
				 //debugger;
				 $scope.stopWordLists = swLists;
			}, function(res) {
				alert('Error while loading stop word lists. Please check server state');
			});*/

			// Crawls loading
			$crawl.getAllCrawls(false).then(function(crawls) {
				$scope.crawls = crawls;
			}, function(res) {
				alert('Error while loading user crawls. Please check server state');
			});

			// Schwdule loading
			/*$crawl.getAllCrawlSchedules().then(function (schedules) {
					$scope.schedules = schedules;
					//$scope.launchNewCrawl();
				}, function (err) {
					alert("Error while get schedules: " + err);
				}
			);*/

			// Sources initialization
			$scope.sources = $config.crawl.sources;
			// parametters:
			$scope.countries = $config.countries;
			$scope.languages = $config.languages;

			/**
			 * FUNCTIONS DEFINITION
			 */

			$scope.changeList = function(){

				$scope.showCrawlsList = !$scope.showCrawlsList;
				$rootScope.isCrawlForm = $scope.showCrawlsList;
			};

			$scope.deleteSchedule = function(schedule){
				// Calling the API to launch a echedule
				$crawl.deleteSchedule(schedule).then(
					function (res) {
						// reload list schedule
						$crawl.getAllCrawlSchedules().then(function(schedules) {
								$scope.schedules = schedules;
							},function(err){
								alert("Error while get schedules: "+err);
							}
						);

					}, function (res) {
						// Hiding the modal
						alert('An error occured while detete the schedule. Please check server state.');
					});
			};

			/**
			 *
			 */
			$("#launchNewCrawlModal").on("shown.bs.modal", function() {
				document.activeElement.blur();
				$('#query').focus();
			});

			$scope.launchNewCrawl = function() {
				// Form initialization
				$scope.crawlForm = {
					query:null,
				   	sources:[]// $config.crawl.sources
					// init params list
					,modalType:null
					,params:[]
					,tweetLimit:"1000"
					,googleBingLimit:"100"
					,facebookLimit:"100"

				};

				$('#launchNewCrawlModal').modal('show');
			};

			$scope.launchNewSchedule = function() {
				console.log("launchNewSchedule");

				$scope.minutes = [];
				$scope.minutes.push({value:'*',label:'*'});
				for(var m=0;m<60;m++){
					$scope.minutes.push({value:m,label:m});
				}

				$scope.hours = [];
				$scope.hours.push({value:'*',label:'*'});
				for(var m=0;m<=23;m++){
					$scope.hours.push({value:m,label:m});
				}

				$scope.daymonths = [];
				$scope.daymonths.push({value:'*',label:'*'});
				for(var m=1;m<=31;m++){
					$scope.daymonths.push({value:m,label:m});
				}

				$scope.months = [];
				$scope.months.push({value:'*',label:'*'});
				for(var m=1;m<=12;m++){
					$scope.months.push({value:m,label:m});
				}

				$scope.dayweeks = [];
				$scope.dayweeks.push({value:'*',label:'*'});
				for(var m=0;m<=6;m++){
					$scope.dayweeks.push({value:m,label:m});
				}

				// Form initialization
				$scope.scheduleForm = {
					minute:[],
					hour:[],
					daymonth:[],
					month:[],
					dayweek:[]
				};
				$('#launchNewScheduleModal').modal('show');
			};

			$scope.validateLaunchNewSchedule = function(){

				var jsonSources = [];
				$scope.crawlForm.sources.forEach(function (source) {
					jsonSources.push(
						{
							limit:$config.crawl.limit,
							language:
								(source.hasOwnProperty('params') && source.params.language!=null)?
									source.params.language.value:
									$config.crawl.language,
							name:$scope.crawlForm.query,
							source:source.value,
							query:$scope.crawlForm.query
						}
					)

				});

				var jsonSchedule = {
					minute: $scope.scheduleForm.minute.value,
					hour: $scope.scheduleForm.hour.value,
					daymonth: $scope.scheduleForm.daymonth.value,
					month:  $scope.scheduleForm.month.value,
					dayweek:  $scope.scheduleForm.dayweek.value
				}

				var json = {
					source:jsonSources,
					schedule:jsonSchedule
				};
				// Calling the API to launch a schedule
				$crawl.launchSchedule(json).then(
					function (res) {

						$('#launchNewScheduleModal').modal('toggle');
						$('#launchNewCrawlModal').modal('toggle');

						// reload list schedule
						$crawl.getAllCrawlSchedules().then(function(schedules) {
								$scope.schedules = schedules;
							},function(err){
								alert("Error while get schedules: "+err);
							}
						);
					}, function (res) {

						$('#launchNewScheduleModal').modal('toggle');
						$('#launchNewCrawlModal').modal('toggle');

						// Hiding the modal
						alert('An error occured while launching the schedule. Please check server state.');
				});


			};


			$scope.launchParams = function(source, $event){

				//console.log(source);

				console.log('launchParams');
				debugger
				var currentChecked = !$($event.currentTarget).hasClass('selected');

				if (currentChecked){

					if (source.hasOwnProperty('params')){

						$scope.crawlForm.params.operators_or = [];
						$scope.crawlForm.params.operators_not = [];
						$scope.crawlForm.params.operators_exclude = [];


						$scope.crawlForm.params.countries = [];
						$scope.crawlForm.params.languages =[];
						$scope.crawlForm.params.user = '';
						$scope.crawlForm.params.place = '';
						$scope.crawlForm.params.from ='';
						$scope.crawlForm.params.to ='';

						$scope.crawlForm.modalType = source.value;

						if (source.value == 'google'
							|| source.value == 'bing'
							|| source.value == 'twitter'
							|| source.value == 'rssfeed'
							|| source.value == 'facebook'
							|| source.value == 'commoncrawl'
						){

							$('#crawlParamsModal').modal("show");
						}
					}

				}
			};

			// reset selected value
			$scope.clickMultiToSingleOption = function(paramName){

				if (paramName == 'country'){
					$scope.crawlForm.params.countries = [];
				}
				else if (paramName == 'language'){
					$scope.crawlForm.params.languages = [];
				}
			};


			$scope.validateParams = function(){

				console.log('validateParams');

				$scope.crawlForm.sources.forEach(

					function(source, i) {

						if (source.hasOwnProperty('params')){

							if (source.value == $scope.crawlForm.modalType ){

								var countries = $scope.crawlForm.params.countries.length>0 ?
										$scope.crawlForm.params.countries[0]:null;
								var place = valueIfNull($scope.crawlForm.params.place);
								var user = valueIfNull($scope.crawlForm.params.user);
								var languages = $scope.crawlForm.params.languages.length>0 ?
										$scope.crawlForm.params.languages[0]:null;
								var from = valueIfNull($scope.crawlForm.params.from);
								var to = valueIfNull($scope.crawlForm.params.to);

								if ($scope.crawlForm.modalType == 'google'
									|| $scope.crawlForm.modalType == 'bing'
									|| $scope.crawlForm.modalType == 'rssfeed'
									|| $scope.crawlForm.modalType == 'commoncrawl'
								){


									$scope.crawlForm.sources[i].params.country = countries;
									$scope.crawlForm.sources[i].params.language = languages;
									$scope.crawlForm.sources[i].params.from = from;
									$scope.crawlForm.sources[i].params.to = to;

								}
								else if ($scope.crawlForm.modalType == 'twitter'){

									$scope.crawlForm.sources[i].params.user = user;
									$scope.crawlForm.sources[i].params.place = place;
									$scope.crawlForm.sources[i].params.language = languages;
									$scope.crawlForm.sources[i].params.from = from;
									$scope.crawlForm.sources[i].params.to = to;

									var oauth = $twitterService.isReady();
									if (oauth){
										console.log(oauth);
										//$scope.crawlForm.sources[i].params.oauth_token = oauth.oauth_token;
										//$scope.crawlForm.sources[i].params.oauth_token_secret = oauth.oauth_token_secret;
									}
									//console.log(oauth);

								}else if ($scope.crawlForm.modalType == 'facebook'){

									$scope.crawlForm.sources[i].params.user = user;
									$scope.crawlForm.sources[i].params.place = place;
									$scope.crawlForm.sources[i].params.language = languages;
									$scope.crawlForm.sources[i].params.from = from;
									$scope.crawlForm.sources[i].params.to = to;

									//console.log(oauth);

								}

								$('#crawlParamsModal').modal("toggle");
							}


						}
				});

			};

			// Form validation
			$scope.validateLaunchNewCrawl = function() {
				debugger;
				var json = [];

				// when this API is fixed (parameters country, from date, to date, user, place), isNewVersion = true
				var isNewVersion = false;

				// Creating a query json object for the request
				$scope.crawlForm.sources.forEach(function (source) {
					// new version :
					if (source.hasOwnProperty('params') && isNewVersion){

						if (source.value == 'google'){
							json.push({
								name: source.value,
								query: $scope.crawlForm.query,
								//country:source.params.country!=null? source.params.country.value:null,
								language:source.params.language!=null? source.params.language.value:null,
								//from:source.params.from,
								//to:source.params.to
								limit:source.params.googleBingLimit!=null?source.params.googleBingLimit:10
							})
						}if (source.value == 'commoncrawl'){
							json.push({
								name: source.value,
								query: $scope.crawlForm.query,
								//country:source.params.country!=null? source.params.country.value:null,
								language:source.params.language!=null? source.params.language.value:null,
								//from:source.params.from,
								//to:source.params.to
								limit:source.params.googleBingLimit!=null?source.params.googleBingLimit:100
							})
						}
						else if(source.value == 'bing'){

							json.push({
								name: source.value,
								query: $scope.crawlForm.query,
								//country:source.params.country!=null? source.params.country.value:null,
								language:source.params.language!=null? source.params.language.value:null,
								//from:source.params.from,
								//to:source.params.to
								limit:source.params.googleBingLimit!=null?source.params.googleBingLimit:100
							})
						}
						else if (source.value == 'twitter'){
							json.push({
								name: source.value,
								query: $scope.crawlForm.query,
								user:source.params.user,
								place:source.params.place,
								language:source.params.language!=null? source.params.language.value:null,
								from:source.params.from,
								to:source.params.to,
								limit: $scope.crawlForm.tweetLimit!=null?source.params.tweetLimit:1000
							})
						} else if (source.value == 'facebook'){
							json.push({
								name: source.value,
								query: $scope.crawlForm.query,
								user:source.params.user,
								place:source.params.place,
								language:source.params.language!=null? source.params.language.value:null,
								from:source.params.from,
								to:source.params.to,
								limit: $scope.crawlForm.facebookLimit!=null?source.params.facebookLimit:100
							})
						}

					}
					else{
						var paramPost = {};

						if (source.hasOwnProperty('params')) {

							if (source.value == 'google' || source.value == 'bing' || source.value == 'commoncrawl') {
								paramPost = {
									name: source.value,
									query: $scope.crawlForm.query,
									language: source.params.language != null ? source.params.language.value : $config.crawl.language,
									limit: $scope.crawlForm.googleBingLimit
								};
							}else if (source.value == 'twitter'){
									paramPost = {
										name: source.value,
										query: $scope.crawlForm.query,
										language: source.params.language != null ? source.params.language.value : $config.crawl.language,
										limit: $scope.crawlForm.tweetLimit
									};
							}else if (source.value == 'facebook'){
									paramPost = {
										name: source.value,
										query: $scope.crawlForm.query,
										language: source.params.language != null ? source.params.language.value : $config.crawl.language,
										limit: $scope.crawlForm.facebookLimit
									};
							}else {
								paramPost = {
									name: source.value,
									query: $scope.crawlForm.query,
									language: $config.crawl.language
								};
							}
						}
						else {

							paramPost = {
								name: source.value,
								query: $scope.crawlForm.query,
								language: $config.crawl.language
							};
						}

						json.push(paramPost);
					}
				});

				// Calling the API to launch a crawl
				$crawl.launchCrawl(json, $scope.crawlForm.query).then(function (crawl) {
					// Adding the new crawl to the list
					$scope.crawls[crawl.id] = crawl;
					// Hiding the modal
					$('#launchNewCrawlModal').modal('toggle');
					//load tree
					$scope.activeNode.load(true).then(function(){
						$scope.activeNode.setExpanded();
					});


				}, function (res) {
					// Hiding the modal
					$('#launchNewCrawlModal').modal('toggle');

					alert('An error occured while launching the crawl. Please check server state.');
				});
			};

			// Calling the API to get crawl result
			$scope.getCrawlResult = function(crawl) {
				console.log("getCrawlResult");

				if (crawl === $scope.activeCrawl){
					$scope.activeCrawl = undefined;
				}
				else {
					$crawl.getCrawlResult(crawl).then(function(res) {
						// Resetting some var
						$scope.activeCrawl = crawl; // Used to know which crawl is active
						$scope.source = undefined;
						// Setting some var
						$scope.documents = res.data;
						$scope.currentPageDocsList=1;
					}, function(res) {
						alert('An error occured while getting crawl result. Please check server state.');
					});
				}
			};


			$scope.createNewCrawlFromOldCrawl = function(crawl) {

				// retrieving crawls of selected crawl
				$scope.crawlForm = {
					crawls:[],
					label: 'Clone of '+crawl.query
				};
				$scope.crawlForm.crawls.push(crawl);

				if(!$scope.$$phase) {
					$scope.$apply();
				}
				$('#cloneCrawlModal').modal('show');
			};

			// Form validation
			$scope.validateCreateNewCrawlFromOldCrawl = function() {

				// Creation the json to be passed to the API
				// add empty crawls, label of this crawl is file name
				var name = $scope.crawlForm.label;
				var json = {
					limit:100,
					language:"fr",
					name:name,
					source:"filesystem",
					query:name
				};

				// create new empty crawl
				$crawl.addCrawl(json).then(
					function(res){

						console.log("create empty crawl id="+res.id);
						var newCrawlId = res.id;

						// add documents (from selected crawls ) to new Crawl
						$scope.crawlForm.crawls.forEach(function(item, idx){

							var jsonAddDocuments = {docs:[]};

							$crawl.getCrawlResult(item).then(
								function(res){
									res.data.forEach(function(item, idx){

										jsonAddDocuments.docs.push(
											{
												title:item.title,
												description:item.description,
												tags:item.tags,
												language:item.language
											}
										);
									});

									$crawl.addDocumentsToCrawl(newCrawlId,jsonAddDocuments).then(
										function(res){
											console.log("addDocumentsToCrawl Success");
											console.log(res);
										},
										function(res){
											console.log("addDocumentsToCrawl Error");
											console.log(res);
										}
									);


								},
								function(res){
									console.log(res);
								}
							);


						})



						//console.log($scope.activeNode);
						//load tree
						if ($scope.activeNode
							&& $scope.activeNode.parent
							&& $scope.activeNode.parent.data.type=="ROOT1") {

							$scope.activeNode.parent.load(true).then(function () {
								$scope.sortDirAsc = false;
								$scope.sortTree(1); //date
								$scope.activeNode.setExpanded();
							});
						}

						// reload list crawls for Creating New Cognitive Space
						$crawl.getAllCrawls(false).then(function(crawls) {
							$scope.crawls = crawls;
						}, function(res) {
							alert('Error while loading user crawls. Please check server state');
						});

						$('#cloneCrawlModal').modal('toggle');
					},
					function(res){
						console.log(res);
						alert('addCrawl problem');

						$('#cloneCrawlModal').modal('toggle');
					}
				);

			};

			// Checking crawls state
			//TODO we should use WebSockets!
			//g_interval = $interval(function() {
            //
			//	console.log("$interval is called from crawlController");
			//	if ($config.api.token == null){
            //
			//		$scope.crawls = {};
			//	}
			//	else {
			//		//if ($rootScope.requestedRoute == '/crawl' && $rootScope.isCrawlForm == true) {
			//		if ($rootScope.isCrawlForm == true) {
			//			for (var crawlId in $scope.crawls) {
			//				var crawl = $scope.crawls[crawlId];
            //
			//				// If this crawl is not finished, we need to check its state
			//				if (crawl.status != 2) {
			//					$crawl.updateCrawlInfos(crawl);
			//				}
			//			}
			//		}
			//	}
            //
			//}, $config.api.pollInterval);
    	}]);
