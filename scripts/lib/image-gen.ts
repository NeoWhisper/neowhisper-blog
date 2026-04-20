import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { spawn } from "node:child_process";
import {
  OLLAMA_IMAGE_MODEL,
  MFLUX_MODEL,
  LM_STUDIO_IMAGE_URL,
  OLLAMA_BASE_URL,
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
  const ollamaUrl = OLLAMA_BASE_URL;

  try {
    const response = await fetch(`${ollamaUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, prompt, stream: false }),
    });

    // Guard: HTTP error (early return)
    if (!response.ok) {
      console.warn(`[image-gen] Ollama API error: ${response.status}`);
      return null;
    }

    // Functional extraction with optional chaining
    const data = (await response.json()) as OllamaImageResponse;
    const firstImage = data.images?.[0];

    return firstImage ? Buffer.from(firstImage, "base64") : null;
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

    // Functional result extraction (ternary over if-else)
    proc.on("close", (code) => {
      const success = code === 0;
      console[success ? "log" : "warn"](
        success
          ? `[image-gen] mflux completed: ${outputPath}`
          : `[image-gen] mflux failed (code ${code}): ${stderr.slice(0, 200)}`,
      );
      resolve(success);
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
    const baseUrl = lmStudioUrl.replace(/\/+$/, "");
    const finalEndpoint = baseUrl.endsWith("/images/generations")
      ? baseUrl
      : `${baseUrl.replace(/\/v1$/, "")}/v1/images/generations`;

    console.log(`[image-gen] Calling LM Studio at ${finalEndpoint}`);

    const response = await fetch(finalEndpoint, {
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

    // Guard: HTTP error (early return)
    if (!response.ok) {
      console.warn(
        `[image-gen] LM Studio API error: ${response.status} ${response.statusText}`,
      );
      return false;
    }

    // Functional extraction with optional chaining
    const data = (await response.json()) as {
      data?: Array<{ b64_json: string }>;
    };
    const b64Image = data.data?.[0]?.b64_json;

    // Guard: No image data (early return)
    if (!b64Image) return false;

    await fs.writeFile(outputPath, Buffer.from(b64Image, "base64"));
    console.log(`[image-gen] LM Studio completed: ${outputPath}`);
    return true;
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
  // Priority configuration: data over control flow (DeMarco)
  const generators = [
    {
      name: "mflux",
      enabled: Boolean(MFLUX_MODEL?.trim()),
      generate: async (prompt: string, filePath: string) =>
        generateWithMflux(prompt, MFLUX_MODEL!, filePath),
    },
    {
      name: "LM Studio",
      enabled: Boolean(LM_STUDIO_IMAGE_URL?.trim()),
      generate: async (prompt: string, filePath: string) =>
        generateWithLMStudio(prompt, LM_STUDIO_IMAGE_URL!, filePath),
    },
    {
      name: "ollama",
      enabled: Boolean(OLLAMA_IMAGE_MODEL?.trim()),
      generate: async (prompt: string, filePath: string) => {
        const buffer = await generateWithOllama(prompt, OLLAMA_IMAGE_MODEL!);
        if (buffer) await fs.writeFile(filePath, buffer);
        return Boolean(buffer);
      },
    },
  ] as const;

  // Guard: No generators configured
  if (!generators.some((g) => g.enabled)) {
    console.log(
      "[image-gen] No image model configured, skipping cover generation",
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

    // Data-driven iteration over generators (functional, not nested ifs)
    for (let i = 0; i < generators.length; i++) {
      const generator = generators[i];
      if (!generator.enabled) continue;

      const success = await generator.generate(prompt, filePath);

      if (success) {
        console.log(
          `[image-gen] Saved cover image (${generator.name}): ${filename}`,
        );
        endStage(stage, true);
        return `/images/${filename}`;
      }

      // Log fallback only if there's a next enabled generator
      const nextEnabled = generators.slice(i + 1).some((g) => g.enabled);
      if (nextEnabled) {
        console.warn(`[image-gen] ${generator.name} failed, trying next...`);
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
