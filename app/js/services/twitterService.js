'use strict';

angular.module('semdeePortal.services').factory('$twitterService',
    ['$q','$config','$cookies',
    function($q, $config, $cookies) {

        var authorizationResult = false;
        return {
            initialize: function() {
                //initialize OAuth.io with public key of the application
                OAuth.initialize($config.twitter.public_key, {cache:true});

                //try to create an authorization result when the page loads, this means a returning user won't have to click the twitter button again
                authorizationResult = OAuth.create('twitter');
            },
            isReady: function() {
                return (authorizationResult);
            },
            connectTwitter: function() {

                var deferred = $q.defer();
                OAuth.popup('twitter', {cache:true}, function(error, result) { //cache means to execute the callback if the tokens are already present

                    if (!error) {
                        console.log("authorizationResult:")
                        console.log(result);

                        authorizationResult = result;

                        deferred.resolve();
                    } else {
                        //do something if there's an error
                    }
                });
                return deferred.promise;
            },
            disconnectTwitter: function() {
                OAuth.clearCache('twitter');

                authorizationResult = false;

            }
        }

    }]);