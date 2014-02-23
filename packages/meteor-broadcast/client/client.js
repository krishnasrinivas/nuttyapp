/*
 * Copyright (c) 2013 Krishna Srinivas
 * MIT License
 */

Meteor.Broadcast = function (sharecode) {
	EventEmitter.call(this);
	var streamName = '_meteor_peerbroadcast_';
	var self = this;
	var clientid = Random.id();

	Meteor.connection.registerStore (streamName, {
		update: function (data) {
			self.emit('data', data.fields);
		}
	});

	Meteor.subscribe (streamName, sharecode, clientid, {
		onError : function (e) {
			self.emit('error', e);
		},
		onReady : function () {
			self.emit('ready');
		}
	});

	this.send = function (data) {
		Meteor.call(streamName, sharecode, clientid, data);
	}
}


util.inherits(Meteor.Broadcast, EventEmitter);
