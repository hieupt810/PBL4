#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiManager.h>
#include <DNSServer.h>
#include <SoftwareSerial.h>
#include <WebSocketsClient.h>

#include <IRremoteESP8266.h>
#include <IRrecv.h>
int RECV_PIN = 10; 
IRrecv irrecv(RECV_PIN);
decode_results results;
#define MICROS_PER_TICK 50

SoftwareSerial SUART(4, 5);  //SRX = D2 = GPIO-4; STX = D1 = GPIO-5

WiFiServer server(80);
String str = "";
String header;
String beSocket = "http://192.168.144.23:5005";
char cstr[2];

void setup() {
  Serial.begin(115200);
  SUART.begin(115200);
  delay(10);
  WiFiManager wifiManager;
  wifiManager.autoConnect("SmartHome Wifi connect", "00000000");     //set name, password of espwifi
  Serial.println("Connected!");
  server.begin();
  irrecv.enableIRIn();
}

void checkLed(String s){
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
}

void checkTemp(String s){
  int temp = s.indexOf("/temp");
  if (temp >= 0){
    SUART.write("temperature \n");
  }
}

void checkHumid(String s){
  int humid = s.indexOf("/humid");
  if (humid >= 0){
    SUART.write("humidity \n");
  }
}

void checkIR(String s){
  int ir = s.indexOf("/ir/");
  if (ir >= 0){
    ir += 4;
    int stateIndexOn = s.indexOf("/on");
    String id = s.substring(ir, stateIndexOn);
    int ir_code = s.indexOf("ir_code");
    int ir_end = s.indexOf("irend");
    if (ir >= 0){
      SUART.write("ir_id ");
      for (int i = 0; i < id.length(); i++){
          SUART.write(id[i]);
      }
      SUART.write(" ir_code ");
      for (int i = ir_code + 8; i < ir_end; i++){
        SUART.write(s[i]);
      }
      SUART.write("\n");
    }
  }
}

void handleRESTControl(String s) {
  // led
  checkLed(s);

  // temperature
  checkTemp(s);

  //humidity
  checkHumid(s);

  //IR
  checkIR(s);
}

// decode IR
void dump(decode_results *results) {
  int count = results->rawlen;
  Serial.print("Endecode: ");
  Serial.print(results->value, HEX);
  Serial.print(" (");
  Serial.print(results->bits, DEC);
  Serial.println(" bits)");
  Serial.print("Raw (");
  Serial.print(count, DEC);
  Serial.print("): ");

  for (int i = 0; i < count; i++) {
    // if ((i % 2) == 1) {
    //   Serial.print(results->rawbuf[i] * MICROS_PER_TICK, DEC);
    // } else {
    //   Serial.print(-(int)results->rawbuf[i] * MICROS_PER_TICK, DEC);
    // }
    Serial.print(results->rawbuf[i] * MICROS_PER_TICK, DEC);
    Serial.print(" ");
  }
  Serial.println("");
}


void loop() {
  delay(100);
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
              Serial.print(header);
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
        String uri = beSocket + "/temperature";
        http.begin(client, uri);
        http.addHeader("Content-Type", "application/json");
        // Send the GET request
        int httpResponseCode = http.POST(str);
        Serial.println(httpResponseCode);
        String payload = http.getString();
        http.end(); // Close connection
      }
      if (str.indexOf("humidity") >= 0){
        HTTPClient http;
        // Start the HTTP request
        String uri = beSocket + "/humidity";
        http.begin(client, uri);
        http.addHeader("Content-Type", "application/json");
        // Send the GET request
        int httpResponseCode = http.POST(str);
        Serial.println(httpResponseCode);
        String payload = http.getString();
        http.end(); // Close connection
      }
      str = "";
    }
  } 

  // recieve IR
  if (irrecv.decode(&results)) {
    Serial.println(results.value, HEX);
    dump(&results);
    irrecv.resume();  // Receive the next value
  }

}
