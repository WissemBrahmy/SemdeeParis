'use strict';

angular.module('semdeePortal.services')

    .factory('$profiling', ['$q', '$semdee',
        function ($q, $semdee) {
            return {
                launchProfiling: function (json) {
                    var deferred = $q.defer();
                    // Appel à l'API pour lancer le profiling
                    $semdee.call({
                        method: 'post',
                        url: 'profiling',
                        json: json
                    }, true).then(function(res) {
                        // we save profiling id for later use
                        var profiling = {
                            id: res.data.id,
                            status: res.data.status,
                            label: res.data.label,
                            spaceId: res.data.spaceId
                        };

                        deferred.resolve(profiling);
                    }, deferred.reject);

                    return deferred.promise;
                },

                getAllProfilings: function () {
                    var deferred = $q.defer();

                    $semdee.call({
                        method: 'get',
                        url: 'profiling',
                        json: {}
                    }, true).then(function (res) {
                        var profilings = [];

                        res.data.forEach(function(profiling) {
                            profilings.push({
                                id: profiling.id,
                                status: profiling.status,
                                label: profiling.label,
                                spaceId: profiling.spaceId
                            });
                        });

                        deferred.resolve(profilings);
                    }, deferred.reject);

                    return deferred.promise;
                },

                getPersonFromProfiling: function(profilingId) {
                    var deferred = $q.defer();

                    $semdee.call({
                        method: 'get',
                        url: 'profiling/' + profilingId + '/entities',
                        json: {}
                    }, false).then(function(res){deferred.resolve(res.data);}, deferred.reject);

                    return deferred.promise;
                },

                getDocsFromPerson: function(personId) {
                    var deferred = $q.defer();

                    $semdee.call({
                        method: 'get',
                        url: 'profiling/' + personId + '/documents',
                        json: {}
                    }, false).then(function(res){deferred.resolve(res.data);}, deferred.reject);

                    return deferred.promise;
                },

                updateMonitoringInfo: function(profiling) {
                    $semdee.call({
                        method: 'get',
                        url: 'profiling/' + profiling.id
                    }, true).then(function(res) {
                        profiling.status = res.data.status;
                    });
                }
            };

        }]
);