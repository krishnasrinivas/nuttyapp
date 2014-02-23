meteor-broadcast
===========

This package enables realtime communication between meteor clients without mongo.
Not added to atmosphere

The similar sounding meteor-pipe package is used when you need communication between a master and multiple slaves. (i.e slave can talk to master but not other slaves)

Usage
=====

On server:
if (Meteor.isServer) {
    var msgserver = new Meteor.Broadcast();
}

on clients do:
var client = new Meteor.Broadcast ("sharedcode");

("sharedcode" can be any string that is pre-agreed between clients.)

You can send data like this:
client.send(Object);

You can receive data from other clients like this:
client.on('data', function (data) {
    console.log (data);
}

Warning : Note that this package uses the undocumented Meteor.connection.registerStore API on client to receive server published data without using local Meteor.Collection on the client.

