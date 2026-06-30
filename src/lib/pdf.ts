// src/lib/pdf.ts

import { jsPDF } from "jspdf";
import { db } from "../lib/db";
import type { Block } from "../types";

/**
 * Export a topic and all its blocks (including images) to a downloadable PDF.
 * The PDF is generated on the client side using jsPDF.
 */
export async function exportTopicToPDF(topicId: string): Promise<void> {
  const topic = await db.topics.get(topicId);
  if (!topic) {
    throw new Error("Topic not found");
  }

  const blocks: Block[] = await db.blocks.where("topicId").equals(topicId).toArray();

  const doc = new jsPDF();
  const margin = 10;
  let cursorY = margin;

  // Title
  doc.setFontSize(20);
  doc.text(topic.name, margin, cursorY);
  cursorY += 12;

  doc.setFontSize(12);

  for (const block of blocks) {
    // If the block is an image (handwritten scan) and has an imageUrl, embed it.
    if (block.type === "handwritten_scan" && block.imageUrl) {
      try {
        const response = await fetch(block.imageUrl);
        const blob = await response.blob();
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        const format = dataUrl.startsWith("data:image/png") ? "PNG" : "JPEG";
        const pageWidth = doc.internal.pageSize.getWidth() - margin * 2;
        // Preserve aspect ratio: let jsPDF calculate height automatically by passing 0 for height.
        doc.addImage(dataUrl, format, margin, cursorY, pageWidth, 0);
        // Approximate height after image is added; jsPDF does not expose it directly.
        cursorY += pageWidth * 0.75; // rough estimate (adjust as needed)
      } catch (e) {
        console.warn("Failed to embed image for block", block.id, e);
      }
    } else {
      // Regular text block – render its content.
      const text = block.content;
      const maxWidth = doc.internal.pageSize.getWidth() - margin * 2;
      const lines = doc.splitTextToSize(text, maxWidth);
      // Add a new page if needed.
      if (cursorY + lines.length * 6 > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        cursorY = margin;
      }
      doc.text(lines, margin, cursorY);
      cursorY += lines.length * 6 + 4;
    }

    // Add spacing between blocks.
    if (cursorY > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      cursorY = margin;
    }
  }

  // Trigger download
  doc.save(`${topic.name}.pdf`);
}
