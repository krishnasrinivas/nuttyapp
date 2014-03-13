angular.module('nuttyapp')
    .controller('clickiconCtrl', ['$scope', '$location',
        function($scope, $location) {
            window.addEventListener("message", function(event) {
                if (event.source !== window)
                    return;
                if (event.data.type !== '_nutty_fromcontentscript')
                    return;
                if (event.data.share) {
                    $location.path('/share').replace();
                    $scope.$apply();
                }
            });
        }]);
