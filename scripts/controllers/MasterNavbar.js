/*
 * https://nutty.io
 * Copyright (c) 2013 krishna.srinivas@gmail.com All rights reserved.
 * GPLv3 License <http://www.gnu.org/licenses/gpl.txt>
 */

'use strict';

angular.module('nuttyApp')
    .controller('MasterNavbarCtrl', function ($scope, NuttyTerm, NuttyUtil, MasterData, MasterConnection, Auth, UserDetailsData,$location, $http, log) {
        $scope.newTerm = function() {
            if (Object.size (MasterData.configs) == 15) {
                log.warn ("Max limit for number of terminals (15) reached");
                return;
            }

            ga('send', 'event', 'master', 'click', 'newTerm', 1);

            NuttyTerm.getkey (function(key) {
                if (key === undefined) {
                    log.error ("nutty extension not installed?");
                    return;
                }
                MasterData.configs[key] = {row: 28, col: 96};
                var tmp = {};
                tmp[key] = MasterData.configs[key];
                MasterConnection.peerwrite ({getConfigsA: tmp});
                log.info ("new terminal create : " + key);
                $scope.$apply();
            });
        };
        $scope.showLogs = function () {
            ga('send', 'event', 'master', 'click', 'showLogs', 1);
            log.visible.val = true;
            log.resizeStyle.zIndex = NuttyUtil.incZindex();
        }
        $scope.copyLink = function() {
            ga('send', 'event', 'master', 'click', 'copyLink', 1);
            copy(MasterConnection.mcdata.sharecode);
        };
        $scope.signIn = function() {
            ga('send', 'event', 'master', 'click', 'signIn', 1);
            Auth.signin();
        };
        $scope.signOut = function() {
            ga('send', 'event', 'master', 'click', 'signOut', 1);
            Auth.signout();
        };
        $scope.showRecordings = function () {
            ga('send', 'event', 'master', 'click', 'showRecordings', 1);
            UserDetailsData.visible.val = true;
            UserDetailsData.resizeStyle.zIndex = NuttyUtil.incZindex();
        };

        $scope.numberOfTerminals = function () {
            var obj = MasterData.configs;
            var size = 0, key;
            for (key in obj) {
                if (obj.hasOwnProperty(key)) size++;
            }
            return size;
        };
        $scope.numberOfViewers = function () {
            if (!MasterConnection.mcdata.conns.length)
                return 0;
            else
                return MasterConnection.mcdata.conns.length;
        }
        $scope.remotero = function () {
            ga('send', 'event', 'master', 'click', 'remotero', 1);
            MasterConnection.peerwrite({remoteroA: true,
                                        value: $scope.mcdata.remotero});
        }
        $scope.mcdata = MasterConnection.mcdata;
        $scope.userprofile = Auth.userprofile;
        NuttyTerm.getkey (function(key) {
            if (key === undefined) {
                log.error ("nutty extension not installed?");
                return;
            }
            MasterData.configs[key] = {row: 28, col: 96};
            log.debug ("new terminal create : " + key);
        });
    });
