import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import path from "path";
import { fileURLToPath } from "url";

// ======================================================
// MICROSERVICIO: ZONAS-AGRICOLAS
// CLIENTE gRPC HACIA PRIORIDAD-RIEGO
// ======================================================
//
// Función:
// Enviar los datos de sensores al microservicio
// prioridad-riego para que este calcule:
//
// - Prioridad general
// - Estado de bomba
// - Acción tomada
// - Sensor que originó la alerta
// - Detalle de evaluación por sensor
//
// ======================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ======================================================
// CARGA DEL CONTRATO PROTO
// ======================================================

const PROTO_PATH = path.join(
  __dirname,
  "prioridad.proto"
);

const packageDefinition = protoLoader.loadSync(
  PROTO_PATH,
  {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  }
);

const prioridadProto = grpc.loadPackageDefinition(
  packageDefinition
).prioridad;

// ======================================================
// CONFIGURACIÓN DEL CLIENTE gRPC
// ======================================================
//
// La URL se obtiene desde docker-compose:
//
// GRPC_PRIORIDAD_URL=prioridad-riego:50051
//
// ======================================================

const GRPC_URL =
  process.env.GRPC_PRIORIDAD_URL || "prioridad-riego:50051";

const client = new prioridadProto.PrioridadService(
  GRPC_URL,
  grpc.credentials.createInsecure()
);

// ======================================================
// FUNCIÓN: evaluarPrioridadGrpc
// ======================================================
//
// Recibe datos del sensor y los envía al servicio
// prioridad-riego mediante gRPC.
//
// Devuelve la respuesta normalizada con:
//
// - prioridad
// - bomba
// - razon
// - accion
// - sensorOrigen
// - detalle
//
// ======================================================

export const evaluarPrioridadGrpc = (sensorData) => {
  return new Promise((resolve, reject) => {
    client.EvaluarPrioridad(
      {
        deviceId: sensorData.deviceId || "",

        humedad: Number(sensorData.humedad || 0),

        ph: Number(sensorData.ph || 0),

        temperatura: Number(sensorData.temperatura || 0),

        zona: sensorData.zona || "Zona 1",
      },
      (error, response) => {
        if (error) {
          console.error(
            "❌ Error cliente gRPC:",
            error
          );

          reject(error);
          return;
        }

        let detalle = {};

        try {
          detalle = response.detalle
            ? JSON.parse(response.detalle)
            : {};
        } catch (parseError) {
          console.error(
            "⚠️ Error parseando detalle gRPC:",
            parseError
          );
        }

        const respuestaNormalizada = {
          prioridad: response.prioridad || "estable",
          bomba: !!response.bomba,
          razon: response.razon || "Sin observaciones",
          accion: response.accion || "Bomba apagada",
          sensorOrigen: response.sensorOrigen || "desconocido",
          detalle,
        };

        console.log(
          "📡 Respuesta gRPC recibida:",
          respuestaNormalizada
        );

        resolve(respuestaNormalizada);
      }
    );
  });
};

