/*
 * https://nutty.io
 * Copyright (c) 2014 krishna.srinivas@gmail.com All rights reserved.
 * GPLv3 License <http://www.gnu.org/licenses/gpl.txt>
 */

angular.module('nuttyapp')
    .controller('slaveCtrl', ['$scope', '$modal', '$routeParams', 'NuttySession', 'SlaveConnection', 'NuttyConnection', 'Compatibility', '$location', 'alertBox',
        function($scope, $modal, $routeParams, NuttySession, SlaveConnection, NuttyConnection, Compatibility, $location, alertBox) {
            var clientid = Session.get("clientid");
            var port = $location.port();
            var portstr = (port === 80 || port === 443) ? '' : ':' + port;
            $scope.descro = true;
            $scope.Compatibility = Compatibility;
            if (!clientid) {
                clientid = Random.id();
                Session.set("clientid", clientid);
                mixpanel.track("slaveterminal");
                ga('send', 'pageview', 'slaveterminal');
            }

            NuttySession.setslave($routeParams.sessionid, clientid);
            NuttyConnection.write = SlaveConnection.pipe.write;
            $scope.$watch(function() {
                return NuttySession.desc;
            }, function(newval) {
                $scope.desc = NuttySession.desc;
            });
            $scope.currentuser = function() {
                var user = Meteor.user();
                if (user) {
                    return user.username;
                } else {
                    return "";
                }
            };
            // $scope.slaveshow = function() {
            // 	if (Compatibility.browser.browser === "Chrome" || Compatibility.browser.browser === "Firefox")
            // 		true;
            // 	else
            // 		false;
            // }
            if (Compatibility.browser.browser === "Chrome" || Compatibility.browser.browser === "Firefox" || Compatibility.browser.browser === "Safari")
                $scope.slaveshow = true;
            Deps.autorun(function() {
                Meteor.userId();
                setTimeout(function() {
                    $scope.$apply();
                }, 0);
            });
            $scope.$watch (function(){
                return NuttySession.sessionid
            }, function(newval) {
                if (newval) {
                    setTimeout(function() {
                        alertBox.alert("success", "Recording : " + $location.protocol() + '://' + $location.host() + portstr + '/recording/' + NuttySession.sessionid);
                        $scope.$apply();
                    }, 35*1000);
                    if ($location.path().match(/^\/websocket\//)) {
                        SlaveConnection.type = 'websocket';
                    } else if ($location.path().match(/^\/webrtc\//)) {
                        SlaveConnection.type = 'webrtc';
                        if (Compatibility.browser.browser !== "Chrome") {
                            alertBox.alert("danger", "WebRTC currently supported on Chrome. Try sharing using WebSockets")
                            alert("WebRTC currently supported on Chrome. Try sharing using WebSockets")
                            return;
                        }
                    }
                    SlaveConnection.connect();
                }
            })
        }
    ]);
