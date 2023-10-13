#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiManager.h>
#include <DNSServer.h>
#include <SoftwareSerial.h>
#include <WebSocketsClient.h>
SoftwareSerial SUART(4, 5);  //SRX = D2 = GPIO-4; STX = D1 = GPIO-5

WiFiServer server(80);
String str = "";
String header;
String beSocket = "http://10.20.0.155:5005/temperature";
char cstr[2];

void setup() {
  Serial.begin(115200);
  SUART.begin(115200);
  delay(10);
  WiFiManager wifiManager;
  wifiManager.autoConnect("SmartHome Wifi connect", "00000000");     //set name, password of espwifi
  Serial.println("Connected!");
  server.begin();
}

void handleRESTControl(String s) {
  // led
  int idIndex = s.indexOf("/led/") + 5;               
  int stateIndexOn = s.indexOf("/on");
  int stateIndexOff = s.indexOf("/off");
  if (idIndex >= 5){       
    if (stateIndexOn >= 0){
      SUART.write("led ");               
      String id = s.substring(idIndex, stateIndexOn);
      for (int i = 0; i < id.length(); i++){
        SUART.write(id[i]);
      }
      SUART.write(" ON\n");
    }
    if (stateIndexOff >= 0){
      SUART.write("led ");               
      String id = s.substring(idIndex, stateIndexOff);
      for (int i = 0; i < id.length(); i++){
        SUART.write(id[i]);
      }
      SUART.write(" OFF\n");
    }
  }

  // temperature
  int temp = s.indexOf("/temp");
  if (temp >= 0){
    SUART.write("temperature \n");
  }

  //humidity
  int humid = s.indexOf("/humid");
  if (humid >= 0){
    SUART.write("humidity \n");
  }
}

void loop() {
  WiFiClient client = server.available();
  if (client) {
    // Serial.println("New Client.");
    String currentLine = "";
    while (client.connected()) {
      if (client.available()) {
        char c = client.read();
        header += c;
        if (c == '\n') {
          if (currentLine.length() == 0) {
            // Check if it's a POST request with the correct URL path
            if (header.indexOf("POST") >= 0) {
              handleRESTControl(header);
            }
            client.println("HTTP/1.1 200 OK");
            client.println("Content-type:text/html");
            client.println("Connection: close");
            client.println();
            break;
          } else {
            currentLine = "";
          }
        } else if (c != '\r') {
          currentLine += c;
        }
      }
    }
    header = "";
    client.stop();
  }

  // Arduino response
  if(SUART.available()>0){
    char com =SUART.read();
    str += com;
    if (com == '\n'){
      Serial.println(str);
      // send temp and humid
      if (str.indexOf("temperature") >= 0){
        HTTPClient http;
        // Start the HTTP request
        http.begin(client, beSocket);
        http.addHeader("Content-Type", "application/json");
        // Send the GET request
        int httpResponseCode = http.POST(str);
        Serial.println(httpResponseCode);
        String payload = http.getString();
        // Serial.println(payload);
        http.end(); // Close connection
      }
      str = "";
    }
  } 
  //   //Connect Backend
  // HTTPClient http;
  // // Your target URL
  // String url = "http://10.20.3.123:8082/api/ard";

  // // Start the HTTP request
  // http.begin(client, url);
  // http.addHeader("Content-Type", "application/json");
  // // Send the GET request
  // int httpResponseCode = http.POST("{\"a\": 1234}");
  // Serial.println(httpResponseCode);
  // String payload = http.getString();
  // Serial.println(payload);
  // http.end(); // Close connection

}
