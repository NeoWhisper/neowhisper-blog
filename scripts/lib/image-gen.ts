import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { spawn } from "node:child_process";
import {
  OLLAMA_IMAGE_MODEL,
  MFLUX_MODEL,
  LM_STUDIO_IMAGE_URL,
  API_BASE_URL,
} from "./config";
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

async function generateWithMflux(
  prompt: string,
  model: string,
  outputPath: string,
): Promise<boolean> {
  return new Promise((resolve) => {
    const args = [
      "generate",
      "--model",
      model,
      "--base-model",
      "dev",
      "--prompt",
      prompt,
      "--width",
      "1024",
      "--height",
      "1024",
      "--steps",
      "20",
      "--guidance",
      "3.5",
      "--output",
      outputPath,
    ];

    console.log(`[image-gen] Running mflux with model: ${model}`);
    const proc = spawn("mflux-generate", args, { stdio: "pipe" });

    let stderr = "";
    proc.stderr?.on("data", (data) => {
      stderr += data.toString();
    });

    proc.on("close", (code) => {
      if (code === 0) {
        console.log(`[image-gen] mflux completed: ${outputPath}`);
        resolve(true);
      } else {
        console.warn(
          `[image-gen] mflux failed (code ${code}): ${stderr.slice(0, 200)}`,
        );
        resolve(false);
      }
    });

    proc.on("error", (err) => {
      console.warn(`[image-gen] mflux error: ${err.message}`);
      resolve(false);
    });
  });
}

async function generateWithLMStudio(
  prompt: string,
  lmStudioUrl: string,
  outputPath: string,
): Promise<boolean> {
  try {
    const normalizedUrl =
      lmStudioUrl.replace(/\/+$/, "").replace(/\/v1$/, "") + "/v1";
    console.log(
      `[image-gen] Calling LM Studio at ${normalizedUrl}/images/generations`,
    );

    const response = await fetch(`${normalizedUrl}/images/generations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        n: 1,
        size: "1024x1024",
        response_format: "b64_json",
      }),
    });

    if (!response.ok) {
      console.warn(
        `[image-gen] LM Studio API error: ${response.status} ${response.statusText}`,
      );
      return false;
    }

    const data = (await response.json()) as {
      data?: Array<{ b64_json: string }>;
    };
    if (data.data && data.data[0]?.b64_json) {
      await fs.writeFile(
        outputPath,
        Buffer.from(data.data[0].b64_json, "base64"),
      );
      console.log(`[image-gen] LM Studio completed: ${outputPath}`);
      return true;
    }

    console.warn("[image-gen] LM Studio returned no image data");
    return false;
  } catch (error) {
    console.warn("[image-gen] LM Studio request failed:", error);
    return false;
  }
}

export async function generateCoverImage(
  title: string,
  excerpt: string,
  dateString: string,
): Promise<string | null> {
  // Priority: mflux > LM Studio > Ollama
  const mfluxModel = MFLUX_MODEL;
  const lmStudioUrl = LM_STUDIO_IMAGE_URL;
  const ollamaModel = OLLAMA_IMAGE_MODEL;

  if (
    (!mfluxModel || mfluxModel.trim() === "") &&
    (!lmStudioUrl || lmStudioUrl.trim() === "") &&
    (!ollamaModel || ollamaModel.trim() === "")
  ) {
    console.log(
      "[image-gen] No image model configured (MFLUX_MODEL, LM_STUDIO_IMAGE_URL or OLLAMA_IMAGE_MODEL), skipping cover generation",
    );
    return null;
  }

  const stage = startStage("coverImage");

  try {
    await ensureImagesDir();

    const prompt = buildImagePrompt(title);
    const baseName = sanitizeFilename(title) || "cover";
    const filename = `${dateString}-${baseName}.png`;
    const filePath = path.join(IMAGES_DIR, filename);

    // Try mflux first if configured
    if (mfluxModel && mfluxModel.trim() !== "") {
      const success = await generateWithMflux(prompt, mfluxModel, filePath);
      if (success) {
        console.log(`[image-gen] Saved cover image (mflux): ${filename}`);
        endStage(stage, true);
        return `/images/${filename}`;
      }
      console.warn("[image-gen] mflux failed, falling back to LM Studio");
    }

    // Try LM Studio if configured
    if (lmStudioUrl && lmStudioUrl.trim() !== "") {
      const success = await generateWithLMStudio(prompt, lmStudioUrl, filePath);
      if (success) {
        console.log(`[image-gen] Saved cover image (LM Studio): ${filename}`);
        endStage(stage, true);
        return `/images/${filename}`;
      }
      console.warn("[image-gen] LM Studio failed, falling back to Ollama");
    }

    // Fallback to Ollama if configured
    if (ollamaModel && ollamaModel.trim() !== "") {
      const imageBuffer = await generateWithOllama(prompt, ollamaModel);
      if (imageBuffer) {
        await fs.writeFile(filePath, imageBuffer);
        console.log(`[image-gen] Saved cover image (ollama): ${filename}`);
        endStage(stage, true);
        return `/images/${filename}`;
      }
    }

    console.warn("[image-gen] No image generated, using fallback");
    return null;
  } catch (error) {
    console.warn("[image-gen] Error generating cover:", error);
    endStage(stage, false);
    return null;
  }
}
