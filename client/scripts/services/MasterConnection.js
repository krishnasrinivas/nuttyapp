/*
 * https://nutty.io
 * Copyright (c) 2014 krishna.srinivas@gmail.com All rights reserved.
 * GPLv3 License <http://www.gnu.org/licenses/gpl.txt>
 */

angular.module('nuttyapp')
    .factory('MasterConnection', ['$rootScope', 'NuttySession', '$location',
        function($rootScope, NuttySession, $location) {
            var websocketactive = false;
            var wsocketmaster;
            var wrtcmaster;
            var wrtcconns = [];
            var ondata;
            var retobj;
            $rootScope.$watch(function() {
                return NuttySession.sessionid;
            }, function(newval, oldval) {
                if (!newval)
                    return;
                Meteor.call('getWebrtcConfig', function(err, webrtcconfig) {
                    function processinput(data) {
                        var msg = {};
                        if (!data)
                            return;
                        if (data.start) {
                            websocketactive = true;
                            return;
                        }
                        if (data.stop) {
                            websocketactive = false;
                            return;
                        }
                        if (NuttySession.readonly) {
                            if (data.data !== String.fromCharCode(2) + 'r')
                                return;
                        }
                        if (data.data) {
                            msg.data = data.data;
                        } else if (data.newtmuxsession) {
                            msg.newtmuxsession = data.newtmuxsession;
                        } else if (data.gettermshot) {
                            msg.gettermshot = data.gettermshot;
                        } else {
                            return;
                        }
                        if (ondata)
                            ondata(msg);
                    }
                    wsocketmaster = new Meteor.PipeClientMaster(NuttySession.sessionid);
                    wsocketmaster.on('data', function(data) {
                        if (retobj.type !== 'websocket')
                            return;
                        processinput(data);
                    });

                    if (err) {
                        console.log("Meteor.call(getWebrtcConfig) returned : " + (err.reason));
                        return;
                    }

                    if (!webrtcconfig.host)
                        webrtcconfig.host = $location.host();
                    if (!webrtcconfig.port)
                        webrtcconfig.port = 9000;
                    wrtcmaster = new Peer(NuttySession.sessionid, webrtcconfig);
                    wrtcmaster.on('open', function(connid) {
                        console.log("Connected to PeerJS server: " + connid);
                    });
                    wrtcmaster.on('error', function(error) {
                        console.log("PeerJS server disconnected : " + error);
                    });
                    wrtcmaster.on('connection', function(conn) {
                        wrtcconns.push(conn);
                        console.log("Got connection from peer");
                        conn.on('data', function(data) {
                            if (retobj.type !== 'webrtc')
                                return;
                            processinput(data);
                        })
                        function conndisconnect() {
                            var idx = wrtcconns.indexOf(conn);
                            wrtcconns.splice(idx, 1);
                        }
                        conn.on('error', conndisconnect);
                        conn.on('close', conndisconnect);
                    });
                });
            });
            retobj = {
                type: '',
                pipe: {
                    write: function(data) {
                        var msg = {};
                        if (data.data)
                            msg.data = data.data;
                        else if (data.settermshot)
                            msg.settermshot = data.settermshot;
                        else if (data.setcursorposition)
                            msg.setcursorposition = data.setcursorposition;
                        else
                            return;
                        if (retobj.type === 'websocket') {
                            if (!websocketactive)
                                return;
                            if (wsocketmaster) {
                                wsocketmaster.send(msg);
                            }
                        } else if (retobj.type === 'webrtc') {
                            for (var i = 0; i < wrtcconns.length; i++) {
                                try {
                                    wrtcconns[i].send(msg);
                                } catch (ex) {
                                    console.log ("unable to write to peer");
                                }
                            }
                        } else {
                            console.log("MasterConnection.type is neither webrtc nor websocket");
                        }
                    },
                    ondata: function(cbk) {
                        ondata = cbk;
                    }
                }
            }
            window.MasterConnection = retobj;
            return retobj;
        }
    ]);
