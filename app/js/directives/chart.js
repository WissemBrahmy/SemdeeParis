var g_color20c = d3.scale.category20()
angular.module("semdeePortal.directives")
    .directive("chart",
    ['$document', '$compile',
    function($document, $compile){
        return {
            restrict: 'E',
            replace: false,
            template: '<div id="chart" style="text-align:center"></div><div class="btn-group"></div>',
            scope: {
                chartData: '=',
                chartTitle: '=',
                chartType: '=',
                chartUnselectable: '=?',
                chartShowTypes: "=",
            },
            link: function (scope, element, attrs) {

                var chartTypes = {
                    'donut-chart': 'Donut chart',
                    'bubble-chart': 'Bubble chart',
                    'cloud-chart': 'Cloud chart'
                };

                scope.graphDiv = element.find('div')[0];
                scope.width = scope.graphDiv.offsetWidth;
                scope.height = scope.width  * 0.7;
                scope.unselectable=scope.chartUnselectable || false;

                if (scope.chartShowTypes) {
                    // Adding links to change chart type (only for authorized chart type)
                    var links = '';
                    attrs.chartAvailableTypes.split(',').forEach(function (chartType) {
                        chartType = chartType.trim();
                        links += '<a href ng-click="chartType=\'' + chartType + '\';" class="btn btn-xs" ng-class="{ active: (chartType == \'' + chartType + '\') }">' + chartTypes[chartType] + '</a>';
                    });
                    links = angular.element(links);

                    $compile(links)(scope);
                    angular.element(element.find('div')[1]).append(links);
                }

                // Chart initialization
                scope.$watchGroup(
                    ['chartData', 'chartTitle', 'chartType', 'chartSelectable'],
                    function (values) {
                        // Don't need to initialize a chart if there is no data
                       /* if (scope.chartData.length == 0) {
                            return;
                        }*/

                        // Adding nested chart
                        var currentChart = angular.element(document.createElement(scope.chartType));
                        $compile(currentChart)(scope);

                        angular.element(element.find('div')[0]).html(currentChart);
                });
            }
        };
    }]);

angular.module("semdeePortal.directives")
    .directive("chart2",['$document', '$compile',
        function($document, $compile){
            return {
                restrict: 'E',
                replace: false,
                template: '<div id="chart2" style="text-align:center"></div><div class="btn-group"></div>',
                scope: {
                    chart2Tags: "=",
                    chart2Type: "=",
                    chart2ShowTypes: "=",
                },
                link: function (scope, element, attrs) {

                    var chartTypes = {
                        'donut-chart': 'Donut chart',
                        'bubble-chart': 'Bubble chart',
                        'cloud-chart': 'Cloud chart'
                    };

                    scope.graphDiv = element.find('div')[0];
                    scope.width = scope.graphDiv.offsetWidth;
                    scope.height = scope.width  * 0.7;
                    scope.unselectable=scope.chartUnselectable || false;

                    if (scope.chart2ShowTypes) {
                        // Adding links to change chart type (only for authorized chart type)
                        var links = '';
                        attrs.chartAvailableTypes.split(',').forEach(function (chartType) {
                            chartType = chartType.trim();
                            links += '<a href ng-click="chartType=\'' + chartType + '\';" class="btn btn-xs" ng-class="{ active: (chartType == \'' + chartType + '\') }">' + chartTypes[chartType] + '</a>';
                        });
                        links = angular.element(links);
                        $compile(links)(scope);
                        angular.element(element.find('div')[1]).append(links);
                    }

                    // Chart initialization
                    scope.$watchGroup(['chart2Tags','chart2Type'], function (values) {

                        // Don't need to initialize a chart if there is no data
                        /*if (scope.chart2Tags.length == 0) {
                            return;
                        }*/

                        // Adding nested chart
                        var currentChart = angular.element(document.createElement(scope.chart2Type));
                        $compile(currentChart)(scope);
                        angular.element(element.find('div')[0]).html(currentChart);
                    });
                }
            };
    }]);

function findMaxSizeBubble(arr){
    var max = 0;
    if (arr.length > 0 ){
        max = arr[0].value;
        for (var i =1;i<arr.length;i++){
            if (arr[i].value > max){
                max = arr[i].value;
            }
        }
    }
    return max;
}