/**
 * semdeeService.js
 *
 * @description :: Encapsulates all calls made to the Semdee API
 *
 */

'use strict';

angular.module('semdeePortal.services')

    .factory('$semdee', ['$q', '$config', '$http', function($q, $config, $http) {
        return {
            /**
             * Method used to make a request to Semdee API.
             * @param   {Object}    request      Object containing the information needed to make a call:
             * 'method': 'POST|GET'
             * json: json object to send to the API
             * url: 'connection' // contains the URL, without the 'http://www.adress.com/api/'. This part must be defined in '$config.api;url'.
             * Required parameter.
             * @param {Boolean}     loadingBar  should be equal to 'true' if a loading should be shown during request
             * @returns {Object}    Return a promise
             */
            call: function (request, loadingBar) {
                var deferred = $q.defer();

                //reject when token is not set
                if (!$config.api.token) {
                    deferred.reject;
                    return deferred.promise;
                }

                // Object passed to angular $http method. It allow us to configure the query.
                var requestObject = {
                    method: request.method,
                    data: request.json,
                    url: $config.api.url + request.url,
                    cache: false,
                    headers: {
                        'X-Auth-Token':$config.api.token
                    }
                };

                // Everything is OK. Let's send the angular query.
                $http(
                        requestObject,
                        { ignoreLoadingBar: loadingBar }
                    ).success(
                        function (data, status, headers, config) {
                            deferred.resolve(data);
                        }
                    ).error(
                        function (data, status) {
                            deferred.reject(status);
                        }
                    );

                return deferred.promise;
            },

            /*
             * call external URL
             */
            callUrl: function (request, loadingBar) {
                var deferred = $q.defer();
                // Object passed to angular $http method. It allow us to configure the query.
                var requestObject = {
                    method: request.method,
                    data: request.json,
                    url: request.url,
                    cache: false,
                    headers: request.headers
                };

                // Everything is OK. Let's send the angular query.
                $http(requestObject, { ignoreLoadingBar: loadingBar }).success(function (data, status, headers, config) {
                    deferred.resolve(data);
                }).error(function (data, status) {
                    deferred.reject(status);
                });

                return deferred.promise;
            },


            /**
             * To post text files such as csv, json, etc.
             */
            postFile: function(request, loadingBar){
            //  debugger;
	        	var deferred = $q.defer(),
	        	requestObject = {
                    method: request.method,
                    data: request.data,
                    url: $config.api.url + request.url,
                    cache: false,
                    headers: {
                    	"Content-Type": request.type,
                        'X-Auth-Token':$config.api.token
                    }
                };

                // Everything is OK. Let's send the angular query.
                $http(
                    requestObject,
                    { ignoreLoadingBar: loadingBar }
                ).success(
                    function (data, status, headers, config) {
                        deferred.resolve(data);
                    }
                ).error(
                    function (data, status) {
                        deferred.reject(status);
                    }
                );

                return deferred.promise;
	        },

          /**
           * To post pdf, doc files.
           */
          postBinaryFile: function(request, loadingBar){

          var deferred = $q.defer(),
          requestObject = {
                  method: request.method,
                  data: request.data,
                  transformRequest: [],
                  url: $config.api.url + request.url,
                  cache: false,
                  headers: {
                    "Content-Type": request.type,
                      'X-Auth-Token':$config.api.token
                  }
              };

              // Everything is OK. Let's send the angular query.
              $http(
                  requestObject,
                  { ignoreLoadingBar: loadingBar }
              ).success(
                  function (data, status, headers, config) {
                      deferred.resolve(data);
                  }
              ).error(
                  function (data, status) {
                      deferred.reject(status);
                  }
              );

              return deferred.promise;
        }

        };
    }]);
