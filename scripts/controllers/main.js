/*
 * https://nutty.io
 * Copyright (c) 2013 krishna.srinivas@gmail.com All rights reserved.
 * GPLv3 License <http://www.gnu.org/licenses/gpl.txt>
 */

'use strict';

angular.module('nuttyApp')
    .controller('MainCtrl', function($scope, $location, NuttyTerm, MasterData, log) {
        if (NuttyTerm.extension.installed) {
            $location.path("/home");
        } else {
            $location.path("/info");
        }
    });
