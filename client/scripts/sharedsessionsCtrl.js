angular.module('nuttyapp')
    .controller('sharedsessionsCtrl', ['$scope', 'NuttySession',
        function($scope, NuttySession) {
        	$scope.sharedsessions = NuttySession.sharedsessions;
            ga('send', 'pageview', 'sharedsessions');
            $scope.currentuser = function() {
                var user = Meteor.user();
                if (user) {
                    return user.username;
                } else {
                    return "";
                }
            };
        }]);
