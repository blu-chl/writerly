"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, BookOpen, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useEditorStore } from "@/lib/store/useEditorStore";
import BookCard from "@/components/books/BookCard";
import NewBookModal from "@/components/books/NewBookModal";

export default function DashboardPage() {
  const router = useRouter();
  const { books, fetchBooks } = useEditorStore();
  const [showNewBook, setShowNewBook] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    fetchBooks();
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      const name = data.user?.user_metadata?.full_name;
      if (name) setUserName(name.split(" ")[0]);
    });
  }, [fetchBooks]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-ink-50">
      {/* Header */}
      <header className="bg-white border-b border-ink-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-600" strokeWidth={1.5} />
            <span className="text-lg font-bold text-ink-900 font-serif">Writerly</span>
          </div>
          <div className="flex items-center gap-4">
            {userName && (
              <span className="text-sm text-ink-500">Hola, {userName}</span>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-800 transition"
            >
              <LogOut size={15} />
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-ink-900">Mis libros</h1>
            <p className="text-ink-500 mt-1 text-sm">
              {books.length === 0
                ? "Aún no tienes libros. ¡Empieza a escribir!"
                : `${books.length} ${books.length === 1 ? "libro" : "libros"}`}
            </p>
          </div>
          <button
            onClick={() => setShowNewBook(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition shadow-sm"
          >
            <Plus size={18} />
            Nuevo libro
          </button>
        </div>

        {books.length === 0 ? (
          <div
            className="border-2 border-dashed border-ink-200 rounded-2xl p-16 text-center cursor-pointer hover:border-indigo-400 transition-colors group"
            onClick={() => setShowNewBook(true)}
          >
            <BookOpen className="w-12 h-12 text-ink-300 group-hover:text-indigo-400 mx-auto mb-4 transition-colors" strokeWidth={1} />
            <p className="text-ink-500 font-medium">Crea tu primer libro</p>
            <p className="text-ink-400 text-sm mt-1">Haz clic aquí para empezar</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
            <button
              onClick={() => setShowNewBook(true)}
              className="border-2 border-dashed border-ink-200 rounded-2xl h-full min-h-[200px] flex flex-col items-center justify-center gap-2 text-ink-400 hover:border-indigo-400 hover:text-indigo-500 transition-colors"
            >
              <Plus size={24} />
              <span className="text-sm font-medium">Nuevo libro</span>
            </button>
          </div>
        )}
      </main>

      {showNewBook && <NewBookModal onClose={() => setShowNewBook(false)} />}
    </div>
  );
}
