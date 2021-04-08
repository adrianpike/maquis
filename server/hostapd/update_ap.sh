#!/bin/bash

set pipefail -euo

MAC=$(cat /sys/class/net/wlan0/address | rev | cut -c-8 | sed 's/://g')

hostname "maquis-$MAC"

cat hostapd.conf | sed "s/MAC/${MAC}/" > /etc/hostapd/hostapd.conf
