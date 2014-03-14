/*
 * https://nutty.io
 * Copyright (c) 2014 krishna.srinivas@gmail.com All rights reserved.
 * GPLv3 License <http://www.gnu.org/licenses/gpl.txt>
 */

angular.module('nuttyapp')
    .factory('SlaveConnection', ['$rootScope', 'NuttySession',
        function($rootScope, NuttySession) {
            var master;
            var ondata;
            var retobj;
            $rootScope.$watch(function() {
                return NuttySession.sessionid;
            }, function(newval, oldval) {
                if (!NuttySession.sessionid)
                    return;
                retobj.master = master = new Meteor.PipeClientSlave(NuttySession.sessionid);
                master.on('data', function(data) {
                    var msg = {};
                    if (!data)
                        return;
                    if (data.data)
                        msg.data = data.data;
                    else
                        return;
                    if (ondata)
                        ondata(msg);
                });
                master.on('ready', function() {
                    master.send({
                        data: String.fromCharCode(2) + 'r'
                    });
                });
            });

            retobj = {
                master: undefined,
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
                        if (master)
                            master.send(msg);
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
