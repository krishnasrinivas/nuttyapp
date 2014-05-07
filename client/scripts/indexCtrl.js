/*
 * https://nutty.io
 * Copyright (c) 2014 krishna.srinivas@gmail.com All rights reserved.
 * GPLv3 License <http://www.gnu.org/licenses/gpl.txt>
 */

gKeys = [];


angular.module('nuttyapp')
    .controller('indexCtrl', ['$scope', '$modal', '$location', 'NuttySession', 'ssh', 'Compatibility',
        function($scope, $modal, $location, NuttySession, ssh, Compatibility) {
            ga('send', 'pageview', 'home');
            var pvtkey = undefined;

            $scope.Compatibility = Compatibility;
            indexed('hosts').create(function(){});
            indexed('hosts').find(function(err, data) {
                $scope.servers = data;
                safeApply($scope);
            });

            function connect(host, port, username, password, pkey) {
                var paramikojsPkey;
                if (pkey) {
                    try {
                        paramikojsPkey = new paramikojs.RSAKey(null, null, 1, null, null, null);
                    } catch(ex) {
                        try {
                            paramikojsPkey = new paramikojs.DSSKey(null, null, 1, null, null, null);
                        } catch (ex) {
                            console.log("Neither RSA nor DSA key?");
                            console.log(ex);
                            $scope.loginerrshow = "Invalid RSA or DSA key";
                            return;
                        }
                    }
                }
                ssh.connect(host, port, username, password, paramikojsPkey, function(err) {
                    Meteor._reload.onMigrate("onMigrate", function() {
                        return [false];
                    });
                    $location.path('/share');
                    $scope.$apply();
                });
                modalInstance = $modal.open({
                    templateUrl: 'templates/connectmodal.html',
                    controller: ['$scope', '$modalInstance', 'sshstate',
                    function($scope, $modalInstance, sshstate) {
                        $scope.sshstate = sshstate;
                        $scope.spinshow = function() {
                            if (sshstate.state === "authfailure" || sshstate.state === 'disconnected')
                                return false;
                            else
                                return true;
                        }
                        $scope.$watch('sshstate.state', function(newValue, oldValue) {
                            if (newValue === 'authsuccess') {
                                setTimeout(function() {
                                    $modalInstance.close();
                                }, 0);
                            }
                            console.log(sshstate.error);
                        });
                    }]});
            }

            $scope.sshhostporterr = function() {
                var host, port;
                if ($scope.hostport && $scope.hostport.match(/:/)) {
                    host = $scope.hostport.match(/(.*):(.*)/)[1];
                    port = parseInt($scope.hostport.match(/(.*):(.*)/)[2]);
                    if (!host || !port)
                        return "has-error";
                }
                return "";
            }

            $scope.usernameerr = function() {
                return "";
            }

            $scope.loginerrclose = function() {
                $scope.loginerrshow = "";
            }

            function loginformerr() {
                var host, port;
                if ($scope.hostport && $scope.hostport.match(/:/)) {
                    host = $scope.hostport.match(/(.*):(.*)/)[1];
                    port = parseInt($scope.hostport.match(/(.*):(.*)/)[2]);
                }
                if (!host)
                    host = $scope.hostport;
                if (!port)
                    port = 22;
                if (!host || !port) {
                    return "Incorrect SshHost entry";
                }
                if (!$scope.username) {
                    return "username required";
                }
                if (!$scope.password && !pvtkey) {
                    return "password or pvtkey required";
                }
                return "";
            }

            $scope.submit = function() {
                function afterinstall() {
                    var host, port;
                    if (!$scope.hostport) {
                        $scope.hostport = "localhost";
                    }
                    if ($scope.hostport && $scope.hostport.match(/:/)) {
                        host = $scope.hostport.match(/(.*):(.*)/)[1];
                        port = parseInt($scope.hostport.match(/(.*):(.*)/)[2]);
                    }
                    if (!host)
                        host = $scope.hostport;
                    if (!port)
                        port = 22;
                    $scope.loginerrshow = loginformerr();
                    if ($scope.loginerrshow)
                        return;
                    connect(host, port, $scope.username, $scope.password, pvtkey);
                }
                if (Compatibility.browser.incompatible) {
                    alert("Supported on Chrome. Firefox support coming soon!");
                    return;
                }
                if (ssh.appinstalled) {
                    afterinstall();
                } else {
                    chrome.webstore.install("https://chrome.google.com/webstore/detail/jeiifmbcmlhfgncnihbiicdbhnbagmnk",
                    function() {
                        setTimeout(function() {
                            afterinstall();
                        }, 2000);
                    }, function() {
                        alert("Nutty install failed.");
                    });
                }
            }

            $scope.readpvtkey = function() {
                var reader = new FileReader();
                reader.onload = function(e) {
                    gKeys[1] = e.target.result;
                    // pvtkey = new paramikojs.RSAKey(null, null, 1, null, null, null);
                    pvtkey = e.target.result;
                    console.log(pvtkey);
                }
                reader.readAsText($('#pvtkey')[0].files[0]);
            }

            $scope.currentuser = function() {
                var user = Meteor.user();
                if (user) {
                    return user.username;
                } else {
                    return "";
                }
            };

            $scope.save = function() {
                var host, port;
                if ($scope.hostport && $scope.hostport.match(/:/)) {
                    host = $scope.hostport.match(/(.*):(.*)/)[1];
                    port = parseInt($scope.hostport.match(/(.*):(.*)/)[2]);
                }
                if (!host)
                    host = $scope.hostport;
                if (!port)
                    port = 22;
                $scope.loginerrshow = loginformerr();
                if ($scope.loginerrshow)
                    return;

                var hostobj = {
                    host: host,
                    port: port,
                    username: $scope.username,
                    password: $scope.password,
                    pvtkey: pvtkey
                }
                console.log(hostobj);
                indexed('hosts').insert(hostobj, function(){
                    indexed('hosts').find(function(err, data) {
                        $scope.servers = data;
                        console.log(data);
                        $scope.$apply();
                    });
                });
            }
            $scope.serverdelete = function(id) {
                indexed('hosts').delete({
                    _id: id
                }, function(err, data) {
                    indexed('hosts').find(function(err, data) {
                        $scope.servers = data;
                        console.log(data);
                        $scope.$apply();
                    });
                });
            }
            $scope.serverconnect = function(server) {
                function afterinstall() {
                    gKeys[1] = server.pvtkey;
                    connect(server.host, server.port, server.username, server.password, server.pvtkey);
                }
                if (Compatibility.browser.incompatible) {
                    alert("Supported on Chrome. Firefox support coming soon!");
                    return;
                }
                if (ssh.appinstalled) {
                    afterinstall();
                } else {
                    chrome.webstore.install("https://chrome.google.com/webstore/detail/jeiifmbcmlhfgncnihbiicdbhnbagmnk",
                    function() {
                        setTimeout(function() {
                            afterinstall();
                        }, 2000);
                    }, function() {
                        alert("Nutty install failed.");
                    });
                }
            }
        }
    ]);


angular.module('nuttyapp')
    .controller('faqCtrl', ['$scope', '$location', '$anchorScroll',
        function($scope, $location, $anchorScroll) {
            ga('send', 'pageview', 'faq');
            $scope.currentuser = function() {
                var user = Meteor.user();
                if (user) {
                    return user.username;
                } else {
                    return "";
                }
            };
            $scope.scrollto = function(id) {
                $location.hash(id);
                $anchorScroll();
            }
        }]);
