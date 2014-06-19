https://nutty.io

LICENSE
-------
nutty is licensed under GPLv3

Docker install
--------------------

`docker run -d -p 8080:80 -p 8081:3478 -p 8082:9000 -e "TURNPORT=8081" -e "PEERJSPORT=8082" krishnasrinivas/nuttyapp`


You need to expose the webserver(80) turnserver(3478) and peerjs-server(9000) and pass the port numbers to the docker container using the environmental variables TURNPORT and PEERJSPORT
