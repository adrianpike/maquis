FROM debian:buster-slim

RUN mkdir -p /etc/direwolf

RUN apt-get update && apt-get -y dist-upgrade \
 && apt-get install -y \
    libasound2-dev \
    libudev-dev \
    alsa-utils \
 && rm -rf /var/lib/apt/lists/*

RUN apt-get update && apt-get install -y \
    build-essential \
    git \
    cmake \
 && rm -rf /var/lib/apt/lists/*

RUN git clone "https://github.com/wb2osz/direwolf.git" /tmp/direwolf \
  && cd /tmp/direwolf \
  && git checkout dev \
  && mkdir build && cd build \
  && cmake .. \
  && make -j4 \
  && make install \
  && make install-conf

ENV CALLSIGN "N0CALL"
ENV PASSCODE "-1"
ENV IGSERVER "noam.aprs2.net"
ENV FREQUENCY "144.39M"
ENV COMMENT "Direwolf in Docker w2bro/direwolf"
ENV SYMBOL "igate"

WORKDIR /etc/direwolf
COPY direwolf.conf .

EXPOSE 8001 

CMD ["/bin/bash", "-c", "direwolf"]
