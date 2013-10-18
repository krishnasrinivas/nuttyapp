/*
 * https://nutty.io
 * Copyright (c) 2013 krishna.srinivas@gmail.com All rights reserved.
 * GPLv3 License <http://www.gnu.org/licenses/gpl.txt>
 */

'use strict'

angular.module('nuttyApp')
    .factory('Recording', function($http, $location, log) {
        var uploadPolicyURL = $location.$$protocol + "://" + $location.$$host + "/api/policy/upload/";
        var downloadPolicyURL = $location.$$protocol + "://" + $location.$$host + "/api/policy/download/";
        var removeRecording = $location.$$protocol + "://" + $location.$$host + "/api/policy/remove/";

        return {
            upload: function(file, desc, cbk) {
                if (!desc.match(/^[a-zA-Z][a-zA-Z0-9-,.:\s]+$/)) {
                    log.error ("Invalid characters in description");
                    return;
                }
                if (desc.length > 30) {
                    log.error ("description length should be < 30 characters");
                    return;
                }
                log.debug("uploading : " + desc);
                $http({
                    method: 'GET',
                    url: uploadPolicyURL + desc
                }).
                success(function(data, status) {
                    if (data.error) {
                        log.error("upload error : " + data.errormsg);
                        cbk();
                    } else {
                        var xhr = new XMLHttpRequest();
                        var fd = new FormData();

                        fd.append('key', data.key);
                        fd.append('AWSAccessKeyId', data.AWSAccessKeyId);
                        fd.append('acl', data.acl);
                        //fd.append('success_action_redirect', data.success_action_redirect);
                        fd.append('policy', data.policy);
                        fd.append('signature', data.signature);
                        fd.append('Content-Type', data.ContentType);

                        // This file object is retrieved from a file input.
                        fd.append('file', file);
                        xhr.open('POST', 'https://nutty.s3.amazonaws.com', true);

                        xhr.onreadystatechange = function() {
                            if (xhr.readyState != 4) {
                                return;
                            }
                            if (xhr.status != 204)
                                log.error("error uploading recording : " + desc + " (size > 1MB?)");
                            else
                                log.info("uploaded recording : " + desc);
                            cbk(1);
                        };
                        xhr.send(fd);
                    }
                }).
                error(function(data, status) {
                    log.error("upload error");
                    cbk();
                });
            },
            download: function(filename, cbk) {
                log.debug("downloading recording...");
                $http({
                    method: 'GET',
                    url: downloadPolicyURL + filename
                }).
                success(function(data, status) {
                    if (data.error) {
                        log.error(data.errormsg);
                        cbk();
                    } else {
                        log.debug("recording download start");
                        $http({
                            method: "GET",
                            url: "https://nutty.s3.amazonaws.com/" + filename,
                            params: data,
                            responseType: 'blob'
                        }).
                        success(function(data, status) {
                            log.debug("recording downloaded!");
                            cbk(data);
                        }).
                        error(function(data, status) {
                            log.error("s3 download error");
                            cbk();
                        });
                    }
                }).
                error(function(data, status) {
                    console.log("upload policy fetch error, internet down?");
                });
            },
            remove: function(key, val, cbk) {
                log.debug("recording remove : " + val);
                $http({
                    method: 'GET',
                    url: removeRecording + key + "/" + val
                }).
                success(function(data, status) {
                    if (data.error) {
                        log.error("recording remove failed : " + log.errormsg);
                    }
                    log.debug("delete done! recording : " + val);
                    cbk(data);
                }).
                error(function(data, status) {
                    log.error("recording remove error during GET, internet down?");
                    cbk({
                        error: "delete",
                        errormsg: "delete error"
                    });
                });
            }
        }
    });
