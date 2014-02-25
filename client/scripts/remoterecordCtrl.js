/*
 * https://nutty.io
 * Copyright (c) 2014 krishna.srinivas@gmail.com All rights reserved.
 * GPLv3 License <http://www.gnu.org/licenses/gpl.txt>
 */

angular.module('nuttyapp')
    .controller('remoterecordCtrl', ['$scope', 'Compatibility',
        function($scope, Compatibility) {
            if (Compatibility.browser.browser === "Chrome")
                $scope.remoterecordshow = true;
            $scope.Compatibility = Compatibility;
        }
    ]);
