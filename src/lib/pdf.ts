// src/lib/pdf.ts

import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { db } from "../lib/db";

/**
 * Export a topic and all its blocks (including images and styling) to a downloadable PDF.
 * This captures the visual representation "as it is" using html2canvas.
 */
export async function exportTopicToPDF(topicId: string): Promise<void> {
  const topic = await db.topics.get(topicId);
  if (!topic) {
    throw new Error("Topic not found");
  }

  const element = document.getElementById("canvas-blocks-container");
  if (!element) {
    throw new Error("Could not find canvas container to export");
  }

  // Add a small visual loading state or just wait for the canvas to render
  try {
    const canvas = await html2canvas(element, {
      scale: 2, // Higher resolution
      useCORS: true, // Allow cross-origin images (Supabase storage, etc.)
      backgroundColor: "#16181D", // Match bg-bg-base for dark mode consistency
      logging: false,
    });

    const imgData = canvas.toDataURL("image/png");

    // Calculate dimensions to make a single continuous page (receipt style)
    // so no blocks get awkwardly cut in half across pages.
    const pdfWidth = canvas.width;
    const pdfHeight = canvas.height;

    // jsPDF expects orientation 'p' (portrait) or 'l' (landscape)
    const orientation = pdfWidth > pdfHeight ? "l" : "p";
    
    // Create a custom-sized PDF to fit the exact captured dimension
    const pdf = new jsPDF({
      orientation,
      unit: "px",
      format: [pdfWidth, pdfHeight],
    });

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${topic.name}.pdf`);
  } catch (error) {
    console.error("Failed to generate visual PDF:", error);
    alert("Failed to generate PDF. Check console for details.");
  }
}
