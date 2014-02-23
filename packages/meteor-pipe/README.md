meteor-pipe
===========

This package enables realtime communication between meteor clients without mongo.
Not added to atmosphere

Usage
=====

On server:
if (Meteor.isServer) {
    var pipeserver = new Meteor.PipeServer();
}

on one client do:
var master = new Meteor.PipeClientMaster ("random-string");

on another client do:
var slave = new Meteor.PipeClientSlave ("random-string");

("random-string" can be any string that is pre-agreed between clients.)

This establishes connection between 'master' and 'slave'
You can send data like this:
master.send(Object)
or
slave.send(Object)

You can receive data like this:
master.on('data', function (data) {
    console.log (data);
}

or

slave.on('data', function (data) {
    console.log (data);
}

Note that for you can have multiple 'slave' connections to a single 'master' in which case when you do master.send() it reaches all the slaves. However if you do slave.send() it reaches only the master. Data is mux'ed on the server.

Warning : Note that this package uses the undocumented Meteor.connection.registerStore API on client to receive server published data without using local Meteor.Collection on the client.

