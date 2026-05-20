import * as anchor from "@coral-xyz/anchor";

import {
  Connection,
  PublicKey,
  clusterApiUrl,
} from "@solana/web3.js";

import idl from "../idl/agrosense_solana.json";

export const PROGRAM_ID = new PublicKey(
  "AhyXk9pLZq5U1CuyDPAutji2y6jw3b3dMLPciaPB2VVu"
);

export const connection = new Connection(
  clusterApiUrl("devnet"),
  "confirmed"
);

const idlWithAddress = {
  ...idl,
  address: PROGRAM_ID.toString(),
  metadata: {
    name: "agrosense_solana",
    version: "0.1.0",
    spec: "0.1.0",
    address: PROGRAM_ID.toString(),
  },
};

// PDA NUEVO PARA USUARIOS
export const getUserAccountPDA = (wallet: PublicKey) => {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("user-account"),
      wallet.toBuffer(),
    ],
    PROGRAM_ID
  )[0];
};

// Alias temporal por si algún componente viejo todavía lo usa
export const getUserProfilePDA = getUserAccountPDA;

export const getProgram = (wallet: anchor.Wallet) => {
  const provider = new anchor.AnchorProvider(
    connection,
    wallet,
    {
      commitment: "confirmed",
    }
  );

  return new anchor.Program(
    idlWithAddress as any,
    provider
  );
};

export const checkProgramExists = async () => {
  const accountInfo = await connection.getAccountInfo(PROGRAM_ID);

  console.log("PROGRAM_ID:", PROGRAM_ID.toString());
  console.log("Program account info:", accountInfo);

  if (!accountInfo) {
    alert("El programa NO existe en Devnet");
    return false;
  }

  console.log("Executable:", accountInfo.executable);

  alert(
    accountInfo.executable
      ? "Programa existe y es ejecutable"
      : "La cuenta existe, pero NO es ejecutable"
  );

  return accountInfo.executable;
};

