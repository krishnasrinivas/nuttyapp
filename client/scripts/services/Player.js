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
    .factory('Player', ['$rootScope',
        function($rootScope) {
            var filestart = 0;
            var filereader;
            var time = true;
            var consoledata = "";
            var delta;
            var file;
            var write;
            var changerowcol;
            var replayvar = false;
            var timeoutvar;
            var timercount = 0;
            var timer;

            function start(_file, _write, _changerowcol, _termshot, _curspos) {
                file = _file;
                write = _write;
                changerowcol = _changerowcol;
                filereader = new FileReader();
                filereader.onload = function(e) {

                    if (time) {
                        var data = e.target.result;
                        var length;
                        var view16 = new Uint16Array(data);
                        if (view16.length === 0) {
                            retobj.playvar = false;
                            clearTimeout(timer);
                            $rootScope.$apply();
                            return;
                        }
                        delta = view16[0];
                        length = view16[1];
                        if (delta === 65535) {
                            var view8 = new Uint8Array(data);
                            changerowcol({
                                row: view8[2],
                                col: view8[3]
                            });
                            _play();
                            return;
                        } else if (delta === 65534) {

                        } else if (delta === 65533) {
                            var view8 = new Uint8Array(data);
                            _curspos({
                                row: view8[2],
                                col: view8[3]
                            });
                            _play();
                            return;
                        } else {
                            if (delta === 0)
                                delta = 5;
                            delta = delta * 10;
                        }
                        var blob = file.slice(filestart, filestart + length);
                        filestart = filestart + length;
                        time = false;
                        // readAsBinaryString reads as UTF-8 string
                        // readAsText reads as UTF-16
                        // if (delta === 65534)
                        //     filereader.readAsText(blob);
                        // else
                        //     filereader.readAsBinaryString(blob);
                        filereader.readAsText(blob);
                    } else {
                        consoledata = e.target.result;
                        if (delta === 65534) {
                            _termshot(consoledata);
                            consoledata = "";
                            _play();
                        } else
                            timeoutvar = setTimeout(_play, delta);
                    }
                }
            }
            var _play = function() {
                // term.io.writeUTF8(consoledata);
                if (retobj.pausevar)
                    return;
                if (consoledata)
                    write(consoledata);
                retobj.progress = Math.floor(filestart / file.size * 100);
                safeApply($rootScope);
                consoledata = "";
                var blob = file.slice(filestart, filestart + 4);
                filestart = filestart + 4;
                time = true;
                filereader.readAsArrayBuffer(blob);
            }

                function play() {
                    if (!file)
                        return;
                    retobj.pausevar = false;
                    retobj.playvar = true;
                    timerstart();
                    _play();
                }

                function pause() {
                    if (!file)
                        return;
                    retobj.pausevar = true;
                    retobj.playvar = false;
                    clearTimeout(timer);
                }

                function replay() {
                    if (!file)
                        return;
                    if (timeoutvar) {
                        clearTimeout(timeoutvar);
                        timeoutvar = undefined;
                    }
                    clearTimeout(timer);
                    timercount = 0;
                    filestart = 0;
                    play();
                }

                function timerstart() {
                    timer = setTimeout(function() {
                        timercount++;
                        var min, sec;
                        min = Math.floor(timercount / 60);
                        sec = Math.floor(timercount % 60);
                        retobj.time = min.toString() + ":" + sec.toString();
                        $rootScope.$apply();
                        timerstart();
                    }, 1000);
                }
            var retobj = {
                start: start,
                play: play,
                pause: pause,
                replay: replay,
                progress: 0,
                time: "0:0",
                pausevar: false,
                playvar: false,
                playback: undefined
            }
            window.Player = retobj;
            return retobj;
        }
    ]);
