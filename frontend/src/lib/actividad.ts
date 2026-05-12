const guardarActividad = () => {
  const hoy = new Date().toISOString().split("T")[0];

  let data = JSON.parse(localStorage.getItem("actividad") || "{}");

  if (!data[hoy]) {
    data[hoy] = 1;
  } else {
    data[hoy]++;
  }

  localStorage.setItem("actividad", JSON.stringify(data));
};