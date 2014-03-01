/*
 * https://nutty.io
 * Copyright (c) 2014 krishna.srinivas@gmail.com All rights reserved.
 * GPLv3 License <http://www.gnu.org/licenses/gpl.txt>
 */

angular.module('nuttyapp')
    .directive('tmuxButtons', function() {
        return {
            templateUrl: "templates/tmuxButtons.html",
            scope: true,
            restrict: 'E',
            replace: true,
            link: function(scope, element, attrs, Ctrl) {},
            controller: ['$scope', 'NuttySession', 'NuttyConnection', 'alertBox',
                function($scope, NuttySession, NuttyConnection, alertBox) {
                    var readonly = NuttySession.readonly;
                    $scope.btn = {
                        color: "primary",
                        value: false
                    };
                    $scope.NuttySession = NuttySession;
                    // if (NuttySession.type === "slave")
                    //     $scope.disabled = "disabled";
                    $scope.splitH = function() {
                        mixpanel.track("splitH");
                        NuttyConnection.write({
                            data: String.fromCharCode(2) + '"'
                        });
                        term.focus();
                    }
                    $scope.splitV = function() {
                        mixpanel.track("splitV");
                        NuttyConnection.write({
                            data: String.fromCharCode(2) + '%'
                        });
                        term.focus();
                    }
                    $scope.newWindow = function() {
                        mixpanel.track("newWindow");
                        NuttyConnection.write({
                            data: String.fromCharCode(2) + 'c'
                        });
                        term.focus();
                    }
                    $scope.newtmuxsession = function() {
                        mixpanel.track("newtmuxsession");
                        NuttyConnection.write({
                            newtmuxsession: true
                        });
                        term.focus();
                    }

                    $scope.resizeL = function() {
                        NuttyConnection.write({
                            data: String.fromCharCode(2, 27, 91, 49, 59, 53, 68)
                        });
                        term.focus();
                    }
                    $scope.resizeR = function() {
                        NuttyConnection.write({
                            data: String.fromCharCode(2, 27, 91, 49, 59, 53, 67)
                        });
                        term.focus();
                    }
                    $scope.resizeU = function() {
                        NuttyConnection.write({
                            data: String.fromCharCode(2, 27, 91, 49, 59, 53, 65)
                        });
                        term.focus();
                    }
                    $scope.resizeD = function() {
                        NuttyConnection.write({
                            data: String.fromCharCode(2, 27, 91, 49, 59, 53, 66)
                        });
                        term.focus();
                    }
                    $scope.markreadonly = function() {
                        if (NuttySession.type === "master") {
                            if (!Meteor.userId()) {
                                alertBox.alert("warning", "Please sign-in");
                                term.focus();
                                return;
                            }
                            mixpanel.track("markreadonly");
                            readonly = !readonly;
                            if (readonly) {
                                NuttySession.setreadonly(true);
                            } else {
                                NuttySession.setreadonly(false);
                            }
                        } else {
                            alertBox.alert("danger", "This can be set only by terminal sharer");
                        }
                        term.focus();
                    }
                    $scope.tooltiptext = function() {
                        if (readonly)
                            return "Remote read only access"
                        else
                            return "Remote read/write access";
                    }
                    $scope.btntext = function() {
                        if (readonly)
                            return "R/O";
                        else
                            return 'R/W';
                    }
                    $scope.$watch(function() {
                        return NuttySession.readonly;
                    }, function(newval) {
                        if (newval) {
                            $scope.btn.color = "danger";
                            readonly = $scope.btn.value = true;
                        } else {
                            $scope.btn.color = "primary";
                            readonly = $scope.btn.value = false;
                        }
                    });
                    $scope.$watch("btn.value", function(newval) {
                        $scope.btn.value = NuttySession.readonly;
                    });
                }
            ]
        }
    });
