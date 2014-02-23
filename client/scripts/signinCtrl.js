angular.module('nuttyapp')
	.directive('nuttySignin', function () {
        return {
            templateUrl: "templates/signin.html",
            scope: true,
            restrict: 'E',
            replace: true,
            link: function(scope, element, attrs, termController) {
            },
            controller: ['$scope', 'NuttySession', '$modal', function($scope, NuttySession, $modal) {
				Deps.autorun(function() {
					Meteor.userId();
					setTimeout(function() {
						$scope.$apply();
					}, 0);
				});
				$scope.signintext = function() {
					if (Meteor.userId()) {
						return "Sign Out";
					} else
						return "Sign In";
				}
				$scope.signinout = function ($event) {
					// $event.stopPropagation();
					// $event.preventDefault();
					if (Meteor.userId()) {
						NuttySession.userloggedout(function() {
							Meteor.logout(function(err){
								if (err)
									console.log("Error logging out in: " + err);
								$scope.$apply();
							});
						});
					}
					else
						Meteor.loginWithGoogle(function(err){
							if (err) {
								console.log("Error logging in: " + err);
								return;
							}
							if (Meteor.user().username) {
		                        NuttySession.userloggedin();
								$scope.$apply();
								return;
							}
							var modalInstance = $modal.open({
								templateUrl: 'templates/username.html',
							    controller: ['$scope', '$modalInstance', function($scope, $modalInstance) {
							    	$scope.user = {username:""};
							    	$scope.spinner = {spin:false};
							    	$scope.ok = function () {
							    		$scope.spinner.spin = true;
							    		$scope.error = "";
									    console.log("username is : " + $scope.user.username);
										Meteor.call('userExists', $scope.user.username, function(err, alreadyexists) {
											if (alreadyexists) {
									    		$scope.spinner.spin = false;
												$scope.error = "Username " + $scope.user.username + " already exists";
									    		$scope.$apply();
											} else {
									    		$scope.spinner.spin = false;
												Meteor.users.update({_id:Meteor.userId()},{$set:{username:$scope.user.username}});
									    		$modalInstance.close($scope.user.username);
											}
										});
							    	}
		  						}]
							});
						    modalInstance.result.then(function (username) {
		                        NuttySession.userloggedin();
						    	console.log("username is : " + username);
						    }, function () {
						    	console.log('Modal dismissed at: ' + new Date());
						    	Meteor.logout(function() {
						    		$scope.$apply();
						    	});
						    });
						});
				};
			}]
		}
	});

angular.module('nuttyapp')
	.directive('focusMe', ['$timeout', function ($timeout) {    
    return {    
        link: function (scope, element, attrs, model) {                
            $timeout(function () {
                element[0].focus();
            });
        }
    };
	}]);
