import { useState } from "react";
import { Link } from "react-router-dom";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle, Loader2 } from "lucide-react";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError("");
    const { error: err } = await createClient().auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/tynt/#/reset-password` });
    if (err) { setError("No se pudo enviar el correo. Intenta de nuevo."); setLoading(false); return; }
    setSent(true); setLoading(false);
  };

  if (sent) return (
    <div className="text-center space-y-4 py-4">
      <CheckCircle className="w-14 h-14 text-green-500 mx-auto" strokeWidth={1.5} />
      <h2 className="text-xl font-bold text-ink-900">Correo enviado</h2>
      <p className="text-ink-500 text-sm">Revisa tu bandeja de entrada.</p>
      <Link to="/login" className="block text-indigo-600 font-medium hover:underline text-sm">← Volver al inicio</Link>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-ink-900 mb-1">Recupera tu contraseña</h1>
        <p className="text-sm text-ink-500">Te enviaremos un enlace para restablecerla</p>
      </div>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>}
      <div>
        <label className="block text-sm font-medium text-ink-700 mb-1.5">Correo electrónico</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@correo.com" required className="w-full px-4 py-2.5 rounded-lg border border-ink-200 text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" />
      </div>
      <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg transition">
        {loading && <Loader2 size={16} className="animate-spin" />}{loading ? "Enviando..." : "Enviar enlace"}
      </button>
      <p className="text-center"><Link to="/login" className="text-sm text-indigo-600 hover:underline">← Volver al inicio de sesión</Link></p>
    </form>
  );
}
