import type { Editor } from "@tiptap/react";
import { Bold, Italic, Underline, Strikethrough, Highlighter, List, ListOrdered, Quote, Minus, AlignLeft, AlignCenter, AlignRight, Heading1, Heading2, Redo, Undo } from "lucide-react";
import { cn } from "@/lib/utils/cn";

function Btn({ onClick, active, disabled, title, children }: { onClick: () => void; active?: boolean; disabled?: boolean; title: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onMouseDown={(e) => {
        e.preventDefault(); // Evita que el editor pierda el foco
        e.stopPropagation();
        onClick();          // Solo se llama una vez desde aquí
      }}
      onClick={(e) => e.preventDefault()} // Bloquea el click para que no duplique
      className={cn("p-1.5 rounded-md transition-colors text-ink-600 hover:bg-ink-100", active && "bg-indigo-100 text-indigo-700", disabled && "opacity-30 cursor-not-allowed")}
    >
      {children}
    </button>
  );
}
const Div = () => <span className="w-px h-5 bg-ink-200 mx-0.5" />;

export default function EditorToolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;

  const cmd = (fn: () => boolean) => {
    editor.commands.focus();
    fn();
  };

  return (
    <div className="flex items-center flex-wrap gap-0.5 px-4 py-2 border-b border-ink-100 bg-white sticky top-0 z-10">
      <Btn onClick={() => cmd(() => editor.chain().undo().run())} disabled={!editor.can().undo()} title="Deshacer"><Undo size={15} /></Btn>
      <Btn onClick={() => cmd(() => editor.chain().redo().run())} disabled={!editor.can().redo()} title="Rehacer"><Redo size={15} /></Btn>
      <Div />
      <Btn onClick={() => cmd(() => editor.chain().toggleHeading({ level: 1 }).run())} active={editor.isActive("heading", { level: 1 })} title="Título 1"><Heading1 size={15} /></Btn>
      <Btn onClick={() => cmd(() => editor.chain().toggleHeading({ level: 2 }).run())} active={editor.isActive("heading", { level: 2 })} title="Título 2"><Heading2 size={15} /></Btn>
      <Div />
      <Btn onClick={() => cmd(() => editor.chain().toggleBold().run())} active={editor.isActive("bold")} title="Negrita"><Bold size={15} /></Btn>
      <Btn onClick={() => cmd(() => editor.chain().toggleItalic().run())} active={editor.isActive("italic")} title="Cursiva"><Italic size={15} /></Btn>
      <Btn onClick={() => cmd(() => editor.chain().toggleUnderline().run())} active={editor.isActive("underline")} title="Subrayado"><Underline size={15} /></Btn>
      <Btn onClick={() => cmd(() => editor.chain().toggleStrike().run())} active={editor.isActive("strike")} title="Tachado"><Strikethrough size={15} /></Btn>
      <Btn onClick={() => cmd(() => editor.chain().toggleHighlight().run())} active={editor.isActive("highlight")} title="Resaltar"><Highlighter size={15} /></Btn>
      <Div />
      <Btn onClick={() => cmd(() => editor.chain().toggleBulletList().run())} active={editor.isActive("bulletList")} title="Lista sin enumerar"><List size={15} /></Btn>
      <Btn onClick={() => cmd(() => editor.chain().toggleOrderedList().run())} active={editor.isActive("orderedList")} title="Lista numerada"><ListOrdered size={15} /></Btn>
      <Btn onClick={() => cmd(() => editor.chain().toggleBlockquote().run())} active={editor.isActive("blockquote")} title="Cita"><Quote size={15} /></Btn>
      <Btn onClick={() => cmd(() => editor.chain().setHorizontalRule().run())} title="Separador"><Minus size={15} /></Btn>
      <Div />
      <Btn onClick={() => cmd(() => editor.chain().setTextAlign("left").run())} active={editor.isActive({ textAlign: "left" })} title="Izquierda"><AlignLeft size={15} /></Btn>
      <Btn onClick={() => cmd(() => editor.chain().setTextAlign("center").run())} active={editor.isActive({ textAlign: "center" })} title="Centro"><AlignCenter size={15} /></Btn>
      <Btn onClick={() => cmd(() => editor.chain().setTextAlign("right").run())} active={editor.isActive({ textAlign: "right" })} title="Derecha"><AlignRight size={15} /></Btn>
    </div>
  );
}
