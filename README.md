# Nutty [![Gitter](https://badges.gitter.im/Join Chat.svg)](https://gitter.im/krishnasrinivas/nuttyapp?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

https://nutty.io

## Advanced use cases

### Docker image

Details here: https://registry.hub.docker.com/u/krishnasrinivas/nuttyapp/
(docker specific code on docker branch)

### Server install

Nutty server depends on MongoDB please install before proceeding https://www.mongodb.org/downloads

```
$ curl https://install.meteor.com/ | sh
$ git clone https://github.com/krishnasrinivas/nuttyapp.git
$ cd nuttyapp
$ meteor install
Configure authinfo.json (optional, details given below)
$ meteor bundle ../bundle.tgz
$ cd ..
$ tar xzvf bundle.tgz
$ export MONGO_URL=mongodb://localhost/nuttyapp
$ export PORT=80
      (or you can run it behind nginx)
$ export ROOT_URL='http://yourserver.com'
$ export MAIL_URL="smtp://user:passwd@smtp.mailgun.org:587"
      (get a free account on mailgun)
$ sudo node bundle/main.js
optional (needed for webrtc): $ ./peerjs --port 9000
$ go run recording.go -basedir ./recordings
```

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
        
       
       
LICENSE
-------
Nutty is released under [Apache License v2](./LICENSE)
