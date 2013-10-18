/*
 * https://nutty.io
 * Copyright (c) 2013 krishna.srinivas@gmail.com All rights reserved.
 * GPLv3 License <http://www.gnu.org/licenses/gpl.txt>
 */

'use strict'

angular.module('nuttyApp').
    service('NuttyTerm', function (log, $rootScope, $timeout, NuttyUtil) {
        var extid = "ooelecakcjobkpmbdnflfneaalbhejmk";
        var port;
        var keycbk = {};

        window.paste = function (cbk) {
            if (!port){
                cbk();
                return;
            }
            chrome.runtime.sendMessage (extid, {paste: true}, cbk);
        };

        window.copy = function (msg) {
            if (!port)
                return;
            chrome.runtime.sendMessage (extid, {copy: true, msg: msg});
        };

        var retobj = {
            extension: {installed: false},
            connect: function() {
                if (NuttyUtil.browser.browser != "Chrome")
                    return 1;
                if (!chrome.runtime) {
                    return 1;
                }
                port = chrome.runtime.connect(extid);
                if (!port) {
                    return 1;
                }
                log.info ("connected to extension!");
                port.onMessage.addListener(function(msg) {
                    if (msg.error) {
                        log.error (msg.error);
                        return;
                    }
                    if (!msg.key) {
                        log.error ("msg.key not found");
                        log.error (msg);
                        return;
                    }
                    if (!keycbk[msg.key]) {
                        log.error ("callback for msg.key not found");
                        log.error (msg);
                        return;
                    }
                    delete (msg.portnum);
                    keycbk[msg.key](msg);
                });
                port.onDisconnect.addListener (function() {
                    log.error ("extension disconnected");
                });
                return 0;
            },
            getkey: function (cbk) {
                if (!port) {
                    cbk();
                    return;
                }
                chrome.runtime.sendMessage (extid, {getkey: true}, cbk);
            },
            register: function (key, cbk) {
                keycbk[key] = cbk;
            },
            unregister: function (key) {
                delete keycbk[key]; 
            },
            send: function (msg) {
                port.postMessage (msg);
            },
        }
        function loop_till_installed() {
            if (port) {
                retobj.extension.installed = true;
                return;
            }
            retobj.connect();
            if (port) {
                retobj.extension.installed = true;
                return;
            }
            $timeout (loop_till_installed, 2000);
        }
        loop_till_installed();
        return retobj;
    });
