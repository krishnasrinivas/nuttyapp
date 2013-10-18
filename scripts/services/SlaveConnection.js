/*
 * https://nutty.io
 * Copyright (c) 2013 krishna.srinivas@gmail.com All rights reserved.
 * GPLv3 License <http://www.gnu.org/licenses/gpl.txt>
 */

'use strict';

angular.module('nuttyApp')
    .provider("SlaveConnection", function() {
        this.$get = function(SlaveData, $rootScope, NuttyUtil, log) {
            var peer;
            var conn;
            var sharecode;
            var scdata = {
                peerCount: 0,
                remotero: false,
                disconnected: false,
                sc: null
            };

            var retobj = {
                scdata: scdata,
                setSharecode: function(s) {
                    sharecode = s;
                },
                close: function() {
                    conn.close();
                },
                connect: function(cbk) {
                    peer = new Peer(NuttyUtil.randomstr(10), {
                        host: 'www.nutty.io',
                        port: 9000,
                        reliable: false,
                        config: {
                            'iceServers': [{
                                'url': 'turn:nuttyuser@webrtc.nutty.io:3478',
                                'credential': 'nuttypasswd'
                            }]
                        }
                    });
                    peer.on('open', function(connid) {
                        scdata.sc = connid;
                        log.info("Connected to PeerJS server.");
                        log.info("Connecting to peer (master) ...");
                    });
                    peer.on('error', function(error) {
                        log.error("PeerJS server : " + error);
                        // even if connection to peerjs server is lost, peer-dc might still be active
                    });
                    conn = peer.connect(sharecode);

                    conn.on('open', function(connid) {
                        log.info("connected to peer (master)");
                        conn.send({
                            getConfigsQ: true
                        });
                        cbk();
                    });
                    conn.on('error', function(error) {
                        scdata.disconnected = true;
                        cbk();
                        log.error("Peer (master) disconnected : " + error);
                    });
                    conn.on('close', function(error) {
                        scdata.disconnected = true;
                        cbk();
                        log.error("Peer (master) closed connection");
                    });
                    conn.on('data', function(data) {
                        if (data.remoteroA) {
                            scdata.remotero = data.value;
                            if (data.value)
                                log.info("Read-only access turned on");
                            else
                                log.info("Read-only access turned off");
                            $rootScope.$apply();
                            return;
                        }
                        if (data.peerCountA) {
                            scdata.peerCount = data.peerCountA;
                            $rootScope.$apply();
                            return;
                        }
                        if (data.getConfigsA) {
                            var termids = [];
                            for (var id in data.getConfigsA) {
                                termids.push(id);
                                delete(data.getConfigsA[id].$$hashKey);
                                SlaveData.configs[id] = data.getConfigsA[id];
                            }
                            if (termids.length)
                                log.info("new terminal (ids : " + termids + " )");
                            $rootScope.$apply();
                            return;
                        }
                        if (data.rowcolA) {
                            for (var id in data.rowcolA) {
                                SlaveData.configs[id].row = data.rowcolA[id].row;
                                SlaveData.configs[id].col = data.rowcolA[id].col;
                            }
                            $rootScope.$apply();
                            return;
                        }
                        if (data.closeTermA) {
                            log.info("close terminal : " + data.id);
                            delete(SlaveData.configs[data.id]);
                            $rootScope.$apply();
                            return;
                        }
                        if (!SlaveData.peerInput[data.id]) {
                            log.error("terminal not found : " + data.id);
                            return;
                        }
                        SlaveData.peerInput[data.id](data);
                    });
                },
                peerwrite: function(data) {
                    if (data.d) {
                        var j = 0;
                        var str;
                        while (1) {
                            /* send in small chunks (for chrome) */
                            str = data.d.substr(j, 200);
                            if (!str)
                                break;
                            j = j + 200;
                            try {
                                conn.send({
                                    d: str,
                                    id: data.id
                                });
                            } catch (ex) {
                                log.error("connection(" + conn.peer + ") send() error : " + ex.message);
                            }
                        }
                    } else {
                        try {
                            conn.send(data);
                        } catch (ex) {
                            log.error("connection(" + conn.peer + ") send() error : " + ex.message);
                        }
                    }
                }
            }
            window.addEventListener('beforeunload', function(e) {
                retobj.close();
            });
            return retobj;
        }
    });
