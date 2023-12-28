#include <IRremote.hpp>
int khz=38;
int strs[300];

#include "DHT.h"
#define LightSenorPin 0
#define LightPin 4
#define LightValue 800
#define DHTPin 3
#define DHTType DHT11
DHT HT(DHTPin, DHTType);

String str = "";
unsigned long currentTime = millis(), time = millis();

void setup() {
  Serial.begin(115200);  
  HT.begin();
  // IrSender.begin(5);
  pinMode(3, INPUT);
  pinMode(5, OUTPUT);
  pinMode(LightPin, OUTPUT);
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

void IR(){
  int pin_index = str.indexOf("ir_id ");
  int code_index = str.indexOf("ir_code ");
  int pin = str.substring(pin_index+ 6, code_index).toInt();
  IrSender.setSendPin(pin);
  String xuli = str.substring(code_index + 8);
  int Stringcount = 0;
  while (xuli.length() > 0){
    int index = xuli.indexOf(' ');
    if (index == -1){
      strs[Stringcount++] = xuli.toInt();
      break;
    }
    else{
      strs[Stringcount++] = xuli.substring(0, index).toInt();
      xuli = xuli.substring(index + 1);
    }
  }
  unsigned int final[Stringcount];
  for (int i = 0; i < Stringcount; i++)
  {
    final[i] = strs[i];
  }
  for (int i = 1; i<= 10; i++){
    IrSender.sendRaw(final, Stringcount, khz);
  }
}

void checkLightSensor(){
  int val = analogRead(LightSenorPin);
  // Serial.println(val);
  if (val > LightValue){
    digitalWrite(LightPin, HIGH);
  }
  else {
   digitalWrite(LightPin, LOW);
  }
  delay(500);
}

void loop() {
  if(Serial.available()>0){
    char com =Serial.read();
    // Serial.println(str);
    str += com;
    if (com == '\n'){
      Serial.println(str);
      //led request
      int idIndex = str.indexOf("led ") + 4; 
      int stateIndexOn = str.indexOf("ON");
      int stateIndexOff = str.indexOf("OFF");
      if (idIndex >= 4){
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
      
      //IR request
      int ir = str.indexOf("ir");
      if (ir >= 0){
        IR();
      } 
      str = "";
    }
  }
  // currentTime = millis();
  // if (currentTime - time == 10000){
  //   time = currentTime;
  //   Temp();
  //   Humid();
  // }
  // checkLightSensor();
}

