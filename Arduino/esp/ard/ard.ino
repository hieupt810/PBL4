#include<SoftwareSerial.h>
#include "DHT.h"

#define DHTPin 4
#define DHTType DHT11
DHT HT(DHTPin, DHTType);

String str = "";
unsigned long currentTime = millis(), time = millis();

void setup() {
  Serial.begin(115200);  
  HT.begin();
  delay(500);
}

void Temp(){
  float t1 = 0, t2 = 1, t3 = 2;
  while (!(t1 == t2 && t2 == t3)){
    delay(100);
    t1 = HT.readTemperature();
    delay(100);
    t2 = HT.readTemperature();
    delay(100);
    t3 = HT.readTemperature();
  }
  Serial.print("{\"temperature\" : ");
  Serial.print(t1);
  Serial.print("} \n");
}

void Humid(){
  float h1 = 0, h2 = 1, h3 = 2;
  while (!(h1 == h2 && h2 == h3)){
    delay(100);
    h1 = HT.readHumidity();
    delay(100);
    h2 = HT.readHumidity();
    delay(100);
    h3 = HT.readHumidity();
  }
  Serial.print("{\"humidity\" : ");
  Serial.print(h1);
  Serial.print("} \n");
}

void loop() {
  if(Serial.available()>0){
    char com =Serial.read();
    str += com;
    if (com == '\n'){
      //led request
      int idIndex = str.indexOf("led ") + 4; 
      int stateIndexOn = str.indexOf("ON");
      int stateIndexOff = str.indexOf("OFF");
      if (idIndex >= 4){
        Serial.print(str);
        if (stateIndexOn >= 0){
        int id = str.substring(idIndex, stateIndexOn).toInt();
        digitalWrite(id, HIGH);
      }
      if (stateIndexOff >= 0){
        int id = str.substring(idIndex, stateIndexOff).toInt();
        digitalWrite(id, LOW);
      }
      }

      //temperature request
      int temp = str.indexOf("temperature");
      if (temp >= 0){
        Temp();
      }

      //humidity request
      int humid = str.indexOf("humidity");
      if (humid >= 0){
        Humid();
      }

      str = "";
    }
  }
  currentTime = millis();
  if (currentTime - time == 10000){
    time = currentTime;
    Temp();
    Humid();
  }
}

