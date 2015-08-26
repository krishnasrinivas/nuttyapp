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

angular.module('nuttyapp')
    .controller('masterCtrl', ['$scope', '$modal', '$location','NuttySession', 'ssh', 'NuttyConnection', 'alertBox', 'MasterConnection',
        function($scope, $modal, $location, NuttySession, ssh, NuttyConnection, alertBox, MasterConnection) {
            var nuttyio = $location.host() === 'nutty.io' || $location.host() === 'www.nutty.io';
            var port = $location.port();
            var portstr = (port === 80 || port === 443) ? '' : ':' + port;

            if (nuttyio)
                NuttyConnection.write = ssh.write;
            else
                NuttyConnection.write = sshext.write;

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
            $scope.$on('$locationChangeStart', function(event, next, current) {
                window.location.assign(next);
            });
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
                    setTimeout(function() {
                        alertBox.alert("success", "Recording : " + $location.protocol() + '://' + $location.host() + portstr + '/recording/' + NuttySession.sessionid);
                        $scope.$apply();
                    }, 35*1000);
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
