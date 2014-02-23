angular.module('nuttyapp')
	.factory('MasterConnection', ['$rootScope', 'NuttySession', function($rootScope, NuttySession) {
		var master;
		var ondata;
		var retobj;
		$rootScope.$watch(function() {
			return NuttySession.sessionid;
		}, function(newval, oldval) {
			master = new Meteor.PipeClientMaster (NuttySession.sessionid);
			master.on('data', function(data) {
				if (!data)
					return;
				if (data.start) {
					retobj.active = true;
					return;
				}
				if (data.stop) {
					retobj.active = false;
					return;
				}
				if (NuttySession.readonly) {
					if (data.data !== String.fromCharCode(2) + 'r')
						return;
				}
				if (ondata)
					ondata(data);
			});
		});
		retobj = {
			active: false,
			pipe: {
				write: function (data) {
					if (!retobj.active)
						return;
					if (master) {
						master.send (data);
					}
				},
				ondata: function (cbk) {
					ondata = cbk;
				}
			}			
		}
		window.MasterConnection = retobj;
		return retobj;
	}]);
