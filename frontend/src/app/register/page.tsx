"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
  const [step, setStep] = useState<"form" | "verify">("form");
  const [codigo, setCodigo] = useState("");
  const [globalError, setGlobalError] = useState("");

  // 🔍 VALIDACIONES
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

  // ✏️ INPUT CHANGE
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value,
    });

    validate(name as keyof FormType, value);
  };

  // 🚀 VALIDAR TODO
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

  // 📧 ENVIAR CÓDIGO
  const enviarCodigo = async () => {
    setGlobalError("");

    if (!validateAll()) return;

    try {
      const res = await fetch("http://localhost:3001/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.ok) {
        setStep("verify");
      } else {
        setGlobalError(data.error);
      }
    } catch (error) {
      console.error(error);
      setGlobalError("Error conectando con el servidor");
    }
  };

  // 🔐 VERIFICAR CÓDIGO
const verificarCodigo = async () => {
  try {
    const res = await fetch("http://localhost:3001/api/auth/verify", {
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

    if (data.ok) {
      // 🔥 LOGIN AUTOMÁTICO
      const loginRes = await fetch("http://localhost:3001/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      const loginData = await loginRes.json();

      if (loginData.ok) {
        localStorage.setItem("user", JSON.stringify(loginData.user));
        router.push("/dashboard");
      }

    } else {
      setGlobalError("Código incorrecto");
    }

  } catch (error) {
    console.error(error);
    setGlobalError("Error verificando código");
  }
};

const reenviarCodigo = async () => {
  await fetch("http://localhost:3001/api/auth/resend", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: form.email }),
  });
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

        {/* Nombre */}
        <input
          type="text"
          name="nombres"
          placeholder="Nombre(s)"
          value={form.nombres}
          onChange={handleChange}
          className="w-full mb-1 p-3 rounded bg-[#0F172A] border border-gray-600"
        />
        {errors.nombres && <p className="text-red-400 text-sm mb-3">{errors.nombres}</p>}

        {/* Primer Apellido */}
        <input
          type="text"
          name="primerapellido"
          placeholder="Primer Apellido"
          value={form.primerapellido}
          onChange={handleChange}
          className="w-full mb-1 p-3 rounded bg-[#0F172A] border border-gray-600"
        />
        {errors.primerapellido && <p className="text-red-400 text-sm mb-3">{errors.primerapellido}</p>}

        {/* Segundo Apellido */}
        <input
          type="text"
          name="segundoapellido"
          placeholder="Segundo Apellido"
          value={form.segundoapellido}
          onChange={handleChange}
          className="w-full mb-1 p-3 rounded bg-[#0F172A] border border-gray-600"
        />
        {errors.segundoapellido && <p className="text-red-400 text-sm mb-3">{errors.segundoapellido}</p>}

        {/* Email */}
        <input
          type="email"
          name="email"
          placeholder="Correo electrónico"
          value={form.email}
          onChange={handleChange}
          className="w-full mb-1 p-3 rounded bg-[#0F172A] border border-gray-600"
        />
        {errors.email && <p className="text-red-400 text-sm mb-3">{errors.email}</p>}

        {/* Teléfono */}
        <input
          type="text"
          name="telefono"
          placeholder="Teléfono"
          value={form.telefono}
          onChange={handleChange}
          className="w-full mb-1 p-3 rounded bg-[#0F172A] border border-gray-600"
        />
        {errors.telefono && <p className="text-red-400 text-sm mb-3">{errors.telefono}</p>}

        {/* Password */}
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={handleChange}
          className="w-full mb-1 p-3 rounded bg-[#0F172A] border border-gray-600"
        />
        {errors.password && <p className="text-red-400 text-sm mb-3">{errors.password}</p>}

        {/* Confirm Password */}
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirmar Contraseña"
          value={form.confirmPassword}
          onChange={handleChange}
          className="w-full mb-1 p-3 rounded bg-[#0F172A] border border-gray-600"
        />
        {errors.confirmPassword && <p className="text-red-400 text-sm mb-3">{errors.confirmPassword}</p>}

        {/* Código */}
        {step === "verify" && (
          <input
            type="text"
            placeholder="Código de verificación"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            className="w-full mb-4 p-3 rounded bg-[#0F172A] border border-gray-600"
          />
        )}

        {/* Botón */}
        <button
          type="button"
          onClick={() => {
            if (step === "form") enviarCodigo();
            else verificarCodigo();
          }}
          className="w-full bg-[#00BB77] py-3 rounded font-semibold hover:bg-[#009966]"
        >
          {step === "form" ? "Registrarse" : "Verificar código"}
        </button>

        <button onClick={reenviarCodigo}>
          Reenviar código
        </button>

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

