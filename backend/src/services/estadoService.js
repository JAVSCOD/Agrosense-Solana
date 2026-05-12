import { getIO } from "../socket.js";

let estado = {
  riego: false,
  automatico: false,
  zona: "Zona 1",
};

let ultimoDato = null;
let historial = [];
let bombaActual = false;

// 📡 guardar datos del sensor
export const setSensorData = (data) => {
  ultimoDato = data;
};

// 📊 obtener último dato
export const getUltimoDato = () => ultimoDato;

// 📊 estado actual
export const getEstado = () => estado;

// 🧾 HISTORIAL
export const agregarHistorial = (evento) => {
  const nuevo = {
    ...evento,
    hora: new Date().toLocaleTimeString(),
  };

  historial.push(nuevo);

  if (historial.length > 20) {
    historial.shift();
  }

  try {
    getIO().emit("historial", historial);
  } catch (e) {}
};

export const getHistorial = () => historial;

// 🔁 ACTUALIZAR ESTADO
export const actualizarEstado = ({ riego, automatico, zona }) => {

  // 🔥 MANUAL
  if (typeof riego === "boolean" && riego !== estado.riego) {
    estado.riego = riego;

    agregarHistorial({
      tipo: "manual",
      evento: riego ? "Riego encendido" : "Riego apagado",
    });
  }

  // 🔥 AUTOMÁTICO
  if (typeof automatico === "boolean" && automatico !== estado.automatico) {
    estado.automatico = automatico;

    agregarHistorial({
      tipo: "automatico",
      evento: automatico
        ? "Modo automático activado"
        : "Modo automático desactivado",
    });
  }

  // 📍 ZONA
  if (zona && zona !== estado.zona) {
    estado.zona = zona;

    agregarHistorial({
      tipo: "zona",
      evento: `Cambio a ${zona}`,
    });
  }

  return estado;
};

// 🧠 DECISIÓN FINAL (VERSIÓN PRO)
export const getDecision = () => {

  let nuevaBomba = false;

  const humedad = parseFloat(ultimoDato?.humedad);
  const ph = parseFloat(ultimoDato?.ph);

  // 🚫 SIN DATOS O DATOS INVÁLIDOS
  if (!ultimoDato || isNaN(humedad) || isNaN(ph)) {
    nuevaBomba = false;
  }

  // 🚫 BLOQUEO PH
  else if (ph < 1 || ph > 8) {
    nuevaBomba = false;
  }

  // 🔧 MANUAL
  else if (estado.riego === true) {
    nuevaBomba = true;
  }

  // 🛑 TODO APAGADO
  else if (!estado.automatico) {
    nuevaBomba = false;
  }

  // 🤖 AUTOMÁTICO
  else {
    if (humedad < 40) nuevaBomba = true;
    else if (humedad > 60) nuevaBomba = false;
  }

  // 🔁 CAMBIO REAL
  if (nuevaBomba !== bombaActual) {
    bombaActual = nuevaBomba;

    agregarHistorial({
      tipo: "bomba",
      evento: nuevaBomba
        ? "💧 Bomba ENCENDIDA"
        : "🛑 Bomba APAGADA",
    });

    try {
      getIO().emit("bomba", { bomba: nuevaBomba });
    } catch (e) {}
  }

  return { bomba: nuevaBomba };
};

