/*
 * https://nutty.io
 * Copyright (c) 2013 krishna.srinivas@gmail.com All rights reserved.
 * GPLv3 License <http://www.gnu.org/licenses/gpl.txt>
 */

'use strict';

angular.module('nuttyApp')
    .provider("MasterConnection", function() {
        var mcdata = {
            conns: [],
            sharecode: "connecting...",
            sc: null,
            server: "",
            port: 0,
            peer: {},
            sharecodero: false,
            remotero: false
        }


        this.config = function(s, p) {
            mcdata.server = s;
            mcdata.port = p;
        }

        this.$get = function(MasterData, NuttyUtil, $location, $rootScope, NuttyTerm, log) {
            var peer;
            var sharecode = NuttyUtil.randomstr(10);
            mcdata.sc = sharecode;
            mcdata.peer = peer = new Peer(sharecode, {
                host: mcdata.server,
                port: mcdata.port,
                reliable: false,
                config: {
                    'iceServers': [{
                        'url': 'turn:nuttyuser@webrtc.nutty.io:3478',
                        'credential': 'nuttypasswd'
                    }]
                }
            });
            peer.on('open', function(connid) {
                log.info("connected to PeerJS server");
                mcdata.sharecode = sharecode;
                mcdata.sharecode = $location.$$protocol + "://" + $location.$$host + "/share/" + mcdata.sharecode;
                mcdata.sharecodero = true;
                $rootScope.$apply();
            });
            peer.on('error', function(error) {
                log.error("Error from PeerJS server : " + error);
            });
            peer.on('connection', function(conn) {
                log.info("slave peer connected : " + conn.peer);
                mcdata.conns.push(conn);
                $rootScope.$apply();
                conn.on('error', function(error) {
                    log.info("slave peer disconnected : " + conn.peer);
                    var idx = mcdata.conns.indexOf(conn);
                    if (idx === -1) {
                        log.error("connection not found");
                        return;
                    }
                    mcdata.conns.splice(idx, 1);
                    _peerwrite({
                        peerCountA: mcdata.conns.length
                    });
                    // $rootScope.$apply();
                });
                conn.on('close', function(error) {
                    log.info("slave peer closed connection : " + conn.peer);
                    var idx = mcdata.conns.indexOf(conn);
                    if (idx === -1) {
                        log.error("connection not found");
                        return;
                    }
                    mcdata.conns.splice(idx, 1);
                    _peerwrite({
                        peerCountA: mcdata.conns.length
                    });
                    $rootScope.$apply();
                });
                conn.on('data', function(data) {
                    if (data.getConfigsQ) {
                        conn.send({
                            getConfigsA: MasterData.configs
                        });
                        _peerwrite({
                            peerCountA: mcdata.conns.length
                        });
                        _peerwrite({
                            remoteroA: true,
                            value: mcdata.remotero
                        });

                        return;
                    }
                    if (data.rowcolQ) {
                        if (mcdata.remotero)
                            return;
                        for (var id in data.rowcolQ) {
                            MasterData.configs[id].row = data.rowcolQ[id].row;
                            MasterData.configs[id].col = data.rowcolQ[id].col;
                        }
                        $rootScope.$apply();
                        return;
                    }
                    if (data.newTermQ) {
                        if (mcdata.remotero)
                            return;
                        if (Object.size(MasterData.configs) >= 15) {
                            log.warn("Max limit for number of terminals (15) reached");
                            return;
                        }
                        NuttyTerm.getkey(function(key) {
                            log.info("peer (" + conn.peer + ") new terminal create : " + key);
                            MasterData.configs[key] = {
                                row: 28,
                                col: 96
                            };
                            var tmp = {};
                            tmp[key] = MasterData.configs[key];
                            _peerwrite({
                                getConfigsA: tmp
                            });
                            $rootScope.$apply();
                        });
                        return;
                    }

                    if (data.id === undefined) {
                        log.error("data.id is undefined. conn : " + conn.peer);
                        return;
                    }

                    if (data.closeTermQ) {
                        if (mcdata.remotero)
                            return;
                        log.info("peer (" + conn.peer + ") close terminal : " + data.id);
                    }
                    if (!MasterData.peerInput[data.id]) {
                        log.error("terminal not found - id : " + data.id);
                        return;
                    }
                    if (mcdata.remotero && data.d !== '\f')
                        return;
                    MasterData.peerInput[data.id](data);
                });
            });

            function _peerwrite(data) {
                for (var i = 0; i < mcdata.conns.length; i++) {
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
                                mcdata.conns[i].send({
                                    d: str,
                                    id: data.id
                                });
                            } catch (ex) {
                                log.error("connection(" + mcdata.conns[i].peer + ") send() error : " + ex.message);
                            }
                        }
                    } else {
                        try {
                            mcdata.conns[i].send(data);
                        } catch (ex) {
                            log.error("connection(" + mcdata.conns[i].peer + ") send() error : " + ex.message);
                        }
                    }
                }
            }

            window.addEventListener('beforeunload', function(e) {
                peer.destroy();
            });

            return {
                mcdata: mcdata,
                peerwrite: function(data) {
                    for (var i = 0; i < mcdata.conns.length; i++) {
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
                                    mcdata.conns[i].send({
                                        d: str,
                                        id: data.id
                                    });
                                } catch (ex) {
                                    log.error("connection(" + mcdata.conns[i].peer + ") send() error : " + ex.message);
                                }
                            }
                        } else {
                            try {
                                mcdata.conns[i].send(data);
                            } catch (ex) {
                                log.error("connection(" + mcdata.conns[i].peer + ") send() error : " + ex.message);
                            }
                        }
                    }
                }
            }
        }
    })
    .config(function(MasterConnectionProvider) {
        MasterConnectionProvider.config("www.nutty.io", 9000);
    });
