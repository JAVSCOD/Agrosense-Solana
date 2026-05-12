"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function Perfil() {
  const router = useRouter();

  const { data: session, status } = useSession();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    nombre: "",
    email: "",
    ubicacion: "",
    cultivo: "",
  });

  // 🔥 OBTENER USUARIO DESDE NEXTAUTH
  useEffect(() => {
    const obtenerUsuario = async () => {
      try {
        if (status === "loading") return;

        // 🔐 NO LOGUEADO
        if (!session) {
          router.push("/login");
          return;
        }

        const userSession: any = session.user;

        setUser(userSession);

        setForm({
          nombre: userSession.nombres || userSession.name || "",
          email: userSession.email || "",
          ubicacion: userSession.ubicacion || "",
          cultivo: userSession.cultivo || "",
        });

      } catch (error) {
        console.error(error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    obtenerUsuario();
  }, [session, status, router]);

  // 🔄 HANDLE INPUTS
  const handleChange = (e: any) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // 💾 GUARDAR CAMBIOS (OPCIONAL BACKEND)
  const guardarCambios = async () => {
    try {
      // 🔥 aquí podrías conectar luego con backend
      setUser({ ...user, ...form });
      setEditando(false);
    } catch (error) {
      console.error("Error guardando:", error);
    }
  };

  // 📷 FOTO PREVIEW
  const handleFoto = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  // 🔥 LOADING
  if (loading) return <p className="p-6">Cargando...</p>;

  // 🔥 NO LOGUEADO
  if (!user) return <p className="p-6">No hay sesión</p>;

  return (
    <div className="flex min-h-screen bg-[#F5F7FA]">
      <main className="flex-1 p-6">

        {/* HEADER */}
        <div className="bg-white p-6 rounded-xl shadow flex justify-between items-center">

          <div className="flex items-center gap-6">

            {/* FOTO */}
            <div className="relative">
              <img
                src={preview || user.image || "/default.png"}
                className="w-24 h-24 rounded-full object-cover border-4 border-green-500"
              />

              {editando && (
                <input
                  type="file"
                  onChange={handleFoto}
                  className="absolute bottom-0 left-0 text-xs"
                />
              )}
            </div>

            {/* INFO */}
            <div>
              {editando ? (
                <>
                  <input
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    className="border p-1 rounded block"
                  />
                  <input
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="border p-1 rounded mt-1 block"
                  />
                </>
              ) : (
                <>
                  <h1 className="text-2xl font-bold">
                    {user.nombres || user.name}
                  </h1>
                  <p className="text-gray-500">{user.email}</p>
                </>
              )}

              <p className="text-sm text-gray-400">
                Registrado: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* BOTONES */}
          <div className="flex gap-3">
            {editando ? (
              <>
                <button
                  onClick={guardarCambios}
                  className="bg-green-500 text-white px-4 py-2 rounded"
                >
                  Guardar
                </button>

                <button
                  onClick={() => setEditando(false)}
                  className="bg-gray-300 px-4 py-2 rounded"
                >
                  Cancelar
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditando(true)}
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                Editar perfil
              </button>
            )}
          </div>
        </div>

        {/* INFO PERSONAL */}
        <div className="bg-white p-6 rounded-xl shadow mt-6">
          <h2 className="font-semibold mb-4">Información personal 👤</h2>

          {editando ? (
            <>
              <input
                name="ubicacion"
                value={form.ubicacion}
                onChange={handleChange}
                placeholder="Ubicación"
                className="border p-2 rounded w-full mb-2"
              />

              <input
                name="cultivo"
                value={form.cultivo}
                onChange={handleChange}
                placeholder="Tipo de cultivo"
                className="border p-2 rounded w-full"
              />
            </>
          ) : (
            <>
              <p><b>Ubicación:</b> {user.ubicacion || "No definida"}</p>
              <p><b>Cultivo:</b> {user.cultivo || "No definido"}</p>
            </>
          )}
        </div>

        {/* SEGURIDAD */}
        <div className="bg-white p-6 rounded-xl shadow mt-6">
          <h2 className="font-semibold mb-4">Seguridad 🔐</h2>

          <button className="bg-red-500 text-white px-4 py-2 rounded">
            Cambiar contraseña
          </button>
        </div>

        {/* PREFERENCIAS */}
        <div className="bg-white p-6 rounded-xl shadow mt-6">
          <h2 className="font-semibold mb-4">Preferencias 🌐</h2>

          <p>Idioma: Español</p>
          <p>Tema: Claro</p>
        </div>

        {/* ACTIVIDAD */}
        <div className="bg-white p-6 rounded-xl shadow mt-6">
          <h2 className="font-semibold mb-4">Actividad reciente 📊</h2>

          <ul className="text-sm text-gray-600 space-y-2">
            <li>Inicio de sesión reciente</li>
            <li>Actualización de perfil</li>
            <li>Acceso al sistema</li>
          </ul>
        </div>

      </main>
    </div>
  );
}

