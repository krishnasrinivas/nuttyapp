/*
 * Copyright (c) 2014 krishna.srinivas@gmail.com All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
