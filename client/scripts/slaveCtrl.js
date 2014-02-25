/*
 * https://nutty.io
 * Copyright (c) 2014 krishna.srinivas@gmail.com All rights reserved.
 * GPLv3 License <http://www.gnu.org/licenses/gpl.txt>
 */

angular.module('nuttyapp')
	.controller('slaveCtrl', ['$scope', '$modal', '$routeParams', 'NuttySession', 'SlaveConnection', 'NuttyConnection', 'Compatibility',
		function ($scope, $modal, $routeParams, NuttySession, SlaveConnection, NuttyConnection, Compatibility) {
		var clientid = Session.get("clientid");
		$scope.descro = true;
		$scope.Compatibility = Compatibility;
		if (!clientid) {
			clientid = Random.id();
			Session.set("clientid", clientid);
			mixpanel.track("slaveterminal");
			ga('send', 'pageview', 'slaveterminal');
		}

		NuttySession.setslave($routeParams.sessionid, clientid);
		NuttyConnection.write = SlaveConnection.pipe.write;
		$scope.$watch(function(){
			return NuttySession.desc;
		}, function(newval){
			$scope.desc = NuttySession.desc;
		});
		$scope.currentuser = function() {
			var user = Meteor.user();
			if (user) {
				return user.username;
			} else {
				return "";
			}
		};
		// $scope.slaveshow = function() {
		// 	if (Compatibility.browser.browser === "Chrome" || Compatibility.browser.browser === "Firefox")
		// 		true;
		// 	else
		// 		false;
		// }
		if (Compatibility.browser.browser === "Chrome" || Compatibility.browser.browser === "Firefox" || Compatibility.browser.browser === "Safari")
			$scope.slaveshow = true;
		Deps.autorun(function() {
			Meteor.userId();
			setTimeout(function() {
				$scope.$apply();
			}, 0);
		});
	}]);