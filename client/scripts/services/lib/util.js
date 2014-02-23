/*
 * https://nutty.io
 * Copyright (c) 2014 krishna.srinivas@gmail.com All rights reserved.
 * GPLv3 License <http://www.gnu.org/licenses/gpl.txt>
 */

safeApply = function(scope) {
  var phase = scope.$root.$$phase;
  if(phase == '$apply' || phase == '$digest')
    return;
  else
    scope.$apply();
}

termfocus = function() {
	term.focus();
}

