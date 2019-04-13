/**
 * stopWordsService.js
 *
 * @description ::
 *
 */

'use strict';

angular.module('semdeePortal.services')

  .factory('$stopWordsService', ['$q', '$semdee', '$config', function($q, $semdee, $config) {

    return {

      /**
       * add several stop words to a list of stop words.
       */
      addStopWord: function(listid, sword) {
        var deferred = $q.defer();

        $semdee.call({
          method: 'post',
          url: $config.api.uri.stopWord + '/add',
          json: {
            "spelings": sw,
            "list": listid
          }
        }, true).then(function(res) {

          deferred.resolve(res.data);

        }, deferred.reject);

        return deferred.promise;
      },


      removeStopWord: function(listid, sword) {
        var deferred = $q.defer();

        $semdee.call({
          method: 'delete',
          url: $config.api.uri.stopword + '/' + listid + '/remove',
          json: {
            "spelling": sw,
            "list": listid
          }
        }, true).then(function(res) {

          deferred.resolve(res.data);

        }, deferred.reject);

        return deferred.promise;
      },

      getStopWordsFromList: function(listId) {
        var deferred = $q.defer();

        $semdee.call({
          method: 'get',
          url: $config.api.uri.stopword + '/list/' + listId,
          json: {}
        }, true).then(function(res) {

          deferred.resolve(res.data);


        }, deferred.reject);

        return deferred.promise;
      },

      getSpellingsFromList: function(listId) {
        var deferred = $q.defer();

        $semdee.call({
          method: 'get',
          url: $config.api.uri.stopword + '/list/' + listId + '/spelling',
          json: {}
        }, true).then(function(res) {

          deferred.resolve(res.data);


        }, deferred.reject);

        return deferred.promise;
      },



      /**
       * Get all the stop word lists.
       */
      getStopWordLists: function() {
        debugger;
        var deferred = $q.defer();

        $semdee.call({
          method: 'get',
          url: $config.api.uri.stopword + '/list',
          json: {}
        }, true).then(function(res) {

          deferred.resolve(res.data);


        }, deferred.reject);

        return deferred.promise;
      },

      /**
       * Get all the stop word lists with spellings.
       */
      getStopWordListsWithSpellings: function() {
        debugger;
        var deferred = $q.defer();

        $semdee.call({
          method: 'get',
          url: $config.api.uri.stopword + '/list/spelling',
          json: {}
        }, true).then(function(res) {

          deferred.resolve(res.data);


        }, deferred.reject);

        return deferred.promise;
      },

      updateStopWordsList: function(id, stopWords) {
        var deferred = $q.defer();

        $semdee.call({
          method: 'post',
          url: $config.api.uri.stopword + '/list/update',
          json: {
            "id": id,
            "spellings": stopWords
          }
        }, true).then(function(res) {

          deferred.resolve(res.data);


        }, deferred.reject);

        return deferred.promise;
      },

      addStopWordListWithSpellings: function(label, stopwords) {
        var deferred = $q.defer();

        $semdee.call({
          method: 'post',
          url: $config.api.uri.stopword + '/list/addspellings',
          json: {
            'label':label,
            "spellings":stopwords
          }
        }, true).then(function(res) {

          deferred.resolve(res.data);

        }, deferred.reject);

        return deferred.promise;
      },

      deleteStopWordList: function(listid) {
        var deferred = $q.defer();

        $semdee.call({
          method: 'delete',
          url: $config.api.uri.stopword + '/list/' + listid + '/remove',
          json: {}
        }, true).then(function(res) {

          deferred.resolve(res.data);

        }, deferred.reject);

        return deferred.promise;
      }


    };
  }]);
