import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import type { Book, Chapter, Json } from "@/lib/supabase/types";

interface EditorStore {
  books: Book[];
  currentBook: Book | null;
  chapters: Chapter[];
  activeChapterId: string | null;
  isSaving: boolean;
  saveError: string | null;
  focusMode: boolean;

  fetchBooks: () => Promise<void>;
  createBook: (title: string, coverColor?: string) => Promise<Book | null>;
  updateBook: (id: string, updates: Partial<Pick<Book, "title" | "description" | "cover_color" | "word_goal">>) => Promise<void>;
  deleteBook: (id: string) => Promise<void>;
  setCurrentBook: (book: Book) => Promise<void>;

  fetchChapters: (bookId: string) => Promise<void>;
  createChapter: (bookId: string) => Promise<Chapter | null>;
  updateChapterTitle: (id: string, title: string) => Promise<void>;
  deleteChapter: (id: string) => Promise<void>;
  setActiveChapter: (id: string) => void;
  reorderChapters: (chapters: Chapter[]) => Promise<void>;

  saveChapterContent: (id: string, content: object, wordCount: number) => Promise<void>;
  toggleFocusMode: () => void;
}

export const useEditorStore = create<EditorStore>((set, get) => ({
  books: [], currentBook: null, chapters: [],
  activeChapterId: null, isSaving: false, saveError: null, focusMode: false,

  fetchBooks: async () => {
    const { data } = await createClient().from("books").select("*").order("updated_at", { ascending: false });
    if (data) set({ books: data as Book[] });
  },

  createBook: async (title, coverColor = "#4f46e5") => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data, error } = await supabase.from("books")
      .insert({ title, cover_color: coverColor, user_id: user.id }).select().single();
    if (error || !data) return null;
    set((s) => ({ books: [data as Book, ...s.books] }));
    return data as Book;
  },

  updateBook: async (id, updates) => {
    const { data } = await createClient().from("books").update(updates).eq("id", id).select().single();
    if (!data) return;
    set((s) => ({
      books: s.books.map((b) => (b.id === id ? data as Book : b)),
      currentBook: s.currentBook?.id === id ? data as Book : s.currentBook,
    }));
  },

  deleteBook: async (id) => {
    await createClient().from("books").delete().eq("id", id);
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

  fetchChapters: async (bookId) => {
    const { data } = await createClient().from("chapters").select("*")
      .eq("book_id", bookId).order("position", { ascending: true });
    if (data) set({ chapters: data as Chapter[], activeChapterId: (data[0] as Chapter)?.id ?? null });
  },

  createChapter: async (bookId) => {
    const position = get().chapters.length;
    const { data, error } = await createClient().from("chapters")
      .insert({ book_id: bookId, title: `Capítulo ${position + 1}`, position }).select().single();
    if (error || !data) return null;
    set((s) => ({ chapters: [...s.chapters, data as Chapter], activeChapterId: (data as Chapter).id }));
    return data as Chapter;
  },

  updateChapterTitle: async (id, title) => {
    await createClient().from("chapters").update({ title }).eq("id", id);
    set((s) => ({ chapters: s.chapters.map((c) => (c.id === id ? { ...c, title } : c)) }));
  },

  deleteChapter: async (id) => {
    await createClient().from("chapters").delete().eq("id", id);
    set((s) => {
      const remaining = s.chapters.filter((c) => c.id !== id);
      return { chapters: remaining, activeChapterId: s.activeChapterId === id ? (remaining[0]?.id ?? null) : s.activeChapterId };
    });
  },

  setActiveChapter: (id) => set({ activeChapterId: id }),

  reorderChapters: async (reordered) => {
    set({ chapters: reordered });
    const supabase = createClient();
    await Promise.all(reordered.map((c, i) => supabase.from("chapters").update({ position: i }).eq("id", c.id)));
  },

  saveChapterContent: async (id, content, wordCount) => {
    set({ isSaving: true, saveError: null });
    const { error } = await createClient().from("chapters").update({ content, word_count: wordCount }).eq("id", id);
    set({
      isSaving: false,
      saveError: error ? "Error al guardar" : null,
      chapters: get().chapters.map((c) => c.id === id ? { ...c, content: content as Json, word_count: wordCount } : c),
    });
  },

  toggleFocusMode: () => set((s) => ({ focusMode: !s.focusMode })),
}));
