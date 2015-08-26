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

/* angular-spinner version 0.2.1
 * License: MIT.
 * Copyright (C) 2013, Uri Shaked.
 */

'use strict';

angular.module('angularSpinner', [])
	.directive('usSpinner', ['$window', function ($window) {
		return {
			scope: true,
			link: function (scope, element, attr) {
				scope.spinner = null;

				function stopSpinner() {
					if (scope.spinner) {
						scope.spinner.stop();
						scope.spinner = null;
					}
				}

				scope.$watch(attr.usSpinner, function (options) {
					stopSpinner();
					scope.spinner = new $window.Spinner(options);
					scope.spinner.spin(element[0]);
				}, true);

				scope.$on('$destroy', function () {
					stopSpinner();
				});
			}
		};
	}]);
