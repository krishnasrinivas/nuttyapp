angular.module('nuttyapp')
    .controller('uploadsCtrl', ['$scope', 'NuttySession', '$modal',
        function($scope, NuttySession, $modal) {
        	$scope.recordings = NuttySession.recordings;
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
        }]);
