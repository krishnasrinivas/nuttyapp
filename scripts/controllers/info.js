/*
 * https://nutty.io
 * Copyright (c) 2013 krishna.srinivas@gmail.com All rights reserved.
 * GPLv3 License <http://www.gnu.org/licenses/gpl.txt>
 */

'use strict';

angular.module('nuttyApp')
    .controller('InfoCtrl', function($scope, $location, NuttyTerm, NuttyUtil) {
        var exturl = "https://chrome.google.com/webstore/detail/ooelecakcjobkpmbdnflfneaalbhejmk";
        if (NuttyTerm.extension.installed) {
            if ($location.path() == '/') {
                $location.path('/home');
                return;
            }
            $scope.installStatus = "extension already installed";
        }
        ga('send', 'pageview', 'info');

        $scope.extension = NuttyTerm.extension;
        $scope.browser = NuttyUtil.browser;
        $scope.install_ext = function() {
            if (NuttyTerm.extension.installed) {
                alert("extension already installed!");
                return;
            }
            if (NuttyUtil.browser.incompatible) {
                alert("browser or OS not supported");
                return;
            }
            $scope.installStatus = "installing .... please wait...";
            chrome.webstore.install(exturl,
                function() {
                    ga('send', 'event', 'installbutton', 'click', 'success', 1);
                    $scope.installStatus = "extension installation done!";
                    $scope.$apply();
                },
                function(errstr) {
                    if (errstr.match(/cancelled install/i)) {
                        ga('send', 'event', 'installbutton', 'click', 'failCancel', 1);
                    } else {
                        ga('send', 'event', 'installbutton', 'click', 'failOther', 1);
                    }
                    $scope.installStatus = "extension installation failed : " + errstr;
                    $scope.$apply();
                });
        }
    });
