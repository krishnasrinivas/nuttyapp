/*
 * https://nutty.io
 * Copyright (c) 2013 krishna.srinivas@gmail.com All rights reserved.
 * GPLv3 License <http://www.gnu.org/licenses/gpl.txt>
 */

'use strict'

angular.module('nuttyApp').
directive('logWindow', function() {
    // Runs during compile
    return {
        // name: '',
        // priority: 1,
        // terminal: true,
        scope: true, // {} = isolate, true = child, false/undefined = no change
        // cont­rol­ler: function($scope, $element, $attrs, $transclue) {},
        // require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
        restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
        // template: '',
        templateUrl: 'templateUrl/logWindow.html',
        // replace: true,
        // transclude: true,
        // compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
        link: function(scope, element, attrs, controller) {
            var resizeElem;
            var tilebarElem;
            var logwindowElem;

            resizeElem = $(element);
            tilebarElem = scope.tilebarElem;
            logwindowElem = scope.logwindowElem;

            resizeElem.draggable({
                handle: tilebarElem,
                scroll: false
            });
            resizeElem.resizable({
                helper: "ui-resizable-helper",
                scroll: false
            });
            resizeElem.on("resizestop", function(e, ui) {
                logwindowElem.width(resizeElem.width() - 2);
                logwindowElem.height(resizeElem.height() - tilebarElem.height() - 2);
            });

            var top = (viewportSize.getHeight() - resizeElem.height() + 48) / 2;
            // var left = (viewportSize.getWidth() - resizeElem.width()) / 2;
            var left = 0;
            resizeElem.offset({
                top: top,
                left: left
            });

            var log = log4javascript.getLogger();
            // var inPageAppender = new log4javascript.InPageAppender(logwindowElem.get(0), false,
            //     false, true, "100%", "100%")
            var inPageAppender = new log4javascript.InPageAppender("containerid", false,
                false, true, "100%", "100%")
            log.addAppender(inPageAppender);
            logwindowElem.width(resizeElem.width() - 2);
            logwindowElem.height(resizeElem.height() - tilebarElem.height() - 2);
            controller.setlog(log);
        },
        controller: function($scope, NuttyUtil, log) {
            $scope.resizeStyle = log.resizeStyle;
            $scope.visible = log.visible;

            $scope.visible.val = true;

            $scope.closeWindow = function() {
                $scope.visible.val = false;
            }

            $scope.incrementZindex = function() {
                $scope.resizeStyle.zIndex = NuttyUtil.incZindex();
            }

            this.setlog = function(_log) {
                log.setlog(_log);
            }
        }
    };
});

angular.module('nuttyApp')
    .directive('logwindowTilebar', function() {
        return function(scope, element) {
            scope.tilebarElem = $(element);
        }
    });

angular.module('nuttyApp')
    .directive('logwindowElement', function() {
        return function(scope, element) {
            scope.logwindowElem = $(element);
        }
    });
