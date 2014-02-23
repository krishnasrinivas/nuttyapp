/*
 * https://nutty.io
 * Copyright (c) 2014 krishna.srinivas@gmail.com All rights reserved.
 * GPLv3 License <http://www.gnu.org/licenses/gpl.txt>
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
    	return retobj;
    });

angular.module('nuttyapp')
    .directive('nuttyAlert', function() {
        return {
            template: "<alert ng-style='alertstyle' style='margin:10px;margin-bottom:0px' ng-show='alertBox.show' type='alertBox.type' close='alertBox.close()'>[[alertBox.msg]]</alert>",
            scope: true,
            restrict: 'E',
            retplace: true,
            controller: ['$scope', 'alertBox', function($scope, alertBox) {
            	$scope.alertBox = alertBox;
            }]
        }
    });
