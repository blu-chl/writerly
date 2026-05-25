"use client";

import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import type { Book, Chapter } from "@/lib/supabase/types";

interface EditorStore {
  // ── Estado ──────────────────────────────────────────────────
  books: Book[];
  currentBook: Book | null;
  chapters: Chapter[];
  activeChapterId: string | null;
  isSaving: boolean;
  saveError: string | null;
  focusMode: boolean;

  // ── Libros ───────────────────────────────────────────────────
  fetchBooks: () => Promise<void>;
  createBook: (title: string, coverColor?: string) => Promise<Book | null>;
  updateBook: (id: string, updates: Partial<Pick<Book, "title" | "description" | "cover_color" | "word_goal">>) => Promise<void>;
  deleteBook: (id: string) => Promise<void>;
  setCurrentBook: (book: Book) => Promise<void>;

  // ── Capítulos ────────────────────────────────────────────────
  fetchChapters: (bookId: string) => Promise<void>;
  createChapter: (bookId: string) => Promise<Chapter | null>;
  updateChapterTitle: (id: string, title: string) => Promise<void>;
  deleteChapter: (id: string) => Promise<void>;
  setActiveChapter: (id: string) => void;
  reorderChapters: (chapters: Chapter[]) => Promise<void>;

  // ── Contenido del editor ─────────────────────────────────────
  saveChapterContent: (id: string, content: object, wordCount: number) => Promise<void>;

  // ── UI ───────────────────────────────────────────────────────
  toggleFocusMode: () => void;
}

export const useEditorStore = create<EditorStore>((set, get) => {
  const supabase = createClient();

  return {
    books: [],
    currentBook: null,
    chapters: [],
    activeChapterId: null,
    isSaving: false,
    saveError: null,
    focusMode: false,

    // ── Libros ───────────────────────────────────────────────────

    fetchBooks: async () => {
      const { data } = await supabase
        .from("books")
        .select("*")
        .order("updated_at", { ascending: false });
      if (data) set({ books: data });
    },

    createBook: async (title, coverColor = "#4f46e5") => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("books")
        .insert({ title, cover_color: coverColor, user_id: user.id })
        .select()
        .single();

      if (error || !data) return null;
      set((s) => ({ books: [data, ...s.books] }));
      return data;
    },

    updateBook: async (id, updates) => {
      const { data } = await supabase
        .from("books").update(updates).eq("id", id).select().single();
      if (!data) return;
      set((s) => ({
        books: s.books.map((b) => (b.id === id ? data : b)),
        currentBook: s.currentBook?.id === id ? data : s.currentBook,
      }));
    },

    deleteBook: async (id) => {
      await supabase.from("books").delete().eq("id", id);
      set((s) => ({
        books: s.books.filter((b) => b.id !== id),
        currentBook: s.currentBook?.id === id ? null : s.currentBook,
        chapters: s.currentBook?.id === id ? [] : s.chapters,
        activeChapterId: s.currentBook?.id === id ? null : s.activeChapterId,
      }));
    },

    setCurrentBook: async (book) => {
      set({ currentBook: book, chapters: [], activeChapterId: null });
      await get().fetchChapters(book.id);
    },

    // ── Capítulos ────────────────────────────────────────────────

    fetchChapters: async (bookId) => {
      const { data } = await supabase
        .from("chapters")
        .select("*")
        .eq("book_id", bookId)
        .order("position", { ascending: true });
      if (data) {
        set({ chapters: data, activeChapterId: data[0]?.id ?? null });
      }
    },

    createChapter: async (bookId) => {
      const { chapters } = get();
      const position = chapters.length;

      const { data, error } = await supabase
        .from("chapters")
        .insert({ book_id: bookId, title: `Capítulo ${position + 1}`, position })
        .select()
        .single();

      if (error || !data) return null;
      set((s) => ({ chapters: [...s.chapters, data], activeChapterId: data.id }));
      return data;
    },

    updateChapterTitle: async (id, title) => {
      await supabase.from("chapters").update({ title }).eq("id", id);
      set((s) => ({
        chapters: s.chapters.map((c) => (c.id === id ? { ...c, title } : c)),
      }));
    },

    deleteChapter: async (id) => {
      await supabase.from("chapters").delete().eq("id", id);
      set((s) => {
        const remaining = s.chapters.filter((c) => c.id !== id);
        const nextActive = s.activeChapterId === id
          ? (remaining[0]?.id ?? null)
          : s.activeChapterId;
        return { chapters: remaining, activeChapterId: nextActive };
      });
    },

    setActiveChapter: (id) => set({ activeChapterId: id }),

    // Actualiza posiciones localmente (optimistic) y persiste en batch
    reorderChapters: async (reordered) => {
      set({ chapters: reordered });

      // Batch update de posiciones — una sola llamada a RPC sería ideal,
      // aquí usamos Promise.all para simplicidad inicial
      await Promise.all(
        reordered.map((c, index) =>
          supabase.from("chapters").update({ position: index }).eq("id", c.id)
        )
      );
    },

    // Llamado desde el editor tras el debounce (1.5s)
    saveChapterContent: async (id, content, wordCount) => {
      set({ isSaving: true, saveError: null });
      const { error } = await supabase
        .from("chapters")
        .update({ content, word_count: wordCount })
        .eq("id", id);

      set({
        isSaving: false,
        saveError: error ? "Error al guardar" : null,
        chapters: get().chapters.map((c) =>
          c.id === id ? { ...c, content: content as import("@/lib/supabase/types").Json, word_count: wordCount } : c
        ),
      });
    },

    toggleFocusMode: () => set((s) => ({ focusMode: !s.focusMode })),
  };
});
