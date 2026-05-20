"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { getProgram } from "@/lib/solana";
import * as anchor from "@coral-xyz/anchor";

export default function TestProgram() {
  const wallet = useWallet();

  const testConnection = async () => {
    try {
      if (!wallet.publicKey) {
        alert("Wallet no conectada");
        return;
      }

      const program = getProgram(
        wallet as unknown as anchor.Wallet
      );

      console.log("✅ Programa conectado:");
      console.log(program);

      alert("Programa conectado correctamente");
    } catch (err) {
      console.error(err);
      alert("Error conectando programa");
    }
  };

  return (
    <button
      onClick={testConnection}
      className="bg-purple-600 px-6 py-3 rounded-lg mt-4"
    >
      Probar programa Solana
    </button>
  );
}

