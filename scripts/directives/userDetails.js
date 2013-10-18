/*
 * https://nutty.io
 * Copyright (c) 2013 krishna.srinivas@gmail.com All rights reserved.
 * GPLv3 License <http://www.gnu.org/licenses/gpl.txt>
 */

'use strict'

angular.module('nuttyApp').
    directive('userDetails', function(){
        return {
            scope: true, // {} = isolate, true = child, false/undefined = no change
            restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
            templateUrl: 'templateUrl/userDetails.html',
            link: function(scope, element, attrs, controller) {
                var resizeElem;
                var tilebarElem;
                var tbodyElem;

                resizeElem = $(element);
                tilebarElem = scope.tilebarElem;
                tbodyElem = scope.tbodyElem;
                resizeElem.draggable({ handle: tilebarElem, scroll: false, stop: function () {
                    var pos = resizeElem.position();
                    if (pos.top < 51)
                        pos.top = 51;
                    if (pos.left < 0)
                        pos.left = 0;
                    resizeElem.css(pos);
                } });
                resizeElem.resizable({ helper: "ui-resizable-helper", scroll: false});

                tbodyElem.width(resizeElem.width()-20);
                tbodyElem.height(resizeElem.height() - tilebarElem.height() - 20);

                resizeElem.on ("resizestop", function(e, ui) {
                    tbodyElem.width(resizeElem.width() - 20);
                    tbodyElem.height(resizeElem.height() - tilebarElem.height() - 20);
                });

                var top = (viewportSize.getHeight() - resizeElem.height() + 48) / 2;
                var left = (viewportSize.getWidth() - resizeElem.width()) / 2;
                resizeElem.offset({top: top, left: left});
            },
            controller: function ($scope, NuttyUtil, $http, $location, Recording, PlayTermData, UserDetailsData, log, NuttyTerm) {
                $scope.resizeStyle = UserDetailsData.resizeStyle;
                $scope.visible = UserDetailsData.visible;
                $scope.recordings = {};

                $scope.$watch('visible.val', function() {
                    if ($scope.visible.val)
                        $scope.refresh();
                });

                $scope.refresh = function () {
                    log.debug("recordings refresh()");
                    $scope.spinnershow = true;
                    var userDetailsURL = $location.$$protocol + "://" + $location.$$host + '/api/user/detail';
                    $http ({method:'GET', url: userDetailsURL}).
                    success (function(data, status) {
                        $scope.spinnershow = false;
                        if (data.error) {
                            log.info ("User not signedin");
                            return;
                        }
                        log.debug("number of recordings : " + data.recordings.length);
                        for (var i = 0; i < data.recordings.length; i++) {
                            var k = data.recordings[i].substr(0, 24);
                            var v = data.recordings[i].substr(25);
                            $scope.recordings[k] = v;
                        }
                    }).
                    error (function(data, status) {
                        $scope.spinnershow = false;
                        log.error ("error during GET for /api/user/detail");
                    });
                }

                $scope.play = function (k) {
                    log.debug ("play recording: " + $scope.recordings[k]);
                    Recording.download(k, function (data) {
                        if (data){
                            var id = NuttyUtil.gettermid();
                            PlayTermData.playTerms[id] = {row: 28, col: 96, file: data};
                        } else
                            log.error ("Error downloading recording");
                    });
                }

                $scope.closeWindow = function () {
                    $scope.visible.val = false;
                }

                $scope.removeRecording = function (k, v) {
                    log.debug ("delete recording: " + $scope.recordings[k]);
                    Recording.remove(k, v, function (data) {
                        if (!data.error) {
                            delete $scope.recordings[k];
                        }
                    });
                }

                $scope.incrementZindex = function () {
                    $scope.resizeStyle.zIndex = NuttyUtil.incZindex();
                }

                $scope.copyRecLink = function(k) {
                    copy ("https://nutty.io/recording/" + k);
                    log.debug("Copied to clipboard: " + "https://nutty.io/recording/" + k)
                }

                $scope.refresh();
            }
        };
    });

angular.module('nuttyApp')
    .directive('userdetailsTilebar', function() {
        return function(scope, element) {
                scope.tilebarElem = $(element);
        }
    });

angular.module('nuttyApp')
    .directive('tbodyElement', function() {
        return function(scope, element) {
                scope.tbodyElem = $(element);
        }
    });
