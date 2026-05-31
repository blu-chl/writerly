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

export default function Editor({ chapterId, initialContent }: { chapterId: string; initialContent: object }) {
  const { saveChapterContent, isSaving, saveError, focusMode } = useEditorStore();
  const prevId = useRef<string | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
      heading: { levels: [1, 2, 3] },
      bulletList: { keepMarks: true, keepAttributes: false },
      orderedList: { keepMarks: true, keepAttributes: false },
      blockquote: {},
      horizontalRule: {},
      listItem: {},
    }),
      UnderlineExt, Highlight,
      TextAlign.configure({ types: ["heading", "paragraph", "blockquote"] }),
      Placeholder.configure({ placeholder: "Comienza a escribir tu historia aquí..." }),
      CharacterCount,
    ],
    content: initialContent,
    editorProps: { attributes: { class: "focus:outline-none", spellcheck: "true" } },
    onUpdate: ({ editor }) => debouncedSave(editor.getJSON(), editor.getText().trim().split(/\s+/).filter(Boolean).length),
  });

  useEffect(() => {
    if (!editor || prevId.current === chapterId) return;
    prevId.current = chapterId;
    debouncedSave.cancel();
    editor.commands.setContent(initialContent, false);
    editor.commands.focus("end");
  }, [chapterId, initialContent, editor]);

  const debouncedSave = useDebouncedCallback(async (content: object, wordCount: number) => {
    await saveChapterContent(chapterId, content, wordCount);
  }, 1500);

  const wordCount = editor ? editor.getText().trim().split(/\s+/).filter(Boolean).length : 0;

  return (
    <div className={cn("flex flex-col h-full", focusMode && "focus-mode")}>
      <EditorToolbar editor={editor} />
      <div className="flex-1 overflow-y-auto">
        <div className={cn("px-12 py-10", focusMode ? "max-w-3xl mx-auto" : "max-w-4xl mx-auto")}>
          <EditorContent editor={editor} className="min-h-[calc(100vh-200px)]" />
        </div>
      </div>
      <div className="flex items-center justify-between px-6 py-2 border-t border-ink-100 bg-white text-xs text-ink-400">
        <span>{wordCount.toLocaleString()} palabras</span>
        {saveError ? <span className="flex items-center gap-1 text-red-500"><CloudOff size={13} /> Error al guardar</span>
          : isSaving ? <span className="flex items-center gap-1 text-indigo-500 animate-pulse"><Loader2 size={13} className="animate-spin" /> Guardando...</span>
          : <span className="flex items-center gap-1 text-green-600"><Cloud size={13} /> Guardado</span>}
      </div>
    </div>
  );
}
