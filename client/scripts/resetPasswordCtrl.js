angular.module('nuttyapp')
    .controller('resetPasswordCtrl', ['$scope', '$location', '$routeParams', '$timeout',
        function($scope, $location, $routeParams, $timeout) {
        	$scope.resetpwd = {};
        	$scope.resetpwd.close = function() {
        		$scope.resetpwd.show = false;
        	}
        	$scope.resetpwd.reset = function() {
        		if (!$scope.resetpwd.password) {
        			$scope.resetpwd.msg = "Empty passwords not allowed";
        			$scope.resetpwd.show = true;
        			return;
        		}
        		$scope.resetpwd.spinner = true;
        		$scope.resetpwd.msg = "";
        		$scope.resetpwd.show = false;
        		Accounts.resetPassword($routeParams.token, $scope.resetpwd.password, function(err) {
        			$scope.resetpwd.spinner = false;
        			if (err) {
        				$scope.resetpwd.msg = err.reason;
        				$scope.resetpwd.show = true;
	        			$scope.$apply();
        			} else {
	        			$location.path('/login');
        			}
        		});
        	}
        }]);
