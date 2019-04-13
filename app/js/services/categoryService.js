/**
 * categoryService.js
 *
 * @description ::
 *
 */

'use strict';

angular.module('semdeePortal.services')

    .factory('$category', ['$q', '$semdee','$config', function($q, $semdee,$config) {
        return {
            /**
             * recupere le detail d'une categorie
             * @param listCategories
             * @returns {promise|qFactory.Deferred.promise}
             */
             getCategoriesDetail: function (listCategories) {//OK
                var deferred = $q.defer();
                var tabPromise=[];
                for(var i=0;i<listCategories.length;i++){
                    var req=$semdee.call({
                        method: 'get',
                        url:  $config.api.uri.categories+'/' +listCategories[i],
                        json: {}
                    }, true);
                    tabPromise.push(req);
                }
                $q.all(tabPromise).then(function(tabRes){
                    var resultat={};
                    for(var i=0;i<tabRes.length;i++) {
                        resultat[tabRes[i].data.id]=tabRes[i].data;
                    }
                    deferred.resolve(resultat);
                },deferred.reject);
                return deferred.promise;
            },

            addCategory: function (categoryName,groupId) {//OK
                var deferred = $q.defer();
                $semdee.call({
                    method: 'post',
                    url: $config.api.uri.categories,
                    json: {label: categoryName,categoryGroupId:groupId}
                }, true).then(function (res) {
                    deferred.resolve(res.data);
                }, deferred.reject);
                return deferred.promise;
            },
            
            /**
             * delete a category
             * @param categorizerId
             * @returns {promise|qFactory.Deferred.promise}
             */
            deleteCategory:function(categorizerId){//OK
                var deferred = $q.defer();
                $semdee.call({
                    method: 'delete',
                    url: $config.api.uri.categories+"/"+categorizerId,
                    json: {}
                }, true).then(function (res) {
                    deferred.resolve(res.data);
                }, deferred.reject);
                return deferred.promise;
            },

            /**
             * get category documents
             * @param categorizerId
             * @returns 
             */
            getCategoryDocuments:function(categoryId){
                var deferred = $q.defer();
                $semdee.call({
                    method: 'get',
                    url: $config.api.uri.categories+"/"+categoryId+"/documents",
                    json: {}
                }, true).then(function (res) {
                    deferred.resolve(res.data);
                }, deferred.reject);
                return deferred.promise;
           },

           getDocumentCategories:function(docId){
                var deferred = $q.defer();
                $semdee.call({
                    method: 'get',
                    url: $config.api.uri.categories+"/document/"+docId,
                    json: {}
                }, true).then(function (res) {
                    deferred.resolve(res.data);
                }, deferred.reject);
                return deferred.promise;
            }

        }
    }]);