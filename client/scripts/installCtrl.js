/*
 * https://nutty.io
 * Copyright (c) 2014 krishna.srinivas@gmail.com All rights reserved.
 * GPLv3 License <http://www.gnu.org/licenses/gpl.txt>
 */

angular.module('nuttyapp')
	.directive('installDiv', function () {
        return {
            templateUrl: "templates/installDiv.html",
            scope: true,
            restrict: 'E',
            replace: true,
            link: function(scope, element, attrs, termController) {
            },
            controller: ['$scope', 'Termdevice', 'Compatibility', function($scope, Termdevice, Compatibility) {
		        var exturl = "https://chrome.google.com/webstore/detail/ooelecakcjobkpmbdnflfneaalbhejmk";
		        $scope.Compatibility = Compatibility;
		        $scope.td = Termdevice;
		        $scope.connected = function () {
		        	return Termdevice.extension;
		        	// return Termdevice.extension && Termdevice.nativehost;
		        }
		        $scope.install_ext = function() {
		            chrome.webstore.install(exturl,
		                function() {
		                    $scope.installStatus = "extension installation done!";
		                    $scope.$apply();
		                },
		                function(errstr) {
		                    $scope.installStatus = "extension installation failed : " + errstr;
		                    $scope.$apply();
		                });
		        }
            }]
        }
    });