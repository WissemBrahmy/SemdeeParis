angular.module("semdeePortal.directives")
    .directive("cloudChart",
    ['$document', '$compile',
    function($document, $compile){
        return {
            restrict: 'E',
            replace: false,
            template: '<div></div>',
            link: function (scope, element, attrs) {

                var width = scope.width;
                //var height = scope.height * 0.85;
                var height = scope.height;

                //var data = angular.copy(scope.chartData);
                var dataTemp = angular.copy(
                    angular.isDefined(scope.chart2Tags) ? scope.chart2Tags : scope.chartData
                );


                var data = dataTemp;
                //big data, we must check this case for error:
                // A script on this page may be busy, or it may have stopped responding.
                // You can stop the script now, open the script in the debugger, or let the script continue.
                if (dataTemp.length >2000){

                    // sort by desc
                    dataTemp.sort(function(a,b) { return parseFloat(b.value) - parseFloat(a.value) } );

                    data = [];
                    dataTemp.forEach(function(d, index) {
                        if (index<2000) {
                            data.push(d);
                        }
                    });
                }
                else{
                    // Sorting data accordingly to its value
                    data.sort(function(a,b) { return parseFloat(b.value) - parseFloat(a.value) } );
                }


                // Remove the old cloud graph
                d3.select("svg").remove();

                // Sorting data accordingly to its value
                //data.sort(function(a,b) { return parseFloat(b.value) - parseFloat(a.value) } );

                // Adding a time for transition duration accordingly to value
                for(var i = 0 ; i < data.length ; i++) {
                    var addTime = (100 * i) + 500;
                    data[i].time = addTime;
                }

                var fontSizeMin = 10,fontSizeMax = 50;
                if (width<500){// show Word Cloud chart in menu Space
                    fontSizeMin = 8,fontSizeMax = 15;
                }
                // Scale text-size accordingly to value
                var sizeScale = d3.scale.linear()
                    .domain([0, d3.max(data, function(d) { return d.value} )])
                    //.range([10, 50]);
                    .range([fontSizeMin, fontSizeMax]);

                // Initializing cloud chart
                d3.layout.cloud().size([width, height])
                    .words(data)
                    .padding(4)
                    //.rotate(function(d) { return ~~(Math.random() * 5) * 30 - 60; })
                    //.rotate(function(d) {  return ~~(Math.random() * 2) * 90;})
                    .rotate(function(d) { return 0; })
                    .fontSize(function(d) { return sizeScale(d.value); })
                    .text(function(d) { return d.label; })
                    .on("end", draw)
                    .start();

                // Drawing the word cloud
                function draw(data, bounds) {
                    var scale = bounds ? Math.min(
                        width / Math.abs(bounds[1].x - width / 2),
                        width / Math.abs(bounds[0].x - width / 2),
                        height / Math.abs(bounds[1].y - height / 2),
                        height / Math.abs(bounds[0].y - height / 2)) / 2 : 1;

                    var fill = d3.scale.category20b();

                    var svg = d3.select(element.find('div')[0]).append('svg')
                        .attr("width", width)
                        .attr("height", height);

                    var g = svg.append("g")
                        .attr("transform", "translate(" + [width >> 1, height >> 1] + ")scale(" + scale + ")")
                        .selectAll("text")
                        .data(data);

                    var text = g
                        .enter()
                        .append("text")
                        .text(function(d) { return d.label; })
                        .attr("class", "cloud")
                        .attr("transform", "translate(25,25)")
                        .style("fill-opacity", 0)
                        .transition()
                        .duration(function(d) { return d.time}  )
                        .attr("transform", function(d) {
                            return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                        })
                        .style("fill-opacity", 1)
                        .style("font-size", function(d) { return d.size + "px"; })
                        //.style("fill", function(d, i) { return fill(i); })
                        .style("fill", function(d, i) { return g_color20c(i); })
                        .attr("text-anchor", "middle");

                    /*
                     // Do we really need a click event on cloud charts???
                     cloud.enter()
                     .append("text")
                     .on("click", function(d) {
                     scope.$emit("chart.onClick", d);
                     d3.selectAll('text.active').attr('class', 'cloud');
                     d3.select(this).attr('class', 'cloud active');
                     });
                     */
                }
            }
        };
    }]);


