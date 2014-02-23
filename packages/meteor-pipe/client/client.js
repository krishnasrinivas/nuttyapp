/*
 * Copyright (c) 2013 Krishna Srinivas
 * MIT License
 */

Meteor.PipeClientMaster = function (sharecode) {
	EventEmitter.call(this);
	var streamName = '_meteor_pipe_';
	var self = this;

	Meteor.connection.registerStore (streamName, {
		update: function (data) {
			self.emit('data', data.fields);
		}
	});

	Meteor.subscribe (streamName, sharecode, 'master', {
		onError : function (e) {
			self.emit('error', e);
		},
		onReady : function () {
			self.emit('ready');
		}
	});

	this.send = function (data) {
		Meteor.call(streamName, sharecode, 'master', data);
	}
}

Meteor.PipeClientSlave = function (sharecode) {
	EventEmitter.call(this);
	var streamName = '_meteor_pipe_';
	var self = this;

	Meteor.connection.registerStore (streamName, {
		update: function (data) {
			self.emit('data', data.fields);
		}
	});

	Meteor.subscribe (streamName, sharecode, 'slave', {
		onError : function (e) {
			self.emit('error', e);
		},
		onReady : function () {
			self.emit('ready');
		}
	});

	this.send = function (data) {
		Meteor.call(streamName, sharecode, 'slave', data);
	}
}

util.inherits(Meteor.PipeClientMaster, EventEmitter);
util.inherits(Meteor.PipeClientSlave, EventEmitter);
