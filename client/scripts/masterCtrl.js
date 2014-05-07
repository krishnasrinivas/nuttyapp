/*
 * https://nutty.io
 * Copyright (c) 2014 krishna.srinivas@gmail.com All rights reserved.
 * GPLv3 License <http://www.gnu.org/licenses/gpl.txt>
 */

angular.module('nuttyapp')
    .controller('masterCtrl', ['$scope', '$modal', '$location','NuttySession', 'ssh', 'NuttyConnection', 'alertBox', 'MasterConnection',
        function($scope, $modal, $location, NuttySession, ssh, NuttyConnection, alertBox, MasterConnection) {
            NuttyConnection.write = ssh.write;
            var port = $location.port();
            var portstr = (port === 80 || port === 443) ? '' : ':' + port;

            if (!localStorage['conntype'])
                localStorage['conntype'] = 'websocket';

            if (!Session.get("autoreload")) {
                mixpanel.track("masterterminal");
                ga('send', 'pageview', 'masterterminal');
                Session.set("autoreload", 1);
            }
            $scope.$watch(function() {
                return NuttySession.desc
            }, function(newval) {
                $scope.desc = NuttySession.desc;
            })
            $scope.currentuser = function() {
                var user = Meteor.user();
                if (user) {
                    return user.username;
                } else {
                    return "";
                }
            };
            $scope.descsubmit = function() {
                NuttySession.setdesc($scope.desc);
                mixpanel.track("descsubmit");
                setTimeout(termfocus, 0);
            }
            $scope.descblur = function() {
                $scope.desc = NuttySession.desc;
            }
            $scope.copysharelink = function() {
                mixpanel.track("copysharelink", {
                    clickedon: "input"
                });
                var elem = document.getElementById("sharelinkbox")
                elem.focus();
                elem.select();
            }
            Deps.autorun(function() {
                Meteor.userId();
                setTimeout(function() {
                    $scope.$apply();
                }, 0);
            });
            $scope.MasterConnection = MasterConnection;
            MasterConnection.type = localStorage['conntype'];
            $scope.$watch('MasterConnection.type', function(newval) {
                localStorage['conntype'] = newval;
                $scope.sharelink = $location.protocol() + '://' + $location.host() + portstr + '/' + localStorage['conntype'] + '/' + NuttySession.sessionid;
                NuttySession.setconntype(newval);
            });
            $scope.$watch(function() {
                return NuttySession.sessionid;
            }, function(newval, oldval) {
                if (newval) {
                    $scope.sharelink = $location.protocol() + '://' + $location.host() + portstr + '/' + localStorage['conntype'] + '/' + NuttySession.sessionid;
                } else
                    $scope.sharelink = "waiting for server...";
            });
            $scope.$watch(function() {
                return NuttySession.masterid;
            }, function(newval, oldval) {
                if (newval) {
                    NuttySession.setconntype(MasterConnection.type);
                }
            });
        }
    ]);
