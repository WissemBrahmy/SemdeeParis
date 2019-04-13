'use strict';

angular.module('semdeePortal.services')
    .factory('$params',['$q', '$semdee','$config',function ($q, $semdee,$config) {
            return {
                getAllParams: function () {
                  //debugger;
                    var deferred = $q.defer();

                    // Appel à l'API pour lancer le profiling
                    $semdee.call({
                        method: 'get',
                        url: $config.api.uri.params+'/'

                    }, true).then(function(res) {
                        deferred.resolve(res.data);
                    }, deferred.reject);

                    return deferred.promise;
                },

                updateParams: function (json) {
                    //debugger;
                    var deferred = $q.defer();

                    $semdee.call({
                        method: 'put',
                        url: $config.api.uri.params+'/',
                        json: json
                    }, true).then(function (res) {
                        deferred.resolve(res.data);
                    }, deferred.reject);

                    return deferred.promise;
                }
            };
        }]
);
