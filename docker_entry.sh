#!/bin/bash

# turnserver will run at 3478, peerjs server runs at 9000

mongod --noprealloc --smallfiles --fork --logpath /var/log/mongodb/mongod.log
service turnserver start
peerjs -p 9000 &
node /opt/bundle/main.js


