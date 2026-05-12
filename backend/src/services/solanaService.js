// import * as anchor from "@project-serum/anchor";
// import { Connection, clusterApiUrl, Keypair } from "@solana/web3.js";
// import fs from "fs";

// const idl = JSON.parse(
//   fs.readFileSync(new URL("../idl/agrosense.json", import.meta.url))
// );

// 🌐 Conexión
// const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// 🔑 Wallet
// const secretKey = JSON.parse(
//   fs.readFileSync("/home/javs/.config/solana/id.json")
// );

// const wallet = Keypair.fromSecretKey(new Uint8Array(secretKey));

// 🔌 Provider
// const provider = new anchor.AnchorProvider(
//   connection,
//   new anchor.Wallet(wallet),
//   { preflightCommitment: "confirmed" }
// );

// anchor.setProvider(provider);

// 🔥 Program ID
// const programId = new anchor.web3.PublicKey(
//   "BPWdnHj2JWkxWHmQ3tJssMx9qPGN3YytY9KrUyUd1u8p"
// );

// 🔥 Programa listo
// const program = new anchor.Program(idl, programId, provider);

// 🚀 Enviar datos (MODO PRUEBA)
export async function enviarASolana(evento) {
  try {
    // 🧪 Solo simulamos envío
    console.log("🧪 Simulación → datos que se enviarían a Solana:", evento);

    // 🔒 TODO ESTO SE ACTIVA DESPUÉS
    /*
    const sensorAccount = anchor.web3.Keypair.generate();

    const humedad = evento.humedad || 0;
    const temperatura = evento.tipo === "activar_riego" ? 1 : 0;

    await program.methods
      .addData(humedad, temperatura)
      .accounts({
        sensorAccount: sensorAccount.publicKey,
        user: wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([sensorAccount])
      .rpc();

    console.log("🔗 Evento enviado a Solana:", evento.tipo);
    */

  } catch (error) {
    console.error("❌ Error simulando envío a Solana:", error);
  }
}

