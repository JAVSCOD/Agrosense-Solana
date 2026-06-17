// ======================================================
// ALMACÉN TEMPORAL DE HISTORIAL
// ======================================================
//
// Función:
//
// Mantener en memoria los últimos eventos
// procesados por el sistema agrícola.
//
// Este historial es utilizado para:
//
// • Consultas rápidas
// • Visualización en frontend
// • Depuración del sistema
//
// Nota:
//
// La persistencia definitiva se realiza en el
// microservicio Persistencia utilizando PostgreSQL.
//
// ======================================================

const historial = [];

// ======================================================
// GUARDAR EVENTO
// ======================================================
//
// Agrega un nuevo evento al historial temporal.
//
// Para evitar consumo excesivo de memoria,
// únicamente se conservan los últimos 50 eventos.
//
// ======================================================

export const guardarEvento = (evento) => {

  historial.push(evento);

  // ==========================================
  // Mantener máximo 50 registros
  // ==========================================

  if (historial.length > 50) {
    historial.shift();
  }

  console.log(
    "🧾 Evento guardado en historial"
  );

};

// ======================================================
// OBTENER HISTORIAL
// ======================================================
//
// Devuelve todos los eventos almacenados
// actualmente en memoria.
//
// ======================================================

export const obtenerHistorial = () => historial;

