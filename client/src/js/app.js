'use strict';


// Declare app level module which depends on filters, and services
var app = angular.module('app', [
        'ngAnimate',
        'ngCookies',
        'ngStorage',
        'ui.router',
        'ui.bootstrap',
        'ui.load',
        'ui.jq',
        'ui.validate',
        'oc.lazyLoad',
        'pascalprecht.translate',
        'app.filters',
        'app.directives',
        'app.controllers',
        'ngDragDrop',
        'easypiechart',
        'ngPrint',
        'lbServices',
        'daterangepicker',
        'toaster',
        "ngStorage",
        "socket.io"

    ])
    .run(function($state, $stateParams, $rootScope, history, toaster){
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
        history.get().then(function(res){
            if(res.usr==false){
                $state.go("access.signin");
                toaster.pop("info","You must login first");
            }
        })
    })
    .config(
        ['$socketProvider','$stateProvider', '$urlRouterProvider', '$controllerProvider', '$compileProvider', '$filterProvider', '$provide',
            function($socketProvider,$stateProvider, $urlRouterProvider, $controllerProvider, $compileProvider, $filterProvider, $provide) {

                // lazy controller, directive and service
                app.controller = $controllerProvider.register;
                app.directive = $compileProvider.directive;
                app.filter = $filterProvider.register;
                app.factory = $provide.factory;
                app.service = $provide.service;
                app.constant = $provide.constant;
                app.value = $provide.value;
                $socketProvider.setConnectionUrl('http://ec2-35-166-240-126.us-west-2.compute.amazonaws.com:3000');
                // $socketProvider.setConnectionUrl('http://localhost:3000');
                $urlRouterProvider.otherwise("/Access/Signin");
                $stateProvider
                    //FOR LOGIN
                    .state('access', {
                        url         : '/Access',
                        template    : '<div ui-view class="fade-in-right-big smooth"></div>'
                    })
                    .state('access.signin', {
                        url         : '/Signin',
                        templateUrl : 'tpl/page_signin.html',
                        controller  : "controller_signin"
                    })

                    .state("access.ceo",{
                        url         : "/Ceo",
                        templateUrl : "tpl/admin/ceo.html",
                        controller  : "controller_ceo"
                    })

                    .state("access.setup",{
                        url         : "/Setup",
                        templateUrl : "tpl/admin/setup.html",
                        controller  : "controller_setup"
                    })

                    //MENU ADMIN
                    .state('admin', {
                        url         : '/Admin',
                        templateUrl : 'tpl/admin/admin.html',
                        controller  : 'controller_app'
                    })

                    .state("admin.monitoring",{
                        url         : "/Monitoring",
                        templateUrl : "tpl/admin/monitoring.html",
                        controller  : "controller_monitoring"
                    })
                    .state("admin.storeInfo",{
                        url         : "/StoreInfo",
                        templateUrl : "tpl/admin/store_info.html",
                        controller  : "controller_storeinfo"
                    })
                     .state("admin.alarm",{
                        url         : "/Alarm",
                        templateUrl : "tpl/admin/alarm.html",
                        controller  : "controller_alarm"
                    })
                    // .state("admin.setup",{
                    //     url         : "/Setup",
                    //     templateUrl : "tpl/admin/setup.html",
                    //     controller  : "controller_setup"
                    // })


                    //MENU USER
                    .state('user', {
                        abstract: true,
                        url         : '/Admin',
                        templateUrl : 'tpl/user/user.html',
                        controller  : 'controller_app'
                    })

                    .state("user.monitoring",{
                        url         : "/Monitoring",
                        templateUrl : "tpl/user/monitoring.html"
                    })

                    //MENU SUPERADMIN
                    .state("superadmin",{
                        url         : "/Super-Admin",
                        templateUrl : "tpl/superadmin/superadmin.html",
                        controller  : "controller_app"
                    })
                    .state("superadmin.setup",{
                        url         : "/Setup",
                        templateUrl    : "tpl/superadmin/setup_table.html",
                        controller  : "CtrlSetups"
                    })


            }
        ]
    )

