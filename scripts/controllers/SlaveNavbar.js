/*
 * https://nutty.io
 * Copyright (c) 2013 krishna.srinivas@gmail.com All rights reserved.
 * GPLv3 License <http://www.gnu.org/licenses/gpl.txt>
 */

'use strict';

angular.module('nuttyApp')
    .controller('SlaveNavbarCtrl', function($scope, SlaveConnection, Auth, UserDetailsData, NuttyUtil, log, SlaveData) {
        $scope.newTerm = function() {
            if (Object.size(SlaveData.configs) >= 15) {
                log.warn("Max limit for number of terminals (15) reached");
                return;
            }
            ga('send', 'event', 'slave', 'click', 'newTerm', 1);
            SlaveConnection.peerwrite({
                newTermQ: true
            });
        };
        $scope.showLogs = function() {
            ga('send', 'event', 'slave', 'click', 'showLogs', 1);
            log.visible.val = true;
            log.resizeStyle.zIndex = NuttyUtil.incZindex();
        };
        $scope.signIn = function() {
            ga('send', 'event', 'slave', 'click', 'signIn', 1);
            Auth.signin();
        };
        $scope.signOut = function() {
            ga('send', 'event', 'slave', 'click', 'signOut', 1);
            Auth.signout();
        };
        $scope.showRecordings = function() {
            ga('send', 'event', 'slave', 'click', 'showRecordings', 1);
            UserDetailsData.visible.val = true;
            UserDetailsData.resizeStyle.zIndex = NuttyUtil.incZindex();
        };

        $scope.numberOfTerminals = function() {
            var obj = SlaveData.configs;
            var size = 0,
                key;
            for (key in obj) {
                if (obj.hasOwnProperty(key)) size++;
            }
            return size;
        }
        $scope.numberOfViewers = function() {
            return SlaveConnection.scdata.peerCount;
        }
        $scope.scdata = SlaveConnection.scdata;
        $scope.userprofile = Auth.userprofile;
    });
