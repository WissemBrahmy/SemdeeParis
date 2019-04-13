'use strict';
angular.module('semdeePortal.controllers')

    .controller('scheduleController',
    	
    	['$scope', '$crawl',

		function($scope, $crawl) {

			$scope.schedules = {};

			$scope.init = function(){

				// Schedule loading
				$crawl.getAllCrawlSchedules().then(
					function (schedules) {
						$scope.schedules = schedules;
					}, function (err) {
						alert("Error while get schedules: " + err);
					}

				);

			}

			$scope.deleteSchedule = function(schedule){
				// Calling the API to launch a echedule
				$crawl.deleteSchedule(schedule).then(
					function (res) {
						// reload list schedule
						$crawl.getAllCrawlSchedules().then(function(schedules) {
								$scope.schedules = schedules;
							},function(err){
								alert("Error while get schedules: "+err);
							}
						);

					}, function (res) {
						// Hiding the modal
						alert('An error occured while detete the schedule. Please check server state.');
					});
			};
    	}]);