angular.module('nuttyapp')
	.controller('localrecordCtrl', ['$scope', '$location', '$routeParams',
		function ($scope, $location, $routeParams) {
				console.log($routeParams);
			if ($routeParams.filename) {
				Session.set("filename", $routeParams.filename);
				$location.path('/localplay').replace();
			}
		}]);
