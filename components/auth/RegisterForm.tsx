"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle, Loader2 } from "lucide-react";

export default function RegisterForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="text-center space-y-4 py-4">
        <CheckCircle className="w-14 h-14 text-green-500 mx-auto" strokeWidth={1.5} />
        <h2 className="text-xl font-bold text-ink-900">¡Revisa tu correo!</h2>
        <p className="text-ink-500 text-sm leading-relaxed">
          Te enviamos un enlace de confirmación a <strong>{email}</strong>.
          Haz clic en él para activar tu cuenta.
        </p>
        <Link href="/login" className="block text-indigo-600 font-medium hover:underline text-sm">
          Volver al inicio de sesión
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-ink-900 mb-1">Crea tu cuenta</h1>
        <p className="text-sm text-ink-500">Empieza a escribir tu historia hoy</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1.5">Nombre completo</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Tu nombre"
            required
            className="w-full px-4 py-2.5 rounded-lg border border-ink-200 text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1.5">Correo electrónico</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@correo.com"
            required
            className="w-full px-4 py-2.5 rounded-lg border border-ink-200 text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1.5">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 8 caracteres"
            required
            className="w-full px-4 py-2.5 rounded-lg border border-ink-200 text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg transition"
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        {loading ? "Creando cuenta..." : "Crear cuenta gratis"}
      </button>

      <p className="text-center text-sm text-ink-500">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="text-indigo-600 font-medium hover:underline">
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}
