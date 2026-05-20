"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { SystemProgram } from "@solana/web3.js";
import {
  getUserProfilePDA,
  getProgram,
  checkProgramExists,
} from "../lib/solana";

export default function UserInitializer() {
  const wallet = useWallet();
  const { publicKey, connected } = wallet;

  const [profilePda, setProfilePda] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [profileExists, setProfileExists] = useState(false);
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!connected || !publicKey) return;
    initializeUser();
  }, [connected, publicKey]);

  const initializeUser = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      setTxSignature(null);

      if (!publicKey) return;

      const pda = getUserProfilePDA(publicKey);
      setProfilePda(pda.toString());

      console.log("Wallet conectada:", publicKey.toString());
      console.log("User Profile PDA:", pda.toString());

      const exists = await checkProgramExists();

      if (!exists) {
        setErrorMsg("El programa no existe o no es ejecutable en Devnet");
        return;
      }

      const program = getProgram(wallet as any) as any;

      try {
        const profile = await program.account.userProfile.fetch(pda);

        console.log("Perfil ya existe:", profile);
        setProfileExists(true);
        return;
      } catch {
        console.log("Perfil no existe, creando...");
      }

      const tx = await program.methods
        .createUserProfile("Alexis", "agricultor")
        .accounts({
          userProfile: pda,
          user: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log("Firma de transacción:", tx);
      setTxSignature(tx);

      const profile = await program.account.userProfile.fetch(pda);
      console.log("Perfil creado:", profile);

      setProfileExists(true);
    } catch (error: any) {
      console.error("Error inicializando usuario:", error);
      setErrorMsg(error?.message || "Error desconocido al crear perfil");
    } finally {
      setLoading(false);
    }
  };

  if (!connected || !publicKey) {
    return null;
  }

  return (
    <div className="mt-6 bg-[#1E293B] border border-[#00BB77]/40 rounded-lg p-4 text-sm text-gray-300 max-w-xl text-center">
      <p className="text-[#00BB77] font-semibold mb-2">
        Wallet conectada correctamente
      </p>

      <p className="break-all">
        <span className="font-semibold text-white">Wallet:</span>{" "}
        {publicKey.toString()}
      </p>

      {profilePda && (
        <p className="break-all mt-2">
          <span className="font-semibold text-white">Perfil PDA:</span>{" "}
          {profilePda}
        </p>
      )}

      <div className="mt-4">
        {loading ? (
          <p className="text-yellow-400">Inicializando perfil...</p>
        ) : profileExists ? (
          <p className="text-[#00BB77] font-semibold">
            Perfil Web3 creado en Solana ✅
          </p>
        ) : (
          <p className="text-red-400">Perfil no inicializado</p>
        )}
      </div>

      {txSignature && (
        <p className="break-all mt-3 text-blue-300">
          TX: {txSignature}
        </p>
      )}

      {errorMsg && (
        <p className="break-all mt-3 text-red-400">
          Error: {errorMsg}
        </p>
      )}
    </div>
  );
}


