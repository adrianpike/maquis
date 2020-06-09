#include "heltec.h"
#include "WiFi.h"
#include "SPIFFS.h"

#include "secrets.h"

// https://github.com/fhessel/esp32_https_server
#include <HTTPSServer.hpp>
#include <HTTPRequest.hpp>
#include <HTTPResponse.hpp>
#include <ResourceNode.hpp>
#include <WebsocketHandler.hpp> // Rumor has it this is pretty experimental.

#include <ArduinoJson.h>

using namespace httpsserver;

// TODO: https
HTTPServer server = HTTPServer();


// TODO: fix the C/C++ nightmare i've opened here
void queuePacket(String packet);

class ClientHandler : public WebsocketHandler {
public:
  static WebsocketHandler* create();
  void onMessage(WebsocketInputStreambuf * input);
  void onClose();
};

ClientHandler* wsClient;

WebsocketHandler * ClientHandler::create() {
  Serial.println("Creating new chat client!");
  wsClient = new ClientHandler();
  return wsClient;
}
void ClientHandler::onClose() {
  wsClient = nullptr;
}
void ClientHandler::onMessage(WebsocketInputStreambuf * inbuf) {
  std::stringstream buffer;
  buffer << inbuf;
  Serial.println(buffer.str().c_str());
  ::queuePacket(buffer.str().c_str());
}

// TODO: This might be configurable. TODO: investigate regional legal concerns on this front.
#define LORA_FREQ 915E6

typedef struct {
  char *ssid;
  char *pass;
  char *callsign; // TODO: generate a sweet random callsign for you
  char *psk;

  char *localPass = "12341234";

  bool encrypt;
  bool enable_tunnel; // This enables a TCP tunnel that simply streams TCP/UDP packets on port 8080 out onto the LoRa.
  // I'm using this for tunneling ATAK over LoRa for fun and games innawoods.

  int lora_spreading_factor = 12; // Large spreading factor, longer time on air but more range
  int lora_coding_rate = 8; // Overhead is doubled, but alas.
  long lora_signal_bandwidth = 62.5E3; // Tighter bandwidth - more resistant to noise.
  int lora_preamble_length = 8;
} Config;

Config config;

// TODO: why fixed ring buffers? what are you thinking dude
int queuedHead = 0;
int queuedTail = 0;
String queuedPackets[255];

int receivedHead = 0;
int receivedTail = 0;
String receivedPacket[255];
int receivedRssi[255];

// Wifi globals
IPAddress localIp;
String tempSSID;

// Lora globals
bool lastPacketChanged = false;
int lastRssi;
String lastPacket;

void initRadio() {
  LoRa.setSpreadingFactor(config.lora_spreading_factor); 
  LoRa.setCodingRate4(config.lora_coding_rate);
  LoRa.setPreambleLength(config.lora_preamble_length);
  LoRa.setSignalBandwidth(config.lora_signal_bandwidth);
}

void initWifi() {
  if (config.ssid && config.pass) {
    WiFi.begin(config.ssid, config.pass);
    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 10) {
      attempts++;
      Heltec.display->drawString(0, 10, "Connecting to wifi...");
      Heltec.display->display();
      delay(500);
    }
  }

  // We either jumped right to AP mode bc no ssid/pass, or timed out.
  if (WiFi.status() == WL_CONNECTED) {
    localIp = WiFi.localIP();
    tempSSID = config.ssid;
  } else {
    tempSSID = "Maquis" + String(random(1000));
    
    char buf[128]; // TODO: cast in the softAP call
    tempSSID.toCharArray(buf, tempSSID.length());
    WiFi.softAP(buf, config.localPass);
    localIp = WiFi.softAPIP();
  }
}

void handleJSBundle(HTTPRequest * req, HTTPResponse * res) {
  res->setHeader("Content-Type", "application/javascript");
  File file = SPIFFS.open("/main.js");
  while(file.available()){
    res->write(file.read());
  }
}

void handleRoot(HTTPRequest * req, HTTPResponse * res) {
  res->setHeader("Content-Type", "text/html");
  File file = SPIFFS.open("/index.html");
  while(file.available()){
    res->write(file.read());
  }
}

void handleGetConfig(HTTPRequest * req, HTTPResponse * res) {
  res->setHeader("Content-Type", "application/json");
  const int capacity = JSON_OBJECT_SIZE(3);
  StaticJsonDocument<capacity> doc;

  String outBuf = "";
  serializeJson(doc, outBuf);
  res->print(outBuf);
}

