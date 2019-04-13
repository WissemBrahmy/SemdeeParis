angular.module("semdeePortal.directives")
    .directive("bubbleChart",
    ['$document', '$compile',
    function ($document, $compile) {
        return {
            restrict: 'E',
            replace: false,
            template: '<svg></svg>',
            link: function (scope, element, attrs) {

                var width = scope.width;
                var height = scope.height;
                var data = { children: angular.copy(scope.chartData) };

                /* calcul du ratio des cercles :
                 on calcule la largeur allouable a 1 cercle => largeur du div / nb d'element a representé
                 parmi les elements on regarde lequel est le plus grand (volume de doc), sa taille = Smax
                 pour le mettre à l'echelle on systématiquement Wmax /Smax
                 */
                // on cherche la longueur de reference => la plus courte des deux.
                var reference = width > height ? height : width;
                var Wmax = reference / data.children.length;
                var Smax = findMaxSizeBubble(data.children);
                var scaleRatio;
                if (Wmax > Smax) {
                    scaleRatio = Wmax /Smax;
                }
                else {
                    scaleRatio = (Smax / Wmax);
                }
                // on calcul le padding (aapliqué centre à centre) avec rayonMax + 5 px
                var padding = (Smax * scaleRatio / 2) + 5;

                var color = d3.scale.category10();
                var svg = d3.select(element.find("svg")[0])
                    .attr("width", width)
                    .attr("height", height)
                    .attr("class", "bubble");

                var bubble = d3.layout.pack()
                    .sort(null)
                    .size([width, height])
                    .padding(1.5);// .padding(padding);

                //.value(function (d) {
                //    return d.value;
                //});

                var nodes = bubble.nodes(data).filter(function (d) { return !d.children;});

                var vis = svg.selectAll('o')
                    .data(nodes, function (d) { return d.id;})
                    .enter()
                    .append('g')
                    .attr('transform', function (d) { return 'translate(' + d.x + ',' + d.y + ')'; });

                if (!scope.unselectable) {
                	vis.on("click", function (d) {
                        scope.$emit("chart.onClick", d);
                        d3.selectAll('text.active').attr('class', 'bubble');
                        // d3.select(this.nextSibling).attr('class', 'bubble active');
                        d3.select(this).select('text').attr('class', 'bubble active');
                    });
                }

                vis.on("mouseover", function (d) {
                    //d3.select(this)
                    //transition().style('opacity', 0.50);
                    d3.select(this)
                    .append('text')
                    .attr('class', 'bubble')
                    .append("tspan")
                    .attr("class", "hover")
                    .text(d.label);
                    //d3.select(this).select('circle').attr('r', 125);
                }).on("mouseout", function (d) {
                    //d3.select(this).transition().style('opacity', 1);
                    d3.select(this).select('tspan.hover').remove();

                    //d3.select(this).select('circle').attr('r' , 100);
                });

                var d=vis.append('circle')
                    .style("fill", function (d, i) { return g_color20c(d.value);  }) //return color(i);
                    .attr('r', function (d) { return 0.001; })
                    .transition()
                    .duration(1000)
                    .style('opacity', 1)
                    .attr('r', function (d) {  	return d.r; });   //return d.value * scaleRatio;
                if(scope.unselectable){
                    d.style("cursor","default");
                }
                //vis.append("text").attr('class', 'bubble').text(function (d) {return d.label;})
                // Label
                /*d = vis.append("text")
                    .attr('class', 'bubble')
                    .text(function (d) {
                        return d.label;
                    })
                // .style("font-size", function(d) {return "10px";});
                // */

                    d = vis.append("text")
                        .attr('class', 'bubble')
                        .append("tspan").text(function (d) {
                            //return d.label;
                            return "";
                        })
//                        .attr('class', 'bubble')
                        .append("tspan").text(function (d) {
                            if (angular.isDefined(d.percent)) {
                                return '(' + d.percent + '%)';
                            }
                            return '';
                    })
                    .attr("x", function (d) { return 0; })
                    .attr("y", function (d) { return 10;})


                if(scope.unselectable){
                    d.style("cursor","default");
                }
            }
        };
    }]);
function findMaxSizeBubble(arr) {
    var max = 0;
    if (arr.length > 0) {
        max = arr[0].value;
        for (var i = 1; i < arr.length; i++) {
            if (arr[i].value > max) {
                max = arr[i].value;
            }
        }
    }
    return max;
}
