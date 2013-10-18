/*
 * https://nutty.io
 * Copyright (c) 2013 krishna.srinivas@gmail.com All rights reserved.
 * GPLv3 License <http://www.gnu.org/licenses/gpl.txt>
 */

'use strict';

angular.module('nuttyApp')
    .controller('RecordingCtrl', function($scope, $routeParams, $location, Recording, NuttyUtil, log, PlayTermData) {
        $scope.playTerms = PlayTermData.playTerms;
        $scope.spinnerStyle = {};
        var recfile = $routeParams.recfile;

        if (NuttyUtil.browser.browser != "Chrome") {
            $location.path("/info");
            return;
        }
        ga('send', 'pageview', 'recording');

        $scope.spinnerStyle.position = "relative";
        $scope.spinnerStyle.top = (viewportSize.getHeight() / 2) + "px";
        $scope.spinnerStyle.left = (viewportSize.getWidth() / 2) + "px";
        $scope.spinnerStyle.fontSize = "44px";

        Recording.download(recfile, function(file) {
            if (file) {
                $scope.spinnerhide = true;
                var id = NuttyUtil.gettermid();
                $scope.playTerms[id] = {
                    row: 28,
                    col: 96,
                    file: file
                };
            } else
                log.error ("Error downloading recording");
        });
    });
