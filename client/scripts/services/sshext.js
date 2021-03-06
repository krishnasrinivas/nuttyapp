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
    .factory('sshext', ['$rootScope', '$location', 'sshstate', function($rootScope, $location, sshstate) {
            var port;
            var inputcbk;
            var trans;
            var channel;
            var sshserver;
            var sshport;
            var username;
            var password;
            var pvtkey;
            var authcbk;
            var auth_success;
            var nuttyio = $location.host() === 'nutty.io' || $location.host() === 'www.nutty.io';

            if (nuttyio) {
                return {};
            }

            function postMessage(msg) {
                msg.type = '_nutty_fromwebpage';
                window.postMessage(msg, window.location.origin);
            }

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
                if (msg.extensionenabled) {
                    retobj.appinstalled = true;
                    $rootScope.$apply();
                }

                if (msg.error) {
                    sshstate.state = "disconnected";
                    switch (-msg.error) {
                        case 102:
                            sshstate.error = "connection refused";
                            break;
                        case 105:
                            sshstate.error = "DNS name resolution failed"
                            break;
                        default:
                            sshstate.error = "connection failure";
                    }
                    $rootScope.$apply()
                    console.log("error from socket : " + msg.error);
                }
                if (msg.connected) {
                    trans = new paramikojs.transport(null);
                    trans.writeCallback = function (str) {
                        postMessage({
                            data: str
                        });
                    };
                    auth_success = function() {
                        sshstate.state = "authsuccess";
                        sshstate.error = "";
                        $rootScope.$apply();
                        var on_success = function(chan) {
                            chan.get_pty('linux', 96, 28);
                            chan.invoke_shell();
                            channel = chan;
                            authcbk();
                        };
                        trans.open_session(on_success);
                    }
                    window.input = function() {
                        if (!window.term) {
                            //in case the term is not yet ready
                            return;
                        }
                        try {
                            var stdin = channel.recv(65536);
                        } catch (ex) {}
                        try {
                            var stderr = channel.recv_stderr(65536);
                        } catch (ex) {}
                        if (stdin && inputcbk) {
                            inputcbk({
                                data: stdin
                            });
                        }
                        if (stderr && inputcbk) {
                            inputcbk({
                                data: stderr
                            });
                        }
                    }
                    postMessage({
                        tcpconnect: true,
                        server: sshserver,
                        port: sshport
                    });
                }
                if (msg.tcpconnected) {
                    sshstate.state = "authenticating";
                    $rootScope.$apply();
                    trans.connect (null, null, username, password, pvtkey, auth_success);
                }
                if (msg.tcpdisconnected) {
                    sshstate.state = "disconnected";
                    $rootScope.$apply();
                    console.log ("nutty background app disconnected");
                }
                if (msg.data) {
                    if (!trans) {
                        console.log("trans is null");
                        return;
                    }
                    trans.fullBuffer += msg.data;  // read data
                    trans.run();
                }
            });

            var retobj = {
                appinstalled: false,
                connect: function(_sshserver, _sshport, _username, _password, _pvtkey, _cbk) {
                    sshstate.error = "";
                    sshstate.state = "connecting";
                    sshserver = _sshserver;
                    sshport = _sshport;
                    username = _username;
                    password = _password;
                    pvtkey = _pvtkey;
                    authcbk = _cbk;

                    postMessage({
                        connect: true,
                    });
                },
                restartsession: function(cbk) {
                    var on_success = function(chan) {
                        chan.get_pty('linux', term.screenSize.width, term.screenSize.height);
                        chan.invoke_shell();
                        channel = chan;
                        if (cbk)
                            cbk();
                    };
                    trans.open_session(on_success);
                },
                ondata: function(cbk) {
                    inputcbk = cbk;
                },
                write: function(msg) {
                    if (!channel) {
                        window.location.pathname = '/';
                        return;
                    }
                    if (!msg) {
                        console.log("ssh.write(): msg is null")
                        return;
                    }
                    if (msg.newtmuxsession) {
                        retobj.restartsession();
                    } else if (msg.data) {
                        channel.send(msg.data);
                    } else if (msg.rowcol) {
                        channel.resize_pty(msg.col, msg.row);
                    } else {
                        postMessage(msg);
                    }
                }
            }
            window.sshext = retobj;
            return retobj;
        }]);
