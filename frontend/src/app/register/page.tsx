"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { SystemProgram } from "@solana/web3.js";

import {
  getProgram,
  getUserAccountPDA,
  checkProgramExists,
} from "@/lib/solana";

type FormType = {
  nombres: string;
  primerapellido: string;
  segundoapellido: string;
  email: string;
  telefono: string;
  password: string;
  confirmPassword: string;
};

export default function Register() {
  const router = useRouter();
  const wallet = useWallet();
  const { publicKey, connected, connect } = wallet;

  const [form, setForm] = useState<FormType>({
    nombres: "",
    primerapellido: "",
    segundoapellido: "",
    email: "",
    telefono: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Partial<FormType>>({});
  const [globalError, setGlobalError] = useState("");
  const [globalSuccess, setGlobalSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [step, setStep] = useState<"form" | "verify">("form");
  const [codigo, setCodigo] = useState("");

  const [userAccountPda, setUserAccountPda] = useState("");
  const [txSignature, setTxSignature] = useState("");

  const hashText = async (text: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(text.trim().toLowerCase());
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));

    return hashArray
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  };

  const validate = (name: keyof FormType, value: string) => {
    let error = "";

    if (
      name === "nombres" ||
      name === "primerapellido" ||
      name === "segundoapellido"
    ) {
      if (!/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/.test(value)) {
        error = "Solo letras permitidas";
      }
    }

    if (name === "email") {
      if (!/^\S+@\S+\.\S+$/.test(value)) {
        error = "Correo inválido";
      }
    }

    if (name === "telefono") {
      if (!/^\d{10}$/.test(value)) {
        error = "Debe tener 10 dígitos";
      }
    }

    if (name === "password") {
      if (value.length < 6) {
        error = "Mínimo 6 caracteres";
      }
    }

    if (name === "confirmPassword") {
      if (value !== form.password) {
        error = "Las contraseñas no coinciden";
      }
    }

    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));

    return error;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value,
    });

    validate(name as keyof FormType, value);
  };

  const validateAll = () => {
    let newErrors: Partial<FormType> = {};

    Object.entries(form).forEach(([key, value]) => {
      if (!value) {
        newErrors[key as keyof FormType] = "Campo obligatorio";
      } else {
        const err = validate(key as keyof FormType, value);
        if (err) newErrors[key as keyof FormType] = err;
      }
    });

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const enviarCodigo = async () => {
    try {
      setGlobalError("");
      setGlobalSuccess("");
      setLoading(true);

      if (!validateAll()) return;

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!data.ok) {
        setGlobalError(data.error || "Error enviando código");
        return;
      }

      setStep("verify");
      setGlobalSuccess("Código enviado. Revisa tu correo.");
    } catch (error: any) {
      console.error(error);
      setGlobalError("Error conectando con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const registrarUsuarioSolana = async () => {
    if (!connected) {
      await connect();
    }

    if (!publicKey) {
      throw new Error("Conecta tu wallet Phantom para registrarte");
    }

    const exists = await checkProgramExists();

    if (!exists) {
      throw new Error("Programa de Solana no desplegado");
    }

    const program = getProgram(wallet as any) as any;
    const pda = getUserAccountPDA(publicKey);

    setUserAccountPda(pda.toString());

    try {
      await program.account.userAccount.fetch(pda);
      throw new Error("El usuario ya existe en Solana");
    } catch (error: any) {
      if (error?.message === "El usuario ya existe en Solana") {
        throw error;
      }
      console.log("Usuario no existe, creando...");
    }

    const emailHash = await hashText(form.email);
    const telefonoHash = await hashText(form.telefono);

    const tx = await program.methods
      .createUser(
        form.nombres,
        form.primerapellido,
        form.segundoapellido,
        emailHash,
        telefonoHash,
        "local"
      )
      .accounts({
        userAccount: pda,
        user: publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    setTxSignature(tx);

    const successRes = await fetch("/api/auth/register-success", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: form.email,
        wallet: publicKey.toString(),
        pda: pda.toString(),
        tx,
      }),
    });

    const successData = await successRes.json();

    if (!successData.ok) {
      throw new Error(successData.error || "Error finalizando registro");
    }

    const usuarioFinal = successData.user || {
      wallet: publicKey.toString(),
      nombres: form.nombres,
      primerapellido: form.primerapellido,
      segundoapellido: form.segundoapellido,
      email: form.email,
      telefono: form.telefono,
      emailHash,
      telefonoHash,
      authProvider: "local",
      tx,
      pda: pda.toString(),
    };

    localStorage.setItem("user", JSON.stringify(usuarioFinal));

    return tx;
  };

  const verificarCodigo = async () => {
    try {
      setGlobalError("");
      setGlobalSuccess("");
      setLoading(true);

      if (!codigo) {
        setGlobalError("Ingresa el código de verificación");
        return;
      }

      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email,
          code: codigo,
        }),
      });

      const data = await res.json();

      if (!data.ok) {
        setGlobalError(data.error || "Código incorrecto");
        return;
      }

      await registrarUsuarioSolana();

      setGlobalSuccess("Registro completado correctamente");
      window.location.href = "/dashboard";

    } catch (error: any) {
      console.error(error);
      setGlobalError(error?.message || "Error verificando registro");
    } finally {
      setLoading(false);
    }
  };

  const reenviarCodigo = async () => {
    try {
      setGlobalError("");
      setGlobalSuccess("");

      const res = await fetch("/api/auth/resend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: form.email }),
      });

      const data = await res.json();

      if (!data.ok) {
        setGlobalError(data.error || "Error reenviando código");
        return;
      }

      setGlobalSuccess("Código reenviado correctamente");
    } catch (error) {
      console.error(error);
      setGlobalError("Error reenviando código");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A] text-white">
      <form className="bg-[#1E293B] p-8 rounded-xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-[#00BB77] mb-6 text-center">
          Crear cuenta 🌱
        </h2>

        {globalError && (
          <p className="text-red-400 text-sm mb-4 text-center">
            {globalError}
          </p>
        )}

        {globalSuccess && (
          <p className="text-[#00BB77] text-sm mb-4 text-center">
            {globalSuccess}
          </p>
        )}

        <input
          type="text"
          name="nombres"
          placeholder="Nombre(s)"
          value={form.nombres}
          onChange={handleChange}
          disabled={step === "verify"}
          className="w-full mb-1 p-3 rounded bg-[#0F172A] border border-gray-600"
        />
        {errors.nombres && (
          <p className="text-red-400 text-sm mb-3">{errors.nombres}</p>
        )}

        <input
          type="text"
          name="primerapellido"
          placeholder="Primer Apellido"
          value={form.primerapellido}
          onChange={handleChange}
          disabled={step === "verify"}
          className="w-full mb-1 p-3 rounded bg-[#0F172A] border border-gray-600"
        />
        {errors.primerapellido && (
          <p className="text-red-400 text-sm mb-3">
            {errors.primerapellido}
          </p>
        )}

        <input
          type="text"
          name="segundoapellido"
          placeholder="Segundo Apellido"
          value={form.segundoapellido}
          onChange={handleChange}
          disabled={step === "verify"}
          className="w-full mb-1 p-3 rounded bg-[#0F172A] border border-gray-600"
        />
        {errors.segundoapellido && (
          <p className="text-red-400 text-sm mb-3">
            {errors.segundoapellido}
          </p>
        )}

        <input
          type="email"
          name="email"
          placeholder="Correo electrónico"
          value={form.email}
          onChange={handleChange}
          disabled={step === "verify"}
          className="w-full mb-1 p-3 rounded bg-[#0F172A] border border-gray-600"
        />
        {errors.email && (
          <p className="text-red-400 text-sm mb-3">{errors.email}</p>
        )}

        <input
          type="text"
          name="telefono"
          placeholder="Teléfono"
          value={form.telefono}
          onChange={handleChange}
          disabled={step === "verify"}
          className="w-full mb-1 p-3 rounded bg-[#0F172A] border border-gray-600"
        />
        {errors.telefono && (
          <p className="text-red-400 text-sm mb-3">{errors.telefono}</p>
        )}

        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={handleChange}
          disabled={step === "verify"}
          className="w-full mb-1 p-3 rounded bg-[#0F172A] border border-gray-600"
        />
        {errors.password && (
          <p className="text-red-400 text-sm mb-3">{errors.password}</p>
        )}

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirmar Contraseña"
          value={form.confirmPassword}
          onChange={handleChange}
          disabled={step === "verify"}
          className="w-full mb-1 p-3 rounded bg-[#0F172A] border border-gray-600"
        />
        {errors.confirmPassword && (
          <p className="text-red-400 text-sm mb-3">
            {errors.confirmPassword}
          </p>
        )}

        {step === "verify" && (
          <input
            type="text"
            placeholder="Código de verificación"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            className="w-full mb-4 p-3 rounded bg-[#0F172A] border border-gray-600"
          />
        )}

        <button
          type="button"
          onClick={step === "form" ? enviarCodigo : verificarCodigo}
          disabled={loading}
          className="w-full bg-[#00BB77] py-3 rounded font-semibold hover:bg-[#009966] disabled:opacity-60"
        >
          {loading
            ? step === "form"
              ? "Enviando código..."
              : "Verificando y registrando..."
            : step === "form"
            ? "Registrarse"
            : "Verificar código"}
        </button>

        {step === "verify" && (
          <button
            type="button"
            onClick={reenviarCodigo}
            className="w-full mt-3 border border-gray-500 py-2 rounded hover:bg-gray-700 transition text-sm"
          >
            Reenviar código
          </button>
        )}

        {userAccountPda && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-300 break-all">
              <span className="font-bold text-white">UserAccount PDA:</span>{" "}
              {userAccountPda}
            </p>

            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(userAccountPda)}
              className="mt-2 bg-[#7C3AED] hover:bg-[#6D28D9] px-3 py-1 rounded text-sm"
            >
              Copiar PDA
            </button>
          </div>
        )}

        {txSignature && (
          <p className="mt-3 text-center text-xs text-blue-400 break-all">
            TX: {txSignature}
          </p>
        )}

        <p className="text-sm text-center mt-4">
          ¿Ya tienes cuenta?{" "}
          <a href="/login" className="text-[#00BB77]">
            Iniciar sesión
          </a>
        </p>
      </form>
    </div>
  );
}


