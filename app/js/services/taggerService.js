"use strict";

angular.module("semdeePortal.services")

    .factory('$tagger', ['$q', '$semdee', '$config', function($q, $semdee, $config) {
        return {
            launchTagger: function (spaceId) {
                var deferred = $q.defer();

                // Appel à l'API pour lancer le tagger
                $semdee.call({
                    method: 'get',
                    url: $config.api.uri.tagger + '/' + spaceId,
                    json: {}
                }, true).then(function(res) {
                    deferred.resolve(res.data);
                }, deferred.reject);

                return deferred.promise;
            },
            // hau add for testing
            launchTaggerWithInternalDocument: function (spaceId, documentId) {
                var deferred = $q.defer();

                // Appel à l'API pour lancer le tagger
                $semdee.call({
                    method: 'get',
                    url: $config.api.uri.tagger + '/' + spaceId +'/doc/'+documentId,
                    json: {}
                }, true).then(function(res) {
                    deferred.resolve(res.data);
                }, deferred.reject);

                return deferred.promise;
            },
            //Appel à l'API pour lancer le tagger from url or a text
            launchTaggerWithExternalDocument: function (spaceId, url) {
                var deferred = $q.defer();

                $semdee.call({
                    method: 'get',
                    url: $config.api.uri.tagger + '/' + spaceId +'/doc?q='+url,
                    json: {}
                }, true).then(function(res) {
                    deferred.resolve(res.data);
                }, deferred.reject);

                return deferred.promise;
            },

            launchTaggerWithFile : function (spaceId, fileContent) {

                var deferred = $q.defer();

                return $semdee.postFile(
                    {
                        method: "get",
                        url: $config.api.uri.tagger + '/'+spaceId+'/file',
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
            launchTaggerWithCategoryGroup: function(spaceId, categoryGroupId){
                var deferred = $q.defer();

                $semdee.call({
                    method: 'get',
                    url: $config.api.uri.tagger + '/' + spaceId +'/groups/'+categoryGroupId,
                    json: {}
                }, true).then(function(res) {
                    deferred.resolve(res.data);
                }, deferred.reject);

                return deferred.promise;
            },
            launchTaggerWithCategorizer:function(spaceId,categorizerId){
                var deferred = $q.defer();
                $semdee.call({
                    method: 'get',
                    url: $config.api.uri.tagger + '/' + spaceId +'/categorizer/'+categorizerId,
                    json: {}
                }, true).then(function(res){
                    // sort tags by score
                    var keys = Object.keys(res.data);
                    for (var i=0; i< keys.length; i++){
                        var compare = function(a,b){
                            if (a.score*1 < b.score*1) return 1;
                            if (a.score*1 > b.score*1) return -1;
                            return 0;
                        }
                        res.data[keys[i]].sort(compare);
                    }
                    deferred.resolve(res.data);

                },deferred.reject);

                return deferred.promise;

            }
        }
    }]);