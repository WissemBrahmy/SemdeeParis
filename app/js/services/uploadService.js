/**
 * uploadService.js
 *
 * @description : upload file
 *
 */

'use strict';

angular.module('semdeePortal.services')

    .service('$uploadService',

		["$q", "$config", "$http" ,"$semdee",

		function ($q, $config, $http, $semdeeService) {

			this.uploadFile = function(id, file){

		        var fd = new FormData();
		        fd.append('file', file);
		       // fd.append('param1', "asdasdasdasda");

		        var f = $q.defer();
	            return $semdeeService.postFile(
					{
						method: "post",
						url: 'http://app.vietnam-team.com/sfar_dev/admin/ajax/postTest/'+id,
						//url:$config.api.uri.imports+'/' +id,
						data: fd,
						json: {}
					}, true)
					.then(
						function(res) {
							var json = {
									id: 11,
									status:1,
									query:"asdasd"
								};
							f.resolve(json)
						}
						, f.reject
					)
					, f.promise
		    }
		}
	]
);
