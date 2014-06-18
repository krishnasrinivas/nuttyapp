FROM       ubuntu:14.04
MAINTAINER Krishna Srinivas <krishna.srinivas@gmail.com>
RUN apt-get update
RUN apt-get install -y -q mongodb
RUN mkdir -p /data/db
RUN apt-get install -yq git
RUN apt-get install -yq curl
RUN apt-get install -yq wget
RUN apt-get install -yq turnserver
RUN apt-get install -yq unzip
RUN curl https://install.meteor.com/ | sh
WORKDIR /opt
RUN curl -O http://nodejs.org/dist/v0.10.28/node-v0.10.28-linux-x64.tar.gz
RUN tar xzf node-v0.10.28-linux-x64.tar.gz
ENV PATH /usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/opt/node-v0.10.28-linux-x64/bin/
RUN npm install -g peer
RUN npm install -g meteorite
RUN wget https://github.com/krishnasrinivas/nuttyapp/archive/docker.zip
RUN unzip docker.zip
WORKDIR /opt/nuttyapp-docker/
RUN mrt install
RUN meteor bundle ../bundle.tgz
WORKDIR /opt
RUN tar xzf bundle.tgz
EXPOSE 80
EXPOSE 9000
EXPOSE 3478
ENV PORT 80
ENV MONGO_URL mongodb://localhost/nuttyapp?autoReconnect=true
ENTRYPOINT /opt/nuttyapp-docker/docker_entry.sh

