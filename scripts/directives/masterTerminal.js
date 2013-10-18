/*
 * https://nutty.io
 * Copyright (c) 2013 krishna.srinivas@gmail.com All rights reserved.
 * GPLv3 License <http://www.gnu.org/licenses/gpl.txt>
 */

'use strict';

angular.module('nuttyApp')
    .directive('masterTerminal', function() {
        return {
            templateUrl: "templateUrl/masterTerminal.html",
            scope: true,
            restrict: 'E',
            link: function(scope, element, attrs, termController) {
                var term;
                var resizeElem;
                var tilebarElem;
                var terminalElem;
                var terminalIframeElem;
                var moreElem;
                var resizing = false;
                var key = scope.key;

                resizeElem = $(element);

                tilebarElem = scope.tilebarElem;
                terminalElem = scope.terminalElem;
                terminalIframeElem = scope.terminalIframeElem;
                var moreElemHeight = scope.moreElem.height();

                termController.NuttyTerm.send({
                    key: key,
                    newTerm: 1
                });
                termController.NuttyTerm.register(key, input);

                scope.$watch('config', function() {
                    if (!term)
                        return;
                    resizing = true;
                    term.setWidth(scope.config.col);
                    term.setHeight(scope.config.row);
                    resizeElem.width(terminalElem.width()).height(terminalElem.height() + tilebarElem.height() +
                        (scope.collapsed ? 0 : moreElemHeight) + 2);
                    resizing = false;
                    termController.NuttyTerm.send({
                        key: key,
                        rowcol: 1,
                        row: scope.config.row,
                        col: scope.config.col
                    });
                    var tmp = {};
                    tmp[scope.key] = {
                        row: scope.config.row,
                        col: scope.config.col
                    };
                    termController.peerwrite({
                        rowcolA: tmp
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
                    term = new hterm.Terminal();
                    window.term = scope.term = term;
                    // term.decorate(terminalElem.get(0), terminalIframeElem.get(0));
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

                    term.nuttyPaste = function() {
                        paste(function(data) {
                            term.io.writeUTF16(data);
                        });
                    }

                    term.setCursorPosition(0, 0);
                    term.setCursorVisible(true);
                    term.runCommandClass(ts, document.location.hash.substr(1));
                };

                ts.prototype.run = function() {
                    this.io = this.argv_.io.push();

                    this.io.onVTKeystroke = this.sendString_.bind(this);
                    this.io.sendString = this.sendString_.bind(this);

                    this.io.onTerminalResize = this.onTerminalResize.bind(this);
                    resizing = true;
                    term.setWidth(scope.config.col);
                    term.setHeight(scope.config.row);
                    resizeElem.width(terminalElem.width()).height(terminalElem.height() + tilebarElem.height() +
                        (scope.collapsed ? 0 : moreElemHeight) + 2);
                    resizing = false;
                    var top = (viewportSize.getHeight() - resizeElem.height() + 48) / 2;
                    var left = (viewportSize.getWidth() - resizeElem.width()) / 2;
                    resizeElem.offset({
                        top: top,
                        left: left
                    });
                    termController.NuttyTerm.send({
                        key: key,
                        rowcol: 1,
                        row: scope.config.row,
                        col: scope.config.col
                    });
                    //          termController.NuttyTerm.send ({key: key, data: "export IGNOREEOF=-1\n\f"});
                }

                ts.prototype.sendString_ = function(string) {
                    var i = 0;
                    var str;
                    while (1) {
                        str = string.substr(i, 500);
                        if (!str)
                            break;
                        i = i + 500;
                        termController.NuttyTerm.send({
                            key: key,
                            data: str
                        });
                    }
                };

                ts.prototype.onTerminalResize = function(col, row) {
                    if (resizing) {
                        return;
                    }

                    if (scope.config.row == row && scope.config.col == col)
                        return;
                    scope.config.row = row;
                    scope.config.col = col;
                    scope.$apply();
                };

                function input(msg) {
                    if (term && msg.data)
                        term.io.writeUTF16(msg.data);
                    termController.peerwrite({
                        d: msg.data,
                        id: scope.key
                    });
                }

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
                    resizing = true;
                    terminalElem.width(resizeElem.width());
                    resizing = false;
                    terminalElem.height(resizeElem.height() - tilebarElem.height() -
                        (scope.collapsed ? 0 : moreElemHeight));
                });

                lib.init(ts.init);
            },

            controller: function($scope, $timeout, NuttyUtil, NuttyTerm, MasterData, MasterConnection, PlayTermData, Recording, Auth, log) {
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
                    NuttyTerm.send({
                        key: $scope.key,
                        closeTerm: 1
                    });
                    MasterConnection.peerwrite({
                        closeTermA: true,
                        id: $scope.key
                    });
                    $timeout(function() {
                        delete MasterData.configs[$scope.key]
                    }, 100);
                }

                $scope.getSharelink = function() {
                    return "https://" + MasterConnection.getsharecode();
                }

                $scope.clickPlus = function() {
                    $scope.collapsed = !$scope.collapsed;
                }

                $scope.record = function() {
                    if (!termRecorder) {
                        recordFileName = "master." + MasterConnection.mcdata.sc + "." + $scope.key + ".dat";
                        termRecorder = new recordTerminal($scope.key, recordFileName, log);
                    }
                    if (record)
                        return;
                    ga('send', 'event', 'master', 'click', 'record', 1);
                    record = true;
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
                        NuttyTerm.send({
                            key: $scope.key,
                            data: '\f'
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
                    ga('send', 'event', 'master', 'click', 'upload', 1);
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

                this.peerwrite = function(obj) {
                    if (record)
                        termRecorder.write(obj);
                    MasterConnection.peerwrite(obj);
                }

                this.NuttyTerm = NuttyTerm;

                function _alert(message) {
                    log.warn(message);
                    $scope.message = message;
                    $timeout(function() {
                        if ($scope.message !== message)
                            return;
                        $scope.message = ""
                    }, 5000);
                }

                MasterData.peerInput[$scope.key] = function(data) {
                    var i = 0;
                    var str;
                    if (data.closeTermQ) {
                        NuttyTerm.send({
                            key: $scope.key,
                            closeTerm: 1
                        });
                        MasterConnection.peerwrite({
                            closeTermA: $scope.key,
                            id: $scope.key
                        });
                        $timeout(function() {
                            delete MasterData.configs[$scope.key]
                        }, 100);
                        return;
                    }
                    while (1) {
                        str = data.d.substr(i, 500);
                        if (!str)
                            break;
                        i = i + 500;
                        NuttyTerm.send({
                            key: $scope.key,
                            data: str
                        });
                    }
                }
            }
        };
    });


angular.module('nuttyApp')
    .directive('nuttyTilebar', function() {
        return function(scope, element) {
            scope.tilebarElem = $(element);
        }
    });

angular.module('nuttyApp')
    .directive('nuttyMore', function() {
        return function(scope, element) {
            scope.moreElem = $(element);
        }
    });

angular.module('nuttyApp')
    .directive('nuttyTerminal', function() {
        return function(scope, element) {
            scope.terminalElem = $(element);
        }
    });

angular.module('nuttyApp')
    .directive('nuttyIframe', function() {
        return function(scope, element) {
            scope.terminalIframeElem = $(element);
        }
    });

angular.module('nuttyApp')
    .directive('stopEvent', function() {
        return {
            restrict: 'A',
            scope: false,
            link: function(scope, element, attr) {
                element.bind(attr.stopEvent, function(e) {
                    e.stopPropagation();
                });
            }
        };
    });
