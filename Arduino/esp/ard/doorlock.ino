#include <LiquidCrystal_I2C.h>  //Thu vien lcd
#include <Keypad.h>
#include <SPI.h>  //ch co
#include <MFRC522.h>
#include <Servo.h>
#include <SoftwareSerial.h>

#define MODEM_RX 16
#define MODEM_TX 17
#define mySerial Serial2

// SoftwareSerial espSerial(0, 1);

#define buzz 8

#define SS_PIN 10
#define RST_PIN 9

typedef enum {
  MODE_ID_RFID_ADD,
  MODE_ID_RFID_FIRST,
  MODE_ID_RFID_SECOND,
} MODE_ID_RFID_E;

unsigned char MODE_RFID = MODE_ID_RFID_ADD;

unsigned char id = 0;
unsigned char id_rf = 0;
unsigned char index_t = 0;
unsigned char error_in = 0;

const byte ROWS = 4;
const byte COLS = 4;

char hexaKeys[ROWS][COLS] = {
  { '1', '2', '3' },
  { '4', '5', '6' },
  { '7', '8', '9' }
};
byte rowPins[ROWS] = { 2, 3, 4 };
byte colPins[COLS] = { 5, 6, 7 };

int addr = 0;
char password[6] = "11111";
char pass_def[6] = "12222";
char mode_changePass[6] = "*#01#";
char mode_resetPass[6] = "*#02#";
char mode_hardReset[6] = "*#03#";
char mode_addRFID[6] = "*107#";
char mode_delRFID[6] = "*108#";
char mode_delAllRFID[6] = "*109#";
byte pass[] = { 0x60, 0x71, 0x2D, 0x1A };

char data_input[6];
char new_pass1[6];
char new_pass2[6];
int angle = 10;

unsigned char in_num = 0, error_pass = 0, isMode = 0;
LiquidCrystal_I2C lcd(0x27, 16, 2);
Keypad keypad = Keypad(makeKeymap(hexaKeys), rowPins, colPins, ROWS, COLS);
MFRC522 rfid(SS_PIN, RST_PIN);

#define servor 8

Servo servo_9;

// void writeEpprom(char data[]) {
//   unsigned char i = 0;
//   for (i = 0; i < 5; i++) {
//     EEPROM.write(i, data[i]);
//   }
//   //EEPROM.commit();
// }

void getPass() {
  // if (Serial.available() > 0) {
  Serial.println("password");
  delay(5000);
  String receivedData = "";
  receivedData = Serial.readString();
  receivedData.trim();
  Serial.println("\n" + receivedData + "\n");
  int firstIndex = receivedData.indexOf('\"');

  // Tìm vị trí của ký tự cuối cùng "
  int lastIndex = receivedData.lastIndexOf('\"');

  // Kiểm tra xem cả hai vị trí đã được tìm thấy hay chưa
  if (firstIndex >= 0 && lastIndex >= 0) {
    // Trích xuất chuỗi con nằm giữa cặp dấu ngoặc kép
    String extractedString = receivedData.substring(firstIndex + 1, lastIndex);

    // In ra kết quả
    Serial.println(extractedString);
    strcpy(pass_def, extractedString.c_str());
  }
  // }
  // else {
  //   Serial.println("khum on");
  // }
}


void clear_data_input()  // xoa gia tri nhap vao hien tai
{
  int i = 0;
  for (i = 0; i < 6; i++) {
    data_input[i] = '\0';
  }
}

unsigned char isBufferdata(char data[])  // Kiem tra buffer da co gia tri chua
{
  unsigned char i = 0;
  for (i = 0; i < 5; i++) {
    if (data[i] == '\0') {
      return 0;
    }
  }
  return 1;
}

bool compareData(char data1[], char data2[])  // Kiem tra 2 cai buffer co giong nhau hay khong
{
  unsigned char i = 0;
  for (i = 0; i < 5; i++) {
    if (data1[i] != data2[i]) {
      return false;
    }
  }
  return true;
}

void notification(char select) {
  unsigned char i = 0;
  if (select == 1) {
    for (i = 0; i < 2; i++) {
      digitalWrite(buzz, HIGH);
      delay(100);
      digitalWrite(buzz, LOW);
      delay(100);
    }
  }
  if (select == 2) {
    for (i = 0; i < 3; i++) {
      digitalWrite(buzz, HIGH);
      delay(100);
      digitalWrite(buzz, LOW);
      delay(100);
    }
  }
  if (select == 3) {
    for (i = 0; i < 4; i++) {
      digitalWrite(buzz, HIGH);
      delay(100);
      digitalWrite(buzz, LOW);
      delay(100);
    }
  }
  if (select == 4) {
  }
}

