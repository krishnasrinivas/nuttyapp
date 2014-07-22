/*
 * https://nutty.io
 * Copyright (c) 2014 krishna.srinivas@gmail.com All rights reserved.
 * GPLv3 License <http://www.gnu.org/licenses/gpl.txt>
 */

nuttyapp = angular.module("nuttyapp", ["ui.bootstrap", "ngRoute", "angularSpinner"]);

nuttyapp.config(['$interpolateProvider', '$routeProvider', '$locationProvider',
    function($interpolateProvider, $routeProvider, $locationProvider) {
        $interpolateProvider.startSymbol('[[');
        $interpolateProvider.endSymbol(']]');
        $locationProvider.html5Mode(true);

        $routeProvider
            .when('/', {
                templateUrl: 'views/index.html',
                controller: 'indexCtrl'
            })
            .when('/login', {
                templateUrl: 'views/login.html',
                controller: 'loginCtrl'
            })
            .when('/verify-email/:token', {
                templateUrl: 'views/login.html',
                controller: 'loginCtrl'
            })
            .when('/reset-password/:token', {
                templateUrl: 'views/resetPassword.html',
                controller: 'resetPasswordCtrl'
            })
            .when('/sharedsessions', {
                templateUrl: 'views/sharedsessions.html',
                controller: 'sharedsessionsCtrl'
            })
            .when('/faq', {
                templateUrl: 'views/faq.html',
                controller: [function() {
                    ga('send', 'pageview', 'faq');
                }]
            })
            .when('/uploads', {
                templateUrl: 'views/uploads.html',
                controller: 'uploadsCtrl'
            })
            .when('/localrecord/:filename', {
                template: '<div></div>',
                controller: 'localrecordCtrl'
            })
            .when('/localplay', {
                template: '<play-terminal ng-style="style"></play-terminal>'
            })
            .when('/recording/:remotefilename', {
                templateUrl: 'views/remoterecord.html',
                controller: 'remoterecordCtrl'
            })
            .when('/share', {
                templateUrl: 'views/master.html',
                controller: 'masterCtrl'
            })
            .when('/scripts', {
                templateUrl: 'views/scripts.html',
                controller: 'scriptsCtrl'
            })
            .when('/websocket/:sessionid', {
                templateUrl: 'views/slave.html',
                controller: 'slaveCtrl'
            })
            .when('/webrtc/:sessionid', {
                templateUrl: 'views/slave.html',
                controller: 'slaveCtrl'
            })
            .otherwise({
                templateUrl: 'views/404.html'
            });
    }
]);
