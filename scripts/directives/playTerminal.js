/*
 * https://nutty.io
 * Copyright (c) 2013 krishna.srinivas@gmail.com All rights reserved.
 * GPLv3 License <http://www.gnu.org/licenses/gpl.txt>
 */

'use strict';

angular.module('nuttyApp')
    .directive('playTerminal', function() {
        return {
            templateUrl: "templateUrl/playTerminal.html",
            scope: true,
            restrict: 'E',
            link: function(scope, element, attrs, termController) {
                var term;
                var resizeElem;
                var tilebarElem;
                var terminalElem;
                var terminalIframeElem;
                var resizing = false;

                resizeElem = $(element);

                tilebarElem = scope.tilebarElem;
                terminalElem = scope.terminalElem;
                terminalIframeElem = scope.terminalIframeElem;

                scope.$watch('config', function() {
                    if (!term)
                        return;
                    resizing = true;
                    term.setWidth(scope.config.col);
                    term.setHeight(scope.config.row);
                    resizing = false;
                    resizeElem.width(terminalElem.width()).height(terminalElem.height() + tilebarElem.height() + 2);
                }, true);

                function ts(argv) {
                    this.argv_ = argv;
                    this.io = null;
                    this.pid_ = -1;
                };

                ts.init = function() {
                    scope.term = term = new hterm.Terminal();

                    //          term.decorate(terminalElem.get(0), terminalIframeElem.get(0));
                    term.decorate(terminalElem.get(0));

                    term.focuscbk = function() {
                        scope.termFocus();
                        if (!scope.insideapply)
                            scope.$apply();
                    }

                    term.setCursorPosition(0, 0);
                    term.setCursorVisible(true);
                    term.runCommandClass(ts, document.location.hash.substr(1));
                };

                ts.prototype.run = function() {
                    this.io = this.argv_.io.push();

                    this.io.onVTKeystroke = this.sendString_.bind(this);
                    //          this.io.sendString = this.sendString_.bind(this);

                    this.io.onTerminalResize = this.onTerminalResize.bind(this);
                    resizing = true;
                    term.setWidth(scope.config.col);
                    term.setHeight(scope.config.row);
                    resizeElem.width(terminalElem.width()).height(terminalElem.height() + tilebarElem.height() + 2);
                    resizing = false;
                    var top = (viewportSize.getHeight() - resizeElem.height() + 48) / 2;
                    var left = (viewportSize.getWidth() - resizeElem.width()) / 2;
                    resizeElem.offset({
                        top: top,
                        left: left
                    });
                    termController.play();
                }

                ts.prototype.sendString_ = function(string) {
                };

                ts.prototype.onTerminalResize = function(col, row) {
                    if (resizing) {
                        return;
                    }

                    if (scope.config.row === row && scope.config.col === col)
                        return;
                    scope.config.row = row;
                    scope.config.col = col;
                    scope.$apply();
                };

                resizeElem.draggable({
                    handle: tilebarElem,
                    scroll: false
                });

                lib.init(ts.init);
            },

            controller: function($scope, $timeout, NuttyUtil, PlayTermData, log) {
                $scope.hide = 0;
                $scope.resizeStyle = {};
                $scope.resizeStyle.position = "absolute";
                $scope.resizeStyle.zIndex = NuttyUtil.incZindex();
                $scope.resizeStyle.border = "1px solid grey";
                $scope.insideapply = false;
                $scope.playDone = "Playback";

                var file = $scope.config.file;
                var filestart = 0;
                var filereader;
                var time = true;
                var consoledata = "";
                var delta;

                $timeout(function() {
                    $scope.resizeStyle.zIndex = NuttyUtil.incZindex();
                }, 100);

                filereader = new FileReader();
                filereader.onload = function(e) {
                    if (time) {
                        var data = e.target.result;
                        var length;
                        var view16 = new Uint16Array(data);
                        if (view16.length === 0) {
                            $scope.playDone = "Playback - Done";
                            $scope.$apply();
                            return;
                        }
                        delta = view16[0];
                        length = view16[1];
                        if (delta === 65535) {
                            var view8 = new Uint8Array(data);
                            $scope.config.row = view8[2];
                            $scope.config.col = view8[3];
                            $scope.$apply();
                            _play();
                            return;
                        }
                        if (delta === 0)
                            delta = 5;
                        delta = delta * 10;
                        var blob = file.slice(filestart, filestart + length);
                        filestart = filestart + length;
                        time = false;
                        // readAsBinaryString reads as UTF-8 string
                        // readAsText reads as UTF-16
                        filereader.readAsBinaryString(blob);
                    } else {
                        consoledata = e.target.result;
                        setTimeout(_play, delta);
                    }
                }

                var _play = function() {
                    if (!PlayTermData.playTerms[$scope.key])
                        return;
                    $scope.term.io.writeUTF8(consoledata);
                    consoledata = "";
                    var blob = file.slice(filestart, filestart + 4);
                    filestart = filestart + 4;
                    time = true;
                    filereader.readAsArrayBuffer(blob);
                }

                this.play = function() {
                    _play();
                }

                $scope.incrementZindex = function() {
                    $scope.resizeStyle.zIndex = NuttyUtil.incZindex($scope.key);
                    $scope.insideapply = true;
                    $scope.terminalElem.focus();
                    $scope.insideapply = false;
                }

                $scope.termFocus = function() {
                    $scope.resizeStyle.zIndex = NuttyUtil.incZindex($scope.key);
                }

                $scope.closeTerm = function() {
                    delete PlayTermData.playTerms[$scope.key];
                }
            }
        };
    });
