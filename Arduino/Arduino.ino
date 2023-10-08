String str = "";

void setup() {
  Serial.begin(9600);  
}

void loop() {
  if(Serial.available()>0){
    char com =Serial.read();
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
    }
  }
}