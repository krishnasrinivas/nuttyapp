/*
 * https://nutty.io
 * Copyright (c) 2014 krishna.srinivas@gmail.com All rights reserved.
 * GPLv3 License <http://www.gnu.org/licenses/gpl.txt>
 */

angular.module('nuttyapp')
    .factory('MasterConnection', ['$rootScope', 'NuttySession',
        function($rootScope, NuttySession) {
            var master;
            var ondata;
            var retobj;
            $rootScope.$watch(function() {
                return NuttySession.sessionid;
            }, function(newval, oldval) {
                master = new Meteor.PipeClientMaster(NuttySession.sessionid);
                master.on('data', function(data) {
                    var msg = {};
                    if (!data)
                        return;
                    if (data.start) {
                        retobj.active = true;
                        return;
                    }
                    if (data.stop) {
                        retobj.active = false;
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
                    } else {
                        return;
                    }
                    if (ondata)
                        ondata(msg);
                });
            });
            retobj = {
                active: false,
                pipe: {
                    write: function(data) {
                        var msg = {};
                        if (!retobj.active)
                            return;
                        if (data.data)
                            msg.data = data.data;
                        else
                            return;
                        if (master) {
                            master.send(msg);
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
