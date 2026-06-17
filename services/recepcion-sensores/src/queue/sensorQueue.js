import { redisClient } from "../redis/redisClient.js";

export const encolarSensorData = async (data) => {
  await redisClient.rPush("cola:sensores", JSON.stringify(data));

  console.log("📥 Dato encolado en Redis:", data);
};

