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
                    $scope.paste = function() {
                        cannedscripts.getscriptcontent($scope.script._id, function(err, content) {
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
