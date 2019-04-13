/**
 * semanticSpaceService.js
 *
 * @description ::
 *
 */

'use strict';

angular.module('semdeePortal.services')

    .factory('$semanticSpace', ['$q', '$semdee', function ($q, $semdee) {
        return {

          downloadCsvFile: function (spaceId) {
            var deferred = $q.defer();

            $semdee.call({
                method: 'get',
                url: 'spaces/' + spaceId + '/asynccsvstream',
                json: {responseType:'arraybuffer'}

            }, false).then(deferred.resolve, deferred.reject);

            return deferred.promise;

            },

            createSpace: function (json) {
                var deferred = $q.defer();
                console.log('Create space with '+json);
                $semdee.call({
                    method: 'post',
                    url: 'spaces',
                    json: json
                }, true).then(deferred.resolve, deferred.reject);

                return deferred.promise;
            },

            createSpace1: function (json) {
                debugger;
                var deferred = $q.defer();
                console.log('Create space with '+json);
                $semdee.call({
                    method: 'post',
                    url: 'spaces/create',
                    json: json
                }, true).then(deferred.resolve, deferred.reject);

                return deferred.promise;
            },

            getAllSpaces: function (crawls) {
                var deferred = $q.defer();

                $semdee.call({
                    method: 'get',
                    url: 'spaces',
                    json: {}
                }, true).then(function (res) {
                    deferred.resolve(res.data);
                }, deferred.reject);

                return deferred.promise;
            },

            searchSpace : function(spaceId,query){
                var deferred = $q.defer();

                $semdee.call({
                    method:'get',
                    url:'spaces/search/'+spaceId+'?u=0&q='+query,
                    json:{}
                },true).then(function (resultDocs){
                    deferred.resolve(resultDocs);
                },deferred.reject);

                return deferred.promise;
            },

            loadSpace  :function(spaceId){
                var deferred = $q.defer();

                console.log("Loading space "+spaceId);
                $semdee.call({
                    method:'get',
                    url:'spaces/load/'+spaceId,
                    json:{}
                },true).then(function (res){
                    deferred.resolve(res);
                },deferred.reject);

                return deferred.promise;
            },

            getSpace :function(spaceId){
              var deferred = $q.defer();

              console.log("getting space "+spaceId);
              $semdee.call({
                  method:'get',
                  url:'spaces/'+spaceId,
                  json:{}
              },true).then(function (res){
                  deferred.resolve(res);
              },deferred.reject);

              return deferred.promise;
            },

            unloadSpace : function(spaceId){
                var deferred = $q.defer();
                console.log("Unloading space "+spaceId);
                $semdee.call({
                    method:'get',
                    url:'spaces/unload/'+spaceId,
                    json:{}
                },true).then(function (res){
                    deferred.resolve(res);
                },deferred.reject);

                return deferred.promise;
            },

            /**
             * recupere les documents de l'espace semantique
             * @returns {promise|qFactory.Deferred.promise}
             */
            getDocuments: function (spaceId) {//OK
                debugger;
                var deferred = $q.defer();
                $semdee.call({
                    method: 'get',
                    url: 'spaces/' + spaceId+ '/documents',
                    json: {}
                }, false).then(deferred.resolve, deferred.reject);
                return deferred.promise;
            },

            /**
             * recupere les documents de l'espace semantique
             * @returns {promise|qFactory.Deferred.promise}
             */
            getSpaceDocuments2: function (space) {//OK
                debugger;
                var deferred = $q.defer();
                $semdee.call({
                    method: 'get',
                    url: 'spaces/' + space.id+ '/documents',
                    json: {}
                }, false).then(deferred.resolve, deferred.reject);
                return deferred.promise;
            },

            /**
             * recupere les documents de l'espace semantique par page
             * @returns {promise|qFactory.Deferred.promise}
             */
            getDocumentsByPage: function (spaceId, page, size) {//OK
                var deferred = $q.defer();
                $semdee.call({
                    method: 'get',
                    url: 'spaces/' + spaceId+ '/documents?page=' + page +'&size=' + size,
                    json: {}
                }, false).then(deferred.resolve, deferred.reject);
                return deferred.promise;
            },

            /**
             * get document count of a space.
             */
            getDocumentCount: function(spaceId){
              var deferred = $q.defer();
              debugger;
              $semdee.call({
                method: 'get',
                url: 'spaces/' + spaceId +'/documents/totalcount',
                json:{}
              }, false).then(deferred.resolve, deferred.reject);
              return deferred.promise;
            },

            // search in the space documents
            searchSpaceDocuments: function(spaceId, filterValue, page, size){
              var deferred = $q.defer();
              $semdee.call({
                method: 'get',
                url: 'spaces/' + spaceId + '/documents?filter=' + filterValue
                + '&page=' + page + '&size=' + size,
                json:{}
              }, false).then(deferred.resolve, deferred.reject);
              return deferred.promise;
            },

            // get document count for search in the space documents
            searchSpaceDocCount: function(spaceId, filterValue, page, size){
              debugger;
              var deferred = $q.defer();
              $semdee.call({
                method: 'get',
                url: 'spaces/' + spaceId + '/documents/totalcount?filter=' + filterValue
                + '&page=' + page + '&size=' + size,
                json:{}
              }, false).then(deferred.resolve, deferred.reject);
              return deferred.promise;
            },

            getNbDocuments: function (spaceId) {//OK
                var deferred = $q.defer();
                $semdee.call({
                    method: 'get',
                    url: 'spaces/' + spaceId+ '/documents',
                    json: {}
                }, true).then(function (res) {
                    deferred.resolve(res.data.length);
                }, deferred.reject);
                return deferred.promise;
            },

            deleteSpace: function(spaceId) {
                var deferred = $q.defer();
                return $semdee.call({
                    method: "delete",
                    url: 'spaces/'+spaceId,
                    json: {}
                }, !0).then(function(res) {
                	//alert("deleteSpace service result: " + JSON.stringify(res));
                	deferred.resolve(res.data);

                }, deferred.reject), deferred.promise
            },
            /* hau testing
             return
             "NetworkError: 404 Not Found -
             http://62.210.86.38:8080/semdee-api/spaces/related/224?docId=80875&u=1"
             */
            relatedContent: function(spaceId, docId) {
                var deferred = $q.defer();
                return $semdee.call({
                    method: "get",
                    url: 'spaces/related/'+spaceId+'?docId='+docId+'&u=0',
                    json: {}
                }, true).then(function(res) {
                    deferred.resolve(res);
                }, deferred.reject), deferred.promise
            }
        }
    }]);
