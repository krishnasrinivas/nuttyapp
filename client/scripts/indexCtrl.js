/*
 * https://nutty.io
 * Copyright (c) 2014 krishna.srinivas@gmail.com All rights reserved.
 * GPLv3 License <http://www.gnu.org/licenses/gpl.txt>
 */

angular.module('nuttyapp')
    .controller('indexCtrl', ['$scope', '$modal', '$location', 'NuttySession',
        function($scope, $modal, $location, NuttySession) {
            $scope.sharedsessions = NuttySession.sharedsessions;
            $scope.recordings = NuttySession.recordings;
            if ($location.$$path === '/')
                ga('send', 'pageview', 'home');
            else if ($location.$$path === '/contact')
                ga('send', 'pageview', 'contact');
            $scope.datetime = function(idx) {
                if ($scope.recordings[idx].createdAt)
                    return $scope.recordings[idx].createdAt.toString().replace(/ GMT.*/, '');
                else
                    return "";
            }
            $scope.currentuser = function() {
                var user = Meteor.user();
                if (user) {
                    return user.username;
                } else {
                    return "";
                }
            };
            $scope.deleterecording = function(idx) {
                NuttySession.deleterecording($scope.recordings[idx]._id);
            }
            $scope.copyembed = function(idx) {
                $scope.recordings[idx].visible = true;
                $scope.recordings[idx].value =
                    '<iframe width="640" height="360" src="' + 'https://nutty.io/recording/' + $scope.recordings[idx].filename + '" frameborder="0"></iframe>';
                setTimeout(function() {
                    $('#' + $scope.recordings[idx].filename.replace(/\./, ''))[0].focus();
                    $('#' + $scope.recordings[idx].filename.replace(/\./, ''))[0].select();
                }, 0);
            }
        }
    ])
