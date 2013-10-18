/*
 * https://nutty.io
 * Copyright (c) 2013 krishna.srinivas@gmail.com All rights reserved.
 * GPLv3 License <http://www.gnu.org/licenses/gpl.txt>
 */

'use strict';

angular.module('nuttyApp')
    .factory('Clipboard', function() {
        return {
            copy: function(arg) {
                var event = document.createEvent('CustomEvent');
                event.initCustomEvent("messagefrompage", true, true, {
                    copy: arg
                });
                document.documentElement.dispatchEvent(event);
            },

            paste: function() {
                var event = document.createEvent('CustomEvent');
                event.initCustomEvent("messagefrompage", true, true, {
                    paste: true
                });
                document.documentElement.dispatchEvent(event);
            }
        };
    });