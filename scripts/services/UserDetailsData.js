/*
 * https://nutty.io
 * Copyright (c) 2013 krishna.srinivas@gmail.com All rights reserved.
 * GPLv3 License <http://www.gnu.org/licenses/gpl.txt>
 */

'use strict'

angular.module('nuttyApp').
	factory('UserDetailsData', function(NuttyUtil) {
	    return {
	        resizeStyle: {
	            zIndex: NuttyUtil.incZindex(),
	        },
	        visible: {
	            val: false
	        }
	    }
	});
