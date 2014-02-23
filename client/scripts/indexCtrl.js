angular.module('nuttyapp')
	.controller('indexCtrl', ['$scope', '$modal', 'NuttySession', function ($scope, $modal, NuttySession) {
		$scope.sharedsessions = NuttySession.sharedsessions;
		$scope.recordings = NuttySession.recordings;
		$scope.datetime = function(idx) {
			if ($scope.recordings[idx].createdAt)
				return $scope.recordings[idx].createdAt.toString().replace(/ GMT.*/, '');
			else
				return "";
		}
		$scope.currentuser = function() {
			var user = Meteor.user();
			if (user) {
				return user.username;
			} else {
				return "";
			}
		};
		$scope.deleterecording = function(idx) {
			NuttySession.deleterecording($scope.recordings[idx]._id);
		}
		$scope.copyembed = function(idx) {
			$scope.recordings[idx].visible = true;
			$scope.recordings[idx].value = 
				'<iframe width="640" height="360" src="' + 'https://nutty.io/recording/' + $scope.recordings[idx].filename + '" frameborder="0"></iframe>';
			setTimeout(function() {
				$('#' + $scope.recordings[idx].filename.replace(/\./, ''))[0].focus();
				$('#' + $scope.recordings[idx].filename.replace(/\./, ''))[0].select();
			}, 0);
		}
	}])