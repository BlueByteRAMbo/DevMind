// ============================================================
// DevMind — useImageUpload Hook
// Full OCR pipeline for HandwrittenBlock:
//   1. Upload to Supabase Storage
//   2. Save block with imageUrl immediately
//   3. Run OCR via Gemini Vision
//   4. Update block with ocrText
// ============================================================

import { useCallback, useState } from "react";
import { uploadHandwrittenScan } from "../lib/storage";
import { useAI } from "./useAI";
import { useAppStore } from "../store/appStore";

export function useImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const user = useAppStore((s) => s.user);
  const { ocr } = useAI();

  /**
   * Upload an image file and run OCR.
   * Returns { imageUrl, ocrText }.
   */
  const upload = useCallback(
    async (
      file: File,
      blockId: string
    ): Promise<{ imageUrl: string; ocrText: string | null }> => {
      if (!user) {
        setError("You must be signed in to upload images.");
        return { imageUrl: "", ocrText: null };
      }

      setUploading(true);
      setError(null);

      try {
        // Step 1: Upload image to Supabase Storage
        const imageUrl = await uploadHandwrittenScan(file, user.id, blockId);

        // Step 2: Run OCR in background (don't block UI)
        let ocrText = null;
        try {
          ocrText = await ocr(imageUrl);
        } catch (ocrErr) {
          console.warn("OCR failed, image still uploaded:", ocrErr);
        }

        return { imageUrl, ocrText: ocrText || "" };
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Upload failed";
        setError(msg);
        return { imageUrl: "", ocrText: null };
      } finally {
        setUploading(false);
      }
    },
    [user, ocr]
  );

  return { upload, uploading, error };
}
