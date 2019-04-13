/**
 * categoryGroupService.js
 *
 * @description ::
 *
 */

'use strict';

angular.module('semdeePortal.services')

    .factory('$categoryGroup', ['$q', '$semdee','$config', function($q, $semdee,$config) {
        return {
            /**
             * recupere les categories deja presentes sur le serveur
             * @returns {promise|qFactory.Deferred.promise}
             */
            getCategories: function (idGroup) {//OK
                var deferred = $q.defer();
                $semdee.call({
                    method: 'get',
                    url: $config.api.uri.groups+'/' + idGroup+"/categories",
                    json: {}
                }, true).then(function (res) {
                    deferred.resolve(res.data);
                }, deferred.reject);
                return deferred.promise;
            },

            addGroup: function (groupName,spaceId) {//OK
                var deferred = $q.defer();
                $semdee.call({
                    method: 'post',
                    url: $config.api.uri.groups,
                    json: {label: groupName,spaceId:spaceId}
                }, true).then(function (res) {
                    deferred.resolve(res.data);
                }, deferred.reject);
                return deferred.promise;
            },
            /**
             * recuperation des groupes de categories d'un espace semantique
             * @param idSpace
             * @returns {promise|qFactory.Deferred.promise}
             */
            getCategoryGroupsOfSpace: function (idSpace) {
                var deferred = $q.defer();
                $semdee.call({
                    method: 'get',
                    url: $config.api.uri.groups+'/spaces/'+idSpace,
                    json: {}
                }, true).then(function (res) {
                    deferred.resolve(res.data);
                }, deferred.reject);
                return deferred.promise;
            }
        }
    }]);