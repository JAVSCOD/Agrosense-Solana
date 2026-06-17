"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import dynamic from "next/dynamic";
import Link from "next/link";

import {
  getProgram,
  getUserAccountPDA,
} from "@/lib/solana";

const ConnectWalletButton = dynamic(
  () => import("@/components/ConnectWalletButton"),
  { ssr: false }
);

function Home() {
  const router = useRouter();
  const wallet = useWallet();
  const { publicKey, connected } = wallet;

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleWeb3Login = async () => {
    try {
      setError("");
      setLoading(true);

      if (!connected || !publicKey) {
        setError("Conecta tu wallet Phantom para continuar");
        return;
      }

      const program = getProgram(wallet as any) as any;
      const userAccountPda = getUserAccountPDA(publicKey);

      const userAccount =
        await program.account.userAccount.fetch(userAccountPda);

      localStorage.setItem(
        "user",
        JSON.stringify({
          wallet: publicKey.toString(),
          pda: userAccountPda.toString(),
          nombres: userAccount.nombres,
          primerapellido: userAccount.primerApellido,
          segundoapellido: userAccount.segundoApellido,
          authProvider: userAccount.authProvider,
        })
      );

      router.push("/dashboard");

    } catch (err: any) {
      console.error("ERROR LOGIN WEB3:", err);

      setError(
        "Esta wallet no tiene usuario registrado en Solana"
      );
    } finally {
      setLoading(false);
    }
  };

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
            <a
              href="#inicio"
              className="hover:text-[#00BB77] transition"
            >
              Inicio
            </a>

            <a
              href="#conceptos"
              className="hover:text-[#00BB77] transition"
            >
              Conceptos
            </a>

            <a
              href="#arquitectura"
              className="hover:text-[#00BB77] transition"
            >
              Arquitectura
            </a>

            <a
              href="#tecnologias"
              className="hover:text-[#00BB77] transition"
            >
              Tecnologías
            </a>
          </nav>

          <Link
            href="/login"
            className="bg-[#00BB77] hover:bg-[#009966] px-5 py-2 rounded-xl font-semibold transition"
          >
            Iniciar Sesión
          </Link>

        </div>
      </header>

      {/* HERO */}
      <section
        id="inicio"
        className="relative min-h-screen flex items-center overflow-hidden"
      >

        {/* VIDEO */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source
            src="/videos/agrosense-hero.mp4"
            type="video/mp4"
          />
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
              <span className="text-[#00BB77]">
                {" "}tiempo real
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl">
              Monitorea sensores agrícolas, automatiza sistemas
              de riego y visualiza datos en tiempo real mediante
              IoT y Web3.
            </p>

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

            <div
          className="
            relative z-10
            w-full max-w-md
            mx-6
            bg-white/80
            backdrop-blur-xl
            border border-white/70
            shadow-[0_25px_70px_rgba(0,0,0,0.14)]
            rounded-[32px]
            p-10
          "
        >

          {/* ICONO */}
          <div className="flex justify-center mb-6">

            <div
              className="
                w-24 h-24
                rounded-full
                bg-[#00BB77]/10
                border border-[#00BB77]/20
                flex items-center justify-center
                shadow-[0_0_30px_rgba(0,187,119,0.16)]
              "
            >
              <span className="text-5xl">🌱</span>
            </div>

          </div>

          {/* TITULOS */}
          <div className="text-center mb-8">

            <h1 className="text-5xl font-extrabold text-[#00BB77] mb-3 tracking-tight">
              Bienvenido 🌱
            </h1>

            <h2 className="text-3xl font-bold text-[#0F172A] mb-4">
              Iniciar sesión Web3
            </h2>

            <p className="text-gray-500 leading-relaxed text-base">
              Conecta tu wallet Phantom para acceder a AgroSense.
            </p>

          </div>

          {/* ERROR */}
          {error && (
            <div
              className="
                mb-5
                p-4
                text-sm
                text-red-600
                bg-red-50
                border border-red-200
                rounded-2xl
              "
            >
              {error}
            </div>
          )}

          {/* BOTON WALLET */}
          <div className="mb-5 flex justify-center">
            <ConnectWalletButton />
          </div>

          {/* WALLET */}
          {publicKey && (
            <div
              className="
                mb-6
                p-4
                rounded-2xl
                bg-[#7C3AED]/10
                border border-[#7C3AED]/20
              "
            >

              <p className="text-xs text-gray-500 text-center mb-2">
                Wallet conectada
              </p>

              <p className="text-sm font-medium text-[#4C1D95] break-all text-center">
                {publicKey.toString()}
              </p>

            </div>
          )}

          {/* LOGIN */}
          <button
            onClick={handleWeb3Login}
            disabled={loading}
            className="
              w-full
              bg-[#00BB77]
              hover:bg-[#029e65]
              text-white
              py-4
              rounded-2xl
              font-bold
              text-lg
              transition-all
              duration-300
              shadow-[0_10px_30px_rgba(0,187,119,0.35)]
              hover:scale-[1.02]
              disabled:opacity-50
            "
          >
            {loading
              ? "Verificando cuenta..."
              : "Entrar con Solana →"}
          </button>

          {/* REGISTER */}
          <p className="text-sm text-gray-500 mt-8 text-center">

            ¿No tienes cuenta?{" "}

            <button
              onClick={() => router.push("/register")}
              className="text-[#00BB77] font-semibold hover:underline"
            >
              Crear cuenta
            </button>

          </p>

        </div>


          </div>

        </div>

      </section>


      {/* FOOTER */}
      <footer className="border-t border-white/10 px-8 py-6 text-center text-gray-500 text-sm">
        © 2026 AgroSense-Web3. Proyecto IoT agrícola con Solana.
      </footer>

    </main>
  );
}

export default Home;

