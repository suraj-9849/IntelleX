#include <Servo.h>
#include <NewPing.h>
#include <SoftwareSerial.h>

#define SERVO_PIN 3
#define ULTRASONIC_SENSOR_TRIG 11
#define ULTRASONIC_SENSOR_ECHO 12
#define MAX_REGULAR_MOTOR_SPEED 60
#define MAX_MOTOR_ADJUST_SPEED 100
#define DISTANCE_TO_CHECK 30

int enableRightMotor = 5;
int rightMotorPin1 = 7;
int rightMotorPin2 = 8;

int enableLeftMotor = 6;
int leftMotorPin1 = 9;
int leftMotorPin2 = 10;

SoftwareSerial BTSerial(2, 3);
SoftwareSerial GPSSerial(4, 5);

#define MIN_LAT 17.439930
#define MAX_LAT 18.697807
#define MIN_LON 78.498276
#define MAX_LON 80.839473

NewPing mySensor(ULTRASONIC_SENSOR_TRIG, ULTRASONIC_SENSOR_ECHO, 400);
Servo myServo;
bool isStopped = false;

void setup()
{
  pinMode(enableRightMotor, OUTPUT);
  pinMode(rightMotorPin1, OUTPUT);
  pinMode(rightMotorPin2, OUTPUT);
  pinMode(enableLeftMotor, OUTPUT);
  pinMode(leftMotorPin1, OUTPUT);
  pinMode(leftMotorPin2, OUTPUT);

  myServo.attach(SERVO_PIN);
  myServo.write(90);

  BTSerial.begin(9600);
  GPSSerial.begin(9600);

  rotateMotor(0, 0);
}

void loop()
{
  checkBluetooth();
  checkGPS();

  if (!isStopped)
  {
    int distance = mySensor.ping_cm();

    if (distance > 0 && distance < DISTANCE_TO_CHECK)
    {
      stopAndNavigate();
    }
    else
    {
      rotateMotor(MAX_REGULAR_MOTOR_SPEED, MAX_REGULAR_MOTOR_SPEED);
    }
  }
}

void stopAndNavigate()
{
  rotateMotor(0, 0);
  delay(500);

  rotateMotor(-MAX_MOTOR_ADJUST_SPEED, -MAX_MOTOR_ADJUST_SPEED);
  delay(200);

  rotateMotor(0, 0);
  delay(500);

  myServo.write(180);
  delay(500);
  int distanceLeft = mySensor.ping_cm();

  myServo.write(0);
  delay(500);
  int distanceRight = mySensor.ping_cm();

  myServo.write(90);
  delay(500);

  if (distanceLeft == 0)
  {
    rotateMotor(MAX_MOTOR_ADJUST_SPEED, -MAX_MOTOR_ADJUST_SPEED);
    delay(200);
  }
  else if (distanceRight == 0)
  {
    rotateMotor(-MAX_MOTOR_ADJUST_SPEED, MAX_MOTOR_ADJUST_SPEED);
    delay(200);
  }
  else if (distanceLeft >= distanceRight)
  {
    rotateMotor(MAX_MOTOR_ADJUST_SPEED, -MAX_MOTOR_ADJUST_SPEED);
    delay(200);
  }
  else
  {
    rotateMotor(-MAX_MOTOR_ADJUST_SPEED, MAX_MOTOR_ADJUST_SPEED);
    delay(200);
  }
  rotateMotor(0, 0);
  delay(200);
}

void rotateMotor(int rightMotorSpeed, int leftMotorSpeed)
{
  if (rightMotorSpeed < 0)
  {
    digitalWrite(rightMotorPin1, LOW);
    digitalWrite(rightMotorPin2, HIGH);
  }
  else
  {
    digitalWrite(rightMotorPin1, HIGH);
    digitalWrite(rightMotorPin2, LOW);
  }

  if (leftMotorSpeed < 0)
  {
    digitalWrite(leftMotorPin1, LOW);
    digitalWrite(leftMotorPin2, HIGH);
  }
  else
  {
    digitalWrite(leftMotorPin1, HIGH);
    digitalWrite(leftMotorPin2, LOW);
  }

  analogWrite(enableRightMotor, abs(rightMotorSpeed));
  analogWrite(enableLeftMotor, abs(leftMotorSpeed));
}

void checkBluetooth()
{
  if (BTSerial.available())
  {
    String command = BTSerial.readStringUntil('\n');
    command.trim();

    if (command == "DANGEROUS")
    {
      rotateMotor(0, 0);
      isStopped = true;
    }
    else if (command == "NORMAL")
    {
      isStopped = false;
    }
  }
}

void checkGPS()
{
  while (GPSSerial.available())
  {
    String gpsData = GPSSerial.readStringUntil('\n');
    float latitude = extractLatitude(gpsData);
    float longitude = extractLongitude(gpsData);

    if ((latitude < MIN_LAT || latitude > MAX_LAT) || (longitude < MIN_LON || longitude > MAX_LON))
    {
      rotateMotor(0, 0);
      isStopped = true;
    }
    else if (isStopped)
    {
      isStopped = false;
    }
  }
}

float extractLatitude(String data)
{
  int index = data.indexOf("LAT:");
  if (index != -1)
  {
    return data.substring(index + 4, data.indexOf(",", index)).toFloat();
  }
  return 0.0;
}

float extractLongitude(String data)
{
  int index = data.indexOf("LON:");
  if (index != -1)
  {
    return data.substring(index + 4, data.indexOf(",", index)).toFloat();
  }
  return 0.0;
}