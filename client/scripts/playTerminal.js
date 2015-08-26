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
    .directive('playTerminal', function() {
        return {
            templateUrl: 'templates/playTerminal.html',
            scope: true,
            restrict: 'E',
            link: function(scope, element, attrs, termController) {
                var term;
                var termElem;
                var outerdivElem;
                var terminalIframeElem;

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
                    height: "100%",
                    width: "100%",
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

                Nuttyterm.prototype.sendString_ = function(str) {};

                Nuttyterm.prototype.onTerminalResize = function(col, row) {};

                lib.init(function() {
                    scope.term = term = new hterm.Terminal();
                    window.term = scope.term = term;
                    term.decorate(termElem.get(0), terminalIframeElem.get(0));
                    term.windowTitle = function(title) {
                        // scope.windowTitle = title;
                        // scope.$apply();
                    }

                    term.nuttyPaste = function() {}

                    term.setCursorPosition(0, 0);
                    term.setCursorVisible(true);
                    term.vt.setDECMode('1000', true);
                    term.runCommandClass(Nuttyterm, document.location.hash.substr(1));
                    termController.start();
                });
            },
            controller: ['$scope', '$routeParams', '$http', '$location', '$rootScope', '$q', 'Compatibility',
                function($scope, $routeParams, $http, $location, $rootScope, $q, Compatibility) {
                    var sessionid = $routeParams.sessionid;
                    var rowcol = {
                        row: 24,
                        col: 80
                    };
                    var paused = 0;
                    var onFinishhack = 0;
                    var testtimeout;
                    var tindex = 0;
                    var timeout = undefined;
                    var deltatimeout = undefined;
                    var sliderinit = {
                        min: 0,
                        max: 1000,
                        type: 'single',
                        step: 1,
                        from: 0,
                        // gridMargin: 5,
                        prettify: false,
                        // hasGrid: true,
                        onFinish: function(obj) {
                            if (onFinishhack)
                                return;
                            onFinishhack = 1;
                            clearTimeout(timeout);
                            clearTimeout(deltatimeout);
                            clearTimeout(testtimeout);
                            sliderinit.from = Math.floor(obj.fromNumber / 30) * 30;
                            if (sliderinit.from === sliderinit.max) {
                                sliderinit.from = sliderinit.from - 30;
                            }
                            tindex = (sliderinit.from / 30);
                            $("#example_id").ionRangeSlider("remove");
                            $("#example_id").ionRangeSlider(sliderinit);
                            loop();
                            onFinishhack = 0;
                        },
                        onChange: function(obj) {
                            clearTimeout(testtimeout);
                        }
                    }
                    $scope.pauseplay = function() {
                        if (paused) {
                            paused = 0;
                            tindex--;
                            sliderinit.from = tindex * 30;
                            $("#example_id").ionRangeSlider("remove");
                            $("#example_id").ionRangeSlider(sliderinit);
                            loop();
                        } else {
                            paused = 1;
                            clearTimeout(timeout);
                            clearTimeout(deltatimeout);
                            clearTimeout(testtimeout);
                        }
                    }
                    $scope.btnstate = function() {
                        if (paused)
                            return "play"
                        else
                            return "pause"
                    }
                    function test () {
                        if (!(sliderinit.from < sliderinit.max))
                            return;
                        sliderinit.from += 1;
                        $("#example_id").ionRangeSlider("update", {
                            from: sliderinit.from
                        });
                        testtimeout = setTimeout(test, 1000);
                    }

                    hterm.Keyboard.KeyMap.prototype.onZoom_ = function(e, keyDef) {
                        return hterm.Keyboard.KeyActions.CANCEL;
                    };
                    // changerowcol = function(size) {
                    //     var termElem;
                    //     var outerdivElem;
                    //     var terminalIframeElem;
                    //     if (!rowcol.row)
                    //         return;
                    //     if (!$scope.term)
                    //         return;
                    //     if (!size)
                    //         size = 15;
                    //     if (size === 6)
                    //         return;
                    //     window.termElem = termElem = $scope.terminalElem;
                    //     window.outerdivElem = outerdivElem = termElem.parent();
                    //     window.terminalIframeElem = terminalIframeElem = $scope.terminalIframeElem;
                    //     // termElem.height(terminalIframeElem.height());
                    //     // termElem.width(terminalIframeElem.width());
                    //     // return;
                    //     console.log(rowcol);
                    //     console.log(size);
                    //     $scope.term.setFontSize(size);
                    //     $scope.term.setHeight(rowcol.row);
                    //     $scope.term.setWidth(rowcol.col);


                    //     termElem.height(terminalIframeElem.height());
                    //     termElem.width(terminalIframeElem.width());
                    //     // return;
                    //     setTimeout(function() {
                    //         var H = outerdivElem.height();
                    //         var W = outerdivElem.width();
                    //         var h = termElem.height();
                    //         var w = termElem.width();
                    //         if ((w < W && h < H) || (w === W && h < H)) {
                    //             termElem.css({
                    //                 left: (outerdivElem.width() - termElem.width()) / 2,
                    //                 top: (outerdivElem.height() - termElem.height()) / 2
                    //             });
                    //             return;
                    //         }
                    //         var fontsize = $scope.term.getFontSize();
                    //         fontsize--;
                    //         console.log(fontsize);
                    //         changerowcol(fontsize);
                    //     }, 0);
                    // }

                    changerowcol = function() {
                        var termElem;
                        var outerdivElem;
                        var terminalIframeElem;
                        var h, H, w, W;

                        if (!rowcol.row)
                            return;
                        if (!$scope.term)
                            return;

                        $scope.term.setFontSize(15);
                        $scope.term.setHeight(rowcol.row);
                        $scope.term.setWidth(rowcol.col);

                        terminalIframeElem = terminalIframeElem = $scope.terminalIframeElem;
                        termElem = $scope.terminalElem;
                        outerdivElem = termElem.parent();


                        while (1) {
                            H = outerdivElem.height();
                            W = outerdivElem.width();
                            h = termElem.height();
                            w = termElem.width();
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


                    // changerowcol = function(size) {
                    //     var termElem;
                    //     var outerdivElem;
                    //     if (!rowcol.row)
                    //         return;
                    //     if (!$scope.term)
                    //         return;
                    //     $scope.term.setFontSize(size);
                    //     $scope.term.setHeight(rowcol.row);
                    //     $scope.term.setWidth(rowcol.col);

                    //     setTimeout(function() {
                    //     termElem = $scope.terminalElem;
                    //     outerdivElem = termElem.parent();

                    //     var H = outerdivElem.height();
                    //     var W = outerdivElem.width();
                    //     var h = termElem.height();
                    //     var w = termElem.width();
                    //     if (w <= W && h <= H) {
                    //         termElem.css({
                    //             left: (outerdivElem.width() - termElem.width()) / 2,
                    //             top: (outerdivElem.height() - termElem.height()) / 2
                    //         });
                    //         return;
                    //     }
                    //     var fontsize = $scope.term.getFontSize();
                    //     fontsize--;
                    //     if (fontsize === 1) {
                    //         return;
                    //     }
                    //     $scope.term.setFontSize(fontsize);
                    //     $scope.term.setHeight(rowcol.row);
                    //     $scope.term.setWidth(rowcol.col);

                    //     changerowcol(fontsize);
                    //     }, 100);
                    // }
                    this.start = function() {
                            Meteor.call('recget', sessionid, "rec.json", function(err, data) {
                                if (!err) {
                                    sliderinit.max = (data.end + 1) * 30;
                                    $("#example_id").ionRangeSlider(sliderinit);
                                    loop();
                                } else {
                                    alert("Recording not yet available!");
                                }
                            });
                    }
                    $(window).resize(changerowcol);

                    function loop() {
                        Meteor.call('recget', sessionid, tindex, function(err, data) {
                            if (!err) {
                                var di = 0;
                                if (tindex === 0) {
                                    var to = term.document_.body.firstChild.firstChild;
                                    var i, j;
                                    for (i = to.firstChild; i; i = i.nextSibling) {
                                        i.innerHTML = "";
                                    }
                                    term.setCursorPosition(1, 1);
                                }
                                try {
                                    $("#example_id").ionRangeSlider("remove");
                                } catch (ex) {}
                                $("#example_id").ionRangeSlider(sliderinit);
                                clearTimeout(testtimeout);
                                test();
                                function termdata() {
                                    if (!data.length) {
                                        tindex++;
                                        loop();
                                        return;
                                    }
                                    var obj = data[di];
                                    function _f() {
                                        if (obj.data) {
                                            term.io.writeUTF8(obj.data);
                                            // term.syncCursorPosition_();
                                        } else if (obj.rowcol) {
                                            rowcol.row = obj.row;
                                            rowcol.col = obj.col;
                                            changerowcol();
                                        } else if (obj.settermshot) {
                                            window.termshot = term.document_.createElement('div');
                                            termshot.innerHTML = obj.settermshot;
                                            var to = term.document_.body.firstChild.firstChild;
                                            var i, j;
                                            for (i = to.firstChild,j = termshot.firstChild; i && j; i = i.nextSibling, j = j.nextSibling) {
                                                i.innerHTML = j.innerHTML;
                                            }
                                            term.setCursorPosition(obj.row, obj.col);
                                            term.syncCursorPosition_();
                                        }
                                        di++;
                                        if (di < data.length) {
                                            if (obj.rowcol)
                                                data[di].delta = 400;
                                            termdata();
                                        } else {
                                            if (!timeout) {
                                                loop();
                                            }
                                        }
                                    }
                                    if (!obj.delta) {
                                        _f();
                                    } else {
                                        deltatimeout = setTimeout(_f, obj.delta);
                                    }
                                }

                                termdata();
                                tindex++;
                                timeout = setTimeout(function() {
                                    timeout = undefined;
                                    if (di === data.length) {
                                        loop();
                                    }
                                }, 30 * 1000);
                            }
                        });
                    }
                }
            ]
        }
    });
