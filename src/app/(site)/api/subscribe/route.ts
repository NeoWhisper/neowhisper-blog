import { NextResponse } from "next/server";
import { z } from "zod";
import { normalizeLang, type SupportedLang } from "@/lib/i18n";
import { upsertSubscriber } from "@/lib/subscriptions";

// In-memory rate limiter for subscribe API
// Author: @security-engineer (t_8a3f)
// Rationale: Prevent subscription spam and abuse on public endpoint.
// Uses simple sliding window (1 request/minute/IP cap at 10 requests).
const SUBSCRIBE_RATE_LIMIT_WINDOW_MS = 60_000;
const SUBSCRIBE_RATE_LIMIT_MAX = 10;
const subscribeRateLimiter = new Map<string, { count: number; resetTime: number }>();

const payloadSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  lang: z.string().optional(),
});

export async function POST(request: Request) {
  // Rate limiting — IP-based sliding window
  // Author: @security-engineer (per t_8a3f)
  const clientIp =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim();

  const now = Date.now();
  if (clientIp) {
    const existing = subscribeRateLimiter.get(clientIp);

    if (existing && existing.resetTime > now) {
      existing.count += 1;
      if (existing.count > SUBSCRIBE_RATE_LIMIT_MAX) {
        console.warn(
          `[SUBSCRIBE API] Rate limit exceeded for IP: ${clientIp} (${existing.count} requests in window)`
        );
        return NextResponse.json(
          { ok: false, message: "Too many requests. Please try again later." },
          { status: 429, headers: { "Retry-After": "60" } }
        );
      }
    } else {
      subscribeRateLimiter.set(clientIp, {
        count: 1,
        resetTime: now + SUBSCRIBE_RATE_LIMIT_WINDOW_MS,
      });
    }

    // Memory cleanup
    if (subscribeRateLimiter.size > 1000) {
      for (const [ip, entry] of subscribeRateLimiter.entries()) {
        if (entry.resetTime <= now) subscribeRateLimiter.delete(ip);
      }
    }
  }

  try {
    const body = (await request.json()) as unknown;
    const parsed = payloadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: "Invalid subscription payload." },
        { status: 400 },
      );
    }

    const lang = normalizeLang(parsed.data.lang) as SupportedLang;
    const { error } = await upsertSubscriber(parsed.data.email, lang);

    if (error) {
      console.error("[subscribe] upsert failed:", error);
      return NextResponse.json({ ok: false, message: error }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[subscribe] unexpected error:", error);
    return NextResponse.json(
      { ok: false, message: "Unable to register subscriber." },
      { status: 500 },
    );
  }
}
