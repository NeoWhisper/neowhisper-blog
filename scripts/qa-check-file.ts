import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const runQaOnFile = async (filePath: string) => {
  const content = await fs.readFile(path.resolve(filePath), "utf8");
  
  const issues: string[] = [];
  
  // 1. Check for middle dot bullets
  if (content.includes("•")) {
    issues.push("ERROR: Found forbidden middle-dot bullets (•). Use hyphens (-) instead.");
  }
  
  // 2. Check for TL;DR format
  if (content.includes('<Callout type="tldr">')) {
    if (!/<Callout type="tldr">\n*\s*- /.test(content)) {
      issues.push("WARNING: TL;DR callout format may not match expected style (- bullets).");
    }
  }

  // 3. TOC anchor matching
  const tocMatches = [...content.matchAll(/\[[^\]]+\]\(#([^)]+)\)/g)].map(m => m[1]);
  const headings = [...content.matchAll(/^(#{2,3})\s+([^\n]+)/gm)].map(m => m[2].trim());
  
  // English kebab case, AR/JA as-is. We just loosely check if the anchor exists in some form.
  const anchorsInBody = new Set(headings.map(h => h.toLowerCase().replace(/\s+/g, '-')));
  const rawHeadings = new Set(headings);
  
  const missingAnchors = tocMatches.filter(anchor => {
    return !anchorsInBody.has(anchor) && !rawHeadings.has(decodeURIComponent(anchor));
  });
  
  if (missingAnchors.length > 0) {
    issues.push(`ERROR: TOC anchors missing in body: ${missingAnchors.join(", ")}`);
  }
  
  // Print Results
  console.log(`\n=== QA Check Results for ${path.basename(filePath)} ===`);
  if (issues.length === 0) {
    console.log("✅ PASS: No QA issues found!");
  } else {
    console.log("❌ FAIL: Issues detected:");
    issues.forEach(i => console.log(`  - ${i}`));
  }
};

const file = process.argv[2];
if (!file) {
  console.error("Please provide an MDX file path: npx tsx scripts/qa-check-file.ts src/content/posts/my-post.mdx");
  process.exit(1);
}

runQaOnFile(file).catch(console.error);
