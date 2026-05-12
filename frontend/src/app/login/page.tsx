"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useAuth } from "@/context/AuthContext"; // 🔥 NUEVO

export default function Login() {
  const router = useRouter();
  const { fetchUser } = useAuth(); // 🔥 NUEVO

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    setError("");

    if (!email || !password) {
      setError("⚠️ Completa todos los campos");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/backend/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.ok) {

        // ❌ ELIMINADO: token en localStorage
        // localStorage.setItem("token", data.token);

        // ✅ opcional (puedes dejarlo)
        localStorage.setItem("user", JSON.stringify(data.user));

        // 🔥 FIX REAL
        await fetchUser();

        router.push("/dashboard");

      } else {
        setError(data.error || "❌ Usuario o contraseña incorrectos");
      }

    } catch (err) {
      console.error(err);
      setError("❌ Error conectando con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* 🔵 LADO IZQUIERDO */}
      <div className="hidden md:flex w-1/2 bg-[#0F172A] flex-col items-center justify-between p-10 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A] to-[#020617]" />

        <div className="relative flex flex-col h-full w-full items-center">
          <div className="text-center mt-10">
            <h1 className="text-5xl font-bold text-[#00BB77] mb-2">
              AgroSense-Web3 🌱
            </h1>
            <p className="text-gray-400 text-2xl">
              Plataforma digital para monitoreo y control de riego inteligente
            </p>
          </div>

          <div className="flex-1 flex items-center justify-center w-full mt-10">
            <img
              src="/agro-bg-a.jpg"
              alt="AgroSense"
              className="rounded-xl shadow-2xl object-cover max-h-[500px] w-full"
            />
          </div>
        </div>
      </div>

      {/* ⚪ FORMULARIO */}
      <div className="flex w-full md:w-1/2 items-center justify-center bg-white">
        <div className="w-full max-w-md p-8">

          <h1 className="text-4xl font-bold text-[#00BB77] mb-4">
            Bienvenido 🌱
          </h1>

          <h2 className="text-2xl font-semibold mb-6 text-gray-800">
            Iniciar sesión
          </h2>

          <p className="text-gray-400">
            Para continuar ingresa tus datos
          </p>

          {error && (
            <div className="mb-4 p-2 text-sm text-red-600 bg-red-100 border border-red-300 rounded">
              {error}
            </div>
          )}

          <input
            type="email"
            placeholder="Correo electrónico"
            className="w-full mb-4 p-3 rounded border border-gray-300 focus:border-[#00BB77] outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Contraseña"
            className="w-full mb-2 p-3 rounded border border-gray-300 focus:border-[#00BB77] outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="text-right mb-4">
            <button
              onClick={() => setError("🔐 Recuperación próximamente")}
              className="text-sm text-[#00BB77] hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-[#00BB77] hover:bg-[#029e65] text-white py-3 rounded transition mb-4 disabled:opacity-50"
          >
            {loading ? "Ingresando..." : "Iniciar sesión"}
          </button>

          <div className="flex items-center my-4">
            <div className="flex-1 h-px bg-gray-300" />
            <span className="px-3 text-sm text-gray-500">o</span>
            <div className="flex-1 h-px bg-gray-300" />
          </div>

          <button
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="w-full border border-gray-300 py-2 rounded hover:bg-gray-100 mb-3"
          >
            Continuar con Google
          </button>

          <button
            onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
            className="w-full border border-gray-300 py-2 rounded hover:bg-gray-100"
          >
            Continuar con GitHub
          </button>

          <p className="text-sm text-gray-500 mt-6 text-center">
            ¿No tienes cuenta?{" "}
            <button
              onClick={() => router.push("/register")}
              className="text-[#00BB77] hover:underline"
            >
              Crear cuenta
            </button>
          </p>

        </div>
      </div>
    </div>
  );
}

