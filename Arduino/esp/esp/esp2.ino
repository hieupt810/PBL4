#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiManager.h>
#include <DNSServer.h>
#include <SoftwareSerial.h>
// #include <WebSocketsClient.h>

SoftwareSerial SUART(4, 5);  //SRX = D2 = GPIO-4; STX = D1 = GPIO-5
WiFiClient client;

WiFiServer server(80);
String str = "";
String urlBe = "http://10.20.3.196:8082";
String header;
String beSocket = "http://10.20.0.155:5005/temperature";
String homeId = "49480b29-b900-412b-8394-f1bcee055f8c";
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

void sendGETRequest()
{
    if (WiFi.status() == WL_CONNECTED)
    {
        HTTPClient http;
        // Your target URL
        String url = "http://10.20.3.196:8082/api/door/pass?id=49480b29-b900-412b-8394-f1bcee055f8c";

        // Start the HTTP request
        http.begin(client, url);
        http.addHeader("Content-Type", "application/json");
        // Send the GET request
        int httpResponseCode = http.GET();
        // Serial.print("HTTP Response code: ");
        // Serial.println(httpResponseCode);

        if (httpResponseCode > 0)
        {
            String payload = http.getString();
            // Serial.print("PASS:");
            Serial.println(payload);
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

void loop()
{

  if (Serial.available() > 0) {
    char receivedMessage = Serial.read();
    str += receivedMessage;
    if (receivedMessage == '\n') {
      str.trim();
      Serial.print(str);
      if (str.equals("password")) {
        sendGETRequest();
      }
      str = "";
    }
  }
  delay(100);
}
