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