void insertData(char data1[], char data2[])  // Gan buffer 2 cho buffer 1
{
  unsigned char i = 0;
  for (i = 0; i < 5; i++) {
    data1[i] = data2[i];
  }
}

void getData()  // Nhan buffer tu ban phim
{
  char key = keypad.getKey();  // Doc gia tri ban phim
  if (key) {
    digitalWrite(buzz, HIGH);
    delay(100);
    digitalWrite(buzz, LOW);
    // Serial.println("key != 0");
    if (in_num == 0) {
      data_input[0] = key;
      lcd.setCursor(5, 1);
      lcd.print(data_input[0]);
      delay(200);
      lcd.setCursor(5, 1);
      lcd.print("*");
    }
    if (in_num == 1) {
      data_input[1] = key;
      lcd.setCursor(6, 1);
      lcd.print(data_input[1]);
      delay(200);
      lcd.setCursor(6, 1);
      lcd.print("*");
    }
    if (in_num == 2) {
      data_input[2] = key;
      lcd.setCursor(7, 1);
      lcd.print(data_input[2]);
      delay(200);
      lcd.setCursor(7, 1);
      lcd.print("*");
    }
    if (in_num == 3) {
      data_input[3] = key;
      lcd.setCursor(8, 1);
      lcd.print(data_input[3]);
      delay(200);
      lcd.setCursor(8, 1);
      lcd.print("*");
    }
    if (in_num == 4) {
      data_input[4] = key;
      lcd.setCursor(9, 1);
      lcd.print(data_input[4]);
      delay(200);
      lcd.setCursor(9, 1);
      lcd.print("*");
    }
    if (in_num == 4) {
      // Serial.println(data_input);
      in_num = 0;
    } else {
      in_num++;
    }
  }
}

void checkPass()  // kiem tra password
{
  getData();
  // Serial.println(password);
  // Serial.println(mode_changePass);
  if (isBufferdata(data_input)) {
    if (compareData(data_input, pass_def))  // Dung pass
    {
      notification(1);
      lcd.clear();
      clear_data_input();
      index_t = 3;
    } else if (compareData(data_input, mode_changePass)) {
      // Serial.print("mode_changePass");
      lcd.clear();
      clear_data_input();
      index_t = 1;
    } else if (compareData(data_input, mode_resetPass)) {
      // Serial.print("mode_resetPass");
      lcd.clear();
      clear_data_input();
      index_t = 2;
    } else if (compareData(data_input, mode_hardReset)) {
      lcd.setCursor(0, 0);
      lcd.print("---HardReset---");
      // writeEpprom(pass_def);
      insertData(password, pass_def);
      clear_data_input();
      delay(2000);
      lcd.clear();
      index_t = 0;
    } else if (compareData(data_input, mode_addRFID)) {
      lcd.clear();
      clear_data_input();
      index_t = 8;
    } else if (compareData(data_input, mode_delRFID)) {
      lcd.clear();
      clear_data_input();
      index_t = 9;
    } else if (compareData(data_input, mode_delAllRFID)) {
      lcd.clear();
      clear_data_input();
      index_t = 10;
    } else {
      if (error_pass == 2) {
        notification(3);
        clear_data_input();
        lcd.clear();
        index_t = 4;
      }
      // Serial.print("Error");
      notification(2);
      lcd.clear();
      lcd.setCursor(1, 1);
      lcd.print("WRONG PASSWORD");
      clear_data_input();
      error_pass++;
      delay(1000);
      lcd.clear();
    }
  }
}

void openDoor() {
  // Serial.println("Open The Door");
  lcd.clear();
  lcd.setCursor(1, 0);
  lcd.print("---OPENDOOR---");
  unsigned char pos;
  delay(1000);
  for (angle = 10; angle < 180; angle++) {
    servo_9.write(angle);
    delay(15);
  }
  delay(5000);
  for (angle = 180; angle > 10; angle--) {
    servo_9.write(angle);
    delay(15);
  }
  // Serial.print("C");
  lcd.clear();
  index_t = 0;
}

