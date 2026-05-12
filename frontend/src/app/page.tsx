export default function Home() {
  return (
    <div className="min-h-screen bg-[#0F172A] text-white flex flex-col justify-center items-center px-6">

      {/* TÍTULO */}
      <h1 className="text-5xl font-bold text-[#00BB77] mb-4 text-center">
        AgroSense-Web3 🌱
      </h1>

      {/* DESCRIPCIÓN */}
      <p className="text-lg text-gray-300 max-w-2xl text-center mb-8">
        Plataforma inteligente para monitoreo agrícola en tiempo real,
        integrando sensores IoT, análisis de datos y programación reactiva.
      </p>

      {/* BOTONES */}
      <div className="flex gap-4">

        <a
          href="/login"
          className="bg-[#00BB77] hover:bg-[#009966] px-6 py-3 rounded-lg font-semibold transition"
        >
          Iniciar sesión
        </a>

        <a
          href="/dashboard"
          className="border border-gray-400 px-6 py-3 rounded-lg hover:bg-gray-700 transition"
        >
          Ver demo
        </a>

      </div>

    </div>
  );
}
