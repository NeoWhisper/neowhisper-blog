import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { OLLAMA_IMAGE_MODEL, API_BASE_URL } from "./config";
import { startStage, endStage } from "./metrics";

const IMAGES_DIR = path.join(process.cwd(), "public/images");

type OllamaImageResponse = {
  images?: string[];
};

function sanitizeFilename(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
}

function buildImagePrompt(title: string): string {
  const cleanTitle = title.replace(/"/g, "'").slice(0, 100);
  return `A professional, modern blog cover image for an article titled "${cleanTitle}". 
Abstract, minimalist style with soft gradients. Tech-inspired but not literal.
High quality, suitable for a professional tech blog header. Clean composition with space for text overlay.`;
}

async function ensureImagesDir(): Promise<void> {
  try {
    await fs.access(IMAGES_DIR);
  } catch {
    await fs.mkdir(IMAGES_DIR, { recursive: true });
  }
}

async function generateWithOllama(
  prompt: string,
  model: string,
): Promise<Buffer | null> {
  const ollamaUrl = API_BASE_URL.replace("/v1", "").replace(/\/+$/, "");

  try {
    const response = await fetch(`${ollamaUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      console.warn(`[image-gen] Ollama API error: ${response.status}`);
      return null;
    }

    const data = (await response.json()) as OllamaImageResponse;

    if (data.images && data.images.length > 0) {
      return Buffer.from(data.images[0], "base64");
    }

    return null;
  } catch (error) {
    console.warn("[image-gen] Failed to generate image:", error);
    return null;
  }
}

export async function generateCoverImage(
  title: string,
  excerpt: string,
  dateString: string,
): Promise<string | null> {
  const model = OLLAMA_IMAGE_MODEL;

  if (!model || model.trim() === "") {
    console.log(
      "[image-gen] OLLAMA_IMAGE_MODEL not configured, skipping cover generation",
    );
    return null;
  }

  const stage = startStage("coverImage");

  try {
    await ensureImagesDir();

    const prompt = buildImagePrompt(title);
    const imageBuffer = await generateWithOllama(prompt, model);

    if (!imageBuffer) {
      console.warn("[image-gen] No image generated, using fallback");
      return null;
    }

    const baseName = sanitizeFilename(title) || "cover";
    const filename = `${dateString}-${baseName}.png`;
    const filePath = path.join(IMAGES_DIR, filename);

    await fs.writeFile(filePath, imageBuffer);

    console.log(`[image-gen] Saved cover image: ${filename}`);
    endStage(stage, true);

    return `/images/${filename}`;
  } catch (error) {
    console.warn("[image-gen] Error generating cover:", error);
    endStage(stage, false);
    return null;
  }
}
