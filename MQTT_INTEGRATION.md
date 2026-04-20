# MQTT Integration Guide

## API Endpoint untuk Terima Data Sensor

### POST `/api/mqtt/receive`

Endpoint ini menerima data sensor dari MQTT broker via HTTP webhook.

#### Request Body (JSON)

```json
{
  "userId": "user-firebase-uid",
  "device_id": "AQN-IOT-001",
  "temperature": 28.5,
  "ph": 7.2,
  "turbidity": 350,
  "waterLevel": 55
}
```

#### Required Fields
- `userId`: Firebase UID dari pemilik kolam
- `device_id`: ID device yang terdaftar di kolam

#### Optional Fields
- `temperature`: Suhu air (°C)
- `ph`: Keasaman air
- `turbidity`: Kekeruhan air (NTU)
- `waterLevel`: Tinggi air (cm)

#### Response Success (200)

```json
{
  "success": true,
  "message": "Sensor data received and saved",
  "pondId": "pond-id-123",
  "actionsCount": 2,
  "actions": [
    "Suhu Terlalu Dingin (24°C) → Tutup kolam atau gunakan pemanas",
    "pH Terlalu Asam (6.0) → Tambahkan kapur pertanian"
  ]
}
```

#### Response Error (400/404/500)

```json
{
  "error": "Error message"
}
```

## Cara Integrasi

### 1. Dari ESP32/Arduino (via HTTP POST)

```cpp
#include <WiFi.h>
#include <HTTPClient.h>

const char* serverUrl = "https://your-domain.vercel.app/api/mqtt/receive";
const char* userId = "your-firebase-uid";
const char* deviceId = "AQN-IOT-001";

void sendSensorData(float temp, float ph, float turbidity, float waterLevel) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");
    
    String payload = "{";
    payload += "\"userId\":\"" + String(userId) + "\",";
    payload += "\"device_id\":\"" + String(deviceId) + "\",";
    payload += "\"temperature\":" + String(temp) + ",";
    payload += "\"ph\":" + String(ph) + ",";
    payload += "\"turbidity\":" + String(turbidity) + ",";
    payload += "\"waterLevel\":" + String(waterLevel);
    payload += "}";
    
    int httpCode = http.POST(payload);
    
    if (httpCode > 0) {
      String response = http.getString();
      Serial.println("Response: " + response);
    }
    
    http.end();
  }
}
```

### 2. Dari MQTT Broker dengan Webhook (HiveMQ, Mosquitto Bridge)

#### HiveMQ Cloud Webhook
1. Login ke HiveMQ Cloud Console
2. Buka Integrations → Add Integration → Webhook
3. Set URL: `https://your-domain.vercel.app/api/mqtt/receive`
4. Set Method: POST
5. Set Topic: `aquavion/+/sensor` (+ adalah device_id)
6. Set Payload Template:
```json
{
  "userId": "${userId}",
  "device_id": "${topic[1]}",
  "temperature": ${temperature},
  "ph": ${ph},
  "turbidity": ${turbidity},
  "waterLevel": ${waterLevel}
}
```

### 3. Dari Node-RED (MQTT to HTTP)

```json
[
  {
    "id": "mqtt-in",
    "type": "mqtt in",
    "topic": "aquavion/+/sensor",
    "broker": "mqtt-broker"
  },
  {
    "id": "http-request",
    "type": "http request",
    "method": "POST",
    "url": "https://your-domain.vercel.app/api/mqtt/receive",
    "headers": {
      "Content-Type": "application/json"
    }
  }
]
```

## Testing

### Menggunakan cURL

```bash
curl -X POST https://your-domain.vercel.app/api/mqtt/receive \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "BJa6fvb3EAPk1jhoAl1z2QKcBBF2",
    "device_id": "AQN-IOT-001",
    "temperature": 24.5,
    "ph": 6.0,
    "turbidity": 450,
    "waterLevel": 35
  }'
```

### Menggunakan Postman

1. Method: POST
2. URL: `https://your-domain.vercel.app/api/mqtt/receive`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):
```json
{
  "userId": "your-firebase-uid",
  "device_id": "AQN-IOT-001",
  "temperature": 28.5,
  "ph": 7.2,
  "turbidity": 350,
  "waterLevel": 55
}
```

## Fitur

1. **Validasi Data**: Cek device_id terdaftar di kolam user
2. **Analisis Otomatis**: Bandingkan dengan threshold per kolam
3. **Generate Actions**: Buat rekomendasi tindakan jika ada anomali
4. **Simpan ke Firestore**: Data sensor tersimpan di `users/{userId}/ponds/{pondId}/sensors`
5. **Trigger Notifikasi**: Kirim notifikasi Telegram jika ada masalah

## Troubleshooting

### Error: "userId is required"
- Pastikan payload include `userId` (Firebase UID)

### Error: "No pond found with device_id"
- Cek device_id sudah terdaftar di halaman Manajemen Kolam
- Pastikan device_id match persis (case-sensitive)

### Error: "Internal server error"
- Cek Firebase credentials di `.env.local`
- Cek Firestore rules allow write untuk user tersebut
