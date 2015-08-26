/*
 * Copyright (c) 2014 krishna.srinivas@gmail.com All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

angular.module('nuttyapp')
    .factory('alertBox', function() {
        var retobj = {
            show: false,
            type: 'danger',
            msg: "",
            alert: alert,
            close: close
        }

        function alert(type, msg) {
            retobj.type = type;
            retobj.msg = msg;
            retobj.show = true;
        }

        function close() {
            retobj.show = false
        }
        window.alertBox = retobj;
        return retobj;
    });

angular.module('nuttyapp')
    .directive('nuttyAlert', function() {
        return {
            template: "<alert ng-style='alertstyle' style='margin:10px;margin-bottom:0px' ng-show='alertBox.show' type='alertBox.type' close='alertBox.close()'>[[alertBox.msg]]</alert>",
            scope: true,
            restrict: 'E',
            retplace: true,
            controller: ['$scope', 'alertBox',
                function($scope, alertBox) {
                    $scope.alertBox = alertBox;
                }
            ]
        }
    });
