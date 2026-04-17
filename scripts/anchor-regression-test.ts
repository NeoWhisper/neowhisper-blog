import fs from "node:fs/promises";
import path from "node:path";
import { slugify } from "../src/lib/slugs";

const POSTS_DIR = path.join(process.cwd(), "src/content/posts");

/**
 * REPRODUCTION OF OLD ANCHOR LOGIC
 */
const oldHeadingToAnchor = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

function oldLogic(text: string, lang: string): string {
  if (lang === "en") {
    return oldHeadingToAnchor(text);
  }
  return text.replace(/\s+/g, "-");
}

interface DriftItem {
  file: string;
  lang: string;
  heading: string;
  oldVal: string;
  newVal: string;
}

async function runAudit() {
  const files = await fs.readdir(POSTS_DIR);
  const drift: DriftItem[] = [];

  for (const file of files) {
    if (!file.endsWith(".mdx")) continue;
    const isAr = file.endsWith("-ar.mdx");
    const isJa = file.endsWith("-ja.mdx");
    const lang = isAr ? "ar" : isJa ? "ja" : "en";

    const filePath = path.join(POSTS_DIR, file);
    const content = await fs.readFile(filePath, "utf-8");

    // Simple heading extraction
    const headings = [...content.matchAll(/^(#{2,3})\s+(.+)$/gm)].map(m => m[2].trim());

    for (const h of headings) {
      const oldVal = oldLogic(h, lang);
      const newVal = slugify(h);

      if (oldVal !== newVal) {
        drift.push({
          file,
          lang,
          heading: h,
          oldVal,
          newVal
        });
      }
    }
  }

  console.log(JSON.stringify(drift, null, 2));
  console.log(`\nFound ${drift.length} anchor mismatches across ${files.length} files.`);
}

runAudit().catch(console.error);
