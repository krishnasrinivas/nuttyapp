angular.module('nuttyapp')
    .factory('Clipboard', ['$rootScope',
        function($rootScope) {
        	var pastecbk;
        	var port;
            var extid = "ooelecakcjobkpmbdnflfneaalbhejmk";
            // var extid = "jboablmfecefcaedlpaaciooecbgjbhl";

            function postMessage(msg) {
                if (port) {
                    port.postMessage(msg)
                } else {
                    msg.type = '_nutty_fromwebpage';
                    window.postMessage(msg, window.location.origin);
                }
            }

        	var retobj = {
        		pastecbk: function(cbk) {
        			pastecbk = cbk;
        		},
        		copy: function(data) {
        			postMessage({
        				copy: data,
        			});
        		},
        		paste: function() {
        			postMessage({
        				paste: true
        			})
        		}
        	}
            window.copy = function(data) {
            	retobj.copy(data);
            }
            window.Clipboard = retobj;
            if (window.chrome && chrome.runtime && chrome.runtime.connect)
                port = chrome.runtime.connect(extid);
            if (port) {
                port.onMessage.addListener(function(msg) {
                    if (pastecbk)
                        pastecbk(msg.paste);
                });
                port.onDisconnect.addListener (function() {
                    console.log ("nutty extension disconnected");
                });
            }
            return retobj;
        }]);
