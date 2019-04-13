'use strict';

angular.module('semdeePortal.controllers')
    .controller('authController',
	['$rootScope', '$scope', '$auth','$routeParams','$location','$config','$cookies',
	function($rootScope, $scope, $auth, $routeParams, $location, $config, $cookies) {
        /**
         * VARs DEFINITION
         */
        $scope.pwdInputType = "password";

        $scope.togglePwd = function(){
            if ( $scope.pwdInputType === "password"){
                $scope.pwdInputType = "text";
            }
            else {
                $scope.pwdInputType = "password"
            }
        };

        $scope.checkAuth = function(){

            $auth.authUser($scope.username,$scope.password).then(function(data){

            	$rootScope.currentUser = data;
				console.log("Check login return token: "+ (data ? data.token:null));
	            
	            if ($rootScope.currentUser){
	            	$config.api.token  = $rootScope.currentUser.token;
	            	$cookies.semdee_auth = angular.toJson($rootScope.currentUser);
	            	
	                $location.$$search = {};
	                if(!$routeParams.p) {
	                    $routeParams.p = '#/home';
	                }
	                $location.path($routeParams.p);
	            }else{
	            	$scope.error="Invalid user name or password";
	            }

        	}, function(res){
				$auth.logOut();
				alert("Error connect to server: "+res)
			})
        };
        
        $scope.addUser = function(user){

        	$auth.addUser(user).then(function(user){
        		if (user){
        			$rootScope.currentUser = user;
        			$config.api.token = user.token;
	                $location.path('/home');
        		}else{
        			$scope.error = "Sign-Up is failed (this email may be using)"
        		}
        			
        	});

        };
        
        $scope.updateUser = function(user){

			var json = {
				username:user.username,
				firstname:user.firstname,
				lastname:user.lastname,
				password:$scope.npassword != null ? $scope.npassword:user.password
			};

        	$auth.updateUser(json).then(

				function(user){
					if (user){
						$location.path('/home');
					}else{
						$scope.error = "Update is failed (your current password may be not correct)"
					}
	        	}
			);
        }
        
    }]);