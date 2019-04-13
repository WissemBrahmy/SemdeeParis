angular.module("semdeePortal.directives")
    .directive('tooltip', function(){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){
            $(element).hover(function(){
                // on mouseenter
                $(element).tooltip('show');
            }, function(){
                // on mouseleave
                $(element).tooltip('hide');
            });
        }
    };
});
//<a href="#0" title="My Tooltip!" data-toggle="tooltip" data-placement="right" tooltip >My Tooltip Link</a>
