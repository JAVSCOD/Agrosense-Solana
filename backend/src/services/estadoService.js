import { getIO } from "../socket.js";

// ==========================================
// ESTADO GLOBAL MULTI-ZONA
// ==========================================

const zonas = {};

let historial = [];

// ==========================================
// OBTENER / CREAR ZONA
// ==========================================

const obtenerZona = (zona = "Zona 1") => {

  if (!zonas[zona]) {

    zonas[zona] = {

      manual: false,
      automatico: true,

      bomba: false,

      riegoActivo: false,
      inicioRiego: null,

      sensor: null,

    };

    console.log(`📍 Nueva zona registrada: ${zona}`);

  }

  return zonas[zona];

};

// ==========================================
// SENSOR
// ==========================================

export const setSensorData = (data) => {

  const zona = data.zona || "Zona 1";

  const zonaData = obtenerZona(zona);

  zonaData.sensor = data;

};

// ==========================================
// ÚLTIMO SENSOR
// ==========================================

export const getUltimoDato = (zona = "Zona 1") => {

  return obtenerZona(zona).sensor;

};

// ==========================================
// ESTADO GENERAL
// ==========================================

export const getEstado = () => {

  return zonas;

};

// ==========================================
// HISTORIAL
// ==========================================

export const agregarHistorial = (evento) => {

  const nuevoEvento = {
    ...evento,
    hora: new Date().toLocaleTimeString(),
  };

  historial.push(nuevoEvento);

  if (historial.length > 100) {
    historial.shift();
  }

  try {
    getIO().emit("historial", historial);
  } catch {}

};

export const getHistorial = () => historial;

// ==========================================
// ACTUALIZAR ESTADO
// ==========================================

export const actualizarEstado = ({
  zona = "Zona 1",
  manual,
  automatico,
}) => {

  const zonaData = obtenerZona(zona);

  // ===========================
  // MANUAL
  // ===========================

  if (
    typeof manual === "boolean" &&
    manual !== zonaData.manual
  ) {

    zonaData.manual = manual;

    agregarHistorial({
      tipo: "manual",
      zona,
      evento: manual
        ? "🕹️ Manual activado"
        : "🕹️ Manual desactivado",
    });

  }

  // ===========================
  // AUTOMÁTICO
  // ===========================

  if (
    typeof automatico === "boolean" &&
    automatico !== zonaData.automatico
  ) {

    zonaData.automatico = automatico;

  }

  return zonaData;

};

// ==========================================
// DECISIÓN DE RIEGO
// ==========================================

export const getDecision = (zona = "Zona 1") => {

  const zonaData = obtenerZona(zona);

  const sensor = zonaData.sensor;

  if (!sensor) {

    return {
      zona,
      bomba: false,
      manual: zonaData.manual,
      automatico: zonaData.automatico,
      riegoActivo: zonaData.riegoActivo,
      razon: "Sin datos",
    };

  }

  const humedad = Number(sensor.humedad);
  const ph = Number(sensor.ph);
  const temperatura = Number(sensor.temperatura ?? 0);

  let nuevaBomba = zonaData.bomba;
  let razon = "Condiciones normales";

  // ======================================
  // MODO MANUAL
  // ======================================

  if (zonaData.manual) {

    zonaData.riegoActivo = false;
    zonaData.inicioRiego = null;

    nuevaBomba = true;

    razon = "Control manual";

  }

  // ======================================
  // AUTOMÁTICO DESACTIVADO
  // ======================================

  else if (!zonaData.automatico) {

    zonaData.riegoActivo = false;
    zonaData.inicioRiego = null;

    nuevaBomba = false;

    razon = "Modo automático desactivado";

  }

  // ======================================
  // PH FUERA DE RANGO
  // ======================================

  else if (ph < 6 || ph > 8) {

    zonaData.riegoActivo = false;
    zonaData.inicioRiego = null;

    nuevaBomba = false;

    razon = "pH fuera de rango";

  }

  // ======================================
  // RIEGO YA INICIADO
  // ======================================

  else if (zonaData.riegoActivo) {

    nuevaBomba = true;

    razon = "Riego automático en curso";

    if (humedad >= 85) {

      const duracionSegundos = Math.floor(
        (Date.now() - zonaData.inicioRiego) / 1000
      );

      zonaData.riegoActivo = false;
      zonaData.inicioRiego = null;

      nuevaBomba = false;

      razon = "Humedad recuperada";

      agregarHistorial({
        tipo: "riego",
        zona,
        evento: `🛑 Riego finalizado (${duracionSegundos}s)`,
      });

    }

  }

  // ======================================
  // INICIAR NUEVO RIEGO
  // ======================================

  else if (humedad < 30) {

    zonaData.riegoActivo = true;
    zonaData.inicioRiego = Date.now();

    nuevaBomba = true;

    razon = "Riego automático iniciado";

    agregarHistorial({
      tipo: "riego",
      zona,
      evento: "💧 Riego automático iniciado",
    });

  }

  // ======================================
  // CONDICIONES NORMALES
  // ======================================

  else {

    nuevaBomba = false;

    razon = "Condiciones normales";

  }

  // ======================================
  // ACTUALIZAR BOMBA
  // ======================================

  if (nuevaBomba !== zonaData.bomba) {

    zonaData.bomba = nuevaBomba;

    agregarHistorial({
      tipo: "bomba",
      zona,
      evento: nuevaBomba
        ? "💧 Bomba ENCENDIDA"
        : "🛑 Bomba APAGADA",
    });

  }

  try {
    getIO().emit("bomba", {
      zona,
      bomba: zonaData.bomba,
      manual: zonaData.manual,
      automatico: zonaData.automatico,
      riegoActivo: zonaData.riegoActivo,
      humedad,
      ph,
      temperatura,
      razon,
    });

  } catch {}

  return {

    zona,

    bomba: zonaData.bomba,

    manual: zonaData.manual,

    automatico: zonaData.automatico,

    riegoActivo: zonaData.riegoActivo,

    humedad,

    ph,

    temperatura,

    razon,

  };

};

