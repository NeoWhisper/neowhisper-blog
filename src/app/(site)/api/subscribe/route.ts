import { NextResponse } from "next/server";
import { z } from "zod";
import { normalizeLang, type SupportedLang } from "@/lib/i18n";
import { upsertSubscriber } from "@/lib/subscriptions";

const payloadSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  lang: z.string().optional(),
});

export async function POST(request: Request) {
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
