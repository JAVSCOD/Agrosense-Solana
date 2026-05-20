"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { getProgram, getUserAccountPDA } from "@/lib/solana";

export default function Perfil() {
  const router = useRouter();
  const wallet = useWallet();
  const { publicKey, connected } = wallet;

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState("");
  const [toast, setToast] = useState("");

  const [form, setForm] = useState({
    nombres: "",
    primerApellido: "",
    segundoApellido: "",
    email: "",
    telefono: "",
  });

  const hashText = async (text: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(text.trim().toLowerCase());
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));

    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        router.push("/login");
        return;
      }

      const parsedUser = JSON.parse(storedUser);

      if (!parsedUser.wallet || !parsedUser.pda) {
        localStorage.removeItem("user");
        router.push("/login");
        return;
      }

      setUser(parsedUser);

      setForm({
        nombres: parsedUser.nombres || "",
        primerApellido:
          parsedUser.primerapellido || parsedUser.primerApellido || "",
        segundoApellido:
          parsedUser.segundoapellido || parsedUser.segundoApellido || "",
        email: parsedUser.email || "Correo protegido",
        telefono: parsedUser.telefono || "",
      });
    } catch (error) {
      console.error(error);
      localStorage.removeItem("user");
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const mostrarToast = (texto: string) => {
    setToast(texto);
    setTimeout(() => setToast(""), 4000);
  };

  const guardarCambios = async () => {
    try {
      setGuardando(true);
      setMensaje("");

      if (!connected || !publicKey) {
        setMensaje("Conecta tu wallet Phantom para actualizar");
        return;
      }

      const program = getProgram(wallet as any) as any;
      const userAccountPda = getUserAccountPDA(publicKey);

      const currentAccount = await program.account.userAccount.fetch(
        userAccountPda
      );

      const nombres = form.nombres?.trim() || currentAccount.nombres;

      const primerApellido =
        form.primerApellido?.trim() || currentAccount.primerApellido;

      const segundoApellido =
        form.segundoApellido?.trim() || currentAccount.segundoApellido;

      const emailHash = user.emailHash || currentAccount.emailHash;

      const telefonoHash = form.telefono?.trim()
        ? await hashText(form.telefono)
        : user.telefonoHash || currentAccount.telefonoHash;

      const tx = await program.methods
        .updateUser(
          nombres,
          primerApellido,
          segundoApellido,
          emailHash,
          telefonoHash,
          user.authProvider || "local"
        )
        .accounts({
          userAccount: userAccountPda,
          user: publicKey,
        })
        .rpc();

      const updatedUser = {
        ...user,
        nombres,
        primerapellido: primerApellido,
        segundoapellido: segundoApellido,
        primerApellido,
        segundoApellido,
        telefono: form.telefono || user.telefono || "",
        telefonoHash,
        image: preview || user.image || "",
        txUpdate: tx,
      };

      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setEditando(false);

      await fetch("http://localhost:3001/api/auth/profile-updated", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: updatedUser.email,
          nombres: updatedUser.nombres,
          primerApellido: updatedUser.primerApellido,
          segundoApellido: updatedUser.segundoApellido,
          telefono: updatedUser.telefono,
          wallet: updatedUser.wallet,
          pda: updatedUser.pda,
          tx,
        }),
      });

      mostrarToast("Perfil actualizado correctamente ✅");
    } catch (error: any) {
      console.error("Error actualizando perfil:", error);
      setMensaje(error?.message || "Error actualizando perfil en Solana");
    } finally {
      setGuardando(false);
    }
  };

  const handleFoto = (e: any) => {
    const file = e.target.files[0];

    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  if (loading) return <p className="p-6">Cargando...</p>;

  if (!user) return <p className="p-6">No hay sesión</p>;

  return (
    <div className="flex min-h-screen bg-[#F5F7FA]">
      {toast && (
        <div className="fixed top-6 right-6 z-[9999] bg-[#22C55E] text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-4">
          <span>{toast}</span>

          <button onClick={() => setToast("")} className="font-bold">
            ✕
          </button>
        </div>
      )}

      <main className="flex-1 p-6">
        <div className="bg-white p-6 rounded-xl shadow flex justify-between items-center">
          <div className="flex items-center gap-6">
            <img
              src={preview || user.image || "/default.png"}
              className="w-24 h-24 rounded-full object-cover border-4 border-[#22C55E]"
            />

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {user.nombres || "Usuario Web3"}
              </h1>

              <p className="text-gray-500 break-all">{user.wallet}</p>

              <p className="text-sm text-gray-400">
                Registrado: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow mt-6">
          <h2 className="font-semibold mb-4 text-gray-900">
            Información personal 👤
          </h2>

          {mensaje && <p className="mb-4 text-sm text-red-600">{mensaje}</p>}

          <p>
            <b>Nombre(s):</b> {user.nombres || "No definido"}
          </p>

          <p>
            <b>Primer apellido:</b>{" "}
            {user.primerapellido || user.primerApellido || "No definido"}
          </p>

          <p>
            <b>Segundo apellido:</b>{" "}
            {user.segundoapellido || user.segundoApellido || "No definido"}
          </p>

          <p>
            <b>Correo:</b> {user.email || "Correo protegido"}
          </p>

          <p>
            <b>Teléfono:</b> {user.telefono || "Protegido"}
          </p>

          <p>
            <b>Proveedor:</b> {user.authProvider || "local"}
          </p>

          <p className="break-all">
            <b>Wallet:</b> {user.wallet}
          </p>

          <p className="break-all">
            <b>UserAccount PDA:</b> {user.pda}
          </p>

          <button
            onClick={() => setEditando(true)}
            className="mt-5 bg-[#22C55E] hover:bg-[#16A34A] text-white px-4 py-2 rounded-lg font-semibold transition"
          >
            Editar perfil
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="font-semibold mb-4 text-lg text-gray-900">
              Seguridad 🔐
            </h2>

            <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition">
              Seguridad Web3 con Phantom
            </button>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="font-semibold mb-4 text-lg text-gray-900">
              Preferencias 🌐
            </h2>

            <div className="space-y-2 text-gray-700">
              <p>
                <span className="font-semibold">Idioma:</span> Español
              </p>

              <p>
                <span className="font-semibold">Tema:</span> Claro
              </p>
            </div>
          </div>
        </div>
      </main>

      {editando && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md h-full bg-[#0F172A] text-white shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-[#1E293B]">
              <h2 className="text-3xl font-bold text-[#22C55E]">
                Editar perfil
              </h2>

              <button
                onClick={() => setEditando(false)}
                className="text-gray-400 hover:text-red-400 text-3xl transition"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              <div className="flex flex-col items-center mb-8">
                <div className="w-32 h-32 rounded-full border-4 border-[#22C55E] overflow-hidden bg-[#1E293B]">
                  {preview || user.image ? (
                    <img
                      src={preview || user.image}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl font-bold text-white">
                      {form.nombres?.charAt(0) || "U"}
                    </div>
                  )}
                </div>

                <label className="mt-5 cursor-pointer bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-5 py-2 rounded-lg transition font-medium">
                  Cambiar foto

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFoto}
                  />
                </label>
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  name="nombres"
                  value={form.nombres}
                  onChange={handleChange}
                  placeholder="Nombre(s)"
                  className="w-full bg-[#1E293B] border border-[#334155] text-white rounded-lg px-4 py-3 outline-none focus:border-[#22C55E]"
                />

                <input
                  type="text"
                  name="primerApellido"
                  value={form.primerApellido}
                  onChange={handleChange}
                  placeholder="Primer apellido"
                  className="w-full bg-[#1E293B] border border-[#334155] text-white rounded-lg px-4 py-3 outline-none focus:border-[#22C55E]"
                />

                <input
                  type="text"
                  name="segundoApellido"
                  value={form.segundoApellido}
                  onChange={handleChange}
                  placeholder="Segundo apellido"
                  className="w-full bg-[#1E293B] border border-[#334155] text-white rounded-lg px-4 py-3 outline-none focus:border-[#22C55E]"
                />

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  disabled
                  className="w-full bg-[#111827] border border-[#334155] text-gray-400 rounded-lg px-4 py-3 cursor-not-allowed"
                />

                <input
                  type="text"
                  name="telefono"
                  value={form.telefono}
                  onChange={handleChange}
                  placeholder="Teléfono"
                  className="w-full bg-[#1E293B] border border-[#334155] text-white rounded-lg px-4 py-3 outline-none focus:border-[#22C55E]"
                />
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={guardarCambios}
                  disabled={guardando}
                  className="flex-1 bg-[#22C55E] hover:bg-[#16A34A] transition py-3 rounded-lg font-semibold disabled:opacity-50"
                >
                  {guardando ? "Guardando..." : "Guardar cambios"}
                </button>

                <button
                  onClick={() => setEditando(false)}
                  className="flex-1 bg-red-500 hover:bg-red-600 transition py-3 rounded-lg font-semibold"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

