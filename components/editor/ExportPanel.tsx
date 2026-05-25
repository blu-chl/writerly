"use client";

import { useState } from "react";
import { FileDown, FileText, X, Loader2, CheckSquare, Square } from "lucide-react";
import { useEditorStore } from "@/lib/store/useEditorStore";
import { exportToPDF, exportToDocx } from "@/lib/utils/export";

interface Props {
  onClose: () => void;
}

export default function ExportPanel({ onClose }: Props) {
  const { currentBook, chapters } = useEditorStore();
  const [selected, setSelected] = useState<Set<string>>(new Set(chapters.map((c) => c.id)));
  const [loading, setLoading] = useState<"pdf" | "docx" | null>(null);

  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const toggleAll = () => {
    if (selected.size === chapters.length) setSelected(new Set());
    else setSelected(new Set(chapters.map((c) => c.id)));
  };

  const handleExport = async (format: "pdf" | "docx") => {
    if (!currentBook || selected.size === 0) return;
    setLoading(format);
    const ids = chapters.filter((c) => selected.has(c.id)).map((c) => c.id);
    if (format === "pdf") {
      await exportToPDF(currentBook.title, chapters, ids);
    } else {
      await exportToDocx(currentBook.title, chapters, ids);
    }
    setLoading(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-ink-900">Exportar libro</h2>
          <button onClick={onClose} className="text-ink-400 hover:text-ink-700 transition">
            <X size={20} />
          </button>
        </div>

        {/* Selección de capítulos */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-ink-700">Selecciona capítulos</p>
            <button onClick={toggleAll} className="text-xs text-indigo-600 hover:underline">
              {selected.size === chapters.length ? "Deseleccionar todos" : "Seleccionar todos"}
            </button>
          </div>
          <div className="space-y-1.5 max-h-52 overflow-y-auto">
            {chapters.map((chapter) => (
              <label
                key={chapter.id}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-ink-50 cursor-pointer transition"
              >
                <span
                  className="text-indigo-600 shrink-0"
                  onClick={() => toggle(chapter.id)}
                >
                  {selected.has(chapter.id) ? <CheckSquare size={16} /> : <Square size={16} />}
                </span>
                <span className="text-sm text-ink-700 truncate">{chapter.title}</span>
                <span className="text-xs text-ink-400 ml-auto shrink-0">
                  {(chapter.word_count ?? 0).toLocaleString()} pal.
                </span>
              </label>
            ))}
          </div>
        </div>

        <p className="text-xs text-ink-400 mb-4 text-center">
          {selected.size} de {chapters.length} capítulos seleccionados
        </p>

        {/* Botones de exportación */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleExport("pdf")}
            disabled={selected.size === 0 || !!loading}
            className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-2.5 rounded-xl font-medium transition text-sm"
          >
            {loading === "pdf"
              ? <Loader2 size={15} className="animate-spin" />
              : <FileDown size={15} />}
            PDF
          </button>
          <button
            onClick={() => handleExport("docx")}
            disabled={selected.size === 0 || !!loading}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2.5 rounded-xl font-medium transition text-sm"
          >
            {loading === "docx"
              ? <Loader2 size={15} className="animate-spin" />
              : <FileText size={15} />}
            Word
          </button>
        </div>
      </div>
    </div>
  );
}
