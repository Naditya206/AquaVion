#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <WiFiClientSecure.h>
#include "config.h"

// Deklarasi Pin
#define PIN_SUHU       26
#define PIN_PH         34
#define PIN_TURBIDITY  35
#define PIN_TRIG       5
#define PIN_ECHO       18
#define PIN_BUZZER     2

OneWire oneWire(PIN_SUHU);
DallasTemperature sensorSuhu(&oneWire);

// Variabel Waktu
unsigned long lastSendTime = 0;

// Function Prototypes
void connectWiFi();
void bacaSensorDanKirim();
void soundBuzzer(bool active);

void setup() {
  Serial.begin(115200);
  
  // Inisialisasi Sensor
  sensorSuhu.begin();
  pinMode(PIN_PH, INPUT);
  pinMode(PIN_TURBIDITY, INPUT);
  pinMode(PIN_TRIG, OUTPUT);
  pinMode(PIN_ECHO, INPUT);
  pinMode(PIN_BUZZER, OUTPUT);

  // Sambungkan ke WiFi
  connectWiFi();

  Serial.println("Sistem AquaVion Berjalan...");
  delay(2000);
}

void loop() {
  // Pastikan WiFi tetap terhubung
  if (WiFi.status() != WL_CONNECTED) {
    connectWiFi();
  }

  // Cek apakah sudah waktunya mengirim data (Setiap 5 Menit)
  unsigned long currentTime = millis();
  if (currentTime - lastSendTime >= SEND_INTERVAL || lastSendTime == 0) {
    bacaSensorDanKirim();
    lastSendTime = currentTime;
  }

  // Delay kecil untuk stabilitas
  delay(10);
}

void connectWiFi() {
  Serial.print("Connecting to WiFi: ");
  Serial.println(WIFI_SSID);
  
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi Connected!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\nWiFi Connection Failed! Will retry in loop.");
  }
}

void bacaSensorDanKirim() {
  // 1. Baca Suhu
  sensorSuhu.requestTemperatures(); 
  float suhuC = sensorSuhu.getTempCByIndex(0);

  // 2. Baca pH
  int analogPH = analogRead(PIN_PH);
  float nilaiPH = analogPH * (14.0 / 4095.0); // Kalibrasi diperlukan

  // 3. Baca Turbidity
  int analogTurbidity = analogRead(PIN_TURBIDITY);

  // 4. Baca Jarak Air (Ultrasonic)
  digitalWrite(PIN_TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(PIN_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(PIN_TRIG, LOW);
  long durasi = pulseIn(PIN_ECHO, HIGH);
  float jarakAir = durasi * 0.034 / 2; 

  Serial.printf("Suhu: %.2f °C | pH: %.2f | Jarak: %.2f cm | Turbidity: %d\n", suhuC, nilaiPH, jarakAir, analogTurbidity);

  // 5. Evaluasi Peringatan (Lokal)
  bool peringatan = false;
  if (suhuC < 25.0 || suhuC > 30.0) peringatan = true;
  if (nilaiPH < 6.5 || nilaiPH > 8.6) peringatan = true;
  if (jarakAir < 50.0 || jarakAir > 70.0) peringatan = true;

  soundBuzzer(peringatan);

  // 6. Kirim Data ke Server via HTTP POST
  if (WiFi.status() == WL_CONNECTED) {
    WiFiClientSecure *client = new WiFiClientSecure;
    if(client) {
      client->setInsecure(); // Mengizinkan HTTPS tanpa verifikasi sertifikat (untuk kemudahan testing)
      
      HTTPClient http;
      if (http.begin(*client, API_URL)) {
        http.addHeader("Content-Type", "application/json");

        // Construct JSON Payload
        JsonDocument doc;
        doc["userId"] = USER_ID;
        doc["device_id"] = DEVICE_ID;
        doc["temperature"] = suhuC;
        doc["ph"] = nilaiPH;
        doc["turbidity"] = analogTurbidity;
        doc["waterLevel"] = jarakAir;

        String jsonPayload;
        serializeJson(doc, jsonPayload);

        Serial.println("Sending data to server (HTTPS)...");
        int httpResponseCode = http.POST(jsonPayload);

        if (httpResponseCode > 0) {
          String response = http.getString();
          Serial.print("HTTP Response code: ");
          Serial.println(httpResponseCode);
          Serial.println("Response: " + response);
        } else {
          Serial.print("Error sending POST: ");
          Serial.println(http.errorToString(httpResponseCode).c_str());
        }
        http.end();
      } else {
        Serial.println("Unable to connect to server");
      }
      delete client;
    }
  }

  Serial.println("-------------------------------------------------");
}

void soundBuzzer(bool active) {
  if (active) {
    digitalWrite(PIN_BUZZER, HIGH);
    Serial.println("⚠️ BAHAYA: Kualitas air di luar batas normal!");
  } else {
    digitalWrite(PIN_BUZZER, LOW);
  }
}
