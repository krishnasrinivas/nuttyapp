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
                    $scope.selectedscript = {};
                    $scope.paste = function() {
                        if (!$scope.selectedscript.script) {
                            alertBox.alert("danger", "Please select a script");
                            return;
                        }
                        cannedscripts.getscriptcontent($scope.selectedscript.script._id, function(err, content) {
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
