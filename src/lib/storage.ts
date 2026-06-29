// ============================================================
// DevMind — Supabase Storage helper
// Handles image uploads for HandwrittenBlock.
// ============================================================

import { supabase } from "./supabase";

const BUCKET = "handwritten-scans";

/**
 * Upload a file to Supabase Storage and return the public URL.
 * Path: userId/blockId/filename
 */
export async function uploadHandwrittenScan(
  file: File,
  userId: string,
  blockId: string
): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${userId}/${blockId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true });

  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
