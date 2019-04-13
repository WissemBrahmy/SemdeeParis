'use strict';
angular.module('semdeePortal.controllers')

    .controller('twitterController',
    	
    	['$scope', '$config', '$interval', '$rootScope','$twitterService',

		function($scope, $config, $interval, $rootScope, $twitterService) {

			$scope = $rootScope;

			$twitterService.initialize();

			$scope.connectToTwitter = function(isConnect){

				if (isConnect) {
					$twitterService.connectTwitter().then(function () {
						if ($twitterService.isReady()) {
							//if the authorization is successful, hide the connect button and display disconnect button
							$('#connectButton').fadeOut(function () {
								$('#disconnectButton').fadeIn();
							});
						}
					});
				}
				else{
					//sign out clears the OAuth cache, the user will have to reauthenticate when returning
					$twitterService.disconnectTwitter();

					$('#disconnectButton').fadeOut(function () {
						$('#connectButton').fadeIn();
					});
				}

			}

			//if the user is a returning user, hide the sign in button and display the tweets
			/*if ($twitterService.isReady()) {
				$('#connectButton').hide();
				$('#disconnectButton').show();
			}*/

			// get from cookies
			if ($twitterService.isReady()){

				$('#connectButton').hide();
				$('#disconnectButton').show();
			}
			else{

				$('#connectButton').show();
				$('#disconnectButton').hide();
			}


		}]);