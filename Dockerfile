FROM ubuntu:xenial

COPY . /opt/latest-node/
RUN apt-get update && apt-get install -y wget && wget https://nodejs.org/dist/v6.11.3/node-v6.11.3-linux-x64.tar.gz && tar xpzf node-v6.11.3-linux-x64.tar.gz --strip-components=1 -C /usr/local && rm node-v6.11.3-linux-x64.tar.gz && apt-get clean -y && cd /opt/latest-node && npm i

EXPOSE 3000

CMD cd /opt/latest-node && node lib/server.js
