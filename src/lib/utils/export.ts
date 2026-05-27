import type { Chapter } from "@/lib/supabase/types";

function extractText(content: unknown): string {
  if (!content || typeof content !== "object") return "";
  const node = content as { text?: string; content?: unknown[] };
  if (node.text) return node.text;
  if (node.content) return node.content.map(extractText).join("");
  return "";
}

function extractParagraphs(content: unknown): string[] {
  if (!content || typeof content !== "object") return [];
  const doc = content as { content?: unknown[] };
  if (!doc.content) return [];
  return doc.content.map(extractText).filter(Boolean);
}

export async function exportToPDF(bookTitle: string, chapters: Chapter[], selectedIds?: string[]) {
  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([import("jspdf"), import("html2canvas")]);
  void html2canvas;
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 20;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.text(bookTitle, pageW / 2, 80, { align: "center" });

  const toExport = selectedIds ? chapters.filter((c) => selectedIds.includes(c.id)) : chapters;

  for (const chapter of toExport) {
    doc.addPage();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(30);
    doc.text(chapter.title, margin, 30);

    const text = extractParagraphs(chapter.content).join("\n\n");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(50);

    const lines = doc.splitTextToSize(text, pageW - margin * 2) as string[];
    let y = 45;
    for (const line of lines) {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(line, margin, y);
      y += 6;
    }
  }
  doc.save(`${bookTitle.replace(/\s+/g, "_")}.pdf`);
}

export async function exportToDocx(bookTitle: string, chapters: Chapter[], selectedIds?: string[]) {
  const { Document, Paragraph, TextRun, HeadingLevel, Packer, AlignmentType } = await import("docx");
  const toExport = selectedIds ? chapters.filter((c) => selectedIds.includes(c.id)) : chapters;

  const children: object[] = [
    new Paragraph({ text: bookTitle, heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER }),
    new Paragraph({ text: "" }),
  ];

  for (const chapter of toExport) {
    children.push(new Paragraph({ text: chapter.title, heading: HeadingLevel.HEADING_1 }), new Paragraph({ text: "" }));
    for (const block of extractParagraphs(chapter.content)) {
      children.push(new Paragraph({ children: [new TextRun({ text: block, size: 24 })], spacing: { after: 160 } }));
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const doc = new Document({ sections: [{ children: children as any[] }] });
  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `${bookTitle.replace(/\s+/g, "_")}.docx`; a.click();
  URL.revokeObjectURL(url);
}
