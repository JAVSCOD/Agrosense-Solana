import Link from "next/link";

const features = [
  {
    title: "Sensores IoT",
    text: "Monitoreo de humedad, temperatura y pH mediante sensores conectados al ESP32.",
    img: "/images/iot-sensores.png",
  },
  {
    title: "Dashboard en tiempo real",
    text: "Visualización dinámica de datos agrícolas, gráficas, estados y métricas del cultivo.",
    img: "/images/dashboard.png",
  },
  {
    title: "Riego automatizado",
    text: "Control manual y automático del sistema de riego según las condiciones del suelo.",
    img: "/images/riego.png",
  },
  {
    title: "Solana / Web3",
    text: "Integración con blockchain para fortalecer la trazabilidad y el enfoque descentralizado.",
    img: "/images/solana.png",
  },
  {
    title: "Alertas inteligentes",
    text: "Notificaciones cuando los sensores detectan valores críticos o eventos importantes.",
    img: "/images/alertas.png",
  },
  {
    title: "Docker y despliegue",
    text: "Arquitectura lista para ejecutarse con contenedores, backend, frontend y base de datos.",
    img: "/images/docker.png",
  },
];

const architecture = [
  {
    name: "ESP32",
    img: "/images/esp-32-2.png",
  },
  {
    name: "Backend Node.js",
    img: "/images/node-2.png",
  },
  {
    name: "MongoDB",
    img: "/images/mongo-2.png",
  },
  {
    name: "Solana",
    img: "/images/solana-log-2.png",
  },
  {
    name: "Frontend Next.js",
    img: "/images/next-2.png",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#07111F] text-white overflow-hidden">

      {/* NAVBAR */}
      <header className="fixed top-0 left-0 w-full z-50 bg-[#07111F]/80 backdrop-blur-xl border-b border-white/10">
        <div className="px-6 md:px-14 py-5 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🌱</span>
            <h2 className="text-xl font-bold text-[#00BB77]">
              AgroSense-Web3
            </h2>
          </div>

          <nav className="hidden md:flex gap-8 text-sm text-gray-300">
            <a href="#inicio" className="hover:text-[#00BB77] transition">Inicio</a>
            <a href="#conceptos" className="hover:text-[#00BB77] transition">Conceptos</a>
            <a href="#arquitectura" className="hover:text-[#00BB77] transition">Arquitectura</a>
            <a href="#tecnologias" className="hover:text-[#00BB77] transition">Tecnologías</a>
          </nav>

          <Link
            href="/login"
            className="bg-[#00BB77] hover:bg-[#009966] px-5 py-2 rounded-xl font-semibold transition"
          >
            Iniciar Sección
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section
        id="inicio"
        className="relative min-h-screen flex items-center overflow-hidden"
      >

        {/* VIDEO BACKGROUND */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/videos/agrosense-hero.mp4" type="video/mp4" />
        </video>

        {/* OVERLAY */}
        <div className="absolute inset-0 bg-[#07111F]/75 backdrop-blur-[2px]" />

        {/* GLOW */}
        <div className="absolute w-[500px] h-[500px] bg-[#00BB77]/20 rounded-full blur-3xl top-10 left-10" />

        {/* CONTENIDO */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-14 w-full">

          <div className="max-w-3xl">

            <span className="inline-block mb-5 px-4 py-2 rounded-full bg-[#00BB77]/10 text-[#00BB77] border border-[#00BB77]/30 text-sm">
              IoT + Web3 + Agricultura inteligente
            </span>

            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6">
              Agricultura inteligente en
              <span className="text-[#00BB77]"> tiempo real</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl">
              Monitorea sensores agrícolas, automatiza sistemas de riego
              y visualiza datos en tiempo real mediante IoT y Web3.
            </p>

            {/* BOTONES */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">

              <a
                href="/login"
                className="bg-[#00BB77] hover:bg-[#009966] px-8 py-4 rounded-xl font-bold transition text-center shadow-lg shadow-[#00BB77]/20"
              >
                MONITOREAR BOSQUE
              </a>

              <a
                href="/dashboard"
                className="border border-white/20 px-8 py-4 rounded-xl hover:bg-white/10 transition font-semibold text-center"
              >
                Ver dashboard
              </a>

            </div>

            {/* STATUS */}
            <div className="flex flex-wrap gap-3">

              <span className="bg-green-500/10 border border-green-500/30 px-4 py-2 rounded-full text-sm text-green-400">
                🟢 Sistema online
              </span>

              <span className="bg-cyan-500/10 border border-cyan-500/30 px-4 py-2 rounded-full text-sm text-cyan-400">
                📡 ESP32 conectado
              </span>

              <span className="bg-purple-500/10 border border-purple-500/30 px-4 py-2 rounded-full text-sm text-purple-400">
                ⛓ Solana activa
              </span>

            </div>

          </div>

        </div>

      </section>

      {/* MINI DASHBOARD */}
      <section className="px-6 md:px-14 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            ["🌡️", "28°C", "Temperatura"],
            ["💧", "68%", "Humedad"],
            ["🧪", "7.1", "Nivel pH"],
            ["🚿", "Activo", "Estado del riego"],
          ].map(([icon, value, label]) => (
            <div
              key={label}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:-translate-y-1 transition"
            >
              <p className="text-3xl mb-3">{icon}</p>
              <h3 className="text-3xl font-bold text-[#00BB77]">{value}</h3>
              <p className="text-gray-400 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CONCEPTOS */}
      <section id="conceptos" className="px-6 md:px-14 py-20">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Conceptos principales del sistema
          </h2>
          <p className="text-gray-400">
            Cada módulo representa una parte clave de AgroSense-Web3: sensores,
            visualización, automatización, blockchain, alertas y despliegue.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {features.map((item) => (
            <div
              key={item.title}
              className="bg-[#0F172A] border border-white/10 rounded-3xl overflow-hidden hover:-translate-y-2 transition shadow-xl"
            >
              <div className="h-82 bg-white/5 border-b border-white/10 overflow-hidden">
                <img
                  src={item.img}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-7">
                <h3 className="text-2xl font-bold text-[#00BB77] mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {item.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ARQUITECTURA */}
      <section
        id="arquitectura"
        className="px-6 md:px-14 py-24 bg-[#0F172A]"
      >
        <div className="max-w-7xl mx-auto text-center">
          
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            Arquitectura del sistema
          </h2>

          <p className="text-gray-400 max-w-4xl mx-auto mb-16 text-lg">
            El flujo conecta sensores físicos con el ESP32, envía datos al backend,
            almacena información en MongoDB, sincroniza eventos Web3 y los muestra
            en el dashboard.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
            {architecture.map((item) => (
              <div
                key={item.name}
                className="
                  h-[320px]
                  w-[250px]
                  group
                  bg-white/5
                  border border-white/10
                  rounded-3xl
                  p-4
                  hover:-translate-y-3
                  hover:border-[#00BB77]/40
                  hover:shadow-[0_0_30px_rgba(0,187,119,0.25)]
                  transition-all
                  duration-300
                  backdrop-blur-sm
                "
              >
                {/* CONTENEDOR IMAGEN */}
                <div
                  className="
                    h-[220px]
                    w-[220px]
                    rounded-2xl
                    flex
                    items-center
                    justify-center
                    mb-8
                    bg-[#07111F]/80
                    overflow-hidden
                    border border-white/5
                  "
                >
                  <img
                    src={item.img}
                    alt={item.name}
                    className="
                      max-h-[220px]
                      max-w-[220px]
                      object-contain
                      group-hover:scale-110
                      transition-transform
                      duration-500
                    "
                  />
                </div>

                {/* TITULO */}
                <h3 className="font-bold text-2xl text-[#00E08A]">
                  {item.name}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TECNOLOGÍAS */}
      <section id="tecnologias" className="px-6 md:px-14 py-20">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-5">
            Tecnologías utilizadas
          </h2>

          <p className="text-gray-400 mb-10">
            Stack tecnológico usado para crear una plataforma agrícola moderna,
            escalable y conectada.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            {[
              "Next.js",
              "TailwindCSS",
              "Node.js",
              "Express",
              "MongoDB",
              "Socket.IO",
              "Docker",
              "ESP32",
              "Solana",
              "Web3",
            ].map((tech) => (
              <span
                key={tech}
                className="px-5 py-3 bg-white/5 border border-white/10 rounded-full text-gray-300 hover:text-[#00BB77] hover:border-[#00BB77]/40 transition"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="px-6 py-24 text-center bg-[#0F172A]">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">
          Tecnología para un campo más inteligente
        </h2>

        <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
          AgroSense-Web3 combina IoT, automatización y Web3 para mejorar la
          toma de decisiones agrícolas.
        </p>

        <Link
          href="/login"
          className="bg-[#00BB77] hover:bg-[#009966] px-8 py-4 rounded-xl font-bold transition"
        >
          Entrar al sistema
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 px-8 py-6 text-center text-gray-500 text-sm">
        © 2026 AgroSense-Web3. Proyecto IoT agrícola con Solana.
      </footer>

    </main>
  );
}

