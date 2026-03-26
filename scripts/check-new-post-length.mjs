#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const MIN_WORDS_EXCLUSIVE = 700; // Rule: strictly more than 700 words
const POSTS_DIR = "src/content/posts";

function stripFrontmatter(source) {
  if (!source.startsWith("---")) return source;
  const endIndex = source.indexOf("\n---", 3);
  if (endIndex === -1) return source;
  return source.slice(endIndex + 4);
}

function countWords(markdown, lang = "en") {
  const text = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const fallbackCount = () => text.split(" ").filter(Boolean).length;

  // English words are space-delimited. Japanese/Arabic often aren't, so use
  // Intl.Segmenter to avoid undercounting (which can incorrectly fail QA).
  const segmentSupported =
    lang !== "en" && typeof Intl !== "undefined" && Intl.Segmenter;

  return !text
    ? 0
    : segmentSupported
      ? (() => {
          try {
            const segmenter = new Intl.Segmenter(lang, { granularity: "word" });
            return Array.from(segmenter.segment(text)).filter(
              (seg) => seg?.isWordLike && String(seg.segment || "").trim(),
            ).length;
          } catch {
            return fallbackCount();
          }
        })()
      : fallbackCount();
}

function getLanguageFromPostFile(relativeFile) {
  const file = String(relativeFile || "");
  return file.endsWith("-ja.mdx")
    ? "ja"
    : file.endsWith("-ar.mdx")
      ? "ar"
      : "en";
}

function parseAddedPostFiles(diffOutput) {
  return diffOutput
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split("\t"))
    .filter(([status, filePath]) => status === "A" && typeof filePath === "string")
    .map(([, filePath]) => filePath)
    .filter((filePath) => filePath.startsWith(`${POSTS_DIR}/`) && filePath.endsWith(".mdx"));
}

async function getStagedAddedFiles() {
  const { execSync } = await import("node:child_process");
  const output = execSync("git diff --cached --name-status --diff-filter=A", {
    encoding: "utf8",
  });
  return parseAddedPostFiles(output);
}

async function main() {
  const addedPosts = await getStagedAddedFiles();
  if (addedPosts.length === 0) {
    process.exit(0);
  }

  const failures = [];

  for (const relativeFile of addedPosts) {
    const absoluteFile = path.join(process.cwd(), relativeFile);
    const content = await fs.readFile(absoluteFile, "utf8");
    const body = stripFrontmatter(content);
    const lang = getLanguageFromPostFile(relativeFile);
    const wordCount = countWords(body, lang);

    if (wordCount <= MIN_WORDS_EXCLUSIVE) {
      failures.push({
        file: relativeFile,
        wordCount,
      });
    }
  }

  if (failures.length === 0) {
    process.exit(0);
  }

  console.error("Post length rule failed. New posts must be more than 700 words.");
  for (const failure of failures) {
    console.error(`- ${failure.file}: ${failure.wordCount} words`);
  }
  console.error("Please expand the post(s) and commit again.");
  process.exit(1);
}

main().catch((error) => {
  console.error("[check-new-post-length] failed:", error?.message || error);
  process.exit(1);
});
