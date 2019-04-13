/**
 * stopWordsService.js
 *
 * @description ::
 *
 */

'use strict';

angular.module('semdeePortal.services')

    .factory('$rgpdService',	['$q', '$semdee', '$config', function($q, $semdee, $config) {

	        return {

        /**
         * add several rgpd patterns to a rgpd list.
         */
        addRgpdPatterns: function (listid, sword) {
					var deferred = $q.defer();

					$semdee.call({
						method: 'post',
						url: $config.api.uri.stopWord+'/add',
						json: {"spelings":sw, "list":listid}
					}, true).then(function (res) {

						deferred.resolve(res.data);

					}, deferred.reject);

					return deferred.promise;
				},


        removeRgpdPattern: function (listid, sword) {
          var deferred = $q.defer();

          $semdee.call({
            method: 'delete',
            url: $config.api.uri.stopWord + '/' + listid + '/remove',
            json: {"spelling":sw, "list":listid}
          }, true).then(function (res) {

            deferred.resolve(res.data);

          }, deferred.reject);

          return deferred.promise;
        },

				getRgpdPatternsFromList: function (listId) {
	                var deferred = $q.defer();

	                $semdee.call({
	                    method: 'get',
	                    url: $config.api.uri.stopWord +'/list/' + listId,
	                    json: {}
	                }, true).then(function (res) {

							deferred.resolve(res.data);


	                }, deferred.reject);

	                return deferred.promise;
	            },

          getPatternsFromList: function (listId) {
      	                var deferred = $q.defer();

      	                $semdee.call({
      	                    method: 'get',
      	                    url: $config.api.uri.stopWord +'/list/' + listId +'/spelling',
      	                    json: {}
      	                }, true).then(function (res) {

      							deferred.resolve(res.data);


      	                }, deferred.reject);

      	                return deferred.promise;
      	            },



      /**
       * Get all the stop word lists.
       */
      getRgpdLists: function () {
        debugger;
      	                var deferred = $q.defer();

      	                $semdee.call({
      	                    method: 'get',
      	                    url: $config.api.uri.stopword +'/list',
      	                    json: {}
      	                }, true).then(function (res) {

      							deferred.resolve(res.data);


      	                }, deferred.reject);

    	                return deferred.promise;
      },

      /**
       * Get all the stop word lists with spellings.
       */
      getRgpdListsWithPatterns: function () {
        debugger;
      	                var deferred = $q.defer();

      	                $semdee.call({
      	                    method: 'get',
      	                    url: $config.api.uri.stopword +'/list/spelling',
      	                    json: {}
      	                }, true).then(function (res) {

      							deferred.resolve(res.data);


      	                }, deferred.reject);

    	                return deferred.promise;
      }


  };
}]);
