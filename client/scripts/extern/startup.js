/*
 * Copyright (c) 2014 krishna.srinivas@gmail.com All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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
            .when('/playback', {
                templateUrl: 'views/playback.html',
                controller: 'playbackCtrl'
            })
            .when('/recording/:sessionid', {
                template: '<play-terminal ng-style="style"></play-terminal>'
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
