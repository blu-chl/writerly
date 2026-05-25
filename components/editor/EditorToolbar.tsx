"use client";

import type { Editor } from "@tiptap/react";
import {
  Bold, Italic, Underline, Strikethrough, Highlighter,
  List, ListOrdered, Quote, Minus, AlignLeft, AlignCenter, AlignRight,
  Heading1, Heading2, Redo, Undo,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface Props {
  editor: Editor | null;
}

function ToolButton({
  onClick, active, disabled, title, children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "p-1.5 rounded-md transition-colors text-ink-600 hover:bg-ink-100",
        active && "bg-indigo-100 text-indigo-700",
        disabled && "opacity-30 cursor-not-allowed"
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="w-px h-5 bg-ink-200 mx-0.5" />;
}

export default function EditorToolbar({ editor }: Props) {
  if (!editor) return null;

  return (
    <div className="flex items-center flex-wrap gap-0.5 px-4 py-2 border-b border-ink-100 bg-white sticky top-0 z-10">
      {/* Undo / Redo */}
      <ToolButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Deshacer (Ctrl+Z)">
        <Undo size={15} />
      </ToolButton>
      <ToolButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Rehacer (Ctrl+Y)">
        <Redo size={15} />
      </ToolButton>

      <Divider />

      {/* Headings */}
      <ToolButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} title="Título 1">
        <Heading1 size={15} />
      </ToolButton>
      <ToolButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Título 2">
        <Heading2 size={15} />
      </ToolButton>

      <Divider />

      {/* Formato inline */}
      <ToolButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Negrita (Ctrl+B)">
        <Bold size={15} />
      </ToolButton>
      <ToolButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Cursiva (Ctrl+I)">
        <Italic size={15} />
      </ToolButton>
      <ToolButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Subrayado (Ctrl+U)">
        <Underline size={15} />
      </ToolButton>
      <ToolButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Tachado">
        <Strikethrough size={15} />
      </ToolButton>
      <ToolButton onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive("highlight")} title="Resaltar">
        <Highlighter size={15} />
      </ToolButton>

      <Divider />

      {/* Listas */}
      <ToolButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Lista">
        <List size={15} />
      </ToolButton>
      <ToolButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Lista numerada">
        <ListOrdered size={15} />
      </ToolButton>
      <ToolButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Cita">
        <Quote size={15} />
      </ToolButton>
      <ToolButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Separador">
        <Minus size={15} />
      </ToolButton>

      <Divider />

      {/* Alineación */}
      <ToolButton onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Izquierda">
        <AlignLeft size={15} />
      </ToolButton>
      <ToolButton onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Centro">
        <AlignCenter size={15} />
      </ToolButton>
      <ToolButton onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Derecha">
        <AlignRight size={15} />
      </ToolButton>
    </div>
  );
}
