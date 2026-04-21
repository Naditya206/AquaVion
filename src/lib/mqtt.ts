import mqtt from 'mqtt';

const MQTT_URL = 'wss://broker.hivemq.com:8884/mqtt'; // HiveMQ Cloud WebSocket URL
// For public broker, use: 'wss://broker.hivemq.com:8000/mqtt'

export const connectMqtt = (onMessage: (data: any) => void) => {
  const client = mqtt.connect(MQTT_URL, {
    protocol: 'wss',
    clientId: 'aquavion_web_' + Math.random().toString(16).substring(2, 8),
  });

  client.on('connect', () => {
    console.log('Connected to MQTT Broker');
    client.subscribe('aquavion/sensor/data', (err) => {
      if (!err) {
        console.log('Subscribed to topic');
      }
    });
  });

  client.on('message', (topic, message) => {
    if (topic === 'aquavion/sensor/data') {
      try {
        const data = JSON.parse(message.toString());
        onMessage(data);
      } catch (e) {
        console.error('Failed to parse MQTT message', e);
      }
    }
  });

  return client;
};
