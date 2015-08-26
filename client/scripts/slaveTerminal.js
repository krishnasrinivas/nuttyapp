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
    .directive('slaveTerminal', function() {
        return {
            //            templateUrl: "templates/slaveTerminal.html",
            template: "<div nutty-terminal ng-style='termstyle'>\
    <iframe nutty-iframe style='border:0px; width:100%; height:100%; position:relative'></iframe>\
    </div>",
            scope: true,
            restrict: 'E',
            link: function(scope, element, attrs, termController) {
                var term;
                var termElem;
                var outerdivElem;
                var terminalIframeElem;

                if (scope.incompatible)
                    return;

                termElem = scope.terminalElem;
                outerdivElem = scope.outerdivElem;
                terminalIframeElem = scope.terminalIframeElem;
                scope.style = {
                    height: "100%",
                    width: "100%",
                    position: "absolute",
                    background: "grey"
                };

                scope.termstyle = {
                    position: "relative"
                };

                function Nuttyterm(argv) {
                    this.argv_ = argv;
                    this.io = null;
                    this.pid_ = -1;
                }

                Nuttyterm.prototype.run = function() {
                    this.io = this.argv_.io.push();

                    this.io.onVTKeystroke = this.sendString_.bind(this);
                    this.io.sendString = this.sendString_.bind(this);
                    this.io.onTerminalResize = this.onTerminalResize.bind(this);
                }

                Nuttyterm.prototype.sendString_ = function(str) {
                    termController.toConnection({
                        data: str
                    });
                };

                Nuttyterm.prototype.onTerminalResize = function(col, row) {
                    //                    termController.toTermdevice({rowcol:1, row:row, col:col});
                };

                termController.fromConnection(function(msg) {
                    if (term && msg && msg.data) {
                        term.io.writeUTF8(msg.data);
                        term.syncCursorPosition_();
                    }
                    if (term && msg && msg.settermshot) {
                        console.log("got settermshot");
                        window.termshot = term.document_.createElement('div');
                        termshot.innerHTML = msg.settermshot;
                        var to = term.document_.body.firstChild.firstChild;
                        var i, j;
                        for (i = to.firstChild,j = termshot.firstChild; i && j; i = i.nextSibling, j = j.nextSibling) {
                            i.innerHTML = j.innerHTML;
                        }
                    }
                    if (term && msg && msg.setcursorposition) {
                        term.setCursorPosition(msg.setcursorposition.row, msg.setcursorposition.col);
                        term.syncCursorPosition_();
                    }
                });
                lib.init(function() {
                    scope.term = term = new hterm.Terminal();
                    window.term = scope.term = term;
                    term.decorate(termElem.get(0), terminalIframeElem.get(0));
                    term.windowTitle = function(title) {
                        // scope.windowTitle = title;
                        // scope.$apply();
                    }

                    term.nuttyPaste = function() {
                        termController.paste();
                    }

                    // term.focuscbk = function() {
                    //     console.log("focused here");
                    //     term.focus();
                    // }

                    term.setCursorPosition(0, 0);
                    term.setCursorVisible(true);
                    // term.vt.setDECMode('1000', true);
                    term.runCommandClass(Nuttyterm, document.location.hash.substr(1));
                    termController.changerowcol();
                });
            },
            controller: ['$scope', 'SlaveConnection', 'NuttySession', 'Compatibility',
                function($scope, SlaveConnection, NuttySession, Compatibility) {
                    var ctrl = this;

                    if (Compatibility.browser.browser !== "Chrome" && Compatibility.browser.browser !== "Firefox" && Compatibility.browser.browser !== "Safari") {
                        $scope.incompatible = true;
                        return;
                    }

                    hterm.Keyboard.KeyMap.prototype.onZoom_ = function(e, keyDef) {
                        return hterm.Keyboard.KeyActions.CANCEL;
                    };
                    this.paste = function() {
                        Clipboard.paste();
                    }
                    this.fromConnection = function(cbk) {
                        SlaveConnection.pipe.ondata(function(msg) {
                            cbk(msg);
                        });
                    }
                    this.toConnection = function(msg) {
                        SlaveConnection.pipe.write(msg);
                    }

                    function setrowcolfont() {
                        if (!NuttySession.rowcol.row)
                            return;
                        if (!$scope.term)
                            return;
                        $scope.term.setHeight(NuttySession.rowcol.row);
                        $scope.term.setWidth(NuttySession.rowcol.col);
                    }
                    this.changerowcol = function() {
                        var termElem;
                        var outerdivElem;
                        if (!NuttySession.rowcol.row)
                            return;
                        if (!$scope.term)
                            return;
                        var fontsize = 15;
                        $scope.term.setFontSize(fontsize);
                        $scope.term.setHeight(NuttySession.rowcol.row);
                        $scope.term.setWidth(NuttySession.rowcol.col);

                        termElem = $scope.terminalElem;
                        outerdivElem = termElem.parent();

                        while (1) {
                            var H = outerdivElem.height();
                            var W = outerdivElem.width();
                            var h = termElem.height();
                            var w = termElem.width();
                            if (w < W && h < H)
                                break;
                            // var fontsize = $scope.term.getFontSize();
                            fontsize--;
                            $scope.term.setFontSize(fontsize);
                            $scope.term.setHeight(NuttySession.rowcol.row);
                            $scope.term.setWidth(NuttySession.rowcol.col +
                                (Compatibility.ismobile ? 1:0));
                        }

                        termElem.css({
                            left: (outerdivElem.width() - termElem.width()) / 2,
                            top: (outerdivElem.height() - termElem.height()) / 2
                        });

                    }
                    $scope.$watch(function() {
                        return NuttySession.rowcol
                    }, function(newval, oldval) {
                        ctrl.changerowcol();
                    }, true);
                    $(window).resize(ctrl.changerowcol);
                    function _f() {
                        if ($scope.term && ($scope.term.screenSize.height !== NuttySession.rowcol.row ||
                            $scope.term.screenSize.width !== NuttySession.rowcol.col)) {
                            ctrl.changerowcol();
                        }
                        setTimeout(_f, 1000);
                    }
                    _f();
                    $scope.focus = function() {
                        console.log("focused here");
                        $scope.term.focus();
                    }
                }
            ]
        }
    });
