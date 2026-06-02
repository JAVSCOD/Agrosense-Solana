"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import dynamic from "next/dynamic";

import {
  getProgram,
  getUserAccountPDA,
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

      window.location.href = "/dashboard";
    } catch (err: any) {
      console.error("ERROR LOGIN WEB3:", err);
      setError("Esta wallet no tiene usuario registrado en Solana");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden bg-[#07111F]">

      {/* LADO IZQUIERDO */}
      <div className="hidden lg:block w-1/2 relative overflow-hidden bg-[#07111F]">
        <img
          src="/login-izquierdo.png"
          alt="AgroSense Web3"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      {/* LADO DERECHO */}
      <div className="relative flex w-full lg:w-1/2 items-center justify-center overflow-hidden bg-white">
        
        {/* FONDO DERECHO */}
        <img
          src="/login-derecho.png"
          alt="Fondo AgroSense"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* CARD LOGIN */}
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

          {/* WALLET BUTTON */}
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

          {/* LOGIN BUTTON */}
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
  );
}
