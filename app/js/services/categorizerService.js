"use strict";

/**
 * retourne un dictionnaire de id de category => liste de id docs
 */
function trieDocByCategory(docs) {
    var catDocs = {};
    for (var indexDoc = 0; indexDoc < docs.length; indexDoc++) {
        var doc = docs[indexDoc];
        if (doc.categories.length == 0) {
            continue;
        }
        for (var indexCat = 0; indexCat < doc.categories.length; indexCat++) {
            var cat = doc.categories[indexCat];
            if (Object.keys(catDocs).indexOf('' + cat.id) == -1) {
                catDocs[cat.id] = [];
            }
            catDocs[cat.id].push(doc.id);
        }
    }
    return catDocs;
}
angular.module("semdeePortal.services")
    .factory("categorizerService",["$http","$q","$semdee","$config",function ($http, $q, $semdee, $config) {
        return {

          downloadCategoryCsvFile: function(categorizerId, categoryId){
            var deferred = $q.defer();

            $semdee.call({
                method: 'get',
                url: $config.api.uri.categorizer+"/"+categorizerId+
                "/asynccsvstream?cat=" + categoryId,
                json: {responseType:'arraybuffer'}

            }, false).then(deferred.resolve, deferred.reject);

            return deferred.promise;

          },

          downloadCsvFile: function (categorizerId) {
            var deferred = $q.defer();

            $semdee.call({
                method: 'get',
                url: $config.api.uri.categorizer+"/"+categorizerId+"/asynccsvstream",
                json: {responseType:'arraybuffer'}

            }, false).then(deferred.resolve, deferred.reject);

            return deferred.promise;

            },

            runCategorizer: function (documents,groupId,label,spaceId) {//OK
                var deferred = $q.defer();
                var req = $semdee.call({
                    method: 'post',
                    url: $config.api.uri.categorizer,
                    json: {
                        spaceId: spaceId,
                        method:$config.categorizer.defaultMethod,
                        groupId:groupId,
                        label:label
                    }
                }, true).then(function (res) {
                    deferred.resolve(res.data);
                }, deferred.reject);
                return deferred.promise;
            },

            getAllCategorizers: function (spaceId) {//OK
                var deferred = $q.defer();

                $semdee.call({
                    method: 'get',
                    url: $config.api.uri.categorizer+"/space/" + spaceId,
                    json: {}
                }, true).then(function (res) {
                    var categorizers = res.data;
                    deferred.resolve(categorizers);
                }, deferred.reject);

                return deferred.promise;
            },


            /**
             * recupere les resultats d'un categorizer
             * @param categorizerId
             * @returns {promise|qFactory.Deferred.promise}
             */
            getCategoriesDocumentsCategorizer:function(categorizerId){//OK
                debugger;
                var deferred = $q.defer();
                $semdee.call({
                    method: 'get',
                    url: $config.api.uri.categorizer+"/"+categorizerId+"/documents",
                    json: {}
                }, true).then(function (res) {
                    deferred.resolve(res.data);
                }, deferred.reject);
                return deferred.promise;
            },


            /**
             * recupere les resultats d'un categorizer avec pagination
             * @param categorizerId
             * @param page
             * @param size
             * @returns {promise|qFactory.Deferred.promise}
             */
            getCategoriesDocumentsCategorizerByPage:function(categorizerId, page, size){//OK
                var deferred = $q.defer();
                $semdee.call({
                    method: 'get',
                    url: $config.api.uri.categorizer+"/"+categorizerId+
                    "/documents?page=" + page + "&size=" + size,
                    json: {}
                }, true).then(function (res) {
                    deferred.resolve(res.data);
                }, deferred.reject);
                return deferred.promise;
            },


            /**
             * get document count of a category in categorizer
             */
            getCategoryDocCountOfCategorizer: function(categorizerId, categoryId){
              var deferred = $q.defer();
              //debugger;
              $semdee.call({
                method: 'get',
                url: $config.api.uri.categorizer+"/"+categorizerId+
                "/documents/totalcount?cat=" + categoryId,
                json:{}
              }, false).then(deferred.resolve, deferred.reject);
              return deferred.promise;
            },


            /**
             * recupere les resultats d'un category d'un categorizer
             * @param categorizerId
             * @returns {promise|qFactory.Deferred.promise}
             */
            getCategoryDocumentsCategorizer:function(categorizerId, categoryId){//OK
                var deferred = $q.defer();
                $semdee.call({
                    method: 'get',
                    url: $config.api.uri.categorizer+"/"+categorizerId+
                    "/documents?cat=" + categoryId,
                    json: {}
                }, false).then(deferred.resolve, deferred.reject);
                return deferred.promise;
            },


            /**
             * recupere les resultats d'un category d'un categorizer avec pagination
             * @param categorizerId
             * @param page
             * @param size
             * @returns {promise|qFactory.Deferred.promise}
             */
            getCategoryDocumentsCategorizerByPage:function(categorizerId, categoryId, page, size){//OK
                var deferred = $q.defer();
                $semdee.call({
                    method: 'get',
                    url: $config.api.uri.categorizer+"/" + categorizerId +
                    "/documents?cat=" + categoryId + "&page=" + page + "&size=" + size,
                    json: {}
                }, false).then(deferred.resolve, deferred.reject);
                return deferred.promise;
            },


            /**
             * modifie les categories d'un document
             * @param document
             * @returns {promise|qFactory.Deferred.promise}
             * this code is copied from documentService (function updateDocs(documents))
             */
            addDocumentToCategories: function (documents) {
                console.log("addDocumentToCategories");

                var deferred = $q.defer();
                var finalDocs = [];

                documents.forEach(function (doc) {
                    var finalDoc = {
                        "id": doc.id,
                        idCategories:[]
                    };
                    doc.idCategories.forEach(function (catId) {
                        finalDoc.idCategories.push(catId);
                    })
                    finalDocs.push(finalDoc);
                });

                $semdee.call({
                    method: 'put',
                    url: $config.api.uri.documents + '/',
                    json: finalDocs
                }, true).then(function (res) {
                    deferred.resolve(res.data);
                }, deferred.reject);
                return deferred.promise;
            },

            /**
             * This	method is used to categorize an	incoming document.
             * @param spaceId and groupId
             * @returns {promise|qFactory.Deferred.promise}
             */
            categorizeDocument:function(spaceId, groupId, theTextToCategorize){
                var deferred = $q.defer();
                $semdee.call({
                    method: 'get',
                    url: $config.api.uri.categorizer+"/categorizeDocument/"+spaceId+"?groupId="+groupId,
                    json:theTextToCategorize
                }, true).then(function (res) {
                    deferred.resolve(res.data);
                }, deferred.reject);
                return deferred.promise;
            },
            removeCategorizer:function(catId){
                var deferred = $q.defer();
                $semdee.call({
                    method: 'delete',
                    url: $config.api.uri.categorizer+"/"+catId+"/remove",
                    json:null,
                }, true).then(function (res) {
                    deferred.resolve(res.data);
                }, deferred.reject);
                return deferred.promise;
            },

            getCategoriesOfCategorizer: function(catzId){
                var deferred = $q.defer();
                $semdee.call({
                    method: 'get',
                    url: $config.api.uri.categorizer+"/"+catzId+"/categories",
                    json:null,
                }, true).then(function (res) {
                    deferred.resolve(res.data);
                }, deferred.reject);
                return deferred.promise;
            },

            /**
             * search categorizer documents
             */
            searchCategorizerDocuments: function(catzId, filter, page, size){
              var deferred = $q.defer();
              $semdee.call({
                  method: 'get',
                  url: $config.api.uri.categorizer+"/" + catzId +
                  "/searchdocuments?filter=" + filter + "&page=" + page + "&size=" + size,
                  json: {}
              }, false).then(deferred.resolve, deferred.reject);
              return deferred.promise;
            },

            /**
             * get search document count of a categorizer
             */
            searchDocCountOfCategorizer: function(categorizerId, filter){
              var deferred = $q.defer();
              //debugger;
              $semdee.call({
                method: 'get',
                url: $config.api.uri.categorizer+"/"+categorizerId+
                "/searchdocuments/totalcount?filter=" + filter,
                json:{}
              }, false).then(deferred.resolve, deferred.reject);
              return deferred.promise;
            }

        };
    }]);
