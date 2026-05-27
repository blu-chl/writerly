export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type Profile = { id: string; full_name: string | null; avatar_url: string | null; created_at: string };
export type Book = { id: string; user_id: string; title: string; description: string | null; cover_color: string; word_goal: number; created_at: string; updated_at: string };
export type Chapter = { id: string; book_id: string; title: string; content: Json; position: number; word_count: number; created_at: string; updated_at: string };
