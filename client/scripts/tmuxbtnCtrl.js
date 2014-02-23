angular.module('nuttyapp')
	.directive('tmuxButtons', function () {
        return {
            templateUrl: "templates/tmuxButtons.html",
            scope: true,
            restrict: 'E',
            replace: true,
            link: function(scope, element, attrs, Ctrl) {
            },
            controller: ['$scope', 'NuttySession', 'NuttyConnection', function($scope, NuttySession, NuttyConnection) {
            	var readonly = NuttySession.readonly;
            	$scope.btn = {color:"primary",value:false};
            	$scope.NuttySession = NuttySession;
            	if (NuttySession.type === "slave")
            		$scope.disabled = "disabled";
            	$scope.splitH = function() {
					NuttyConnection.write({
						data: String.fromCharCode(2) + '"'
					});
					term.focus();
            	}
            	$scope.splitV = function() {
					NuttyConnection.write({
						data: String.fromCharCode(2) + '%'
					});
					term.focus();
            	}
            	$scope.newWindow = function() {
					NuttyConnection.write({
						data: String.fromCharCode(2) + 'c'
					});
					term.focus();            		
            	}
            	$scope.newtmuxsession = function() {
					NuttyConnection.write({
						newtmuxsession: true
					});
					term.focus();            		
            	}

            	$scope.resizeL = function() {
					NuttyConnection.write({
						data: String.fromCharCode(2, 27, 91, 49, 59, 53, 68)
					});
					term.focus();
            	}
            	$scope.resizeR = function() {
					NuttyConnection.write({
						data: String.fromCharCode(2, 27, 91, 49, 59, 53, 67)
					});
					term.focus();
            	}
            	$scope.resizeU = function() {
					NuttyConnection.write({
						data: String.fromCharCode(2, 27, 91, 49, 59, 53, 65)
					});
					term.focus();
            	}
            	$scope.resizeD = function() {
					NuttyConnection.write({
						data: String.fromCharCode(2, 27, 91, 49, 59, 53, 66)
					});
					term.focus();
            	}
            	$scope.markreadonly = function() {
            		if (NuttySession.type === "master") {
	            		readonly = !readonly;
	            		if (readonly) {
	            			NuttySession.setreadonly(true);
	            		} else {
	            			NuttySession.setreadonly(false);
	            		}
	            	}
					term.focus();
            	}
            	$scope.tooltiptext = function() {
            		if (readonly)
            			return "Remote read only access"
            		else
            			return "Remote read/write access";
            	}
            	$scope.btntext = function() {
            		if (readonly)
            			return "R/O";
            		else
            			return 'R/W';
            	}
            	$scope.$watch(function() {
            		return NuttySession.readonly;
            	}, function(newval) {
            		if (newval) {
            			$scope.btn.color = "danger";
            			readonly = $scope.btn.value = true;
            		} else {
            			$scope.btn.color = "primary";
            			readonly = $scope.btn.value = false;
            		}
            	});
            	$scope.$watch("btn.value", function(newval) {
            		$scope.btn.value = NuttySession.readonly;
            	});
			}]
		}
	});
