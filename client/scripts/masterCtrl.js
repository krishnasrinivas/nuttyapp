/*
 * https://nutty.io
 * Copyright (c) 2014 krishna.srinivas@gmail.com All rights reserved.
 * GPLv3 License <http://www.gnu.org/licenses/gpl.txt>
 */

angular.module('nuttyapp')
	.controller('masterCtrl', ['$scope', '$modal', 'NuttySession', 'Termdevice', 'NuttyConnection', function ($scope, $modal, NuttySession, Termdevice, NuttyConnection) {
		NuttyConnection.write = Termdevice.write;
		if (!Session.get("autoreload")) {
			mixpanel.track("masterterminal");
			ga('send', 'pageview', 'masterterminal');
			Session.set("autoreload", 1);
		}
		$scope.sharelink = function() {
			if (NuttySession.sessionid)
				return "https://nutty.io/share/" + NuttySession.sessionid;
			else
				return "waiting for server...";
		}
		$scope.$watch(function() {
			return NuttySession.sessionid;
		}, function(newval, oldval) {
			if (newval) {
				$scope.sharelink = "https://nutty.io/share/" + NuttySession.sessionid;
			} else
				$scope.sharelink = "";
		});
		$scope.$watch (function(){return NuttySession.desc}, function(newval) {
			$scope.desc = NuttySession.desc;
		})
		$scope.currentuser = function() {
			var user = Meteor.user();
			if (user) {
				return user.username;
			} else {
				return "";
			}
		};
		$scope.descsubmit = function() {
			NuttySession.setdesc($scope.desc);
			mixpanel.track("descsubmit");
			setTimeout(termfocus, 0);
		}
		$scope.descblur = function() {
			$scope.desc = NuttySession.desc;
		}
		$scope.copysharelink = function() {
			copy($scope.sharelink);
			mixpanel.track("copysharelink", {clickedon:"input"});
			setTimeout(function(){
				term.focus();
			}, 1000);
		}
		$scope.sharelinkbtn = function() {
			mixpanel.track("copysharelink", {clickedon:"button"});
			setTimeout(
				function(){
					$("#sharelinkbox").focus().click();
				}, 0);
		}
		Deps.autorun(function() {
			Meteor.userId();
			setTimeout(function() {
				$scope.$apply();
			}, 0);
		});
	}]);