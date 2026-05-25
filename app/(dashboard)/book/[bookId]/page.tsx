"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Download, Maximize2, Minimize2, BookOpen,
} from "lucide-react";
import { useEditorStore } from "@/lib/store/useEditorStore";
import ChapterPanel from "@/components/chapters/ChapterPanel";
import Editor from "@/components/editor/Editor";
import ExportPanel from "@/components/editor/ExportPanel";

export default function BookEditorPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = params.bookId as string;

  const {
    books,
    fetchBooks,
    currentBook,
    setCurrentBook,
    chapters,
    activeChapterId,
    focusMode,
    toggleFocusMode,
  } = useEditorStore();

  const [showExport, setShowExport] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      // Si books no está cargado, los traemos primero
      let book = books.find((b) => b.id === bookId);
      if (!book) {
        await fetchBooks();
        book = useEditorStore.getState().books.find((b) => b.id === bookId);
      }
      if (book) await setCurrentBook(book);
      setLoading(false);
    };
    init();
  }, [bookId]);

  const activeChapter = chapters.find((c) => c.id === activeChapterId);

  if (loading) {
    return (
      <div className="min-h-screen bg-ink-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-ink-400">
          <BookOpen className="w-10 h-10 animate-pulse" strokeWidth={1.2} />
          <p className="text-sm">Cargando libro...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      {/* Topbar — se oculta en modo enfoque */}
      {!focusMode && (
        <header className="flex items-center justify-between px-5 py-3 border-b border-ink-100 bg-white shrink-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-800 transition"
            >
              <ArrowLeft size={16} />
              Libros
            </button>
            <span className="text-ink-300">/</span>
            <span className="text-sm font-semibold text-ink-800 truncate max-w-xs">
              {currentBook?.title ?? "..."}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowExport(true)}
              className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-ink-200 text-ink-600 hover:bg-ink-50 transition"
            >
              <Download size={15} />
              Exportar
            </button>
            <button
              onClick={toggleFocusMode}
              title="Modo enfoque (sin distracciones)"
              className="p-2 rounded-lg text-ink-500 hover:bg-ink-100 transition"
            >
              <Maximize2 size={16} />
            </button>
          </div>
        </header>
      )}

      {/* Botón para salir del modo enfoque */}
      {focusMode && (
        <button
          onClick={toggleFocusMode}
          className="fixed top-4 right-4 z-50 p-2 bg-white/80 backdrop-blur rounded-lg shadow-sm text-ink-500 hover:text-ink-800 transition"
          title="Salir del modo enfoque"
        >
          <Minimize2 size={16} />
        </button>
      )}

      {/* Layout principal: sidebar + editor */}
      <div className="flex flex-1 overflow-hidden">
        {!focusMode && currentBook && (
          <ChapterPanel bookId={currentBook.id} />
        )}

        {/* Área del editor */}
        <main className="flex-1 overflow-hidden">
          {activeChapter ? (
            <Editor
              key={activeChapter.id}
              chapterId={activeChapter.id}
              initialContent={activeChapter.content as object ?? {}}
            />
          ) : (
            <EmptyState bookId={bookId} />
          )}
        </main>
      </div>

      {showExport && <ExportPanel onClose={() => setShowExport(false)} />}
    </div>
  );
}

function EmptyState({ bookId }: { bookId: string }) {
  const { createChapter } = useEditorStore();
  return (
    <div className="h-full flex flex-col items-center justify-center text-center gap-4 p-8">
      <BookOpen className="w-14 h-14 text-ink-200" strokeWidth={1} />
      <div>
        <p className="text-ink-600 font-medium">Este libro no tiene capítulos</p>
        <p className="text-sm text-ink-400 mt-1">Crea el primer capítulo para empezar a escribir</p>
      </div>
      <button
        onClick={() => createChapter(bookId)}
        className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition text-sm"
      >
        Crear primer capítulo
      </button>
    </div>
  );
}
