import { NextResponse } from "next/server";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM = process.env.RESEND_FROM;
const RESEND_TO = process.env.RESEND_TO || "neowhisperhq@gmail.com";
const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, details, company, projectType, budget, turnstileToken } =
      body ?? {};

    if (!name || !email || !details) {
      return NextResponse.json(
        { ok: false, message: "Missing required fields." },
        { status: 400 }
      );
    }

    if (TURNSTILE_SECRET_KEY) {
      if (!turnstileToken) {
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
        return NextResponse.json(
          { ok: false, message: "Spam verification failed." },
          { status: 400 }
        );
      }
    }

    if (!RESEND_API_KEY || !RESEND_FROM) {
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
      return NextResponse.json(
        { ok: false, message: "Email delivery failed." },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, message: "Invalid request." },
      { status: 400 }
    );
  }
}
