#!/bin/bash

set pipefail -euo

MAC=$(cat /sys/class/net/wlan0/address | rev | cut -c-8 | sed 's/://g')

echo "New hostname; maquis-$MAC"
hostname "maquis-$MAC"
echo "maquis-$MAC" > /etc/hostname

cat hostapd.conf | sed "s/MAC/${MAC}/" > /etc/hostapd/hostapd.conf
