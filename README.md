https://nutty.io

LICENSE
-------
nutty is licensed under GPLv3

Docker image
------------
Details here: https://registry.hub.docker.com/u/krishnasrinivas/nuttyapp/
(docker specific code on docker branch)

Nutty server install
--------------------

1.  Install MongoDB
2.  $ curl https://install.meteor.com/ | sh
3.  $ sudo npm install -g meteorite
4.  $ git clone https://github.com/krishnasrinivas/nuttyapp.git
5.  $ cd nuttyapp
6.  $ mrt install
7.  Configure authinfo.json (optional, details given below)
8.  $ meteor bundle ../bundle.tgz
9.  $ cd ..
10. $ tar xzvf bundle.tgz
11. $ export MONGO_URL=mongodb://localhost/nuttyapp
12. $ export PORT=80
      (or you can run it behind nginx)
13. $ export ROOT_URL='http://yourserver.com'
14. $ export MAIL_URL="smtp://user:passwd@smtp.mailgun.org:587"
      (get a free account on mailgun)
15. $ sudo node bundle/main.js
16. optional (needed for webrtc): $ ./peerjs --port 9000
17. go run recording.go -basedir ./recordings

authinfo.json should be put in "nuttyapp/private" directory with the format:

        {
            "google": {
                "clientId": "googleoauth-clientid-optional",
                "secret": "googleoauth-secret-optional"
            },
            "webrtc": {
                "key": "key from peerjs.com - optional - if you need webrtc"
            }
        }

google.clientId and google.secret can be configured if you need google auth signin.
webrtc should be configured if you need WebRTC. For webrtc config details check http://peerjs.com/.
nutty.io's webrtc config looks like this:

        "webrtc": {
            "host": "nutty.io",
            "port": 9000,
            "iceServers": [{
                "url": "stun:stun.l.google.com:19302"
            }]
        }
