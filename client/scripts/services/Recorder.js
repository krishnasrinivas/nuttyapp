/*
 * https://nutty.io
 * Copyright (c) 2014 krishna.srinivas@gmail.com All rights reserved.
 * GPLv3 License <http://www.gnu.org/licenses/gpl.txt>
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
