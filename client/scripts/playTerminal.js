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

                if (scope.Compatibility.browser.browser !== "Chrome")
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
                };

                Nuttyterm.prototype.onTerminalResize = function(col, row) {
                };

                termController.fromRecording(function(msg) {
                	if (term && msg && msg.data) {
                        term.io.writeUTF16(msg.data);
                	}
                });

                lib.init (function() {
                    scope.term = term = new hterm.Terminal();
                    window.term = scope.term = term;
                    term.decorate(termElem.get(0), terminalIframeElem.get(0));
                    term.windowTitle = function(title) {
                        // scope.windowTitle = title;
                        // scope.$apply();
                    }

                    term.nuttyPaste = function() {
                    }

                    term.setCursorPosition(0, 0);
                    term.setCursorVisible(true);
                    term.vt.setDECMode('1000', true);
                    term.runCommandClass(Nuttyterm, document.location.hash.substr(1));
                    // setTimeout(function() {
                        termController.start();
                    // }, 500);
                });
            },
            controller: ['$scope', '$routeParams', '$http', '$location', 'Player', 'Compatibility', function($scope, $routeParams, $http, $location, Player, Compatibility) {
                var ctrl = this;
                var play = true;
                var rowcol = {
                    row: 24,
                    col: 80
                };
                $scope.Compatibility = Compatibility;
                if (Compatibility.browser.browser !== "Chrome")
                    return;
                $scope.$parent.showdownloadprogress = true;
                $("#progressbarid").height($("#btngroupid").height());
                $("#timerid").height($("#btngroupid").height());
                hterm.Keyboard.KeyMap.prototype.onZoom_ = function(e, keyDef) {
                  return hterm.Keyboard.KeyActions.CANCEL;
                };

                $scope.playpause = function() {
                    if (Player.pausevar)
                        Player.play();
                    else if (Player.playvar)
                        Player.pause();
                    else
                        Player.replay();
                    term.focus();
                }
                $scope.playpauseicon = function() {
                    if (Player.pausevar)
                        return "play";
                    else if (Player.playvar)
                        return "pause";
                    else
                        return "play";
                }
                $scope.playpauseactive = function() {
                    if (Player.playvar)
                        return "active";
                    if (Player.pausevar)
                        return "active";
                    return "";
                }
                $scope.replay = function() {
                    Player.replay();
                    term.focus();
                }
                $scope.playprogress = function() {
                    return Player.progress;
                }
                $scope.timercountstr = function() {
                    return Player.time;
                }
            	this.fromRecording = function(cbk) {
            	}

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
                        left: (outerdivElem.width()-termElem.width())/2,
                        top: (outerdivElem.height()-termElem.height())/2
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
                $scope.focus = function() {
                    console.log("focused here");
                    $scope.term.focus();
                }

                function errorHandler(e) {
                    var msg = '';

                    switch (e.code) {
                        case FileError.QUOTA_EXCEEDED_ERR:
                            msg = 'QUOTA_EXCEEDED_ERR';
                            break;
                        case FileError.NOT_FOUND_ERR:
                            msg = 'NOT_FOUND_ERR';
                            break;
                        case FileError.SECURITY_ERR:
                            msg = 'SECURITY_ERR';
                            break;
                        case FileError.INVALID_MODIFICATION_ERR:
                            msg = 'INVALID_MODIFICATION_ERR';
                            break;
                        case FileError.INVALID_STATE_ERR:
                            msg = 'INVALID_STATE_ERR';
                            break;
                        default:
                            msg = 'Unknown Error';
                            break;
                    };
                    console.log("recordTerminal error " + msg);
                }
            this.start = function() {
                var filename = Session.get("filename");
                console.log(filename);
                if (filename) {
                    console.log("filename already set");
                    $scope.$parent.showdownloadprogress = false;
                    $scope.$apply();
                    var onInitFs_record = function(fs) {
                        fs.root.getFile(filename, {
                        }, function(fileEntry) {
                            fileEntry.file(function(_file) {
                                Player.start(_file, function (data) {
                                    term.io.writeUTF16(data);
                                },
                                function(_rowcol) {
                                    rowcol = _rowcol;
                                    console.log('changerowcol');
                                    ctrl.changerowcol()
                                });
                                Player.play();
                            }, errorHandler);
                        }, errorHandler);
                    };

                    navigator.webkitTemporaryStorage.requestQuota(1024 * 1024, function(grantedBytes) {
                        window.webkitRequestFileSystem(TEMPORARY, grantedBytes, onInitFs_record, errorHandler);
                    }, function(e) {
                        log.error('Error', e);
                    });
                } else {
                    Meteor.call('s3downloadinfo', $routeParams.remotefilename, function(err, data) {
                        if (err) {
                              alertBox.alert("danger", "Server err during download");
                              $scope.$apply();
                        } else {
                            var xhr = new XMLHttpRequest();
                            var _downloaderror = false;
                            xhr.addEventListener("error", downloaderror);
                            xhr.addEventListener("progress", downloadprogressupdate);
                            xhr.addEventListener("load", downloadcomplete);
                            xhr.responseType = 'blob';
                            var getstr = "https://nutty.s3.amazonaws.com/" + $routeParams.remotefilename + "?AWSAccessKeyId=" + data.AWSAccessKeyId + "&Expires=" + data.Expires + "&Signature=" + encodeURIComponent(data.Signature);
                            xhr.open('GET', getstr, true);
                            $scope.$parent.downloadprogress = 10;
                            safeApply($scope);
                            function downloadprogressupdate(event) {
                                if(event.lengthComputable) {
                                      var percent = event.loaded / event.total * 100;
                                      console.log(percent);
                                      $scope.$parent.downloadprogress = Math.floor(percent);
                                      $scope.$apply();
                                }
                            }
                            function downloaderror(event) {
                                _downloaderror = true;
                            }
                            function downloadcomplete(event) {
                                console.log("recording downloaded!");
                                $scope.$parent.showdownloadprogress = false;
                                $scope.$apply();
                                Player.start(xhr.response, function (_data) {
                                    term.io.writeUTF16(_data);
                                },
                                function(_rowcol) {
                                    rowcol = _rowcol;
                                    console.log('changerowcol');
                                    ctrl.changerowcol()
                                });
                                Player.play();
                            }
                            xhr.send();
                        }
                    });
                }
            }
            }]
        }
	});

