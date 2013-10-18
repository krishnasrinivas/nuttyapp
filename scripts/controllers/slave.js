/*
 * https://nutty.io
 * Copyright (c) 2013 krishna.srinivas@gmail.com All rights reserved.
 * GPLv3 License <http://www.gnu.org/licenses/gpl.txt>
 */

'use strict';

angular.module('nuttyApp')
    .controller('SlaveCtrl', function($scope, $routeParams, SlaveConnection, SlaveData, PlayTermData, NuttyUtil, $location, log) {
        $scope.configs = SlaveData.configs;
        $scope.playTerms = PlayTermData.playTerms;
        $scope.spinnerStyle = {};
        $scope.spinnerStyle.position = "relative";
        $scope.spinnerStyle.top = (viewportSize.getHeight() / 2) + "px";
        $scope.spinnerStyle.left = (viewportSize.getWidth() / 2) + "px";
        $scope.spinnerStyle.fontSize = "44px";

        if (NuttyUtil.browser.browser != "Chrome") {
            $location.path("/info");
            return;
        } else
            ga('send', 'pageview', 'slave');

        SlaveConnection.setSharecode($routeParams.sharecode);
        SlaveConnection.connect(function() {
            $scope.spinnerhide = true;
            $scope.peerConnected = true;
            $scope.$apply();
        });
    });
