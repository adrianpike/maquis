#!/bin/bash

set pipefail -euo

apt-get install -y dnsmasq iptables hostapd avahi-daemon

cd /tmp/
cp dnsmasq.conf /etc/dnsmasq.conf
cp hostapd.service /etc/systemd/system/hostapd@.service
cp update_hostname.sh /usr/sbin/update_hostname.sh
systemctl unmask hostapd.service

ifconfig wlan0 down
ifconfig wlan0 10.42.42.1
ifconfig wlan0 up

iptables -P FORWARD ACCEPT
iptables -F FORWARD
sysctl net.ipv4.ip_forward=1 # ipv6 too?
iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE

service dnsmasq enable
service hostapd enable 
