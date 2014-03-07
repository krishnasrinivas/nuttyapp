/*
 * https://nutty.io
 * Copyright (c) 2014 krishna.srinivas@gmail.com All rights reserved.
 * GPLv3 License <http://www.gnu.org/licenses/gpl.txt>
 */

angular.module('nuttyapp')
    .factory('Termdevice', ['$rootScope', 'NuttySession', 'Compatibility', '$timeout', 'alertBox', '$location',
        function($rootScope, NuttySession, Compatibility, $timeout, alertBox, $location) {
            var inputcbk;
            var autoreload = false;

            function postMessage(msg) {
                msg.type = '_nutty_fromwebpage';
                window.postMessage(msg, window.location.origin);
            }

            var retobj = {
                extension: false,
                nativehost: false,
                ondata: function(cbk) {
                    inputcbk = cbk;
                },
                write: function(msg) {
                    if (!msg) {
                        console.log("Termdevice.write(): msg is null")
                        return;
                    }
                    if (msg.newtmuxsession) {
                        retobj.newtmuxsession();
                        return;
                    }
                    postMessage(msg);
                },
                newtmuxsession: function() {
                    if (!NuttySession.sessionid)
                        return;
                    postMessage({
                        unsetsessionid: true
                    });
                    postMessage({
                        setsessionid: NuttySession.sessionid
                    });
                    postMessage({
                        rowcol: 1,
                        row: NuttySession.rowcol.row,
                        col: NuttySession.rowcol.col
                    });
                }
            }
            Meteor._reload.onMigrate("onMigrate", function() {
                autoreload = true;
                return [true];
            });
            window.addEventListener('beforeunload', function(e) {
                if (!autoreload) {
                    postMessage({
                        data: String.fromCharCode(2) + 'k'
                    });
                }
            });

            window.addEventListener('message', function(event) {
                if (event.source !== window)
                    return;
                if (event.data.type !== '_nutty_fromcontentscript')
                    return;
                var msg = event.data;
                if (!msg) {
                    log.console("msg from extension is undefined");
                    return;
                }
                if (msg.nativehost === "connected") {
                    retobj.nativehost = true;
                    safeApply($rootScope);
                    return;
                } else if (msg.nativehost === "disconnected") {
                    retobj.nativehost = false;
                    safeApply($rootScope);
                    return;
                }
                if (inputcbk)
                    inputcbk(msg);
            });

            window.Termdevice = retobj;
            if (Compatibility.browser.incompatible) {
                return retobj;
            }
            // if (port) {
            //     retobj.extension = true;
            //     port.onMessage.addListener(function(msg) {
            //         if (!msg) {
            //             log.console("msg from extension is undefined");
            //             return;
            //         }
            //         if (msg.nativehost === "connected") {
            //             retobj.nativehost = true;
            //             safeApply($rootScope);
            //             return;
            //         } else if (msg.nativehost === "disconnected") {
            //             retobj.nativehost = false;
            //             safeApply($rootScope);
            //             return;
            //         }
            //         if (inputcbk)
            //             inputcbk(msg);
            //     });
            //     port.onDisconnect.addListener(function() {
            //         retobj.extension = false;
            //         console.log("nutty extension disconnected");
            //     });
            // }
            $rootScope.$watch(function() {
                return NuttySession.sessionid;
            }, function(newval) {
                if (newval) {
                    postMessage({
                        setsessionid: newval
                    });
                    $timeout (function() {
                        if (!retobj.nativehost) {
                            alertBox.alert('danger', 'Please install nutty scripts "sudo pip install nutty"');
                            $timeout (function() {
                                window.location.assign('/install');
                            }, 4000);
                        }
                    }, 2000);
                    if (Session.get("onreload")) {
                        postMessage({
                            data: String.fromCharCode(2) + 'r'
                        });
                    } else
                        Session.set("onreload", 1);
                }
            });
            return retobj;
        }
    ]);
