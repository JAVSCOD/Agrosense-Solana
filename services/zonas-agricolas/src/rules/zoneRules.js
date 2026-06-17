export const procesarZona = (data) => {

  let sector = "General";
  let cultivo = "Hortalizas";

  if (data.zona === "Zona 1") {
    sector = "Invernadero Norte";
    cultivo = "Tomate";
  }

  else if (data.zona === "Zona 2") {
    sector = "Invernadero Sur";
    cultivo = "Lechuga";
  }

  else if (data.zona === "Zona 3") {
    sector = "Exterior";
    cultivo = "Maíz";
  }

  return {
    ...data,
    sector,
    cultivo,
    zonaProcesadaEn: new Date().toISOString(),
  };
};

