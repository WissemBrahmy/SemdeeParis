/**
 * crawlService.js
 *
 * @description ::
 *
 */

'use strict';

angular.module('semdeePortal.services')

    .factory('$crawl',

    	['$q', '$semdee', '$semanticSpace','$config','cfpLoadingBar',
        function($q, $semdee, $semanticSpace, $config, cfpLoadingBar) {

	        return {
            downloadCsvFile: function (crawlid) {
              var deferred = $q.defer();

              $semdee.call({
                  method: 'get',
                  url: $config.api.uri.crawls + '/' + crawlid + '/asynccsvstream',
                  json: {responseType:'arraybuffer'}

              }, false).then(deferred.resolve, deferred.reject);

    					return deferred.promise;

            			/*return $http.get(//here server endpoint to which you want to hit the request
                          , {
            				responseType: 'arraybuffer',
            				params: {
            					//Required params
            				},
            			}).then(function (response, status, headers, config) {
            				return response;
            			});*/
            		},

	            launchCrawl: function (json, query) {
              //  debugger;;
	                var deferred = $q.defer();

	                /**
	                 * Launching the new crawl
                   */
	                $semdee.call({
	                    method: 'post',
	                    url: $config.api.uri.crawls,
	                    json: json
	                }, true).then(function(res) {
	                    console.log(res);
	                    // crawl representation of created space
	                    var crawl = {
	                        id: res.data.id,
	                        status: 1,
	                        query: query
	                    };
	                    deferred.resolve(crawl);
	                }, deferred.reject);

	                return deferred.promise;
	            },

				getCrawl: function (crawlid) {
					var deferred = $q.defer();

					$semdee.call({
						method: 'get',
						url: $config.api.uri.crawls+'/'+crawlid,
						json: {}
					}, true).then(function (res) {

						deferred.resolve(res.data);

					}, deferred.reject);

					return deferred.promise;
				},

				getAllCrawls: function (useIdxCrawlId) {
	                var deferred = $q.defer();

	                $semdee.call({
	                    method: 'get',
	                    url: $config.api.uri.crawls,
	                    json: {}
	                }, true).then(function (res) {

						if (useIdxCrawlId) {
							var crawls = {};

							res.data.forEach(function (crawl) {
								crawls[crawl.id] = crawl;
							});

							deferred.resolve(crawls);
						}
						else{
							deferred.resolve(res.data);
						}

	                }, deferred.reject);

	                return deferred.promise;
	            },

				getAllCrawlSchedules:function(){
					var deferred = $q.defer();
					$semdee.call({
						method: 'get',
						url: $config.api.uri.crawls + '/scheduler/',
						json: {}
					}, true).then(function (res) {

						var schedules = {};

						res.data.forEach(function(schedule) {
							schedules[schedule.id] = schedule;
						});

						deferred.resolve(schedules);
					}, deferred.reject);

					return deferred.promise;
				},

              getCrawlResult: function(crawl) {
	                var deferred = $q.defer();

	                $semdee.call({
	                    method: 'get',
	                    //url: $config.api.uri.crawls + '/' + crawl.id + '/documents',
	                    url: $config.api.uri.crawls + '/' + crawl.id + '/documents',
	                    json: {}
	                }, false).then(deferred.resolve, deferred.reject);

	                return deferred.promise;
	            },

              // get crawl results by page
              getCrawlResultByPage: function(crawl, page, size){
                var deferred = $q.defer();

                $semdee.call({
                  method: 'get',
                  url: $config.api.uri.crawls + '/' + crawl.id +
                  '/documents?page=' + page + '&size=' + size,
                  json:{}
                }, false).then(deferred.resolve, deferred.reject);
                return deferred.promise;
              },

              // get the number of documents in a crawl
              getCrawlResultCount: function(crawl){
                var deferred = $q.defer();

                $semdee.call({
                  method: 'get',
                  url: $config.api.uri.crawls + '/' + crawl.id +'/documents/totalcount',
                  json:{}
                }, false).then(deferred.resolve, deferred.reject);
                return deferred.promise;
              },

              // search in the crawl documents
              searchCrawlDocuments: function(crawlId, filterValue, page, size){
                var deferred = $q.defer();
                $semdee.call({
                  method: 'get',
                  url: $config.api.uri.crawls + '/' + crawlId + '/documents?filter=' + filterValue
                  + '&page=' + page + '&size=' + size,
                  json:{}
                }, false).then(deferred.resolve, deferred.reject);
                return deferred.promise;
              },

              // get document count for search in the crawl documents
              searchCrawlDocCount: function(crawlId, filterValue){
                //debugger;
                var deferred = $q.defer();
                $semdee.call({
                  method: 'get',
                  url: $config.api.uri.crawls + '/' + crawlId + '/documents/totalcount?filter=' + filterValue,
                  json:{}
                }, false).then(deferred.resolve, deferred.reject);
                return deferred.promise;
              },

	            updateCrawlInfos: function(crawl) {

					           var deferred = $q.defer();

					cfpLoadingBar.includeSpinner = false;

	                $semdee.call({
	                    method: 'get',
	                    url: $config.api.uri.crawls+'/' + crawl.id,
	                    json: {}
	                }, false).then(
						function(res) {

							cfpLoadingBar.includeSpinner = true;

							deferred.resolve(res.data);
						}
						, deferred.reject);

					return deferred.promise;
	            },

				launchSchedule: function (json) {
					var deferred = $q.defer();

					/**
					 * Launching the new schedule
					 */
					$semdee.call({
						method: 'post',
						url: $config.api.uri.crawls + '/scheduler/',
						json: json
					}, true).then(function(res) {
						console.log(res);
						deferred.resolve(res);

					}, deferred.reject);

					return deferred.promise;
				},

				deleteSchedule: function (schedule) {
					var deferred = $q.defer();

					/**
					 * delete a schedule
					 */
					$semdee.call({
						method: 'delete',
						url: $config.api.uri.crawls + '/scheduler/'+schedule.id
					}, true).then(function(res) {
						console.log(res);
						deferred.resolve(res);
					}, deferred.reject);

					return deferred.promise;
				},

				//to add an empty crawl (without documents) to the list of crawls.
				addCrawl: function (json) {
          //debugger;
					var deferred = $q.defer();

					/**
					 * Launching the new crawl
					 */
					$semdee.call({
						method: 'post',
						url: $config.api.uri.crawls+'/add/',
						json: json
					}, true).then(function(res) {
						console.log(res);
						// crawl representation of created space
						var crawl = {id: res.data};
						deferred.resolve(crawl);

					}, deferred.reject);

					return deferred.promise;
				},
				removeCrawl:function(crawlid){
					var deferred = $q.defer();
					$semdee.call({
						method: 'DELETE',
						url: $config.api.uri.crawls+'/'+crawlid+'/remove',
						json: null
					}, true).then(function(res) {
						console.log(res);
						deferred.resolve(res);
					}, deferred.reject);
					return deferred.promise;
				},

        /**
         * import csv file content
         */
				importFileContent: function (crawlid, fileContent) {
          //debugger;
          var contentSize = fileContent.length;
          var deferred = $q.defer();

					return $semdee.postFile(
						{
							method: "post",
							url: $config.api.uri.crawls + '/upload/'+crawlid+'/',
							data: fileContent
						}, true)
					.then(
						function(res) {
							deferred.resolve(res);
							return deferred.promise;
						},
						deferred.reject
					);

					return deferred.promise;
				},

// upload files with settings by wissem

importFileContentWithSettings: function (crawlid, fileContent,settings) {
  //debugger;
  var contentSize = fileContent.length;
  var deferred = $q.defer();

  return $semdee.postFile(
    {
      method: "post",
      url: $config.api.uri.crawls + '/upload/'+crawlid+'/',
      data: {fileContent,settings}
    }, true)
  .then(
    function(res) {
      deferred.resolve(res);
      return deferred.promise;
    },
    deferred.reject
  );

  return deferred.promise;
},



        /**
         * add pdf/doc/etc files to a crawl.
         */
				addFileToCrawl: function (crawlid, fileContent) {
        //  debugger;
          var contentSize = fileContent.length;
					var deferred = $q.defer();

					return $semdee.postBinaryFile(
						{
							method: "post",
							url: $config.api.uri.crawls + '/'+crawlid+'/file',
							data: fileContent,
              type: "application/octet-stream" //binary stream
						}, true)
						.then(
						function(res) {
							deferred.resolve(res);
							return deferred.promise;
						},
						deferred.reject
					);

					return deferred.promise;
				},

        /**
         * add pdf/doc/etc files to a crawl with FileName and Language.
         */
				addFileToCrawlWithFileName: function (crawlid, fileContent, fname, language) {
        //  debugger;
          var contentSize = fileContent.length;
					var deferred = $q.defer();
          return $semdee.postBinaryFile(
						{
							method: "post",
							url: $config.api.uri.crawls + '/'+crawlid+'/binaryfile?fname='
              +fname+"&language="+language,
							data: fileContent,
              type: "application/octet-stream" //binary stream

						}, true)
						.then(
						function(res) {
							deferred.resolve(res);
							return deferred.promise;
						},
						deferred.reject
					);

					return deferred.promise;
				},

        /**
         * add pdf/doc/etc files to a crawl with FileName and Language.
         */
				addEmailFileToCrawl: function (crawlid, fileContent, language) {
        //  debugger;
          var contentSize = fileContent.length;
					var deferred = $q.defer();
          return $semdee.postBinaryFile(
						{
							method: "post",
							url: $config.api.uri.crawls + '/'+crawlid+'/email?language='+language,
							data: fileContent,
              type: "application/octet-stream" //binary stream

						}, true)
						.then(
						function(res) {
							deferred.resolve(res);
							return deferred.promise;
						},
						deferred.reject
					);

					return deferred.promise;
				},

				addDocumentsToCrawl: function (crawlid, json) {
					var deferred = $q.defer();

					/**
					 * add documents to Crawl
					 */
					$semdee.call({
						method: 'post',
						url: $config.api.uri.crawls +'/'+crawlid +'/documents/',
						json: json
					}, true).then(function(res) {
						console.log(res);
						deferred.resolve(res);

					}, deferred.reject);

					return deferred.promise;
				},

        addCategoryAsCrawl: function (categorizerId, categoryId) {
					var deferred = $q.defer();

          /**
					 * add a category as a new crawl
					 */
					$semdee.call({
						method: 'post',
						url: $config.api.uri.crawls +'/category?categorizerId='+categorizerId
            +'&categoryId=' + categoryId,
						json: {}
					}, true).then(function(res) {
						console.log(res);
						deferred.resolve(res);

					}, deferred.reject);

					return deferred.promise;
				},

        addClusterAsCrawl: function (clusteringId, clusterId) {
					var deferred = $q.defer();

          /**
					 * add a clusteras a new crawl
					 */
					$semdee.call({
						method: 'post',
						url: $config.api.uri.crawls +'/cluster?clusteringId='+clusteringId
            +'&clusterId=' + clusterId,
						json: {}
					}, true).then(function(res) {
						console.log(res);
						deferred.resolve(res);

					}, deferred.reject);

					return deferred.promise;
				},

				renameCrawl: function(crawlId,crawlName){
					var deferred = $q.defer();
					$semdee.call({
						method: 'PUT',
						url: $config.api.uri.crawls+'/'+crawlId+'/rename',
						json: angular.toJson(crawlName)
					}, true).then(function(res) {
						console.log(res);
						deferred.resolve(res);
					}, deferred.reject);

					return deferred.promise;
				}

				/*importCsv: function (crawlid, file) {
					var deferred = $q.defer();

					var fd = new FormData();
					fd.append('file', file);
					return $semdee.postFile({
						method: "post",
						url: $config.api.uri.crawls + '/upload/'+crawlid+'/',
						data: fd,
						type:'text/html; charset=UTF-8',
						json: {}
					}, true).then(
						function(res) {
							deferred.resolve(res);
							return deferred.promise;
						},
						deferred.reject
					);

					return deferred.promise;
				}*/

	        };
    }]);
