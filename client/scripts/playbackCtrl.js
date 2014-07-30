angular.module('nuttyapp')
    .controller('playbackCtrl', ['$scope', 'NuttySession', '$modal', '$location', 'Player',
        function($scope, NuttySession, $modal, $location, Player) {
        	$scope.recordings = NuttySession.recordings;
            ga('send', 'pageview', 'uploads');
            if (Player.playback) {
                window.location.pathname = '/playback';
            }
            $scope.currentuser = function() {
                var user = Meteor.user();
                if (user) {
                    return user.username;
                } else {
                    return "";
                }
            };
            $scope.embed = function(idx) {
                var modalInstance = $modal.open({
                    template: '<textarea style="width:100%;height:100%" id="embedid">' +
                                '<iframe width="640" height="360" src="' + 'https://nutty.io/recording/' + $scope.recordings[idx].filename + ' frameborder="0"></iframe>'
                                +'</textarea>',
                    controller: ['$scope', '$modalInstance',
                        function($scope, $modalInstance) {
                            setTimeout(function() {
                                // $('#embedid').value =
                                //     '<iframe width="640" height="360" src="' + 'https://nutty.io/recording/' + $scope.recordings[idx].filename + '" frameborder="0"></iframe>';
                                $('#embedid').focus();
                                $('#embedid').select();
                            }, 0);
                        }]});
            }
            $scope.datetime = function(idx) {
                if ($scope.recordings[idx].createdAt)
                    return $scope.recordings[idx].createdAt.toString().replace(/ GMT.*/, '');
                else
                    return "";
            }
            $scope.deleterecording = function(idx) {
                NuttySession.deleterecording($scope.recordings[idx]._id);
            }
            $scope.change = function() {
                Player.playback = $("#playbackrec")[0].files[0];
                $location.path('/localplay');
            }
        }]);
