/**
 * DevMind — Generate Placeholder PWA Icons (ESM version)
 * Run with: node scripts/generate-placeholder-icons.js
 */

import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ICONS_DIR = join(__dirname, "..", "public", "icons");

// Ensure directory exists
if (!existsSync(ICONS_DIR)) {
  mkdirSync(ICONS_DIR, { recursive: true });
}

/**
 * Minimal valid 1x1 dark PNG (placeholder).
 * Replace with real branded icons before production.
 */
const PNG_1x1_DARK = Buffer.from(
  "89504e470d0a1a0a0000000d4948445200000001000000010802000000907753de0000000c" +
  "4944415408d76360606000000004000157f46e970000000049454e44ae426082",
  "hex"
);

const sizes = [192, 512];
for (const size of sizes) {
  const filePath = join(ICONS_DIR, `icon-${size}.png`);
  writeFileSync(filePath, PNG_1x1_DARK);
  console.log(`✓ Created ${filePath}`);
}

const instructions = `Drop DevMind_logo.png here, then tell Antigravity:
"The real logo is at public/icons/DevMind_logo.png. Update Logo.tsx to use this PNG. Regenerate icon-192.png and icon-512.png. Delete LogoPlaceholder.tsx and this file."
`;
writeFileSync(join(ICONS_DIR, "REPLACE_WITH_REAL_LOGO.txt"), instructions);
console.log("✓ Created REPLACE_WITH_REAL_LOGO.txt");
console.log("\nPlaceholder icons created successfully.");
