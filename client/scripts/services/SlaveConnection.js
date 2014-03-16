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

            retobj = {
                type: '',
                connect: function () {
                    function processinput(data) {
                        var msg = {};
                        if (!data)
                            return;
                        if (data.data)
                            msg.data = data.data;
                        else
                            return;
                        if (ondata)
                            ondata(msg);                    
                    }
                    if (retobj.type === 'websocket') {
                        wsocketslave = new Meteor.PipeClientSlave(NuttySession.sessionid);
                        wsocketslave.on('data', processinput);
                        wsocketslave.on('ready', function() {
                            wsocketslave.send({
                                data: String.fromCharCode(2) + 'r'
                            });
                        });
                    } else if (retobj.type === 'webrtc') {
                        Meteor.call('getWebrtcConfig', function(err, webrtcconfig) {
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
                                wrtcconn.send({
                                    data: String.fromCharCode(2) + 'r'
                                });
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
