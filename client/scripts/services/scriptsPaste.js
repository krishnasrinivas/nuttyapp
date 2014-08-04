angular.module('nuttyapp')
    .directive('scriptsPaste', function() {
        return {
            templateUrl: "templates/scriptsPaste.html",
            scope: {},
            restrict: 'E',
            replace: true,
            link: function(scope, element, attrs, Ctrl) {},
            controller: ['$scope', 'NuttyConnection', 'alertBox', 'cannedscripts',
                function($scope, NuttyConnection, alertBox, cannedscripts) {
                    $scope.scripts = cannedscripts.scripts;
                    $scope.selectedscript = {};
                    $scope.paste = function() {
                        if (!$scope.selectedscript.script) {
                            alertBox.alert("danger", "Please select a script");
                            return;
                        }
                        cannedscripts.getscriptcontent($scope.selectedscript.script._id, function(err, content) {
                            if (content)
                                NuttyConnection.write({
                                    data: content
                                });
                        });
                    }
                }
            ]
        }
    });
