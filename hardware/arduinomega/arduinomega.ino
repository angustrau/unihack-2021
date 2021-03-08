#include <AccelStepper.h>

/* Analog pin inputs */
#define OPEN_GATE_PIN       A15 
#define DISPENSE_MASK_PIN   A7
#define ACTIVATE_PUMP_PIN   A10

#define ANALOG_THRESHOLD (1024*3.0/5.0)

/* Gate stepper motor driver pins */
#define MOTOR_INTERFACE_TYPE 4
#define PIN_1           28 // set these later
#define PIN_2           26
#define PIN_3           24
#define PIN_4           22
#define STEPPER_RELAY   49

/* Mask dispenser pins */
#define MASK_RELAY      50

/* Water pump pin */
#define PUMP_RELAY      48

// Create stepper motor instance
AccelStepper gateStepper;

void setup() {
  digitalWrite(PUMP_RELAY, HIGH); // HIGH = OFF
  digitalWrite(MASK_RELAY, HIGH); // for mask relay, HIGH = OFF
  digitalWrite(STEPPER_RELAY, LOW);
  
  Serial.begin(115200);

  gateStepper = AccelStepper(MOTOR_INTERFACE_TYPE, PIN_1, PIN_2, PIN_3, PIN_4);;
  gateStepper.setMaxSpeed(1000);
  gateStepper.setAcceleration(40000);

  pinMode(DISPENSE_MASK_PIN, INPUT);
  pinMode(OPEN_GATE_PIN, INPUT);
  pinMode(ACTIVATE_PUMP_PIN, INPUT);
  
  pinMode(STEPPER_RELAY, OUTPUT);
  pinMode(PUMP_RELAY, OUTPUT);
  pinMode(MASK_RELAY, OUTPUT);
  

}

void loop() {

  int maskPinValue = analogRead(DISPENSE_MASK_PIN);
  int openGatePinValue = analogRead(OPEN_GATE_PIN);
  int activatePumpPinValue = analogRead(ACTIVATE_PUMP_PIN);
//  
//  Serial.print("\n mask pin ");
//  Serial.print(maskPinValue);
//  Serial.print("\n gate pin ");
//  Serial.print(openGatePinValue);

  if (maskPinValue >= ANALOG_THRESHOLD) {
    Serial.println("Dispensing Mask");
    dispenseMask();
  }
  if (openGatePinValue >= ANALOG_THRESHOLD) {
    Serial.println("Open Gate");
    openGate();
  }
  if (activatePumpPinValue >= ANALOG_THRESHOLD) {
    Serial.println("Activate pump");
    activatePump();  
  }

  delay(10);

}

void openGate() {
  digitalWrite(STEPPER_RELAY, HIGH);
  gateStepper.runToNewPosition(1000);
  delay(1000); // wait 1 second
  gateStepper.runToNewPosition(0);
  digitalWrite(STEPPER_RELAY, LOW);

}


void dispenseMask() {
  digitalWrite(MASK_RELAY, LOW); // run motor
  Serial.println("Running mask motor");
  delay(1000); // wait 1 sec
  digitalWrite(MASK_RELAY, HIGH);
  Serial.println("Stopped mask motor");
  delay(1000); // delay so that the same signal isnt processed twice
  
}

void activatePump() {
  digitalWrite(PUMP_RELAY, LOW); // run motor
  Serial.println("Running pump");
  delay(500); // wait 1 sec
  digitalWrite(PUMP_RELAY, HIGH);
  Serial.println("Stopped pump");
  delay(1000); // delay so that the same signal isnt processed twice
  
}
