"use client";

import type { Chapter } from "@/lib/supabase/types";

// ── PDF ──────────────────────────────────────────────────────────────────────

export async function exportToPDF(
  bookTitle: string,
  chapters: Chapter[],
  selectedIds?: string[]
) {
  // Carga dinámica para no inflar el bundle inicial
  const [jsPDFModule, html2canvasModule] = await Promise.all([
    import("jspdf"),
    import("html2canvas"),
  ]);
  const jsPDF = jsPDFModule.default;
  const html2canvas = html2canvasModule.default;

  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 20;
  const textW = pageW - margin * 2;

  // Portada
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.text(bookTitle, pageW / 2, 80, { align: "center" });
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120);
  doc.text(new Date().getFullYear().toString(), pageW / 2, 95, { align: "center" });

  const toExport = selectedIds
    ? chapters.filter((c) => selectedIds.includes(c.id))
    : chapters;

  for (const chapter of toExport) {
    doc.addPage();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(30);
    doc.text(chapter.title, margin, 30);

    // Extrae texto plano del JSON de TipTap
    const plainText = extractPlainText(chapter.content as object);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(50);

    const lines = doc.splitTextToSize(plainText, textW) as string[];
    let y = 45;
    for (const line of lines) {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(line, margin, y);
      y += 6;
    }
  }

  doc.save(`${bookTitle.replace(/\s+/g, "_")}.pdf`);
}

// ── WORD (.docx) ─────────────────────────────────────────────────────────────

export async function exportToDocx(
  bookTitle: string,
  chapters: Chapter[],
  selectedIds?: string[]
) {
  const { Document, Paragraph, TextRun, HeadingLevel, Packer, AlignmentType } =
    await import("docx");

  const toExport = selectedIds
    ? chapters.filter((c) => selectedIds.includes(c.id))
    : chapters;

  const children: object[] = [
    new Paragraph({
      text: bookTitle,
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({ text: "" }),
  ];

  for (const chapter of toExport) {
    children.push(
      new Paragraph({ text: chapter.title, heading: HeadingLevel.HEADING_1 }),
      new Paragraph({ text: "" })
    );

    const blocks = extractParagraphs(chapter.content as object);
    for (const block of blocks) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: block, size: 24 })],
          spacing: { after: 160 },
        })
      );
    }
    children.push(new Paragraph({ text: "" }));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const doc = new Document({ sections: [{ children: children as any[] }] });
  const blob = await Packer.toBlob(doc);

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${bookTitle.replace(/\s+/g, "_")}.docx`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function extractPlainText(content: object): string {
  if (!content || typeof content !== "object") return "";
  const doc = content as { content?: object[] };
  if (!doc.content) return "";
  return doc.content.map(extractNodeText).join("\n\n");
}

function extractParagraphs(content: object): string[] {
  if (!content || typeof content !== "object") return [];
  const doc = content as { content?: object[] };
  if (!doc.content) return [];
  return doc.content.map(extractNodeText).filter(Boolean);
}

function extractNodeText(node: object): string {
  const n = node as { type?: string; text?: string; content?: object[] };
  if (n.text) return n.text;
  if (n.content) return n.content.map(extractNodeText).join("");
  return "";
}
