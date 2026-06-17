import mqtt from "mqtt";

const MQTT_URL = process.env.MQTT_URL || "mqtt://mosquitto:1883";

const client = mqtt.connect(MQTT_URL);

client.on("connect", () => {
  console.log("📡 MQTT conectado desde Prioridad-Riego");
});

client.on("error", (err) => {
  console.error("❌ Error MQTT:", err);
});

export const publicarControlRiego = (zona, estado) => {

  const topic = `agrosense/control/${zona}`;

  const payload = JSON.stringify({
    bomba: estado,
    timestamp: new Date().toISOString(),
  });

  client.publish(topic, payload);

  console.log("🚰 Orden MQTT enviada:", {
    topic,
    payload,
  });
};

