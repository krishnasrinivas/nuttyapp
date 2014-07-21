angular.module('nuttyapp')
    .controller('scriptsCtrl', ['$scope', '$modal', 'cannedscripts',
        function($scope, $modal, cannedscripts) {
            $scope.scripts = cannedscripts.scripts;
            $scope.change = function() {
                if ($('#script')[0].files[0])
                    $scope.desc = $('#script')[0].files[0].name;
                else
                    $scope.desc = "";
            }
            $scope.upload = function() {
                var reader = new FileReader();
                if (!$('#script')[0].files[0]) {
                    alert("Please select a script to upload");
                    return;
                }
                if (!$scope.desc) {
                    alert("Please provide description for the script");
                    return;
                }
                reader.onload = function(e) {
                    var filecontent = e.target.result;
                    var userId = Meteor.userId();
                    if (!userId) {
                        alert("User not loggedin");
                        return;
                    }
                    cannedscripts.insertscript({
                        createdAt: new Date,
                        content: filecontent,
                        userId: userId,
                        description: $scope.desc
                    });
                }
                reader.readAsText($('#script')[0].files[0]);
            }
            $scope.removescript = function(id) {
                cannedscripts.removescript(id);
            }
            $scope.currentuser = function() {
                var user = Meteor.user();
                if (user) {
                    return user.username;
                } else {
                    return "";
                }
            };
        }
    ]);
