angular.module('nuttyapp')
	.controller('remoterecordCtrl', ['$scope', 'Compatibility', function($scope, Compatibility) {
		if (Compatibility.browser.browser === "Chrome")
			$scope.remoterecordshow = true;
		$scope.Compatibility = Compatibility;
	}]);
