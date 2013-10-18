/*
 * https://nutty.io
 * Copyright (c) 2013 krishna.srinivas@gmail.com All rights reserved.
 * GPLv3 License <http://www.gnu.org/licenses/gpl.txt>
 */

'use strict';

angular.module('nuttyApp')
    .controller('MasterCtrl', function($scope, MasterData, PlayTermData, NuttyTerm, NuttyUtil, $location) {
        $scope.configs = MasterData.configs;
        $scope.playTerms = PlayTermData.playTerms;
        if (!NuttyTerm.extension.installed || NuttyUtil.browser.incompaible) {
            $location.path("/info");
        } else
			ga('send', 'pageview', 'master');
    });
