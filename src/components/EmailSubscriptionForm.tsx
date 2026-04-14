"use client";

import { type FormEvent, useState } from "react";
import { normalizeLang, type SupportedLang } from "@/lib/i18n";

type SubscriptionCopy = {
  heading: string;
  button: string;
  sending: string;
  success: string;
  error: string;
  privacy: string;
  placeholder: string;
};

type FormState = "idle" | "submitting" | "success" | "error";

const copyByLang: Record<SupportedLang, SubscriptionCopy> = {
  en: {
    heading: "Subscribe for new posts",
    button: "Subscribe",
    sending: "Subscribing...",
    success: "You are subscribed. New posts will arrive by email.",
    error: "We could not process your request. Please try again later.",
    privacy:
      "Emails are sent by NeoWhisper via Resend. Unsubscribe support can be added on request.",
    placeholder: "you@email.com",
  },
  ja: {
    heading: "新着記事をメールで受け取る",
    button: "購読する",
    sending: "送信中...",
    success: "登録が完了しました。新着記事をメールでお届けします。",
    error: "登録に失敗しました。時間をおいて再度お試しください。",
    privacy:
      "メールはResend経由でNeoWhisperから送信されます。配信停止機能は必要に応じて追加できます。",
    placeholder: "you@email.com",
  },
  ar: {
    heading: "اشترك لاستلام المقالات الجديدة",
    button: "اشتراك",
    sending: "جارٍ الاشتراك...",
    success: "تم الاشتراك بنجاح. سنرسل المقالات الجديدة إلى بريدك.",
    error: "تعذر تنفيذ الطلب. يرجى المحاولة لاحقا.",
    privacy:
      "تصل الرسائل من NeoWhisper عبر Resend. يمكن إضافة إلغاء الاشتراك عند الحاجة.",
    placeholder: "you@email.com",
  },
};

export default function EmailSubscriptionForm({ lang }: { lang: string }) {
  const currentLang = normalizeLang(lang) as SupportedLang;
  const copy = copyByLang[currentLang];
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
      setMessage(copy.error);
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
      setMessage(copy.success);
    } catch (error) {
      const fallback =
        error instanceof Error && error.message && error.message !== "Request failed"
          ? error.message
          : copy.error;
      setState("error");
      setMessage(fallback);
    }
  };

  return (
    <form
      className="space-y-3"
      onSubmit={handleSubmit}
      aria-label={copy.heading}
      dir={currentLang === "ar" ? "rtl" : "ltr"}
    >
      <label className="sr-only" htmlFor="subscription-email">
        {copy.heading}
      </label>
      <div className="grid gap-3 sm:grid-cols-[2fr,1fr]">
        <input
          id="subscription-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder={copy.placeholder}
          className="w-full min-w-0 rounded-2xl border border-white/20 bg-white/80 px-4 py-3 text-sm text-gray-800 shadow-sm transition focus:border-purple-500 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-gray-100"
        />
        <button
          type="submit"
          disabled={state === "submitting"}
          className="w-full rounded-2xl bg-purple-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-purple-500 disabled:opacity-60"
        >
          {state === "submitting" ? copy.sending : copy.button}
        </button>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">{copy.privacy}</p>
      {message && (
        <p
          className={`text-sm font-medium ${
            state === "success" ? "text-green-600" : "text-red-500"
          }`}
          aria-live="polite"
        >
          {message}
        </p>
      )}
    </form>
  );
}
