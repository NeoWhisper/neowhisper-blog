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
const MAX_LENGTH = {
  name: 120,
  email: 254,
  company: 160,
  projectType: 120,
  budget: 120,
  details: 4000,
} as const;

function sanitizeSingleLine(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const sanitized = value.trim().replace(/[\r\n]+/g, " ");
  return sanitized || undefined;
}

function sanitizeMultiLine(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const sanitized = value.trim().replace(/\r\n/g, "\n");
  return sanitized || undefined;
}

function isTooLong(value: string | undefined, max: number): boolean {
  return Boolean(value && value.length > max);
}

function isAsciiEmailChar(value: string): boolean {
  for (let i = 0; i < value.length; i += 1) {
    if (value.charCodeAt(i) > 127) return false;
  }
  return true;
}

function isValidLocalPart(local: string): boolean {
  if (!local || local.startsWith(".") || local.endsWith(".")) return false;

  const validSpecial = new Set(["!", "#", "$", "%", "&", "'", "*", "+", "-", "/", "=", "?", "^", "_", "`", "{", "|", "}", "~", "."]);

  for (let i = 0; i < local.length; i += 1) {
    const ch = local[i];
    const code = ch.charCodeAt(0);
    const isAlphaNum =
      (code >= 48 && code <= 57) ||
      (code >= 65 && code <= 90) ||
      (code >= 97 && code <= 122);

    if (!isAlphaNum && !validSpecial.has(ch)) return false;
  }

  return !local.includes("..");
}

function isValidDomain(domain: string): boolean {
  if (!domain || domain.length > 253) return false;
  if (domain.startsWith(".") || domain.endsWith(".")) return false;
  if (!domain.includes(".")) return false;

  const labels = domain.split(".");
  if (labels.some((label) => label.length === 0)) return false;

  for (const label of labels) {
    if (label.startsWith("-") || label.endsWith("-")) return false;

    for (let i = 0; i < label.length; i += 1) {
      const ch = label[i];
      const code = ch.charCodeAt(0);
      const isAlphaNum =
        (code >= 48 && code <= 57) ||
        (code >= 65 && code <= 90) ||
        (code >= 97 && code <= 122);

      if (!isAlphaNum && ch !== "-") return false;
    }
  }

  const tld = labels[labels.length - 1] ?? "";
  return tld.length >= 2;
}

function isValidEmailAddress(email: string): boolean {
  if (!email || email.length > MAX_LENGTH.email) return false;
  if (!isAsciiEmailChar(email)) return false;

  const atIndex = email.indexOf("@");
  if (atIndex <= 0 || atIndex !== email.lastIndexOf("@")) return false;
  if (atIndex >= email.length - 1) return false;

  const local = email.slice(0, atIndex);
  const domain = email.slice(atIndex + 1);

  return isValidLocalPart(local) && isValidDomain(domain);
}

function getClientIp(request: Request): string | undefined {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }

  const realIp = request.headers.get("x-real-ip")?.trim();
  return realIp || undefined;
}

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

    const name = sanitizeSingleLine(toStr(body.name));
    const email = sanitizeSingleLine(toStr(body.email))?.toLowerCase();
    const details = sanitizeMultiLine(toStr(body.details));
    const company = sanitizeSingleLine(toStr(body.company));
    const projectType = sanitizeSingleLine(toStr(body.projectType));
    const budget = sanitizeSingleLine(toStr(body.budget));
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

    if (!isValidEmailAddress(email)) {
      if (wantsHtml) return redirect(`/contact?lang=${lang}&error=1`);
      return NextResponse.json(
        { ok: false, message: "Invalid email address." },
        { status: 400 }
      );
    }

    if (
      isTooLong(name, MAX_LENGTH.name) ||
      isTooLong(email, MAX_LENGTH.email) ||
      isTooLong(company, MAX_LENGTH.company) ||
      isTooLong(projectType, MAX_LENGTH.projectType) ||
      isTooLong(budget, MAX_LENGTH.budget) ||
      isTooLong(details, MAX_LENGTH.details)
    ) {
      if (wantsHtml) return redirect(`/contact?lang=${lang}&error=1`);
      return NextResponse.json(
        { ok: false, message: "One or more fields are too long." },
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

      const verifyBody = new URLSearchParams({
        secret: TURNSTILE_SECRET_KEY,
        response: String(turnstileToken),
      });
      const clientIp = getClientIp(request);
      if (clientIp) {
        verifyBody.set("remoteip", clientIp);
      }

      const verifyRes = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: verifyBody,
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

    const safeNameForSubject = name.replace(/[\r\n]+/g, " ").slice(0, 80);
    const emailPayload = {
      from: finalFrom,
      to: recipients.length ? recipients : ["neowhisperhq@gmail.com"],
      subject: `New inquiry from ${safeNameForSubject || "Website visitor"}`,
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
