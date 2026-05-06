#ifndef CONFIG_H
#define CONFIG_H

// WiFi Configuration
const char* WIFI_SSID = "AquaVion";
const char* WIFI_PASSWORD = "12345678";

// API Configuration
// Gunakan alamat IP laptop Anda jika tes lokal, atau domain Vercel jika sudah online
// Contoh Lokal: "http://192.168.1.15:3000/api/mqtt/receive"
const char* API_URL = "https://aqua-vion.vercel.app/api/mqtt/receive";

// User & Device Configuration
const char* USER_ID = "we2KX9B0sCRBwnaeB9kD9xrzvsf2"; 
const char* DEVICE_ID = "AQN-IOT-001";

// Interval pengiriman data (5 menit)
const unsigned long SEND_INTERVAL = 300000; 

#endif
