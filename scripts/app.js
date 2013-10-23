/*
 * https://nutty.io
 * Copyright (c) 2013 krishna.srinivas@gmail.com All rights reserved.
 * GPLv3 License <http://www.gnu.org/licenses/gpl.txt>
 */

'use strict';

angular.module('nuttyApp', ['ui.bootstrap', 'ngRoute', 'angular-md5'])
    .config(function($routeProvider, $locationProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'views/info.html',
                controller: 'InfoCtrl'
            })
            .when('/info', {
                templateUrl: 'views/info.html',
                controller: 'InfoCtrl'
            })
            .when('/home', {
                templateUrl: 'views/master.html',
                controller: 'MasterCtrl'
            })
            .when('/share', {
                templateUrl: 'views/slave.html',
                controller: 'SlaveCtrl'
            })
            .when('/share/:sharecode', {
                templateUrl: 'views/slave.html',
                controller: 'SlaveCtrl'
            })
            .when('/recording/:recfile', {
                templateUrl: 'views/recording.html',
                controller: 'RecordingCtrl'
            })
            .otherwise({
              templateUrl: '404.html'
            });
        $locationProvider.html5Mode(true);
    });
