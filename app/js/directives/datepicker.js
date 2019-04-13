angular.module("semdeePortal.directives")
.directive('datepicker', function() {
    return {
        restrict: 'A',
        require : 'ngModel',
        link : function (scope, element, attrs, ngModelCtrl) {
            $(function(){

            	element.keypress(function(event) {event.preventDefault();});
            	
                element.datepicker({
                    autoclose: true,
                    format: 'dd-mm-yyyy',
                    weekStart: 0,
                    //startDate: '01-01-2016',endDate: '30-03-2016',startView:'year',
                    onSelect:function (date) {
                        scope.$apply(function () {
                            ngModelCtrl.$setViewValue(date);
                        });
                    }
                });
            });
        }
    }
});