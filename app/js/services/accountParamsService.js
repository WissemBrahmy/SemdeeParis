'use strict';

angular.module('semdeePortal.services')
    .factory('$accountParams',['$q', '$semdee','$config',function ($q, $semdee,$config) {
            return {

                /**
                 *  Get twitter parameters via web service semdee
                 */
                getTwitterParams: function () {
                    var deferred = $q.defer();
                    var sourceId = 4;
                    $semdee.call({
                        method: 'get',
                        url: $config.api.uri.params+'/usersource/' + sourceId

                    }, true).then(function(res) {
                        deferred.resolve(res.data);
                    }, deferred.reject);

                    return deferred.promise;
                },

                /**
                 * Update tiwtter parameters by semdee web service
                 */
                updateTwitterParams: function (json) {
                    debugger;
                    var deferred = $q.defer();

                    $semdee.call({
                        method: 'put',
                        url: $config.api.uri.params+'/usersource',
                        json: json
                    }, true).then(function (res) {
                        deferred.resolve(res.data);
                    }, deferred.reject);

                    return deferred.promise;
                },

                /**
                 *  Get facebook parameters via web service semdee
                 */
                getFacebookParams: function () {
                    var deferred = $q.defer();
                    var sourceId = 5;
                    $semdee.call({
                        method: 'get',
                        url: $config.api.uri.params+'/usersource/' + sourceId

                    }, true).then(function(res) {
                        deferred.resolve(res.data);
                    }, deferred.reject);

                    return deferred.promise;
                },

                /**
                 * Update facebook parameters by semdee web service
                 */
                updateFacebookParams: function (json) {
                    debugger;
                    var deferred = $q.defer();

                    $semdee.call({
                        method: 'put',
                        url: $config.api.uri.params+'/usersource',
                        json: json
                    }, true).then(function (res) {
                        deferred.resolve(res.data);
                    }, deferred.reject);

                    return deferred.promise;
                },

                /**
                 *  Get google parameters via web service semdee
                 */
                getGoogleParams: function () {
                    var deferred = $q.defer();
                    var sourceId = 1;
                    $semdee.call({
                        method: 'get',
                        url: $config.api.uri.params+'/usersource/' + sourceId

                    }, true).then(function(res) {
                        deferred.resolve(res.data);
                    }, deferred.reject);

                    return deferred.promise;
                },

                /**
                 * Update google parameters by semdee web service
                 */
                updateGoogleParams: function (json) {
                    debugger;
                    var deferred = $q.defer();

                    $semdee.call({
                        method: 'put',
                        url: $config.api.uri.params+'/usersource',
                        json: json
                    }, true).then(function (res) {
                        deferred.resolve(res.data);
                    }, deferred.reject);

                    return deferred.promise;
                },

                /**
                 *  Get bing parameters via web service semdee
                 */
                getBingParams: function () {
                    var deferred = $q.defer();
                    var sourceId = 2;
                    $semdee.call({
                        method: 'get',
                        url: $config.api.uri.params+'/usersource/' + sourceId

                    }, true).then(function(res) {
                        deferred.resolve(res.data);
                    }, deferred.reject);

                    return deferred.promise;
                },

                /**
                 * Update bing parameters by semdee web service
                 */
                updateBingParams: function (json) {
                    debugger;
                    var deferred = $q.defer();

                    $semdee.call({
                        method: 'put',
                        url: $config.api.uri.params+'/usersource',
                        json: json
                    }, true).then(function (res) {
                        deferred.resolve(res.data);
                    }, deferred.reject);

                    return deferred.promise;
                }

            };
        }]
);
