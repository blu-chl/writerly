import { useEffect, useState } from "react";
import { Plus, BookOpen, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useEditorStore } from "@/lib/store/useEditorStore";
import BookCard from "@/components/books/BookCard";
import NewBookModal from "@/components/books/NewBookModal";
import { RequireAuth } from "@/components/auth/AuthGuard";

function Dashboard() {
  const { books, fetchBooks } = useEditorStore();
  const [showNew, setShowNew] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    fetchBooks();
    createClient().auth.getUser().then(({ data }) => {
      const name = data.user?.user_metadata?.full_name;
      if (name) setUserName(name.split(" ")[0]);
    });
  }, [fetchBooks]);

  const handleLogout = async () => {
    await createClient().auth.signOut();
    window.location.hash = "#/login";
  };

  return (
    <div className="min-h-screen bg-ink-50">
      <header className="bg-white border-b border-ink-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-600" strokeWidth={1.5} />
            <span className="text-lg font-bold text-ink-900 font-serif">Writerly</span>
          </div>
          <div className="flex items-center gap-4">
            {userName && <span className="text-sm text-ink-500">Hola, {userName}</span>}
            <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-800 transition"><LogOut size={15} /> Salir</button>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-ink-900">Mis libros</h1>
            <p className="text-ink-500 mt-1 text-sm">{books.length === 0 ? "Aún no tienes libros." : `${books.length} ${books.length === 1 ? "libro" : "libros"}`}</p>
          </div>
          <button onClick={() => setShowNew(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition shadow-sm"><Plus size={18} /> Nuevo libro</button>
        </div>
        {books.length === 0 ? (
          <div className="border-2 border-dashed border-ink-200 rounded-2xl p-16 text-center cursor-pointer hover:border-indigo-400 transition-colors group" onClick={() => setShowNew(true)}>
            <BookOpen className="w-12 h-12 text-ink-300 group-hover:text-indigo-400 mx-auto mb-4 transition-colors" strokeWidth={1} />
            <p className="text-ink-500 font-medium">Crea tu primer libro</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {books.map(book => <BookCard key={book.id} book={book} />)}
            <button onClick={() => setShowNew(true)} className="border-2 border-dashed border-ink-200 rounded-2xl min-h-[200px] flex flex-col items-center justify-center gap-2 text-ink-400 hover:border-indigo-400 hover:text-indigo-500 transition-colors">
              <Plus size={24} /><span className="text-sm font-medium">Nuevo libro</span>
            </button>
          </div>
        )}
      </main>
      {showNew && <NewBookModal onClose={() => setShowNew(false)} />}
    </div>
  );
}

export default function DashboardPage() {
  return <RequireAuth><Dashboard /></RequireAuth>;
}
