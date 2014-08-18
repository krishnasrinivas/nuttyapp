/*
 * https://nutty.io
 * Copyright (c) 2014 krishna.srinivas@gmail.com All rights reserved.
 * GPLv3 License <http://www.gnu.org/licenses/gpl.txt>
 */

angular.module('nuttyapp')
    .factory('SlaveConnection', ['$rootScope', 'NuttySession', '$location',
        function($rootScope, NuttySession, $location) {
            var wsocketslave;
            var wrtcslave;
            var wrtcconn;
            var ondata;
            var retobj;

            Meteor._reload.onMigrate("onMigrate", function() {
                console.log(arguments);
                return [false];
            });
            retobj = {
                type: '',
                connect: function () {
                    function processinput(data) {
                        var msg = {};
                        console.log(data);
                        if (!data)
                            return;
                        if (data.data)
                            msg.data = data.data;
                        else if (data.settermshot)
                            msg.settermshot = data.settermshot;
                        else if (data.setcursorposition)
                            msg.setcursorposition = data.setcursorposition;
                        else
                            return;
                        if (ondata)
                            ondata(msg);                    
                    }
                    if (retobj.type === 'websocket') {
                        wsocketslave = new Meteor.PipeClientSlave(NuttySession.sessionid);
                        wsocketslave.on('data', processinput);
                        wsocketslave.on('ready', function() {
                            setTimeout ( function() {
                                wsocketslave.send({
                                    gettermshot: true
                                });
                            }, 1000);
                        });
                    } else if (retobj.type === 'webrtc') {
                        Meteor.call('getWebrtcConfig', $location.host(), function(err, webrtcconfig) {
                            if (err) {
                                console.log("Meteor.call(getWebrtcConfig) returned : " + (err.reason));
                                return;
                            }
                            if (!webrtcconfig.host)
                                webrtcconfig.host = $location.host();
                            if (!webrtcconfig.port)
                                webrtcconfig.port = 9000;
                            wrtcslave = new Peer(webrtcconfig);
                            wrtcslave.on('open', function(connid) {
                                console.log("Connected to PeerJS server");
                            });
                            wrtcslave.on('error', function(error) {
                                console.log("error from PeerJS server : " + error);
                            })
                            wrtcconn = wrtcslave.connect(NuttySession.sessionid);
                            wrtcconn.on('open', function() {
                                console.log('connected to master');
                                setTimeout ( function() {
                                    wrtcconn.send({
                                        gettermshot: true
                                    });
                                }, 1000);
                            });
                            wrtcconn.on('error', function(error) {
                                console.log('error on connection to master');
                            });
                            wrtcconn.on('close', function() {
                                console.log('master closed connection');
                            });
                            wrtcconn.on('data', processinput);
                        });
                    }
                },
                pipe: {
                    write: function(data) {
                        var msg = {};
                        if (data.data)
                            msg.data = data.data;
                        else if (data.newtmuxsession) {
                            msg.newtmuxsession = data.newtmuxsession;
                        } else if (data.gettermshot) {
                            msg.gettermshot = data.gettermshot;
                        } else {
                            return;
                        }
                        if (retobj.type === 'webrtc') {
                            if (wrtcconn)
                                wrtcconn.send(msg);
                        } else if (retobj.type === 'websocket'){
                            if (wsocketslave)
                                wsocketslave.send(msg);
                        } else {
                            console.log("SlaveConnection.type is neither websocket nor webrtc");
                        }
                    },
                    ondata: function(cbk) {
                        ondata = cbk;
                    }
                }
            }
            window.SlaveConnection = retobj;
            return retobj;
        }
    ]);
