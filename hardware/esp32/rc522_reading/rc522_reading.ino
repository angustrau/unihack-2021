#include <ArduinoWebsockets.h>
#include <WiFi.h>
#include <SPI.h>
#include <MFRC522.h>
#include <AccelStepper.h>
#include <string.h>

/* Control signals to arduino MEGA */
#define DISPENSE_MASK_PIN 26
#define OPEN_GATE_PIN     25
#define ACTIVATE_PUMP_PIN 33

/* RC522 Pins */
#define RST_PIN         22           // Configurable, see typical pin layout above
#define SS_PIN          21           // Configurable, see typical pin layout above

#define RELAY_LOW       0
#define RELAY_HIGH      1

MFRC522 mfrc522(SS_PIN, RST_PIN);   // Create MFRC522 instance

/* WiFi Details for Websockets */
const char*    WIFI_SSID      = ""; // enter wifi SSID
const char*    WIFI_PASSWORD  = "";      // enter wifi password
//const char*    WS_SERVER_HOST = "192.168.0.113"; // enter websockets server
const char*    WS_SERVER_HOST = "";
const uint16_t WS_SERVER_PORT = 5001;            // enter websockets port

// Set up websockets
using namespace websockets;
WebsocketsClient client;

//*****************************************************************************************//
void setup() {
  Serial.begin(115200);                                         // Initialize serial communications with the PC
  
  SPI.begin();                                                  // Init SPI bus
  mfrc522.PCD_Init();                                           // Init MFRC522 card
  
  Serial.print(F("Connecting to Wifi"));            
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);                         // Connect to wifi

  // set up stepper motor
//  gateStepper.setMaxSpeed(500);
//  gateStepper.setAcceleration(40000);
//  pinMode(STEPPER_RELAY, OUTPUT);
//  // set up mask motor
//  pinMode(MASK_PIN, OUTPUT);
// 
  pinMode(OPEN_GATE_PIN, OUTPUT);
  pinMode(DISPENSE_MASK_PIN, OUTPUT);
  pinMode(ACTIVATE_PUMP_PIN, OUTPUT);
  
  // Wait some time to connect to wifi
  for(int i = 0; i < 10 && WiFi.status() != WL_CONNECTED; i++) {
      Serial.print(" .");
      delay(1000);
  }
  Serial.print("\n");

  // Check if connected to wifi
  if(WiFi.status() != WL_CONNECTED) {
      Serial.println("No Wifi!");
      return;
  }

  Serial.println("Connected to Wifi, Connecting to server.");
  // try to connect to Websockets server
  bool connected = client.connect(WS_SERVER_HOST, WS_SERVER_PORT, "/");
  if(connected) {
      Serial.println("Connected!");
      client.send("Hello Server");
  } else {
      Serial.println("Not Connected!");
  }

   Serial.println(F("Ready to read RFID card."));                     //shows in serial that it is ready to read

  // run callback when messages are received
    client.onMessage([&](WebsocketsMessage message){
        Serial.print("Got Message: ");
        Serial.println(message.data());
        
        if (strcmp(message.data().c_str(), "dispenseMask") == 0) {
          dispenseMask();  
        } 
        
        else if (strcmp(message.data().c_str(), "openGate") == 0) {
          openGate();
        }
        else if (strcmp(message.data().c_str(), "sanitise") == 0) {
          activatePump();  
        }
        
    });

    Serial.println("Listening for websockets ...");
}

//*****************************************************************************************//
void loop() {
  // let the websockets client check for incoming messages
    if(client.available()) {
        client.poll();
    }
    
  // Prepare key - all keys are set to FFFFFFFFFFFFh at chip delivery from the factory.
  MFRC522::MIFARE_Key key;
  for (byte i = 0; i < 6; i++) key.keyByte[i] = 0xFF;

  //some variables we need
  byte block;
  byte len;
  MFRC522::StatusCode status;

  //-------------------------------------------

  // Reset the loop if no new card present on the sensor/reader. This saves the entire process when idle.
  if ( ! mfrc522.PICC_IsNewCardPresent()) {
    return;
  }

  // Select one of the cards
  if ( ! mfrc522.PICC_ReadCardSerial()) {
    return;
  }

  Serial.println(F("\n"));
  Serial.println(F("**Card Detected**"));
  client.send("NFC CARD DETECTED");
//  openGate();

  //-------------------------------------------

  mfrc522.PICC_DumpDetailsToSerial(&(mfrc522.uid)); //dump some details about the card

  //----------------------------------------

  Serial.println(F("\n**End Reading**"));

  delay(1000); //change value if you want to read cards faster

  mfrc522.PICC_HaltA();
  mfrc522.PCD_StopCrypto1();
}
//*****************************************************************************************//

//void relaySet(int setting) {
//  if (setting == 0) {
//    digitalWrite(STEPPER_RELAY, LOW);
//    Serial.println("Stepper Relay: LOW");
//  }
//  else if (setting == 1) {
//    digitalWrite(STEPPER_RELAY, HIGH);
//    Serial.println("Stepper Relay: HIGH");
//  }
//}

void openGate() {
  Serial.printf("Opening gate, PIN %d HIGH\n", OPEN_GATE_PIN);
  digitalWrite(OPEN_GATE_PIN, HIGH);
  delay(1000);
  digitalWrite(OPEN_GATE_PIN, LOW);
}
//  Serial.println("**Opening the gate**");
//  relaySet(RELAY_HIGH);
//  gateStepper.runToNewPosition(50);
//  delay(1);
//  relaySet(RELAY_LOW);
//  
//  delay(500);
//  
//  relaySet(RELAY_HIGH);
//  gateStepper.runToNewPosition(0);
//  delay(1);
//  relaySet(RELAY_LOW);
//}

void dispenseMask() {
  Serial.println("Mask dispensing");
  digitalWrite(DISPENSE_MASK_PIN, HIGH);
  delay(1000);
  digitalWrite(DISPENSE_MASK_PIN, LOW);
}
//  Serial.println("**Dispensing a mask**");
//  delay(1);
//  digitalWrite(MASK_PIN, HIGH); // run motor
//  Serial.println("Running mask motor");
//  delay(10000); // for 900ms
//  digitalWrite(MASK_PIN, LOW);
//  Serial.println("Stopped mask motor");
//}

void activatePump() {
  Serial.println("Sanitising");
  digitalWrite(ACTIVATE_PUMP_PIN, HIGH);
  delay(1000);
  digitalWrite(ACTIVATE_PUMP_PIN, LOW);  
}
