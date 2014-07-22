angular.module('nuttyapp')
    .controller('loginCtrl', ['$scope', '$location', '$modal', '$routeParams', '$timeout',
        function($scope, $location, $modal, $routeParams, $timeout) {
            $scope.alert = {};
            $scope.lalert = {};
            $scope.verification = {};
            $scope.resetpwd = {};
            $scope.showsignupbox = false;
            $scope.showloginbox = true;
            $scope.showresetpwdbox = false;
            $scope.resetpwd.close = function() {
                $scope.resetpwd.msg = "";
                $scope.resetpwd.show = false;
            }
            $scope.resetpwd.reset = function() {
                if (!$scope.resetpwd.email) {
                    $scope.resetpwd.msg = "Please enter your email";
                    $scope.resetpwd.show = true;
                    return;
                }
                $scope.resetpwd.spinner = true;
                $scope.resetpwd.show = false;
                Accounts.forgotPassword({
                    email: $scope.resetpwd.email
                }, function(err) {
                    if (err) {
                        $scope.resetpwd.msg = err.reason;
                        $scope.resetpwd.show = true;
                    } else {
                        $scope.resetpwd.email = "";
                        $scope.resetpwd.msg = "Please check your email to reset password";
                        $scope.resetpwd.show = true;
                    }
                    $scope.resetpwd.spinner = false;
                    $scope.$apply();
                });
            }
            $scope.verification.close = function() {
                $scope.verification.msg = "";
                $scope.verification.show = false;
            }
            $scope.alert.close = function() {
                $scope.alert.msg = "";
                $scope.alert.show = false;
            }
            $scope.lalert.close = function() {
                $scope.lalert.msg = "";
                $scope.lalert.show = false;
            }
            $scope.loggedinas = function() {
                var user = Meteor.user();
                if (user) {
                    return user.username;
                } else
                    return "";
            }
            $scope.signuppassword = function() {
                if (!$scope.password) {
                    $scope.alert.type = "danger";
                    $scope.alert.show = true;
                    $scope.alert.msg = "Please provide valid password";
                    return;
                }
                Accounts.createUser({
                    username: $scope.username,
                    password: $scope.password,
                    email: $scope.email
                }, function(err) {
                    $scope.password = "";
                    if (err) {
                        $scope.alert.type = "danger";
                        $scope.alert.show = true;
                        $scope.alert.msg = err.reason;
                    }
                    $scope.$apply();
                })
            }
            $scope.spinnershow = function() {
                return Meteor.loggingIn();
            }
            $scope.login = function() {
                Meteor.loginWithPassword($scope.lusername, $scope.lpassword, function(err) {
                    $scope.lpassword = "";
                    if (err) {
                        $scope.lalert.type = "danger";
                        $scope.lalert.show = true;
                        $scope.lalert.msg = err.reason;
                    } else {
                        $scope.lalert.show = false;
                        if ($routeParams.token) {
                            Accounts.verifyEmail($routeParams.token, function(err) {
                                if (err) {
                                    $scope.verification.msg = "Unable to verify email";
                                } else {
                                    $scope.verification.msg = "Email verified!";
                                }
                                $scope.verification.show = true;
                            });
                        }
                    }
                    $scope.$apply();
                });
            }
            $scope.googlelogin = function() {
                Meteor.loginWithGoogle(function(err) {
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
                        controller: ['$scope', '$modalInstance',
                            function($scope, $modalInstance) {
                                $scope.user = {
                                    username: ""
                                };
                                $scope.spinner = {
                                    spin: false
                                };
                                $scope.ok = function() {
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
                                            Meteor.users.update({
                                                _id: Meteor.userId()
                                            }, {
                                                $set: {
                                                    username: $scope.user.username
                                                }
                                            }, function(err) {
                                                if (err) {
                                                    $scope.spinner.spin = false;
                                                    $scope.error = "Error, try different username";
                                                    $scope.$apply();
                                                } else
                                                    $modalInstance.close($scope.user.username);
                                            });
                                        }
                                    });
                                }
                            }
                        ]
                    });
                    modalInstance.result.then(function(username) {
                        NuttySession.userloggedin();
                        console.log("username is : " + username);
                    }, function() {
                        console.log('Modal dismissed at: ' + new Date());
                        Meteor.logout(function() {
                            $scope.$apply();
                        });
                    });
                });
            }

            if (Meteor.userId() && $routeParams.token) {
                Accounts.verifyEmail($routeParams.token, function(err) {
                    $timeout(function() {
                        if (err) {
                            $scope.verification.msg = "Unable to verify email";
                        } else {
                            $scope.verification.msg = "Email verified!";
                        }
                        $scope.verification.show = true;
                    }, 0);
                });
            }

        }
    ]);
