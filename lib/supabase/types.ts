// Tipos derivados del schema de Supabase
// En producción se generan con: npx supabase gen types typescript --local

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; full_name: string | null; avatar_url: string | null; created_at: string };
        Insert: { id: string; full_name?: string | null; avatar_url?: string | null };
        Update: { full_name?: string | null; avatar_url?: string | null };
      };
      books: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          cover_color: string;
          word_goal: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string;
          description?: string | null;
          cover_color?: string;
          word_goal?: number;
        };
        Update: {
          title?: string;
          description?: string | null;
          cover_color?: string;
          word_goal?: number;
        };
      };
      chapters: {
        Row: {
          id: string;
          book_id: string;
          title: string;
          content: Json;
          position: number;
          word_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          book_id: string;
          title?: string;
          content?: Json;
          position: number;
          word_count?: number;
        };
        Update: {
          title?: string;
          content?: Json;
          position?: number;
          word_count?: number;
        };
      };
    };
    Views: {
      book_stats: {
        Row: {
          id: string;
          title: string;
          user_id: string;
          chapter_count: number;
          total_words: number;
        };
      };
    };
  };
}

// Aliases cómodos
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Book = Database["public"]["Tables"]["books"]["Row"];
export type Chapter = Database["public"]["Tables"]["chapters"]["Row"];
export type BookStats = Database["public"]["Views"]["book_stats"]["Row"];
