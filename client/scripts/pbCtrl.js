/*
 * https://nutty.io
 * Copyright (c) 2014 krishna.srinivas@gmail.com All rights reserved.
 * GPLv3 License <http://www.gnu.org/licenses/gpl.txt>
 */

angular.module('nuttyapp')
    .controller('pbCtrl', ['$scope', '$routeParams', '$http', '$location',
        function($scope, $routeParams, $http, $location) {
            var ctrl = this;
            var play = true;
            var sessionid = $routeParams.sessionid;
            var rowcol = {
                row: 24,
                col: 80
            };
            hterm.Keyboard.KeyMap.prototype.onZoom_ = function(e, keyDef) {
                return hterm.Keyboard.KeyActions.CANCEL;
            };
            this.changerowcol = function() {
                var termElem;
                var outerdivElem;
                if (!rowcol.row)
                    return;
                if (!$scope.term)
                    return;
                $scope.term.setFontSize(15);
                $scope.term.setHeight(rowcol.row);
                $scope.term.setWidth(rowcol.col);

                termElem = $scope.terminalElem;
                outerdivElem = termElem.parent();

                while (1) {
                    var H = outerdivElem.height();
                    var W = outerdivElem.width();
                    var h = termElem.height();
                    var w = termElem.width();
                    if (w < W && h < H)
                        break;
                    var fontsize = $scope.term.getFontSize();
                    fontsize--;
                    $scope.term.setFontSize(fontsize);
                    $scope.term.setHeight(rowcol.row);
                    $scope.term.setWidth(rowcol.col);
                }

                termElem.css({
                    left: (outerdivElem.width() - termElem.width()) / 2,
                    top: (outerdivElem.height() - termElem.height()) / 2
                });
            }
            $(window).resize(ctrl.changerowcol);

            function _f() {
                if ($scope.term && ($scope.term.screenSize.height !== rowcol.row ||
                    $scope.term.screenSize.width !== rowcol.col)) {
                    ctrl.changerowcol();
                }
                setTimeout(_f, 1000);
            }
            _f();
            var tindex = 0;
            var tdelta = 0;
            function loop() {
                $http({method: 'GET', url: 'http://localhost:9090/recording/' + sessionid + '/' + tindex}).
                    success(function(data, status, headers, config) {
                        console.log(data);
                        tindex++;
                        setTimeout(loop, 30 * 1000);
                    }).
                    error(function() {
                        console.log("GET error");
                        tindex++;
                        loop();
                    })
            }
            loop();
        }
    ]);
