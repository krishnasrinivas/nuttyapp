/*
 * https://nutty.io
 * Copyright (c) 2014 krishna.srinivas@gmail.com All rights reserved.
 * GPLv3 License <http://www.gnu.org/licenses/gpl.txt>
 */

angular.module('nuttyapp')
	.controller('localrecordCtrl', ['$scope', '$location', '$routeParams',
		function ($scope, $location, $routeParams) {
				console.log($routeParams);
			if ($routeParams.filename) {
				Session.set("filename", $routeParams.filename);
				$location.path('/localplay').replace();
			}
		}]);
