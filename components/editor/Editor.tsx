"use client";

import { useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import UnderlineExt from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import { useDebouncedCallback } from "use-debounce";
import { Cloud, CloudOff, Loader2 } from "lucide-react";
import { useEditorStore } from "@/lib/store/useEditorStore";
import EditorToolbar from "./EditorToolbar";
import { cn } from "@/lib/utils/cn";

interface Props {
  chapterId: string;
  initialContent: object;
}

export default function Editor({ chapterId, initialContent }: Props) {
  const { saveChapterContent, isSaving, saveError, focusMode } = useEditorStore();
  const prevChapterIdRef = useRef<string | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      UnderlineExt,
      Highlight,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({
        placeholder: "Comienza a escribir tu historia aquí...",
      }),
      CharacterCount,
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: "focus:outline-none",
        spellcheck: "true",
      },
    },
    onUpdate: ({ editor }) => {
      debouncedSave(editor.getJSON(), countWords(editor.getText()));
    },
  });

  // Cuando cambia el capítulo activo, carga el nuevo contenido sin reinicializar el editor
  useEffect(() => {
    if (!editor) return;
    if (prevChapterIdRef.current === chapterId) return;
    prevChapterIdRef.current = chapterId;

    // Cancelar cualquier guardado pendiente del capítulo anterior
    debouncedSave.cancel();

    editor.commands.setContent(initialContent, false);
    editor.commands.focus("end");
  }, [chapterId, initialContent, editor]);

  // Debounce de 1.5s: espera a que el usuario deje de escribir antes de guardar
  const debouncedSave = useDebouncedCallback(
    async (content: object, wordCount: number) => {
      await saveChapterContent(chapterId, content, wordCount);
    },
    1500
  );

  const wordCount = editor
    ? countWords(editor.getText())
    : 0;

  return (
    <div className={cn("flex flex-col h-full", focusMode && "focus-mode")}>
      <EditorToolbar editor={editor} />

      {/* Área de escritura */}
      <div className="flex-1 overflow-y-auto">
        <div className={cn(
          "px-12 py-10",
          focusMode ? "max-w-3xl mx-auto" : "max-w-4xl mx-auto"
        )}>
          <EditorContent editor={editor} className="min-h-[calc(100vh-200px)]" />
        </div>
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-6 py-2 border-t border-ink-100 bg-white text-xs text-ink-400">
        <span>{wordCount.toLocaleString()} palabras</span>
        <SaveIndicator saving={isSaving} error={saveError} />
      </div>
    </div>
  );
}

function SaveIndicator({ saving, error }: { saving: boolean; error: string | null }) {
  if (error) {
    return (
      <span className="flex items-center gap-1 text-red-500">
        <CloudOff size={13} /> Error al guardar
      </span>
    );
  }
  if (saving) {
    return (
      <span className="flex items-center gap-1 text-indigo-500 animate-pulse">
        <Loader2 size={13} className="animate-spin" /> Guardando...
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-green-600">
      <Cloud size={13} /> Guardado
    </span>
  );
}

function countWords(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}