void error() {
  lcd.clear();
  lcd.setCursor(1, 0);
  lcd.print("WRONG 3 TIME");
  lcd.setCursor(1, 1);
  lcd.print("Wait 1 minutes");
  unsigned char minute = 0;
  unsigned char i = 30;
  char buff[3];
  while (i > 0) {
    if (i == 1 && minute > 0) {
      minute--;
      i = 59;
    }
    if (i == 1 && minute == 0) {
      break;
    }
    sprintf(buff, "%.2d", i);
    i--;
    digitalWrite(buzz, HIGH);
    delay(300);
    digitalWrite(buzz, LOW);
    delay(200);
    digitalWrite(buzz, HIGH);
    delay(300);
    digitalWrite(buzz, LOW);
    delay(100);
  }
  // Serial.print("I");
  lcd.clear();
  index_t = 0;
}

void changePass() {
  lcd.setCursor(0, 0);
  lcd.print("-- Change Pass --");
  delay(3000);
  lcd.setCursor(0, 0);
  lcd.print("--- New Pass ---");
  while (1) {
    getData();
    if (isBufferdata(data_input)) {
      insertData(new_pass1, data_input);
      // Serial.println(new_pass1);
      clear_data_input();
      break;
    }
  }
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("---- AGAIN ----");
  while (1) {
    getData();
    if (isBufferdata(data_input)) {
      insertData(new_pass2, data_input);
      // Serial.println(new_pass2);
      clear_data_input();
      break;
    }
  }
  delay(1000);
  if (compareData(new_pass1, new_pass2)) {
    lcd.clear();
    // Serial.println("Success");
    lcd.setCursor(0, 0);
    lcd.print("--- Success ---");
    notification(1);
    delay(1000);
    // writeEpprom(new_pass2);
    insertData(pass_def, new_pass2);
    lcd.clear();
    index_t = 0;
  } else {
    lcd.clear();
    // Serial.println("miss");
    lcd.setCursor(0, 0);
    lcd.print("-- Mismatched --");
    notification(3);
    delay(1000);
    lcd.clear();
    index_t = 0;
  }
}

void resetPass() {
  unsigned char choise = 0;
  // Serial.println("Pass reset");
  lcd.setCursor(0, 0);
  lcd.print("---Reset Pass---");
  getData();
  if (isBufferdata(data_input)) {
    if (compareData(data_input, pass_def)) {
      lcd.clear();
      clear_data_input();
      while (1) {
        lcd.setCursor(0, 0);
        lcd.print("---Reset Pass---");
        char key = keypad.getKey();
        if (choise == 0) {
          lcd.setCursor(0, 1);
          lcd.print(">");
          lcd.setCursor(2, 1);
          lcd.print("YES");
          lcd.setCursor(9, 1);
          lcd.print(" ");
          lcd.setCursor(11, 1);
          lcd.print("NO");
        }
        if (choise == 1) {
          lcd.setCursor(0, 1);
          lcd.print(" ");
          lcd.setCursor(2, 1);
          lcd.print("YES");
          lcd.setCursor(9, 1);
          lcd.print(">");
          lcd.setCursor(11, 1);
          lcd.print("NO");
        }
        if (key == '*') {
          if (choise == 1) {
            choise = 0;
          } else {
            choise++;
          }
        }
        if (key == '#' && choise == 0) {
          lcd.clear();
          delay(1000);
          // writeEpprom(pass_def);
          insertData(password, pass_def);
          lcd.setCursor(0, 0);
          lcd.print("---Reset ok---");
          notification(1);
          delay(1000);
          lcd.clear();
          break;
        }
        if (key == '#' && choise == 1) {
          lcd.clear();
          break;
        }
      }
      index_t = 0;
    } else {
      notification(1);
      index_t = 0;
      lcd.clear();
    }
  }
}

unsigned char numberInput() {
  char number[5];
  char count_i = 0;
  while (count_i < 2) {
    char key = keypad.getKey();
    if (key && key != 'A' && key != 'B' && key != 'C' && key != 'D' && key != '*' && key != '#') {
      digitalWrite(buzz, HIGH);
      delay(100);
      digitalWrite(buzz, LOW);
      lcd.setCursor(10 + count_i, 1);
      lcd.print(key);
      number[count_i] = key;
      count_i++;
    }
  }
  return (number[0] - '0') * 10 + (number[1] - '0');
}

