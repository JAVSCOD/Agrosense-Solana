import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import path from "path";
import { fileURLToPath } from "url";

import { evaluarPrioridad } from "../rules/decisionRules.js";

// ======================================================
// MICROSERVICIO: PRIORIDAD-RIEGO
// ======================================================
//
// Función:
// Analizar los datos provenientes de los sensores
// agrícolas y determinar:
//
// • Nivel de prioridad general
// • Estado de la bomba de riego
// • Acción ejecutada
// • Sensor responsable de la alerta
// • Detalle completo de la evaluación
//
// Comunicación:
// gRPC
//
// Puerto:
// 50051
//
// Consumidor principal:
// zonas-agricolas
//
// ======================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ======================================================
// CARGA DEL ARCHIVO PROTO
// ======================================================
//
// prioridad.proto define:
//
// • Estructura de solicitudes
// • Estructura de respuestas
// • Servicio PrioridadService
//
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
// MÉTODO gRPC: EvaluarPrioridad
// ======================================================
//
// Flujo:
//
// 1. Recibe datos de sensores desde
//    zonas-agricolas.
//
// 2. Ejecuta las reglas de negocio
//    definidas en decisionRules.js.
//
// 3. Determina:
//
//    • Prioridad general
//    • Estado de la bomba
//    • Acción tomada
//    • Sensor origen
//
// 4. Devuelve la respuesta al cliente.
//
// ======================================================

function EvaluarPrioridad(call, callback) {

  try {

    const sensorData = call.request;

    console.log(
      "📥 Solicitud gRPC recibida:",
      sensorData
    );

    // =====================================
    // Evaluación de reglas de negocio
    // =====================================

    const decision = evaluarPrioridad(sensorData);

    console.log(
      "🚨 Respuesta gRPC:",
      decision
    );

    // =====================================
    // Respuesta enviada al cliente
    // =====================================

    callback(null, {

      // Nivel general calculado
      prioridad:
        decision.prioridad || "estable",

      // Estado final de la bomba
      bomba:
        decision.bomba || false,

      // Motivo principal de la decisión
      razon:
        decision.razon || "Sin observaciones",

      // Acción ejecutada por el sistema
      accion:
        decision.accion || "Bomba apagada",

      // Sensor que originó la prioridad
      sensorOrigen:
        decision.sensorOrigen || "desconocido",

      // Detalle completo de la evaluación
      // serializado para transporte gRPC
      detalle: JSON.stringify(
        decision.detalle || {}
      ),

    });

  } catch (error) {

    console.error(
      "❌ Error gRPC:",
      error
    );

    callback(error);

  }

}

// ======================================================
// INICIALIZACIÓN DEL SERVIDOR gRPC
// ======================================================
//
// Registra el servicio:
//
// PrioridadService
//
// Expone el puerto:
//
// 50051
//
// Permite que otros microservicios
// soliciten evaluaciones de prioridad.
//
// ======================================================

export function iniciarGrpcServer() {

  const server = new grpc.Server();

  // =====================================
  // Registro del servicio gRPC
  // =====================================

  server.addService(
    prioridadProto.PrioridadService.service,
    {
      EvaluarPrioridad,
    }
  );

  // =====================================
  // Inicio del servidor
  // =====================================

  server.bindAsync(
    "0.0.0.0:50051",
    grpc.ServerCredentials.createInsecure(),
    (error, port) => {

      if (error) {

        console.error(
          "❌ Error iniciando gRPC:",
          error
        );

        return;

      }

      console.log(
        `🚀 Servidor gRPC escuchando en puerto ${port}`
      );

      server.start();

    }
  );

}