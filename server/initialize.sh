#!/bin/bash

set pipefail -euo

rfkill block wifi
rfkill unblock wifi

sudo apt-get update -y
sudo apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

sh hostapd/init.sh

curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

sudo curl -L https://github.com/linuxserver/docker-docker-compose/releases/download/1.28.5-ls32/docker-compose-armhf | sudo tee /usr/local/bin/docker-compose
sudo chmod a+x /usr/local/bin/docker-compose
sudo docker-compose up -d