// translate config
.config(['$translateProvider', function($translateProvider) {

    // Register a loader for the static files
    // So, the module will search missing translation tables under the specified urls.
    // Those urls are [prefix][langKey][suffix].
    $translateProvider.useStaticFilesLoader({
        prefix: 'l10n/',
        suffix: '.json'
    });

    // Tell the module what language to use by default
    $translateProvider.preferredLanguage('en');

    // Tell the module to store the language in the local storage
    $translateProvider.useLocalStorage();

}])

/**
 * jQuery plugin config use ui-jq directive , config the js and css files that required
 * key: function name of the jQuery plugin
 * value: array of the css js file located
 */
.constant('JQ_CONFIG', {
    easyPieChart: ['js/jquery/charts/easypiechart/jquery.easy-pie-chart.js'],
    sparkline: ['js/jquery/charts/sparkline/jquery.sparkline.min.js'],
    plot: ['js/jquery/charts/flot/jquery.flot.min.js',
        'js/jquery/charts/flot/jquery.flot.resize.js',
        'js/jquery/charts/flot/jquery.flot.tooltip.min.js',
        'js/jquery/charts/flot/jquery.flot.spline.js',
        'js/jquery/charts/flot/jquery.flot.orderBars.js',
        'js/jquery/charts/flot/jquery.flot.pie.min.js'
    ],
    slimScroll: ['js/jquery/slimscroll/jquery.slimscroll.min.js'],
    sortable: ['js/jquery/sortable/jquery.sortable.js'],
    nestable: ['js/jquery/nestable/jquery.nestable.js',
        'js/jquery/nestable/nestable.css'
    ],
    filestyle: ['js/jquery/file/bootstrap-filestyle.min.js'],
    slider: ['js/jquery/slider/bootstrap-slider.js',
        'js/jquery/slider/slider.css'
    ],
    chosen: ['js/jquery/chosen/chosen.jquery.min.js',
        'js/jquery/chosen/chosen.css'
    ],
    TouchSpin: ['js/jquery/spinner/jquery.bootstrap-touchspin.min.js',
        'js/jquery/spinner/jquery.bootstrap-touchspin.css'
    ],
    wysiwyg: ['js/jquery/wysiwyg/bootstrap-wysiwyg.js',
        'js/jquery/wysiwyg/jquery.hotkeys.js'
    ],
    dataTable: ['js/jquery/datatables/jquery.dataTables.min.js',
        'js/jquery/datatables/dataTables.bootstrap.js',
        'js/jquery/datatables/dataTables.bootstrap.css'
    ],
    vectorMap: ['js/jquery/jvectormap/jquery-jvectormap.min.js',
        'js/jquery/jvectormap/jquery-jvectormap-world-mill-en.js',
        'js/jquery/jvectormap/jquery-jvectormap-us-aea-en.js',
        'js/jquery/jvectormap/jquery-jvectormap.css'
    ],
    footable: ['js/jquery/footable/footable.all.min.js',
        'js/jquery/footable/footable.core.css'
    ]
})

// modules config
.constant('MODULE_CONFIG', {
    select2: ['js/jquery/select2/select2.css',
        'js/jquery/select2/select2-bootstrap.css',
        'js/jquery/select2/select2.min.js',
        'js/modules/ui-select2.js'
    ]
})

// oclazyload config
.config(['$ocLazyLoadProvider', function($ocLazyLoadProvider) {
    // We configure ocLazyLoad to use the lib script.js as the async loader
    $ocLazyLoadProvider.config({
        debug: false,
        events: true,
        modules: [{
            name: 'ngGrid',
            files: [
                'js/modules/ng-grid/ng-grid.min.js',
                'js/modules/ng-grid/ng-grid.css',
                'js/modules/ng-grid/theme.css'
            ]
        }, {
            name: 'toaster',
            files: [
                'js/modules/toaster/toaster.js',
                'js/modules/toaster/toaster.css'
            ]
        }]
    });
}])

.config(['$httpProvider', function($httpProvider) {
    $httpProvider.interceptors.push(function($q, $location, LoopBackAuth) {
        return {
            responseError: function(rejection) {
                if (rejection.status == 401) {
                    //Now clearing the loopback values from client browser for safe logout...
                    LoopBackAuth.clearUser();
                    LoopBackAuth.clearStorage();
                    $location.nextAfterLogin = $location.path();
                    $location.path('/#/access/signin');
                }
                return $q.reject(rejection);
            }
        };
    });
}]);
