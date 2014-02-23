/*
 * Copyright (c) 2013 Krishna Srinivas
 * MIT License
 */

Meteor.Broadcast = function() {
	EventEmitter.call(this);
	var streamName = '_meteor_peerbroadcast_';
	var methods = {};
	var peerbroadcastserver = this;
	var messages = {};

	Meteor.publish(streamName, function (sharecode, clientid) {
		var self = this;
		var pushData = function (_clientid, data) {
			if (_clientid === clientid) {
				return;
			}
			var id = Random.id();
			self.added (streamName, id, data);
		};

		peerbroadcastserver.on(sharecode, pushData);
		if (!messages[sharecode]) {
			messages[sharecode] = [];
		}

		this.onStop(function () {
			peerbroadcastserver.off(sharecode, pushData);
			if (!peerbroadcastserver._events[sharecode]) {
				delete messages[sharecode];
			}
		});

		this.ready();
		_.each(messages[sharecode], function(element) {
			self.added (streamName, Random.id(), element);
		});
	});

	methods[streamName] = function (sharecode, _clientid, data) {
		if (Meteor.userId())
			data.username = Meteor.user().username;
		messages[sharecode].push(data);
		if (messages[sharecode].length >= 11)
			messages[sharecode].shift();
		peerbroadcastserver.emit(sharecode, _clientid, data);
	}

	Meteor.methods (methods);
}

util.inherits(Meteor.Broadcast, EventEmitter);
