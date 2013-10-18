/*
 * https://nutty.io
 * Copyright (c) 2013 krishna.srinivas@gmail.com All rights reserved.
 * GPLv3 License <http://www.gnu.org/licenses/gpl.txt>
 */

'use strict';

angular.module('nuttyApp')
    .factory('Auth', function($http, $rootScope, $location, md5, log) {
        var userprofile = {
            signedin: false,
            email: "",
        };

        function getuserprofile() {
            var profileurl = $location.$$protocol + "://" + $location.$$host + "/api/user/info";
            $http({
                method: 'GET',
                url: profileurl
            }).
            success(function(data, status) {
                if (data.error) {
                    log.info("User not signedin");
                    return;
                }
                if (!data.username) {
                    log.error("username not provided");
                    retobj.signout();
                    return;
                }
                userprofile.email = data.emails[0].value;
                userprofile.username = data.username;
                userprofile.signedin = true;
                userprofile.emailhash = md5.createHash(userprofile.email);
                log.info("signedin user : " + userprofile.username);
            }).
            error(function(data, status) {
                log.error("error while fetching userinfo, internet down?")
            });
        }

        function signincbk() {
            getuserprofile();
            $rootScope.$apply();
        };

        getuserprofile();
        var retobj = {
            userprofile: userprofile,
            signin: function() {
                var returnToUrl = $location.$$protocol + "://" + $location.$$host + "/api/auth/google/return";

                if (userprofile.signedin)
                    return;

                var extensions = {
                    'openid.ns.ax': 'http://openid.net/srv/ax/1.0',
                    'openid.ax.mode': 'fetch_request',
                    'openid.ax.type.email': 'http://axschema.org/contact/email',
                    'openid.ax.type.firstname': 'http://axschema.org/namePerson/first',
                    'openid.ax.type.lastname': 'http://axschema.org/namePerson/last',
                    'openid.ax.required': 'email,firstname,lastname'
                };

                var googleOpener = popupManager.createPopupOpener({
                    'realm': $location.$$protocol + "://" + $location.$$host,
                    'opEndpoint': 'https://www.google.com/accounts/o8/ud',
                    'returnToUrl': returnToUrl,
                    'onCloseHandler': signincbk,
                    'shouldEncodeUrls': true,
                    'extensions': extensions
                });
                googleOpener.popup(450, 500);

            },
            signout: function() {
                var logouturl = $location.$$protocol + "://" + $location.$$host + '/api/auth/google/logout';
                $http({
                    method: 'GET',
                    url: logouturl
                }).
                success(function(data, status) {
                    log.info("sign out : " + userprofile.username);
                    userprofile.email = null;
                    userprofile.username = null;
                    userprofile.signedin = false;
                    userprofile.emailhash = null;
                }).
                error(function(data, status) {
                    log.error("error while signing out, internet down?")
                });
            }
        }
        return retobj;
    });
