app.directive('barChart', function() {
    return {
        restrict: 'E',
        scope: {
            title: '@',
            data: '=',
            label: '='
        },
        template: '<div></div>',
        link: function(scope, element) {
            // declaration array for render chart
            var chart;

            // make function to set haighchart in directive
            var process = function() {
                var defaultOptions = {
                    chart: {
                        renderTo: element[0],
                        type: 'column'
                    }
                };
                var options = {
                    title: {
                        text: '',
                        style: {
                            display: 'none'
                        }
                    },
                    subtitle: {
                        text: 'Monthly Power Usage'
                    },
                    xAxis: {
                        categories: [
                            'Jan',
                            'Feb',
                            'Mar',
                            'Apr',
                            'May',
                            'Jun',
                            'Jul',
                            'Aug',
                            'Sep',
                            'Oct',
                            'Nov',
                            'Dec'
                        ]
                    },
                    credits: {
                        enabled: false
                    },
                    yAxis: {
                        allowDecimals: false,
                        min: 0,
                        title: {
                            text: ''
                        },
                        labels: {
                            format: '{value} kwh',
                            style: {
                                color: '#444'
                            }
                        }
                    },

                    tooltip: {
                        formatter: function() {
                            return '<b>' + this.x + '</b><br/>' +
                                this.series.name + ': ' + this.y + ' kwh <br/>' +
                                'Total: ' + this.point.stackTotal + ' kwh';
                        }
                    },

                    plotOptions: {
                        column: {
                            stacking: 'normal'
                        }
                    },

                    series: scope.data
                };
                var config = angular.extend(defaultOptions, options);
                chart = new Highcharts.Chart(config);
            };

            process();
            scope.$watch("data", function() {
                process();
            });
        }
    }
});





app.directive('lineChart', function() {
    return {
        restrict: 'E',
        scope: {
            title: '@',
            data: '=',
            label: '='
        },
        template: '<div></div>',
        link: function(scope, element) {
            // declaration array for render chart
            var chart;

            // make function to set haighchart in directive
            var process = function() {
                var defaultOptions = {
                    chart: {
                        renderTo: element[0],
                        type: 'spline'
                    }
                };
                var options = {
                    title: {},
                    series: {
                        showInNavigator: true
                    },
                    credits: {
                        enabled: false
                    },
                    xAxis: {
                        type: 'datetime',
                        labels: {
                            overflow: 'justify'
                        }
                    },
                    yAxis: [{
                        title: {
                            text: 'Temperature & Humidity',
                            style: {
                                color: '#444'
                            }
                        },
                        labels: {
                            format: '{value}°C',
                            style: {
                                color: '#444'
                            }
                        }
                    }, {
                        title: {
                            text: 'Power Usage',
                            style: {
                                color: '#444'
                            }
                        },
                        labels: {
                            format: '{value} KW',
                            style: {
                                color: '#444'
                            }
                        },
                        opposite: true
                    }],
                    plotOptions: {
                        spline: {
                            lineWidth: 2,
                            states: {
                                hover: {
                                    lineWidth: 3
                                }
                            },
                            marker: {
                                enabled: false
                            }
                        },
                        pointInterval: 2 * 3600 * 1000,
                        pointRange: 24 * 3600 * 1000
                    },
                    series: scope.data
                };

                if (scope.data != undefined) {
                    if (scope.data.length == 0) {
                        options.title.text = 'Data is empty',
                            options.title.style = {
                                fontSize: "30px"
                            }
                    } else {
                        options.title.style = {
                            display: "none"
                        }
                    }
                } else {
                    options.title.text = 'Loading...',
                        options.title.style = {
                            fontSize: "30px"
                        }
                }
                var config = angular.extend(defaultOptions, options);
                chart = new Highcharts.chart(config);
            };

            // process();
            scope.$watch("data", function() {
                process();
            });
        }
    }
});
