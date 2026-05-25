"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Loader2 } from "lucide-react";
import { useEditorStore } from "@/lib/store/useEditorStore";

const COLORS = [
  "#4f46e5", "#7c3aed", "#db2777", "#dc2626",
  "#d97706", "#059669", "#0891b2", "#0f172a",
];

interface Props {
  onClose: () => void;
}

export default function NewBookModal({ onClose }: Props) {
  const router = useRouter();
  const { createBook } = useEditorStore();
  const [title, setTitle] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    const book = await createBook(title.trim(), color);
    if (book) {
      router.push(`/book/${book.id}`);
    }
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-ink-900">Nuevo libro</h2>
          <button onClick={onClose} className="text-ink-400 hover:text-ink-700 transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleCreate} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">Título</label>
            <input
              autoFocus
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="El nombre de tu obra"
              className="w-full px-4 py-2.5 rounded-lg border border-ink-200 text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-700 mb-2">Color de portada</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-8 h-8 rounded-full transition-transform hover:scale-110"
                  style={{
                    backgroundColor: c,
                    outline: color === c ? `3px solid ${c}` : "none",
                    outlineOffset: "2px",
                  }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-ink-200 text-ink-700 hover:bg-ink-50 transition font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!title.trim() || loading}
              className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-2.5 rounded-lg transition font-medium"
            >
              {loading && <Loader2 size={15} className="animate-spin" />}
              Crear libro
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
