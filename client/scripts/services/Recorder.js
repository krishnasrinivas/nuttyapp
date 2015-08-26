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

window.buffer = [];

angular.module('nuttyapp')
    .factory('Recorder', ['$rootScope', 'NuttySession', '$http',
        function($rootScope, NuttySession, $http) {
            var tindex = 0;
            var time = 0;
            function loop () {
                var buffers = JSON.stringify(buffer);
                buffer = [];
                Meteor.call('recput',NuttySession.sessionid, tindex, buffers, function(err, data) {
                    if (err) {
                        console.log("error while recput");
                    }
                });
                time = 0;
                tindex++;
                var termshot = term.document_.body.firstChild.firstChild.innerHTML;
                buffer.push({
                    rowcol: 1,
                    row: term.screenSize.height,
                    col: term.screenSize.width
                });
                buffer.push({
                    settermshot: termshot,
                    row: term.getCursorRow(),
                    col: term.getCursorColumn(),
                    delta: 0
                });
                setTimeout(loop, 30 * 1000);
            }
            setTimeout(loop, 30 * 1000);
            function start(recordFileName, create, startcbk) {
            }

            function stop() {
            }

            function write(obj) {
                if (!time) {
                    time = new Date();
                    obj.delta = 0;
                    buffer.push(obj);
                } else {
                    var time2 = new Date();
                    var delta = time2 - time;
                    time = time2;
                    obj.delta = delta;
                    buffer.push(obj)
                }
            }

            window.onbeforeunload = function() {
                var buffers = JSON.stringify(buffer);
                buffer = [];
                Meteor.call('recput',NuttySession.sessionid, tindex, buffers, function(err, data) {
                    if (err) {
                        console.log("error while recput");
                    }
                });
                return;
            }
            var retobj = {
                start: start,
                stop: stop,
                write: write
            }
            return retobj;
        }
    ]);