void initHttpServer() {
  ResourceNode * root = new ResourceNode("/", "GET", &handleRoot);
  ResourceNode * getJSBundle = new ResourceNode("/main.js", "GET", &handleJSBundle);
  ResourceNode * getConfig = new ResourceNode("/config.json", "GET", &handleGetConfig);

  // TODO: POST config
  // TODO: POST message

  WebsocketNode * clientNode = new WebsocketNode("/ws", &ClientHandler::create);
  server.registerNode(clientNode);

  server.registerNode(getJSBundle);
  server.registerNode(getConfig);
  server.registerNode(root);

  server.start();
}

// Dumps it to both the serial output and the OLED display (if it exists)
// TODO: log levels
int logLine = 0;
void logger(String str) {
   Serial.println(str);
}

void setup() {
  Heltec.begin(true /*DisplayEnable Enable*/, true /*LoRa Enable*/, true /*Serial Enable*/, true /*LoRa use PABOOST*/, LORA_FREQ  /*LoRa RF working band*/);
  
  // Boot screen. Alignment & font possibly redundant.
  Heltec.display->init();
  Heltec.display->setTextAlignment(TEXT_ALIGN_LEFT);
  Heltec.display->setFont(ArialMT_Plain_10);
  Heltec.display->drawString(0, 0, "m a q u i s v0.1");
  Heltec.display->display();
  
  // Possible future bug: we should verify frequency drift as temperature changes, and make sure that 
  // the underlying semtech chipset we use correctly adjusts.

  // Configuration loading
  logger("Loading config...");
  SPIFFS.begin(true);
  if (SPIFFS.exists("/config.json")) {
    logger("Loading config from config.json...");
    File file = SPIFFS.open("/config.json", "r");
  } else {
    logger("No config, using default config!");
    config.ssid = "1015 55th";
    config.pass = DEFAULT_PASS; // it's from secrets, sorry. :)
  }

  initRadio();
  initWifi();
  initHttpServer();

  // On Heltec boards, this is the PRG switch.
  attachInterrupt(0,interrupt_GPIO0,FALLING);

  LoRa.onReceive(interrupt_loraReceive);
  LoRa.receive();

  // Initialization complete, clear launch screen and show address info.
  Heltec.display->clear();
  Heltec.display->drawString(0, 0, localIp.toString() + "@" + config.ssid);
  Heltec.display->display();
}

void queuePacket(String packet) {
  queuedPackets[queuedTail] = packet;
  queuedTail = queuedTail + 1 % 255;
  logger("S:" + packet + ", h:" + String(queuedHead) + ", t:" + String(queuedTail));
}

int pingCount = 0;
void interrupt_GPIO0() {
  queuePacket("SYN" + String(pingCount));
  pingCount++;
}

void interrupt_loraReceive(int size) {
  String lastPacket;
  lastRssi = LoRa.packetRssi();
  while (LoRa.available()) {
    lastPacket += (char) LoRa.read();
  }

  receivedPacket[receivedTail] = lastPacket;
  receivedRssi[receivedTail] = lastRssi;
  receivedTail = receivedTail + 1 % 255;

  if (lastPacket == "SYN") { // todo: starts with
    queuePacket("PONG:" + String(lastRssi, DEC));
  }
}

void loRaBroadcast(String content) {
  LoRa.beginPacket();
  LoRa.print(content);
  LoRa.endPacket();
  LoRa.receive();
}

void loop() {
  while (receivedTail != receivedHead) {
    logger("R:" + receivedPacket[receivedHead] + ", rssi:" + String(receivedRssi[receivedHead], DEC));
    if (wsClient) {
      // fuckin gross, wsClient expects std::string, but receivedPacket is a String
      // there's probably some sweet buffer bugs in here
      unsigned char buf[256];
      receivedPacket[receivedHead].toCharArray((char *) buf, 256);
      wsClient->send(buf, receivedPacket[receivedHead].length(), WebsocketHandler::SEND_TYPE_TEXT);
    }
    receivedHead = receivedHead + 1 % 255;
  }
  
  // Deliver Packets
  while (queuedTail != queuedHead) {
    loRaBroadcast(queuedPackets[queuedHead]);
    queuedHead = queuedHead + 1 % 255;
  }

  server.loop();
}
