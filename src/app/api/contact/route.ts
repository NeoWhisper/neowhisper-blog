import { NextResponse } from "next/server";
import { normalizeLang } from "@/lib/i18n";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM = process.env.RESEND_FROM;
const RESEND_TO = process.env.RESEND_TO || "neowhisperhq@gmail.com";
const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY;

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  const accept = request.headers.get("accept") ?? "";
  const wantsHtml = !contentType.includes("application/json") && accept.includes("text/html");
  const origin = new URL(request.url).origin;

  const redirect = (path: string) =>
    NextResponse.redirect(new URL(path, origin), 303);

  const toStr = (value: unknown) => (typeof value === "string" ? value : undefined);

  try {
    const body =
      contentType.includes("application/json")
        ? ((await request.json()) as Record<string, unknown>)
        : (Object.fromEntries(
            (await request.formData()).entries()
          ) as Record<string, unknown>);

    const name = toStr(body?.name);
    const email = toStr(body?.email);
    const details = toStr(body?.details);
    const company = toStr(body?.company);
    const projectType = toStr(body?.projectType);
    const budget = toStr(body?.budget);
    const lang = normalizeLang(toStr(body?.lang));
    const turnstileToken =
      toStr(body?.turnstileToken) ?? toStr(body?.["cf-turnstile-response"]);

    if (!name || !email || !details) {
      if (wantsHtml) return redirect(`/contact?lang=${lang}&error=1`);
      return NextResponse.json(
        { ok: false, message: "Missing required fields." },
        { status: 400 }
      );
    }

    if (TURNSTILE_SECRET_KEY) {
      if (!turnstileToken) {
        if (wantsHtml) return redirect(`/contact?lang=${lang}&error=1`);
        return NextResponse.json(
          { ok: false, message: "Spam verification failed." },
          { status: 400 }
        );
      }

      const verifyRes = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            secret: TURNSTILE_SECRET_KEY,
            response: String(turnstileToken),
          }),
        }
      );

      const verifyJson = (await verifyRes.json()) as { success?: boolean };
      if (!verifyJson.success) {
        if (wantsHtml) return redirect(`/contact?lang=${lang}&error=1`);
        return NextResponse.json(
          { ok: false, message: "Spam verification failed." },
          { status: 400 }
        );
      }
    }

    if (!RESEND_API_KEY || !RESEND_FROM) {
      if (wantsHtml) return redirect(`/contact?lang=${lang}&error=1`);
      return NextResponse.json(
        { ok: false, message: "Email service not configured." },
        { status: 500 }
      );
    }

    const recipients = RESEND_TO.split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);

    const emailPayload = {
      from: RESEND_FROM,
      to: recipients.length ? recipients : ["neowhisperhq@gmail.com"],
      subject: `New inquiry from ${name}`,
      reply_to: email,
      text: `Name: ${name}\nEmail: ${email}\nCompany: ${company || "-"}\nProject Type: ${projectType || "-"}\nBudget: ${budget || "-"}\n\nDetails:\n${details}`,
    };

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailPayload),
    });

    if (!res.ok) {
      if (wantsHtml) return redirect(`/contact?lang=${lang}&error=1`);
      return NextResponse.json(
        { ok: false, message: "Email delivery failed." },
        { status: 502 }
      );
    }

    if (wantsHtml) return redirect(`/contact/success?lang=${lang}`);
    return NextResponse.json({ ok: true });
  } catch {
    if (wantsHtml) return redirect(`/contact?lang=en&error=1`);
    return NextResponse.json(
      { ok: false, message: "Invalid request." },
      { status: 400 }
    );
  }
}
