/**
 * RegexService.js
 *
 * @description ::
 *
 */

'use strict';

angular.module('semdeePortal.services')

  .factory('$regexService', ['$q', '$semdee', '$config', function($q, $semdee, $config) {

    return {

      /**
       * Get all the regex search of a crawl.
       */
      getAllRegexSearches: function(crawlId) {
      //  debugger;
        var deferred = $q.defer();

        $semdee.call({
          method: 'get',
          url: $config.api.uri.regex + '/regexsearch/' + crawlId
        }, true).then(function(res) {
          var regexSearches = res.data;
          deferred.resolve(regexSearches);
        }, deferred.reject);

        return deferred.promise;

      },

      // get regex search results by page
      getRgxSearchResultByPage: function(id, page, size) {
        var deferred = $q.defer();

        $semdee.call({
          method: 'get',
          url: $config.api.uri.regex + '/regexsearch/' + id +
            '/documents?page=' + page + '&size=' + size,
          json: {}
        }, false).then(deferred.resolve, deferred.reject);
        return deferred.promise;
      },

      // get the number of documents in a regex search result
      getRgxSearchResultCount: function(id) {
        var deferred = $q.defer();

        $semdee.call({
          method: 'get',
          url: $config.api.uri.regex + '/regexsearch/' + id + '/documents/totalcount',
          json: {}
        }, false).then(deferred.resolve, deferred.reject);
        return deferred.promise;
      },

      // search in the crawl documents
      searchRgxSearchDocuments: function(id, filterValue, page, size) {
        var deferred = $q.defer();
        $semdee.call({
          method: 'get',
          url: $config.api.uri.regex + '/regexsearch/' + id + '/documents?filter=' + filterValue +
            '&page=' + page + '&size=' + size,
          json: {}
        }, false).then(deferred.resolve, deferred.reject);
        return deferred.promise;
      },

      // get document count for search in the crawl documents
      searchRgxSearchDocCount: function(id, filterValue) {
        //debugger;
        var deferred = $q.defer();
        $semdee.call({
          method: 'get',
          url: $config.api.uri.regex + '/regexsearch/' + id + '/documents/totalcount?filter=' + filterValue,
          json: {}
        }, false).then(deferred.resolve, deferred.reject);
        return deferred.promise;
      },

      downloadCsvFile: function(id) {
        var deferred = $q.defer();

        $semdee.call({
          method: 'get',
          url: $config.api.uri.regex + '/regexsearch/' + id + '/asynccsvstream',
          json: {
            responseType: 'arraybuffer'
          }

        }, false).then(deferred.resolve, deferred.reject);

        return deferred.promise;

      },

      /**
       * add a regex to a regex list.
       */
      addRegex: function(listid, regex) {
        var deferred = $q.defer();

        $semdee.call({
          method: 'post',
          url: $config.api.uri.regex + '/add',
          json: {
            "spelings": regex,
            "list": listid
          }
        }, true).then(function(res) {

          deferred.resolve(res.data);

        }, deferred.reject);

        return deferred.promise;
      },


      /**
       * Delete a regex from a list.
       */
      removeRegex: function(listid, regex) {
        var deferred = $q.defer();

        $semdee.call({
          method: 'delete',
          url: $config.api.uri.regex + '/' + listid + '/remove',
          json: {
            "spelling": regex,
            "list": listid
          }
        }, true).then(function(res) {

          deferred.resolve(res.data);

        }, deferred.reject);

        return deferred.promise;
      },

      /**
       * Get regexes from a list.
       */
      getRegexesFromList: function(listId) {
        var deferred = $q.defer();

        $semdee.call({
          method: 'get',
          url: $config.api.uri.regex + '/list/' + listId,
          json: {}
        }, true).then(function(res) {

          deferred.resolve(res.data);


        }, deferred.reject);

        return deferred.promise;
      },

      /**
       * Get Regex spellings from a list.
       */
      getSpellingsFromList: function(listId) {
        var deferred = $q.defer();

        $semdee.call({
          method: 'get',
          url: $config.api.uri.regex + '/list/' + listId + '/spelling',
          json: {}
        }, true).then(function(res) {

          deferred.resolve(res.data);


        }, deferred.reject);

        return deferred.promise;
      },



      /**
       * Get all the regex lists.
       */
      getRegexLists: function() {
        //debugger;
        var deferred = $q.defer();

        $semdee.call({
          method: 'get',
          url: $config.api.uri.regex + '/list',
          json: {}
        }, true).then(function(res) {

          deferred.resolve(res.data);


        }, deferred.reject);

        return deferred.promise;
      },

      /**
       * Get all regex lists with spellings.
       */
      getRegexListsWithSpellings: function() {
        //debugger;
        var deferred = $q.defer();

        $semdee.call({
          method: 'get',
          url: $config.api.uri.regex + '/list/spelling',
          json: {}
        }, true).then(function(res) {

          deferred.resolve(res.data);


        }, deferred.reject);

        return deferred.promise;
      },

      /**
       * Update a regex list with the spellings.
       */
      updateRegexesList: function(id, regexes) {
        var deferred = $q.defer();

        $semdee.call({
          method: 'post',
          url: $config.api.uri.regex + '/list/update',
          json: {
            "id": id,
            "spellings": regexes
          }
        }, true).then(function(res) {

          deferred.resolve(res.data);


        }, deferred.reject);

        return deferred.promise;
      },

      /**
       * Add a regex list with the spellings.
       */
      addRegexListWithSpellings: function(label, regexes) {
        var deferred = $q.defer();

        $semdee.call({
          method: 'post',
          url: $config.api.uri.regex + '/list/addspellings',
          json: {
            'label': label,
            "spellings": regexes
          }
        }, true).then(function(res) {

          deferred.resolve(res.data);

        }, deferred.reject);

        return deferred.promise;
      },

      /**
       * Delete a regex list.
       */
      deleteRegexList: function(listid) {
        var deferred = $q.defer();

        $semdee.call({
          method: 'delete',
          url: $config.api.uri.regex + '/list/' + listid + '/remove',
          json: {}
        }, true).then(function(res) {

          deferred.resolve(res.data);

        }, deferred.reject);

        return deferred.promise;
      },

      /**
       * launch a new regex search.
       */
      newRegexSearch: function(json) {
        //debugger;
        //alert("asking webservice ...");
        var deferred = $q.defer();
        console.log('new regex search ' + json);
        $semdee.call({
          method: 'post',
          url: $config.api.uri.regex + '/launch',
          json: json
        }, true).then(deferred.resolve, deferred.reject);

        return deferred.promise;

      }

    };
  }]);
