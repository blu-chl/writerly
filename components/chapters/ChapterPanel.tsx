"use client";

import { useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { Plus, GripVertical, Trash2, Check, Pencil } from "lucide-react";
import { useEditorStore } from "@/lib/store/useEditorStore";
import type { Chapter } from "@/lib/supabase/types";
import { cn } from "@/lib/utils/cn";

interface Props {
  bookId: string;
}

export default function ChapterPanel({ bookId }: Props) {
  const {
    chapters,
    activeChapterId,
    setActiveChapter,
    createChapter,
    deleteChapter,
    updateChapterTitle,
    reorderChapters,
  } = useEditorStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination } = result;
    if (source.index === destination.index) return;

    const reordered = Array.from(chapters);
    const [moved] = reordered.splice(source.index, 1);
    reordered.splice(destination.index, 0, moved);

    reorderChapters(reordered.map((c, i) => ({ ...c, position: i })));
  };

  const startEdit = (chapter: Chapter) => {
    setEditingId(chapter.id);
    setEditTitle(chapter.title);
  };

  const commitEdit = async (id: string) => {
    if (editTitle.trim()) await updateChapterTitle(id, editTitle.trim());
    setEditingId(null);
  };

  const handleDelete = async (chapter: Chapter) => {
    if (confirm(`¿Eliminar "${chapter.title}"?`)) {
      await deleteChapter(chapter.id);
    }
  };

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-ink-100 flex flex-col h-full">
      {/* Header del panel */}
      <div className="px-4 py-4 border-b border-ink-100 flex items-center justify-between">
        <h2 className="text-xs font-semibold text-ink-500 uppercase tracking-wider">Capítulos</h2>
        <button
          onClick={() => createChapter(bookId)}
          title="Nuevo capítulo"
          className="w-6 h-6 flex items-center justify-center rounded-md text-ink-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Lista con drag & drop */}
      <div className="flex-1 overflow-y-auto py-2">
        {chapters.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="text-xs text-ink-400">Sin capítulos aún</p>
            <button
              onClick={() => createChapter(bookId)}
              className="mt-3 text-xs text-indigo-600 hover:underline font-medium"
            >
              + Crear el primero
            </button>
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="chapters">
              {(provided) => (
                <ul ref={provided.innerRef} {...provided.droppableProps} className="space-y-0.5 px-2">
                  {chapters.map((chapter, index) => (
                    <Draggable key={chapter.id} draggableId={chapter.id} index={index}>
                      {(drag, snapshot) => (
                        <li
                          ref={drag.innerRef}
                          {...drag.draggableProps}
                          className={cn(
                            "group flex items-center gap-1 rounded-lg px-2 py-2 cursor-pointer transition-colors text-sm",
                            activeChapterId === chapter.id
                              ? "bg-indigo-50 text-indigo-700"
                              : "text-ink-700 hover:bg-ink-50",
                            snapshot.isDragging && "shadow-lg bg-white ring-1 ring-indigo-300"
                          )}
                          onClick={() => setActiveChapter(chapter.id)}
                        >
                          {/* Handle */}
                          <span
                            {...drag.dragHandleProps}
                            className="text-ink-300 hover:text-ink-500 cursor-grab active:cursor-grabbing shrink-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <GripVertical size={14} />
                          </span>

                          {/* Título o editor inline */}
                          {editingId === chapter.id ? (
                            <form
                              className="flex-1 flex items-center gap-1"
                              onSubmit={(e) => { e.preventDefault(); commitEdit(chapter.id); }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <input
                                autoFocus
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                onBlur={() => commitEdit(chapter.id)}
                                className="flex-1 bg-transparent border-b border-indigo-400 focus:outline-none text-ink-900 text-sm min-w-0"
                              />
                              <button type="submit" className="text-green-600 shrink-0">
                                <Check size={13} />
                              </button>
                            </form>
                          ) : (
                            <span className="flex-1 truncate text-xs font-medium">
                              {chapter.title}
                            </span>
                          )}

                          {/* Acciones (hover) */}
                          {editingId !== chapter.id && (
                            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                              <button
                                onClick={(e) => { e.stopPropagation(); startEdit(chapter); }}
                                className="p-1 rounded hover:bg-ink-200 text-ink-400 hover:text-ink-700 transition"
                                title="Renombrar"
                              >
                                <Pencil size={11} />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDelete(chapter); }}
                                className="p-1 rounded hover:bg-red-100 text-ink-400 hover:text-red-600 transition"
                                title="Eliminar"
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>
                          )}
                        </li>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>

      {/* Footer — contador de palabras total */}
      <div className="px-4 py-3 border-t border-ink-100">
        <p className="text-xs text-ink-400">
          {chapters.reduce((acc, c) => acc + (c.word_count ?? 0), 0).toLocaleString()} palabras en total
        </p>
      </div>
    </aside>
  );
}
