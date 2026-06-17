// ======================================================
// VALIDADOR DE DATOS DE SENSORES
// ======================================================
//
// Función:
//
// Verificar que los datos recibidos desde MQTT
// contengan la estructura esperada.
//
// Campos obligatorios:
//
// - deviceId
// - humedad
// - ph
// - temperatura
// - zona
//
// Si alguno no cumple el tipo esperado,
// el mensaje será descartado.
//
// ======================================================

export const validarSensorData = (data) => {
  return (
    data &&

    // Identificador del dispositivo
    typeof data.deviceId === "string" &&

    // Humedad del suelo
    typeof data.humedad === "number" &&

    // Nivel de pH
    typeof data.ph === "number" &&

    // Temperatura ambiente
    typeof data.temperatura === "number" &&

    // Zona agrícola
    typeof data.zona === "string"
  );
};

