/*
 * https://nutty.io
 * Copyright (c) 2014 krishna.srinivas@gmail.com All rights reserved.
 * GPLv3 License <http://www.gnu.org/licenses/gpl.txt>
 */

angular.module('nuttyapp')
	.factory('Termdevice', ['$rootScope', 'NuttySession', 'Compatibility', function($rootScope, NuttySession, Compatibility) {
		var inputcbk;
        var extid = "ooelecakcjobkpmbdnflfneaalbhejmk";
        var autoreload = false;
        var port;
        var retobj = {
            extension:false,
            nativehost:false,
            ondata: function(cbk) {
                inputcbk = cbk;
            },
            write: function(msg) {
                if (!msg) {
                    console.log("Termdevice.write(): msg is null")
                    return;
                }
                if (!port) {
                    console.log("Termdevice.port is null");
                    return;
                }
                if (msg.newtmuxsession) {
                    retobj.newtmuxsession();
                    return;
                }
                port.postMessage(msg);
            },
            newtmuxsession: function() {
                if (!NuttySession.sessionid)
                    return;
                if (!port)
                    return;
                port.postMessage({
                    unsetsessionid: true
                });
                port.postMessage({
                    setsessionid: NuttySession.sessionid
                });
                port.postMessage({
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
            console.log("beforeunload");
            if (port && !autoreload) {
                console.log("killing tmux");
                port.postMessage({
                                data: String.fromCharCode(2) + 'k'
                            });
            }
        });


        window.Termdevice = retobj;
        if (Compatibility.browser.incompatible) {
            return retobj;
        }
        if (chrome.runtime)
            port = chrome.runtime.connect(extid);
        if (port) {
            retobj.extension = true;
            port.onMessage.addListener(function(msg) {
                if (!msg) {
                	log.console("msg from extension is undefined");
                    return;
                }
                if (msg.nativehost === "connected") {
                    retobj.nativehost = true;
                    safeApply($rootScope);
                    return;
                }
                else if (msg.nativehost === "disconnected") {
                    retobj.nativehost = false;
                    safeApply($rootScope);
                    return;
                }
                if (inputcbk)
                	inputcbk(msg);
            });
            port.onDisconnect.addListener (function() {
                retobj.extension = false;
                console.log ("nutty extension disconnected");
            });
        }
        $rootScope.$watch (function() {
            return NuttySession.sessionid;
        }, function(newval) {
            if (newval) {
                port.postMessage({
                    setsessionid: newval
                });
                if (Session.get("onreload")) {
                    port.postMessage({
                        data: String.fromCharCode(2) + 'r'
                    });
                } else
                    Session.set("onreload", 1);
            }
        });
        return retobj;
	}]);

