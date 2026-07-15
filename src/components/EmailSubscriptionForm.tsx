"use client";

import { type FormEvent, useState } from "react";
import { normalizeLang, type SupportedLang } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";


type FormState = "idle" | "submitting" | "success" | "error";

export default function EmailSubscriptionForm({ lang }: { lang: string }) {
  const currentLang = normalizeLang(lang) as SupportedLang;
  const t = getDictionary(currentLang);
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (state === "submitting") return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get("email") ?? "").trim().toLowerCase();

    if (!email) {
      setState("error");
      setMessage(t.messages.subscribeError);
      return;
    }

    setState("submitting");
    setMessage("");

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, lang: currentLang }),
      });

      if (!response.ok) {
        let serverMessage = "";
        try {
          const data = (await response.json()) as { message?: string };
          serverMessage = data.message ?? "";
        } catch {
          // Ignore parse failures and use localized fallback.
        }
        throw new Error(serverMessage || "Request failed");
      }

      form.reset();
      setState("success");
      setMessage(t.messages.subscribeSuccess);
    } catch {
      setState("error");
      setMessage(t.messages.subscribeError);
    }
  };

  return (
    <form
      className="space-y-3"
      onSubmit={handleSubmit}
      aria-label={t.sections.subscribeHeading}
      dir={currentLang === "ar" ? "rtl" : "ltr"}
    >
      <div className="relative z-10">
        <h3 className="text-xl font-bold tracking-tight text-white sm:text-2xl mb-2">
          {t.sections.subscribeHeading}
        </h3>
        <p className="text-white/70 text-sm mb-6 max-w-md">
          {t.messages.subscribePrivacy}
        </p>
        <div className="grid gap-3 sm:grid-cols-[2fr,1fr]">
          <input
            id="subscription-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder={t.actions.subscribePlaceholder}
            disabled={state === "submitting" || state === "success"}
            className="w-full min-w-0 flex-auto rounded-full border-0 bg-white/10 px-5 py-3 text-white placeholder:text-white/50 shadow-sm ring-1 ring-inset ring-white/20 focus:ring-2 focus:ring-inset focus:ring-white sm:text-sm sm:leading-6"
          />
          <button
            type="submit"
            disabled={state === "submitting" || state === "success"}
            className="flex-none rounded-full bg-white px-8 py-3 text-sm font-semibold text-purple-600 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {state === "submitting" ? t.actions.subscribing : t.actions.subscribe}
          </button>
        </div>
      </div>
      {message && (
        <p
          className={`text-sm font-medium ${
            state === "success" ? "text-green-400" : "text-red-400"
          }`}
          aria-live="polite"
        >
          {message}
        </p>
      )}
    </form>
  );
}
