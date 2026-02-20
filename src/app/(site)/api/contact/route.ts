import { NextResponse } from "next/server";
import { normalizeLang } from "@/lib/i18n";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
// Validate RESEND_FROM: must contain @ to be a valid email
const RESEND_FROM_RAW = process.env.RESEND_FROM || "";
const RESEND_FROM = RESEND_FROM_RAW.trim().includes("@")
  ? RESEND_FROM_RAW.trim()
  : "onboarding@resend.dev"; // Fallback to Resend's test email
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
    let body: Record<string, unknown>;

    if (contentType.includes("application/json")) {
      body = (await request.json()) as Record<string, unknown>;
    } else {
      const formData = await request.formData();
      body = Object.fromEntries(formData.entries());
    }

    const name = toStr(body.name);
    const email = toStr(body.email);
    const details = toStr(body.details);
    const company = toStr(body.company);
    const projectType = toStr(body.projectType);
    const budget = toStr(body.budget);
    const lang = normalizeLang(toStr(body.lang));
    // Check both possible keys for the token
    const turnstileToken = toStr(body.turnstileToken) ?? toStr(body["cf-turnstile-response"]);

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

      const verifyJson = (await verifyRes.json().catch(() => ({}))) as {
        success?: boolean;
        "error-codes"?: unknown;
      };

      if (!verifyRes.ok || !verifyJson.success) {
        console.error("Turnstile verification failed", {
          status: verifyRes.status,
          errorCodes: verifyJson?.["error-codes"],
        });
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

    // RESEND_FROM is now guaranteed to be a valid email (validated at top of file)
    const finalFrom = RESEND_FROM.includes("<")
      ? RESEND_FROM
      : `NeoWhisper <${RESEND_FROM}>`;

    const emailPayload = {
      from: finalFrom,
      to: recipients.length ? recipients : ["neowhisperhq@gmail.com"],
      subject: `New inquiry from ${name}`,
      reply_to: email,
      text: `Name: ${name}\nEmail: ${email}\nCompany: ${company || "-"}\nProject Type: ${projectType || "-"}\nBudget: ${budget || "-"}\n\nDetails:\n${details}`,
    };

    console.log("Sending email with payload:", JSON.stringify({ ...emailPayload, text: "(omitted)" }));

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailPayload),
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      console.error("Resend email send failed", {
        status: res.status,
        body: errorText.slice(0, 1000),
      });

      let message = "Email delivery failed.";
      try {
        const json = JSON.parse(errorText) as {
          message?: string;
          error?: { message?: string };
        };
        message = json?.message || json?.error?.message || message;
      } catch {
        // ignore parse errors
      }

      if (wantsHtml) return redirect(`/contact?lang=${lang}&error=1`);
      return NextResponse.json(
        { ok: false, message },
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
