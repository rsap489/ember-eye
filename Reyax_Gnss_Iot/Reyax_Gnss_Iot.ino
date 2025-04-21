#include <TinyGPS++.h>

// Define GPS serial pins
// const byte RxPin = 0;
// const byte TxPin = 1;

// Create SoftwareSerial and GPS decoder instances
// SoftwareSerial GPSSerial(RxPin, TxPin);
TinyGPSPlus gps;

void setup()
{
    Serial.begin(115200);
    Serial1.begin(115200);
  // GPSSerial.begin(9600); // most GPS modules default to 9600 baud
  Serial.println("GPS Location Reader");
}

//void loop()
//{
//  while (Serial1.available())
//  {
//    char c = Serial1.read();
//    Serial.write(c); // Just mirror the raw GPS data to Serial Monitor
//  }
//}

void loop()
{
  // Feed the GPS decoder with data from the GPS module
  while (Serial1.available() > 0)
  {
    // Serial.print("reading");
    gps.encode(Serial1.read());
  }

  // If a valid location is available, print it
  if (gps.location.isUpdated())
  {
    Serial.print("Latitude: ");
    Serial.println(gps.location.lat(), 6);
    Serial.print("Longitude: ");
    Serial.println(gps.location.lng(), 6);
    Serial.println();
  }
}
