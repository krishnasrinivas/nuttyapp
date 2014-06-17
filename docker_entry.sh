#!/bin/bash

# turnserver will run at 3478, peerjs server runs at 9000

mongod --noprealloc --smallfiles --fork --logpath /var/log/mongodb/mongod.log
service turnserver start
supervisor peerjs -p 9000 &
supervisor node /opt/bundle/main.js


