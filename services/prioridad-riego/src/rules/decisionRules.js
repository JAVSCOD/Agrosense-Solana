export const evaluarPrioridad = (data) => {
  const humedad = Number(data.humedad);
  const ph = Number(data.ph);
  const temperatura = Number(data.temperatura);

  // ==========================
  // HUMEDAD
  // ==========================

  const evaluarHumedad = () => {
    if (humedad < 30) {
      return {
        nivel: "critica",
        mensaje: "Humedad extremadamente baja",
      };
    }

    if (humedad >= 30 && humedad < 50) {
      return {
        nivel: "alta",
        mensaje: "Humedad baja",
      };
    }

    if (humedad >= 50 && humedad < 85) {
      return {
        nivel: "media",
        mensaje: "Humedad aceptable",
      };
    }

    return {
      nivel: "estable",
      mensaje: "Suelo suficientemente húmedo",
    };
  };

  // ==========================
  // PH
  // ==========================

  const evaluarPH = () => {
    if (ph < 5.5 || ph > 8.5) {
      return {
        nivel: "critica",
        mensaje: "pH crítico",
      };
    }

    if ((ph >= 5.5 && ph < 6.0) || (ph > 8.0 && ph <= 8.5)) {
      return {
        nivel: "alta",
        mensaje: "pH fuera del rango recomendado",
      };
    }

    if ((ph >= 6.0 && ph < 6.5) || (ph > 7.5 && ph <= 8.0)) {
      return {
        nivel: "media",
        mensaje: "pH ligeramente fuera del punto ideal",
      };
    }

    return {
      nivel: "estable",
      mensaje: "pH estable",
    };
  };

  // ==========================
  // TEMPERATURA
  // ==========================

  const evaluarTemperatura = () => {
    if (temperatura < 5 || temperatura > 40) {
      return {
        nivel: "critica",
        mensaje: "Temperatura extrema",
      };
    }

    if (
      (temperatura >= 5 && temperatura <= 10) ||
      (temperatura >= 35 && temperatura <= 40)
    ) {
      return {
        nivel: "alta",
        mensaje: "Temperatura elevada o baja",
      };
    }

    if (
      (temperatura >= 11 && temperatura <= 17) ||
      (temperatura >= 31 && temperatura <= 34)
    ) {
      return {
        nivel: "media",
        mensaje: "Temperatura fuera del rango ideal",
      };
    }

    return {
      nivel: "estable",
      mensaje: "Temperatura estable",
    };
  };

  // ==========================
  // DETALLE POR SENSOR
  // ==========================

  const detalle = {
    humedad: {
      valor: humedad,
      ...evaluarHumedad(),
    },
    ph: {
      valor: ph,
      ...evaluarPH(),
    },
    temperatura: {
      valor: temperatura,
      ...evaluarTemperatura(),
    },
  };

  // ==========================
  // PRIORIDAD GENERAL
  // ==========================

  const ordenPrioridad = {
    critica: 4,
    alta: 3,
    media: 2,
    estable: 1,
  };

  let prioridad = "estable";
  let razon = "Condiciones estables";

  for (const sensor of Object.values(detalle)) {
    if (
      ordenPrioridad[sensor.nivel] >
      ordenPrioridad[prioridad]
    ) {
      prioridad = sensor.nivel;
      razon = sensor.mensaje;
    }
  }

  // ==========================
  // DECISIÓN DE RIEGO
  // ==========================

  let bomba = false;
  let accion = "Bomba apagada";

  const humedadNecesitaRiego =
    detalle.humedad.nivel === "critica" ||
    detalle.humedad.nivel === "alta";

  const phPermiteRiego =
    detalle.ph.nivel === "estable" ||
    detalle.ph.nivel === "media";

  if (humedadNecesitaRiego && phPermiteRiego) {
    bomba = true;
    accion = "Bomba encendida";
    razon =
      detalle.humedad.nivel === "critica"
        ? "Humedad crítica. Riego activado"
        : "Humedad baja. Riego activado";
  }

  if (
    detalle.ph.nivel === "critica" ||
    detalle.ph.nivel === "alta"
  ) {
    bomba = false;
    accion = "Bomba apagada";
    razon = `${detalle.ph.mensaje}. Riego bloqueado`;
  }

  // ==========================
  // RESPUESTA FINAL
  // ==========================

  return {
    ...data,
    prioridad,
    bomba,
    razon,
    accion,
    detalle,
    procesadoEn: new Date().toISOString(),
  };
};