void clear_database() {
  char key = keypad.getKey();
  lcd.setCursor(3, 0);
  lcd.print("CLEAR DATA ?");
  if (key == '*') {
    isMode = 0;
  }
  if (key == '#') {
    isMode = 1;
  }
  if (isMode == 0) {
    lcd.setCursor(0, 1);
    lcd.print("> Yes      No  ");
  }
  if (isMode == 1) {
    lcd.setCursor(0, 1);
    lcd.print("  Yes    > No  ");
  }
  if (key == '0' && isMode == 0) {
    lcd.setCursor(0, 1);
    lcd.print("  Clear done  ");
    delay(2000);
    index_t = 0;
    lcd.clear();
  }
  if (key == '0' && isMode == 1) {
    lcd.clear();
    index_t = 0;
  }
}

bool isAllowedRFIDTag(byte tag[]) {
  int length = sizeof(pass) / sizeof(pass[0]);
  for (int i = 0; i < length; i++) {
    if (tag[i] != pass[i]) {
      return false;
    }
  }
  return true;
}

void rfidCheck() {
  if (rfid.PICC_IsNewCardPresent() && rfid.PICC_ReadCardSerial()) {
    byte rfidTag[4];
    Serial.print("RFID TAG: ");
    for (byte i = 0; i < rfid.uid.size; i++) {
      rfidTag[i] = rfid.uid.uidByte[i];
      Serial.print(rfidTag[i], HEX);
    }
    Serial.println();

    if (isAllowedRFIDTag(rfidTag)) {
      notification(1);
      lcd.clear();
      index_t = 3;
    } else {
      if (error_pass == 2) {
        notification(3);
        lcd.clear();
        index_t = 4;
      }
      Serial.print("Error\n");
      notification(2);
      lcd.clear();
      lcd.setCursor(3, 1);
      lcd.print("WRONG RFID");
      error_pass++;
      delay(1000);
      lcd.clear();
    }
    rfid.PICC_HaltA();
    rfid.PCD_StopCrypto1();
  }
}

/*-------------- RFID -----------------------*/
// void addRFID() {
//   lcd.clear();
//   lcd.setCursor(3, 0);
//   lcd.print("ADD NEW RFID");
//   switch (MODE_RFID) {
//     case (MODE_ID_RFID_ADD):
//       {
//         Serial.print("ADD_IN");
//         lcd.setCursor(0, 1);
//         lcd.print("Input Id: ");
//         id_rf = numberInput();
//         Serial.println(id_rf);
//         if (id_rf == 0) {  // ID #0 not allowed, try again!
//           lcd.clear();
//           lcd.setCursor(3, 1);
//           lcd.print("ID ERROR");
//         } else {
//           MODE_RFID = MODE_ID_RFID_FIRST;
//         }
//         delay(2000);
//       }
//       break;
//     case (MODE_ID_RFID_FIRST):
//       {
//         lcd.clear();
//         lcd.setCursor(0, 1);
//         lcd.print("   Put RFID    ");
//         if (rfid.PICC_IsNewCardPresent() && rfid.PICC_ReadCardSerial()) {
//           byte rfidTag[4];
//           Serial.print("RFID TAG: ");
//           for (byte i = 0; i < rfid.uid.size; i++) {
//             rfidTag[i] = rfid.uid.uidByte[i];
//             Serial.print(rfidTag[i], HEX);
//           }
//           Serial.println();

//           if (isAllowedRFIDTag(rfidTag)) {
//             notification(2);
//             lcd.clear();
//             lcd.setCursor(1, 1);
//             lcd.print("RFID ADDED BF");
//             index_t = 0;
//             delay(2000);
//             lcd.clear();
//             MODE_RFID = MODE_ID_RFID_ADD;
//           } else {
//             MODE_RFID = MODE_ID_RFID_SECOND;
//           }
//           rfid.PICC_HaltA();
//           rfid.PCD_StopCrypto1();
//         }
//       }
//       break;
//     case MODE_ID_RFID_SECOND:
//       {
//         lcd.setCursor(0, 1);
//         lcd.print("   Put Again    ");
//         delay(1000);
//         if (rfid.PICC_IsNewCardPresent() && rfid.PICC_ReadCardSerial()) {
//           byte rfidTag[4];
//           Serial.print("RFID TAG: ");
//           for (byte i = 0; i < rfid.uid.size; i++) {
//             rfidTag[i] = rfid.uid.uidByte[i];
//             Serial.print(rfidTag[i], HEX);
//           }
//           for (int i = 0; i < 4; i++) {
//             EEPROM.write(10 + (id_rf - 1) * 4 + i, rfidTag[i]);
//             //        EEPROM.commit();
//             Serial.println(EEPROM.read(10 + (id_rf - 1) * 4 + i), HEX);
//           }
//           Serial.print("OK");
//           lcd.setCursor(0, 1);
//           lcd.print("Add RFID Done");
//           notification(1);
//           delay(2000);
//           index_t = 0;
//           Serial.print("ADD_OUT");
//           lcd.clear();
//           MODE_RFID = MODE_ID_RFID_ADD;
//         }
//         rfid.PICC_HaltA();
//         rfid.PCD_StopCrypto1();
//       }
//       break;
//   }
// }

