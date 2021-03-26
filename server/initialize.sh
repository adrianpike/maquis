#!/bin/bash

set -euo pipefail

apt-get install udhcpd hostapd 

cp ./hostapd.conf /etc/hostapd/
# cp ./udhcpd.conf /etc/
