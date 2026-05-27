import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MoreVertical, Trash2, Edit3, BookOpen } from "lucide-react";
import { useEditorStore } from "@/lib/store/useEditorStore";
import type { Book } from "@/lib/supabase/types";

export default function BookCard({ book }: { book: Book }) {
  const navigate = useNavigate();
  const { deleteBook, updateBook } = useEditorStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(book.title);

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && title.trim() !== book.title) await updateBook(book.id, { title: title.trim() });
    setEditing(false);
  };

  const handleDelete = async () => {
    if (confirm(`¿Eliminar "${book.title}"?`)) await deleteBook(book.id);
    setMenuOpen(false);
  };

  return (
    <div className="group relative bg-white border border-ink-100 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
      <div className="h-36 flex items-center justify-center cursor-pointer" style={{ backgroundColor: book.cover_color }} onClick={() => navigate(`/book/${book.id}`)}>
        <BookOpen className="w-12 h-12 text-white/70" strokeWidth={1.2} />
      </div>
      <div className="p-4">
        {editing ? (
          <form onSubmit={handleRename}>
            <input autoFocus value={title} onChange={e => setTitle(e.target.value)} onBlur={handleRename} className="w-full text-sm font-semibold text-ink-900 border-b border-indigo-400 focus:outline-none bg-transparent" />
          </form>
        ) : (
          <h3 className="font-semibold text-ink-900 text-sm leading-tight truncate cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => navigate(`/book/${book.id}`)}>{book.title}</h3>
        )}
      </div>
      <div className="absolute top-3 right-3">
        <button onClick={e => { e.stopPropagation(); setMenuOpen(!menuOpen); }} className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-white/90 hover:bg-white rounded-lg text-ink-600 shadow-sm">
          <MoreVertical size={15} />
        </button>
        {menuOpen && (
          <div className="absolute right-0 mt-1 w-40 bg-white rounded-xl shadow-lg border border-ink-100 py-1 z-10">
            <button onClick={() => { setEditing(true); setMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-ink-700 hover:bg-ink-50 transition"><Edit3 size={14} /> Renombrar</button>
            <button onClick={handleDelete} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition"><Trash2 size={14} /> Eliminar</button>
          </div>
        )}
      </div>
    </div>
  );
}
