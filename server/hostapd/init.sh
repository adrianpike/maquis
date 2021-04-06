#!/bin/bash

set pipefail -euo

# hostapd config
apt-get install -y dnsmasq iptables hostapd
cp dnsmasq.conf /etc/dnsmasq.conf

./update_ap.sh

ifconfig wlan0 down
ifconfig wlan0 10.42.42.1
ifconfig wlan0 up

iptables -P FORWARD ACCEPT
iptables -F FORWARD
sysctl net.ipv4.ip_forward=1 # ipv6 too?
iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE

sleep 1

service dnsmasq start
hostapd -B -d /etc/hostapd/hostapd.conf
