"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import dynamic from "next/dynamic";

import {
  getProgram,
  getUserAccountPDA,
  checkProgramExists,
} from "@/lib/solana";

const ConnectWalletButton = dynamic(
  () => import("@/components/ConnectWalletButton"),
  { ssr: false }
);

export default function Login() {
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

      console.log("Wallet login:", publicKey.toString());

      const program = getProgram(wallet as any) as any;
      const userAccountPda = getUserAccountPDA(publicKey);

      console.log("PDA login:", userAccountPda.toString());

      const userAccount = await program.account.userAccount.fetch(userAccountPda);

      console.log("Usuario encontrado en Solana:", userAccount);

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

      console.log("Usuario guardado en localStorage");
      window.location.href = "/dashboard";

    } catch (err: any) {
      console.error("ERROR LOGIN WEB3:", err);
      setError("Esta wallet no tiene usuario registrado en Solana");
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

      {/* ⚪ LOGIN WEB3 */}
      <div className="flex w-full md:w-1/2 items-center justify-center bg-white">
        <div className="w-full max-w-md p-8">
          <h1 className="text-4xl font-bold text-[#00BB77] mb-4">
            Bienvenido 🌱
          </h1>

          <h2 className="text-2xl font-semibold mb-6 text-gray-800">
            Iniciar sesión Web3
          </h2>

          <p className="text-gray-400 mb-6">
            Conecta tu wallet Phantom para acceder a AgroSense.
          </p>

          {error && (
            <div className="mb-4 p-2 text-sm text-red-600 bg-red-100 border border-red-300 rounded">
              {error}
            </div>
          )}

          <div className="mb-4">
            <ConnectWalletButton />
          </div>

          {publicKey && (
            <p className="text-xs text-gray-500 break-all mb-4 text-center">
              Wallet conectada: {publicKey.toString()}
            </p>
          )}

          <button
            onClick={handleWeb3Login}
            disabled={loading}
            className="w-full bg-[#00BB77] hover:bg-[#029e65] text-white py-3 rounded transition mb-4 disabled:opacity-50"
          >
            {loading ? "Verificando cuenta..." : "Entrar con Solana"}
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

