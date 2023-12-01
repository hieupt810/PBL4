#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiManager.h>
#include <DNSServer.h>
#include <SoftwareSerial.h>

SoftwareSerial SUART(4, 5);  //SRX = D2 = GPIO-4; STX = D1 = GPIO-5
WiFiClient client;

WiFiServer server(80);
String str = "";
String urlBe = "http://192.168.23.127:8082";
String header;
String homeId = "a3086737-9ecb-4998-923d-1bfe24c24310";
char cstr[2];

void setup()
{
    Serial.begin(9600);
    SUART.begin(9600);
    delay(1000);
    WiFiManager wifiManager;
    wifiManager.autoConnect("SmartHome Wifi connect", "00000000"); //set name, password of espwifi
    Serial.println("Connected!");
    server.begin();
}


void loop()
{
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

  if (SUART.available() > 0) {
    char receivedMessage = SUART.read();
    str += receivedMessage;
    if (receivedMessage == '\n') {
      str.trim();
      Serial.println(str);
      if (str.equals("password")) {
        sendGETRequest();
      }
      str = "";
    }
  }
  delay(100);
}

void sendGETRequest()
{
    if (WiFi.status() == WL_CONNECTED)
    {
        HTTPClient http;
        // Your target URL
        String url = urlBe + "/api/door/pass?id=" + homeId;

        // Start the HTTP request
        http.begin(client, url);
        http.addHeader("Content-Type", "application/json");
        // Send the GET request
        int httpResponseCode = http.GET();

        if (httpResponseCode > 0)
        {
            String payload = http.getString();
            // print password
            SUART.println(payload);
        }
        else
        {
            Serial.print("Error on sending GET Request: ");
            Serial.println(httpResponseCode);
        }
        // Free the resources
        http.end();
    }
    else
    {
        Serial.println("WiFi Disconnected");
    }
}

void checkOpenDoor(String s){
  int open = s.indexOf("/door/unlock");
  if (open >= 0){
    SUART.write("openDoor \n");
  }
}

void checkChangePass(String s){
  int open = s.indexOf("/door/changePass");
  if (open >= 0){
    SUART.write("changePass \n");
  }
}

void handleRESTControl(String s) {
  // openDoor
  checkOpenDoor(s);

  //resetPass
  checkChangePass(s);
}

