angular.module("semdeePortal.directives")
// for upload 1 file
.directive('fileDirective',
	['$parse'
	, function ($parse) {
	    return {
	        restrict: 'A',
	        link: function(scope, element, attrs) {
	            var model = $parse(attrs.fileDirective);
	            var modelSetter = model.assign;

	            element.bind('change', function(){
	                scope.$apply(function(){

	                	scope.uploadFrm.file = !0;
	                    modelSetter(scope, element[0].files[0]);
	                    scope.uploadFrm.fileName = element[0].files[0].name;
	                    
	                });
	            });
	        }
	    };
	}]
)// for upload multi files
.directive('filesDirective',
	['$parse'
		, function ($parse) {
		return {
			restrict: 'A',
			link: function(scope, element, attrs) {
				var model = $parse(attrs.filesDirective);
				var modelSetter = model.assign;

				element.bind('change', function(){
					scope.$apply(function(){

						scope.uploadFrm.file = !0;
						var files = model(scope);

						scope.uploadFrm.file = !0;

						for(var i=0;i<element[0].files.length;i++){
							if (scope.uploadFrm.filesName.indexOf(element[0].files[i].name)==-1) {
								scope.uploadFrm.filesName.push(element[0].files[i].name);
								files.push(element[0].files[i]);

								var r = new FileReader();
								r.onload = function(e) {
									//debugger;
									var contents = e.target.result;
									//console.log("------------------------");
									//console.log(contents);
									//scope.$apply(function () {
									//	scope.fileReader = contents;
									//});
									scope.uploadFrm.filesContent.push(contents);
								};
								//The readAsDataURL method is used to read the contents of the specified Blob or File.
								//When the read operation is finished, the readyState becomes DONE, and the loadend is triggered.
								// At that time, the result attribute contains the data as a URL representing
								// the file's data as a base64 encoded string.
								//r.readAsDataURL(element[0].files[i]);
								//r.readAsText(element[0].files[i]);
								r.readAsArrayBuffer(element[0].files[i]);
							}
						};
						modelSetter(scope, files);

					});
				});
			}
		};
	}]
);
