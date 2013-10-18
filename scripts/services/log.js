/*
 * https://nutty.io
 * Copyright (c) 2013 krishna.srinivas@gmail.com All rights reserved.
 * GPLv3 License <http://www.gnu.org/licenses/gpl.txt>
 */

'use strict'

angular.module('nuttyApp').
    factory('log', function(NuttyUtil) {
        var log;
        return {
            resizeStyle: {
                zIndex: NuttyUtil.incZindex(),
            },
            visible: {
                val: false
            },
            setlog: function(_log) {
                log = _log;
            },
            debug: function(msg) {
                if (!log)
                    return;
                log.debug(msg);
            },
            info: function(msg) {
                if (!log)
                    return;
                log.info(msg);
            },
            warn: function(msg) {
                if (!log)
                    return;
                log.warn(msg);
            },
            error: function(msg) {
                if (!log)
                    return;
                log.error(msg);
            },
        }
    });
