/*
 * https://nutty.io
 * Copyright (c) 2013 krishna.srinivas@gmail.com All rights reserved.
 * GPLv3 License <http://www.gnu.org/licenses/gpl.txt>
 */

'use strict';

angular.module('nuttyApp')
    .directive('slaveTerminal', function() {
        return {
            templateUrl: "templateUrl/slaveTerminal.html",
            scope: true,
            restrict: 'E',
            link: function(scope, element, attrs, termController) {
                var term;
                var resizeElem;
                var tilebarElem;
                var terminalElem;
                var terminalIframeElem;
                var resizing = false;
                var moreElem;

                resizeElem = $(element);

                tilebarElem = scope.tilebarElem;
                terminalElem = scope.terminalElem;
                terminalIframeElem = scope.terminalIframeElem;
                var moreElemHeight = scope.moreElem.height();

                scope.$watch('config', function() {
                    if (!term)
                        return;
                    resizing = true;
                    term.setWidth(scope.config.col);
                    term.setHeight(scope.config.row);
                    resizing = false;
                    resizeElem.width(terminalElem.width()).height(terminalElem.height() + tilebarElem.height() +
                        (scope.collapsed ? 0 : moreElemHeight) + 2);
                    var tmp = {};
                    tmp[scope.key] = {
                        row: scope.config.row,
                        col: scope.config.col
                    };
                    termController.peerwrite({
                        rowcolQ: tmp
                    });
                }, true);

                scope.$watch('collapsed', function(collapsed) {
                    resizeElem.width(terminalElem.width()).height(terminalElem.height() + tilebarElem.height() +
                        (collapsed ? 0 : moreElemHeight) + 2);
                });

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

                    term.windowTitle = function(title) {
                        // scope.windowTitle = title;
                        // scope.$apply();
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
                    resizeElem.width(terminalElem.width()).height(terminalElem.height() + tilebarElem.height() + (scope.collapsed ? 0 : moreElemHeight) + 2);
                    resizing = false;
                    var top = (viewportSize.getHeight() - resizeElem.height() + 48) / 2 + (scope.alternate ? 40 : 0);
                    var left = (viewportSize.getWidth() - resizeElem.width()) / 2 + (scope.alternate ? 40 : 0);

                    resizeElem.offset({
                        top: top,
                        left: left
                    });
                    termController.peerwrite({
                        id: scope.key,
                        d: '\f'
                    })
                }

                ts.prototype.sendString_ = function(string) {
                    termController.peerwrite({
                        d: string,
                        id: scope.key
                    });
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
                    scroll: false,
                    stop: function() {
                        var pos = resizeElem.position();
                        if (pos.top < 51)
                            pos.top = 51;
                        if (pos.left < 0)
                            pos.left = 0;
                        resizeElem.css(pos);
                    }
                });

                resizeElem.resizable({
                    helper: "ui-resizable-helper",
                    scroll: false
                });
                resizeElem.on("resizestop", function(e, ui) {
                    if (scope.scdata.remotero) {
                        resizeElem.width(terminalElem.width()).height(terminalElem.height() + tilebarElem.height() + (scope.collapsed ? 0 : moreElemHeight) + 2);
                        return;
                    }
                    resizing = true;
                    terminalElem.width(resizeElem.width());
                    resizing = false;
                    terminalElem.height(resizeElem.height() - tilebarElem.height() - (scope.collapsed ? 0 : moreElemHeight));
                });

                lib.init(ts.init);
            },

            controller: function($scope, $timeout, NuttyUtil, SlaveData, SlaveConnection, PlayTermData, Recording, Auth, log) {
                var record = false;
                var termRecorder;
                var recordFileName;

                $scope.hide = 0;
                $scope.resizeStyle = {};
                $scope.resizeStyle.position = "absolute";
                $scope.resizeStyle.zIndex = NuttyUtil.incZindex();
                $scope.resizeStyle.border = "1px solid grey";
                $scope.insideapply = false;
                $scope.collapsed = false;
                $scope.recBtnStyle = {};
                $scope.recBtnStyle.cursor = "pointer";
                $scope.recBtnStyle.marginLeft = "5px";
                $scope.recBtnStyle.color = "black";
                $scope.scdata = SlaveConnection.scdata;
                $scope.alternate = NuttyUtil.alternate;

                NuttyUtil.alternate = !NuttyUtil.alternate;

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
                    SlaveConnection.peerwrite({
                        closeTermQ: true,
                        id: $scope.key
                    });
                }

                $scope.clickPlus = function() {
                    $scope.collapsed = !$scope.collapsed;
                }

                $scope.record = function() {
                    if (!termRecorder) {
                        recordFileName = "slave." + SlaveConnection.scdata.sc + "." + $scope.key + ".dat";
                        termRecorder = new recordTerminal($scope.key, recordFileName, log);
                    }
                    if (record)
                        return;
                    record = true;
                    ga('send', 'event', 'slave', 'click', 'record', 1);

                    $scope.recBtnStyle.color = "red";
                    termRecorder.start(function() {
                        var tmp = {};
                        tmp[$scope.key] = {
                            row: $scope.config.row,
                            col: $scope.config.col
                        };
                        termRecorder.write({
                            rowcolA: tmp
                        });
                        SlaveConnection.peerwrite({
                            d: '\f',
                            id: $scope.key
                        });
                    });
                }

                $scope.stop = function() {
                    if (!record)
                        return;
                    record = false;
                    $scope.recBtnStyle.color = "black";
                    termRecorder.stop();
                }

                this.peerwrite = function(obj) {
                    SlaveConnection.peerwrite(obj);
                }

                $scope.upload = function() {
                    if (!termRecorder) {
                        _alert("No recording available");
                        return;
                    }
                    if (record) {
                        _alert("Recording in progress, please stop and upload");
                        return;
                    }
                    if (!$scope.recordDesc) {
                        _alert("Please enter description");
                        return;
                    }
                    if ($scope.recordDesc.length > 30) {
                        _alert("description should be < 30 chars");
                        return;
                    }
                    if (!Auth.userprofile.signedin) {
                        _alert("Please signin");
                        return;
                    }
                    ga('send', 'event', 'slave', 'click', 'upload', 1);
                    $scope.spinner = true;
                    Recording.upload(termRecorder.file, $scope.recordDesc, function(apply) {
                        $scope.spinner = false;
                        if (apply)
                            $scope.$apply();
                    });
                }

                $scope.play = function() {
                    if (!termRecorder) {
                        _alert("No recording available");
                        return;
                    }
                    if (record) {
                        _alert("Recording in progress, please stop and play");
                        return;
                    }
                    var id = NuttyUtil.gettermid();
                    PlayTermData.playTerms[id] = {
                        row: 28,
                        col: 96,
                        recfile: recordFileName,
                        file: termRecorder.file
                    };
                    return;
                }

                function _alert(message) {
                    log.warn(message);
                    $scope.message = message;
                    $timeout(function() {
                        if ($scope.message !== message)
                            return;
                        $scope.message = ""
                    }, 5000);
                }

                SlaveData.peerInput[$scope.key] = function(data) {
                    if (record)
                        termRecorder.write(data);
                    if ($scope.term)
                        $scope.term.io.writeUTF16(data.d);
                }
            }
        };
    });
