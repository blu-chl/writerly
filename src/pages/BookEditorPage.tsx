import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Maximize2, Minimize2, BookOpen } from "lucide-react";
import { useEditorStore } from "@/lib/store/useEditorStore";
import { RequireAuth } from "@/components/auth/AuthGuard";
import ChapterPanel from "@/components/chapters/ChapterPanel";
import Editor from "@/components/editor/Editor";
import ExportPanel from "@/components/editor/ExportPanel";

function BookEditor() {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const { books, fetchBooks, currentBook, setCurrentBook, chapters, activeChapterId, focusMode, toggleFocusMode } = useEditorStore();
  const [showExport, setShowExport] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      let book = books.find(b => b.id === bookId);
      if (!book) { await fetchBooks(); book = useEditorStore.getState().books.find(b => b.id === bookId); }
      if (book) await setCurrentBook(book);
      else navigate("/");
      setLoading(false);
    };
    init();
  }, [bookId]);

  const activeChapter = chapters.find(c => c.id === activeChapterId);

  if (loading) return (
    <div className="min-h-screen bg-ink-50 flex items-center justify-center">
      <BookOpen className="w-10 h-10 text-indigo-400 animate-pulse" strokeWidth={1.2} />
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      {!focusMode && (
        <header className="flex items-center justify-between px-5 py-3 border-b border-ink-100 bg-white shrink-0 z-20">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/")} className="flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-800 transition"><ArrowLeft size={16} /> Libros</button>
            <span className="text-ink-300">/</span>
            <span className="text-sm font-semibold text-ink-800 truncate max-w-xs">{currentBook?.title ?? "..."}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowExport(true)} className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-ink-200 text-ink-600 hover:bg-ink-50 transition"><Download size={15} /> Exportar</button>
            <button onClick={toggleFocusMode} className="p-2 rounded-lg text-ink-500 hover:bg-ink-100 transition" title="Modo enfoque"><Maximize2 size={16} /></button>
          </div>
        </header>
      )}
      {focusMode && (
        <button onClick={toggleFocusMode} className="fixed top-4 right-4 z-50 p-2 bg-white/80 backdrop-blur rounded-lg shadow-sm text-ink-500 hover:text-ink-800 transition"><Minimize2 size={16} /></button>
      )}
      <div className="flex flex-1 overflow-hidden">
        {!focusMode && bookId && <ChapterPanel bookId={bookId} />}
        <main className="flex-1 overflow-hidden">
          {activeChapter ? (
            <Editor key={activeChapter.id} chapterId={activeChapter.id} initialContent={activeChapter.content as object ?? {}} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center gap-4 p-8">
              <BookOpen className="w-14 h-14 text-ink-200" strokeWidth={1} />
              <div>
                <p className="text-ink-600 font-medium">Este libro no tiene capítulos</p>
                <p className="text-sm text-ink-400 mt-1">Crea el primero para empezar a escribir</p>
              </div>
              {bookId && <button onClick={() => useEditorStore.getState().createChapter(bookId)} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition text-sm">Crear primer capítulo</button>}
            </div>
          )}
        </main>
      </div>
      {showExport && <ExportPanel onClose={() => setShowExport(false)} />}
    </div>
  );
}

export default function BookEditorPage() {
  return <RequireAuth><BookEditor /></RequireAuth>;
}