// void delRFID() {
//   char buffDisp[20];
//   lcd.setCursor(1, 0);
//   lcd.print("  DELETE RFID   ");
//   Serial.print("DEL_IN");
//   lcd.setCursor(0, 1);
//   lcd.print("Input ID: ");
//   id_rf = numberInput();
//   if (id_rf == 0) {  // ID #0 not allowed, try again!
//     lcd.clear();
//     lcd.setCursor(3, 1);
//     lcd.print("ID ERROR");
//     delay(2000);
//   } else {
//     for (int i = 0; i < 4; i++) {
//       EEPROM.write(10 + (id_rf - 1) * 4 + i, '\0');
//       //     EEPROM.commit();
//       Serial.println(EEPROM.read(10 + (id_rf - 1) * 4 + i), HEX);
//     }
//     sprintf(buffDisp, "Clear id:%d Done", id_rf);
//     lcd.setCursor(0, 1);
//     lcd.print(buffDisp);
//     Serial.print("DEL_OUT");
//     notification(1);
//     delay(2000);
//     lcd.clear();
//     index_t = 0;
//   }
// }

// void delAllRFID() {
//   char key = keypad.getKey();
//   lcd.setCursor(0, 0);
//   lcd.print("CLEAR ALL RFID?");
//   if (key == '*') {
//     isMode = 0;
//   }
//   if (key == '#') {
//     isMode = 1;
//   }
//   if (isMode == 0) {
//     lcd.setCursor(0, 1);
//     lcd.print("> Yes      No  ");
//   }
//   if (isMode == 1) {
//     lcd.setCursor(0, 1);
//     lcd.print("  Yes    > No  ");
//   }
//   if (key == '0' && isMode == 0) {
//     for (int i = 10; i < 512; i++) {
//       EEPROM.write(i, '\0');
//       //      EEPROM.commit();
//       Serial.println(EEPROM.read(i), HEX);
//     }
//     lcd.setCursor(0, 1);
//     lcd.print("  Clear done  ");
//     delay(2000);
//     index_t = 0;
//     lcd.clear();
//   }
//   if (key == '0' && isMode == 1) {
//     lcd.clear();
//     index_t = 0;
//   }
// }

void setup() {
  Serial.begin(9600);
  // espSerial.begin(9600);
  SPI.begin();
  rfid.PCD_Init();
  delay(1000);

  lcd.init();
  lcd.backlight();
  lcd.print("   SYSTEM INIT   ");

  servo_9.attach(servor, 500, 2500);
  servo_9.write(0);

  pinMode(buzz, OUTPUT);
  digitalWrite(buzz, LOW);
  getPass();
  lcd.clear();

  // Serial.print("PASSWORK: ");
  // Serial.println(password);
}

void loop() {
  lcd.setCursor(1, 0);
  lcd.print("Enter Password");
  checkPass();
  rfidCheck();
  // Serial.println(index_t);

  while (index_t == 1) {
    changePass();
  }

  while (index_t == 2) {
    resetPass();
  }

  while (index_t == 3) {
    openDoor();
    error_pass = 0;
  }

  while (index_t == 4) {
    error();
    error_pass = 0;
  }
  while (index_t == 7) {
    clear_database();
  }
  // while (index_t == 8)
  // {
  //   addRFID();
  // }
  // while (index_t == 9)
  // {
  //   delRFID();
  // }
  // while (index_t == 10)
  // {
  //   delAllRFID();
  // }
}
