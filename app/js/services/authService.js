/**
 * AuthService.js
 *
 * @description :: authenticate a user against the server and store user info such as name, surname, email and token
 *
 */

'use strict';

angular.module('semdeePortal.services',['ngCookies'])

    .factory('$auth', ['$q', '$semdee','$config','$rootScope','$cookies','$twitterService',
		function($q, $semdee, $config, $rootScope, $cookies, $twitterService) {

		var saveToCookie = function(user){

			if (user){
				console.log(user);
				$rootScope.currentUser = user;
				$config.api.token = user.token;
				$cookies.semdee_auth = angular.toJson(user);

			}
			else{
				$rootScope.currentUser = undefined;
				$config.api.token = null;
				$cookies.semdee_auth = null;
			}
		};

		return {

            currentUser : undefined,

            isRoutePublic : function(routeName){
                var deferred = $q.defer();
                $config.publicRoutes.forEach(function(route){
                    if (route === routeName){
                        deferred.resolve(true);
                        return deferred.promise; // return if found
                    }
                });

                deferred.resolve(false);
                return deferred.promise;
            },

            autoAuth : function(){

            	var deferred = $q.defer();
        		var user = angular.fromJson($cookies.semdee_auth); //get id from cookie
        		user = user ? user : {username:null,password:null};
           		this.authUser(user.username,user.password).then(function(data){
           			deferred.resolve(data);
            	},function(res){
					deferred.reject(res);
				});

            	return deferred.promise;
            },
            
            authUser : function (username,password){

				console.log("authUser");

                //TODO call to semdee backend to authenticate a user, fake service for now
                var deferred = $q.defer();

				if (username != null && password != null){

					$semdee.callUrl(
						{
							method : 'get',
							url : $config.api.url+$config.api.uri.params+'/login?uid='+username+'&pwd='+password
						}, true)
						.then(function(res) {

							var user = null;
							if (res && res.data && res.data && res.data.token!=null){

								user ={
										username:res.data.user_name,
										firstname:res.data.firstname,
										lastname:res.data.lastname,
										password:password,
										token:res.data.token
									};
							}

							saveToCookie(user);

							deferred.resolve(user);

						}, function(res){
							deferred.reject(res)
						});

				}
				else{

					deferred.resolve(null);
				}
		        return deferred.promise;
		         
            },
            
            logOut : function(){
            	$rootScope.currentUser = undefined;
            	$cookies.semdee_auth = null;

				$twitterService.disconnectTwitter();
            },
            
            addUser : function(user){

            	//TODO call to semdee backend to authenticate a user, fake service for now
            	var deferred = $q.defer();

            	//var data = angular.toJson(user);
				var json = {
					username:user.username,
					firstname:user.firstname,
					lastname:user.lastname,
					password:user.password
				};
				$semdee.callUrl(
				{
					method : 'post',
					url : $config.api.url+$config.api.uri.params+'/user/',
					json: json
				}, true)
				.then(function(res) {

					var user2 = null;

					if (res && res.data && res.data != -1){
						user2 = json;
						user2.token = res.data;
					}

					saveToCookie(user2);

					deferred.resolve(user2);

				}, function(res){
					deferred.reject(res)
				});
                
            	return deferred.promise;
            },
            
            updateUser : function(user){

				var deferred = $q.defer();

				var json = {
					username:user.username,
					firstname:user.firstname,
					lastname:user.lastname,
					password:user.password
				};

				$semdee.call({
					method: 'put',
					url: $config.api.uri.params+'/user/',
					json: json
				}, true).then(function(res) {

					var user2 = null;
					if (res){
						user2 = json;
						user2.token = $config.api.token;
					}

					saveToCookie(user2);

					deferred.resolve(user2);

				}, deferred.reject);

				return deferred.promise;
            }
        }
  }]);