angular.module("semdeePortal.directives")
    .directive("cloud",['$document', '$compile',
        function($document, $compile){
        return {
            restrict: 'E',
            replace: false,
            template: '<div id="cloud" style="text-align:center"></div>',
            scope: {
                cloudData: "=",
                cloudWidth: "=",
                cloudHeight: "="
            },
            link: function (scope, element, attrs) {

                scope.graphDiv = element.find('div')[0];

                if (scope.graphDiv.offsetWidth){
                    scope.width = scope.graphDiv.offsetWidth;
                }
                else if (angular.isDefined(scope.cloudWidth) && scope.cloudWidth){
                    scope.width = scope.cloudWidth;
                }
                else{
                    scope.width = 500;
                }

                if (angular.isDefined(scope.cloudHeight) && scope.cloudHeight){
                    scope.height = scope.cloudHeight;
                }
                else {
                    scope.height = scope.width * 0.2;
                }

                var width = scope.width;
                //var height = scope.height * 0.85;
                var height = scope.height;

                // Remove the old cloud graph
                d3.select("svg.cloudSvg").remove();

                if (angular.isUndefined(scope.cloudData)){
                    return;
                }

                //var data = angular.copy(scope.cloudData);
                // Sorting data accordingly to its value
                //data.sort(function(a,b) { return parseFloat(b.value) - parseFloat(a.value) } );

                var dataTemp = angular.copy(scope.cloudData);
              //  console.log(dataTemp);
                var data = dataTemp;
                //big data, we must check this case for error:
                // A script on this page may be busy, or it may have stopped responding.
                // You can stop the script now, open the script in the debugger, or let the script continue.
                if (dataTemp.length >2000){

                    // sort by desc
                    dataTemp.sort(function(a,b) { return parseFloat(b.value) - parseFloat(a.value) } );

                    data = [];
                    dataTemp.forEach(function(d, index) {
                        if (index<2000) {
                            data.push(d);
                        }
                    });
                }
                else{
                    // Sorting data accordingly to its value
                    data.sort(function(a,b) { return parseFloat(b.value) - parseFloat(a.value) } );
                }

//console.log("height=="+height+" data:"+data.length);

                // Adding a time for transition duration accordingly to value
                for(var i = 0 ; i < data.length ; i++) {
                    var addTime = (100 * i) + 500;
                    data[i].time = addTime;
                }

                var fontSizeMin = 10,fontSizeMax = 50;
                if (width<500){// show Word Cloud chart in menu Space
                    fontSizeMin = 8,fontSizeMax = 15;
                }
                // Scale text-size accordingly to value
                var sizeScale = d3.scale.linear()
                    .domain([0, d3.max(data, function(d) { return d.value} )])
                    .range([fontSizeMin, fontSizeMax]);

                // Initializing cloud chart
                d3.layout.cloud().size([width, height])
                    .words(data)
                    .padding(4)
                    .rotate(function(d) { return 0; })
                    .fontSize(function(d) { return sizeScale(d.value); })
                    .text(function(d) { return d.label; })
                    .on("end", draw)
                    .start();

                // Drawing the word cloud
                function draw(data, bounds) {
                    var scale = bounds ? Math.min(
                        width / Math.abs(bounds[1].x - width / 2),
                        width / Math.abs(bounds[0].x - width / 2),
                        height / Math.abs(bounds[1].y - height / 2),
                        height / Math.abs(bounds[0].y - height / 2)) / 2 : 1;

                    var fill = d3.scale.category20b();

                    var svg = d3.select(element.find('div')[0]).append('svg')
                        .attr("class", 'cloudSvg')
                        .attr("width", width)
                        .attr("height", height);


                    var g = svg.append("g")
                        .attr("transform", "translate(" + [width >> 1, height >> 1] + ")scale(" + scale + ")")
                        .selectAll("text")
                        .data(data);

                    var text = g
                        .enter()
                        .append("text")
                        .text(function(d) { return d.label; })
                        .attr("class", "cloud")
                        .attr("transform", "translate(25,25)")
                        .style("fill-opacity", 0)
                        .transition()
                        .duration(function(d) { return d.time}  )
                        .attr("transform", function(d) {
                            return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                        })
                        .style("fill-opacity", 1)
                        .style("font-size", function(d) { return d.size + "px"; })
                        .style("fill", function(d, i) { return g_color20c(i); })
                        .attr("text-anchor", "middle");

                }
            }
        };
    }]);