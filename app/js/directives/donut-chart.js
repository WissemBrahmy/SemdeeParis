angular.module("semdeePortal.directives")
    .directive("donutChart",
    ['$document', '$compile',
    function($document, $compile){
        return {
            restrict: 'E',
            replace: false,
            template: '<div></div>',
            link: function (scope, element, attrs) {

                var data = scope.chartData;
                if (data.length==0){
                    return;
                }
                // set new color
                $.each(data , function( index, value ) {
                	value.color = g_color20c(value.value);
                });
                var vis = new d3pie(element.find('div')[0], {
                    header: {
                        title: {
                            text: scope.chartTitle
                        },
                        location: "pie-center"
                    },
                    size: {
                        canvasHeight: scope.height,
                        canvasWidth: scope.width,
                        pieInnerRadius: "65%"
                    },
                    data: {
                        sortOrder: "label-asc",
                        content: data
                    },
                    callbacks: {
                        onClickSegment: function (a) {
                            scope.$emit("chart.onClick", a.data);
                        }
                    },
                   /* tooltips: {
                        enabled: true,
                        type: "placeholder",
                        string: "{value}%"
                    },*/
                    labels: {
                        inner: {format: "percentage",},
                        percentage: {
                            color: "black",
                            //font: "arial",
                            //fontSize: 10,
                            //decimalPlaces: 0
                        },
                    },

                });
              //  vis.totalSize = 20;
                if (!scope.unselectable) {
                    element.find('div')[0].className = 'selectable';
                } else {
                    vis.updateProp("effects.pullOutSegmentOnClick.effect",  false);
                }
            }
        };
    }]);