/**
 * documentsService.js
 *
 * @description ::
 *
 */

'use strict';

angular.module('semdeePortal.services')

    .factory('$documents',
    	['$q', '$semdee','$config', '$window', 'ngDialog','$semanticSpace' ,'$rootScope', '$tagger',
        function($q, $semdee,$config, $window, ngDialog, $semanticSpace, $rootScope, $tagger) {

			var openDialogWithFrame = function(frameData){

				// close last "related Content" dialog
				if (angular.isDefined($rootScope)
					&&  angular.isDefined($rootScope.relatedDialogContentId)){

					ngDialog.close($rootScope.relatedDialogContentId);
					$rootScope.relatedDialogContentId = undefined;
				}

				// open new dialog
				$rootScope.relatedDialogContentId = ngDialog.open(
					{
						template: 'app/templates/documentFrame.html',
						plain: false,
						cache: false,
						className: 'ngdialog-theme-plain ngdialog-iframe-custom',
						preCloseCallback: function () {
							console.log('default pre-close callback');
						},
						data: frameData
					}
				);

			};

	        return {
	            /**
	             * modifie les categories d'un document
	             * @param document
	             * @returns {promise|qFactory.Deferred.promise}
	             */
	            updateDocs: function (documents) {

	                var deferred = $q.defer();
	                var finalDocs = [];

	                documents.forEach(function (doc) {
	                    var finalDoc = {"id": doc.id};
	                    finalDoc.idCategories = [];
	                    doc.categories.forEach(function (categ) {
	                        finalDoc.idCategories.push(categ.id);
	                    })
	                    finalDocs.push(finalDoc);
	                });

	                $semdee.call({
	                    method: 'put',
	                    url: $config.api.uri.documents + '/',
	                    json: finalDocs
	                }, true).then(function (res) {
	                    deferred.resolve(res.data);
	                }, deferred.reject);
	                return deferred.promise;
	            },

				/**
				 * modifie les categories d'un document
				 * @param document
				 * hauhh
				 * @returns {promise|qFactory.Deferred.promise}
				 */
				/*updateDocuments: function (documents) {

					var deferred = $q.defer();
					var finalDocs = [];

					documents.forEach(function (doc) {
						var finalDoc = {
							"id": doc.id,
							idCategories:[]
						};
						doc.idCategories.forEach(function (catId) {
							finalDoc.idCategories.push(catId);
						})
						finalDocs.push(finalDoc);
					});

					$semdee.call({
						method: 'put',
						url: $config.api.uri.documents + '/',
						json: finalDocs
					}, true).then(function (res) {
						deferred.resolve(res.data);
					}, deferred.reject);
					return deferred.promise;
				},*/

	            /**
	             * recupere les details d'un document
	             * @param documentId
	             * @returns {promise|qFactory.Deferred.promise}
	             */
	            getDocumentById: function (documentId) {//OK
	                var deferred = $q.defer();
	                $semdee.call({
	                    method: 'get',
	                    url: $config.api.uri.documents + '/' + documentId,
	                    json: {}
	                }, true).then(function (res) {
	                    deferred.resolve(res.data);
	                }, deferred.reject);
	                return deferred.promise;
	            },
				/**
				 *
				 */
				getDocumentByIdArray: function(arrId){
					var deferred = $q.defer();
					$semdee.call({
						method: 'post',
						url: $config.api.uri.documents+"/",
						json: angular.toJson(arrId)
					}, true).then(function (res) {
						deferred.resolve(res.data);
					}, deferred.reject);
					return deferred.promise;
				},

				goToDocument: function(doc) {

	            	console.log("goToDocument service");

					var deferred = $q.defer();

					this.getDocumentById(doc.id).then(

							function(doc){

								if(doc.source == 'filesystem' ) {

									var url = $config.api.url + $config.api.uri.documents + '/' + doc.id + '/download';
									url += '?token=' + $config.api.token;

									$rootScope.relatedDialogContentId = ngDialog.open({
										template: '<iframe id="framePreview" src="https://docs.google.com/viewer?url='+encodeURIComponent(url)+'&embedded=true" ></iframe><a id="btnPreviewSource" class="btn btn-default" href="' + url + '" ng-click="closeThisDialog()" target="_blank"><span class="fa fa-external-link"></span> Open in browser</a>',
										plain: true,
										cache: false,
										className: 'ngdialog-theme-plain'
									});


								} else {

									//$window.open(doc.url, '_blank');

									var url_valid = false;
									if (doc.url){
										url_valid = /^(https?|s?ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(doc.url);
									}

									var spaceIsDefined = false;
									if (angular.isDefined($rootScope)
										&& angular.isDefined($rootScope.shared)){
										spaceIsDefined = angular.isDefined($rootScope.shared.space);
									}

									if (spaceIsDefined) {

										var spaceId = $rootScope.shared.space.id;

										$tagger.launchTaggerWithInternalDocument(spaceId, doc.id)
											.then(function (tags) {

												var cloud = {data:[]};
												// preparing chart for active space tags
												// Creating a table that will fetch chart data
												tags.forEach(function (tag) {
													cloud.data.push({
														value: tag.frequency,
														label: tag.label
													});
												});

												// trying to find related content for document that bears id : docId
												//$semanticSpace.searchSpace(spaceId, doc.url)
												$semanticSpace.relatedContent(spaceId, doc.id)
													.then(function (resultDocs) {
														console.log("searchSpace");
														console.log(resultDocs);

														// set data for ngDialog frame
														var frame_data = {
															url: url_valid? doc.url:null,
															title: doc.title,
															doc: doc,
															description: doc.description ? doc.description : doc.shortDescription,
															relatedContent: resultDocs.data,
															showRelatedContent: spaceIsDefined,
															chartActive:true,
															cloud:cloud,
															showCloud:true
														}

														openDialogWithFrame(frame_data);

													}, function () {
														console.log("Couldn't start search for space " + spaceId);
													});

											}, function (res) {
												alert('Errror while launching tagging operation ' + JSON.stringify(res));
											});

									}
									else{ // no select space => no show tags, related content

										// set data for ngDialog frame
										var frame_data = {
											url: url_valid? doc.url:null,
											title: doc.title,
											description: doc.description ? doc.description : doc.shortDescription,
											doc: doc,
											relatedContent: [],
											showRelatedContent: false,
											chartActive:false,
											cloud:null,
											showCloud:false
										}

										openDialogWithFrame(frame_data);
									}

								}
							},
							function(res){

							}
					);

	                deferred.resolve();

	                return deferred.promise;
	            }
	        }
    }]);