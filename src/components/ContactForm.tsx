"use client";

import { useState, type FormEvent } from "react";

type FormState = "idle" | "submitting" | "success" | "error";

type ContactCopy = {
  name: string;
  email: string;
  company: string;
  projectType: string;
  budget: string;
  details: string;
  send: string;
  sending: string;
  success: string;
  error: string;
  turnstileRequired: string;
  viewConfirmation: string;
  placeholderName: string;
  placeholderEmail: string;
  placeholderCompany: string;
  placeholderDetails: string;
  emailDirect: string;
  options: {
    projectType: readonly string[];
    budget: readonly string[];
  };
};

export default function ContactForm({
  copy,
  lang,
  turnstileSiteKey,
}: {
  copy: ContactCopy;
  lang: string;
  turnstileSiteKey?: string;
}) {
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState<string>("");
  const [showToast, setShowToast] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    // Capture the form element early. React synthetic events can be unreliable after `await`.
    const form = event.currentTarget;
    event.preventDefault();
    setState("submitting");
    setMessage("");

    const formData = new FormData(form);
    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      company: formData.get("company"),
      projectType: formData.get("projectType"),
      budget: formData.get("budget"),
      details: formData.get("details"),
      turnstileToken: formData.get("cf-turnstile-response"),
      lang: formData.get("lang"),
    };

    if (
      turnstileSiteKey &&
      (typeof payload.turnstileToken !== "string" || payload.turnstileToken.trim() === "")
    ) {
      setState("error");
      setMessage(copy.turnstileRequired);
      return;
    }

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let serverMessage = "";
        try {
          const data = (await res.json()) as { message?: string };
          serverMessage = data?.message ?? "";
        } catch {
          // ignore parse errors
        }
        throw new Error(serverMessage || "Request failed");
      }

      setState("success");
      setMessage(copy.success);
      form.reset();
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
    } catch (err) {
      const errMessage =
        err instanceof Error && err.message && err.message !== "Request failed"
          ? err.message
          : copy.error;
      setState("error");
      setMessage(errMessage);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
      action="/api/contact"
      method="post"
    >
      <input type="hidden" name="lang" value={lang} />
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
            {copy.name}
          </label>
          <input
            required
            name="name"
            type="text"
            className="mt-2 w-full rounded-2xl border border-white/20 bg-white/70 px-4 py-3 text-sm text-gray-800 shadow-sm outline-none transition focus:border-purple-400 dark:border-white/10 dark:bg-white/10 dark:text-gray-100"
            placeholder={copy.placeholderName}
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
            {copy.email}
          </label>
          <input
            required
            name="email"
            type="email"
            className="mt-2 w-full rounded-2xl border border-white/20 bg-white/70 px-4 py-3 text-sm text-gray-800 shadow-sm outline-none transition focus:border-purple-400 dark:border-white/10 dark:bg-white/10 dark:text-gray-100"
            placeholder={copy.placeholderEmail}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
            {copy.company}
          </label>
          <input
            name="company"
            type="text"
            className="mt-2 w-full rounded-2xl border border-white/20 bg-white/70 px-4 py-3 text-sm text-gray-800 shadow-sm outline-none transition focus:border-purple-400 dark:border-white/10 dark:bg-white/10 dark:text-gray-100"
            placeholder={copy.placeholderCompany}
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
            {copy.projectType}
          </label>
          <select
            name="projectType"
            className="mt-2 w-full rounded-2xl border border-white/20 bg-white/70 px-4 py-3 text-sm text-gray-800 shadow-sm outline-none transition focus:border-purple-400 dark:border-white/10 dark:bg-white/10 dark:text-gray-100"
          >
            {copy.options.projectType.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
          {copy.budget}
        </label>
        <select
          name="budget"
          className="mt-2 w-full rounded-2xl border border-white/20 bg-white/70 px-4 py-3 text-sm text-gray-800 shadow-sm outline-none transition focus:border-purple-400 dark:border-white/10 dark:bg-white/10 dark:text-gray-100"
        >
          {copy.options.budget.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
          {copy.details}
        </label>
        <textarea
          required
          name="details"
          rows={5}
          className="mt-2 w-full rounded-2xl border border-white/20 bg-white/70 px-4 py-3 text-sm text-gray-800 shadow-sm outline-none transition focus:border-purple-400 dark:border-white/10 dark:bg-white/10 dark:text-gray-100"
          placeholder={copy.placeholderDetails}
        />
      </div>

      {turnstileSiteKey && (
        <div>
          <div
            className="cf-turnstile"
            data-sitekey={turnstileSiteKey}
            data-language={lang}
            data-theme="dark"
          />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={state === "submitting"}
          className="rounded-full bg-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition-all duration-300 hover:scale-[1.02] disabled:opacity-60"
        >
          {state === "submitting" ? copy.sending : copy.send}
        </button>
        <a
          href="mailto:neowhisperhq@gmail.com"
          className="rounded-full border border-white/20 bg-white/70 px-6 py-3 text-sm font-semibold text-gray-800 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-gray-200"
        >
          {copy.emailDirect}
        </a>
        {message && (
          <span
            className={`text-sm font-medium ${
              state === "success" ? "text-green-600" : "text-red-500"
            }`}
          >
            {message}
          </span>
        )}
      </div>

      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-xs rounded-2xl border border-white/20 bg-white/80 px-4 py-3 text-sm font-semibold text-gray-800 shadow-lg backdrop-blur-lg dark:border-white/10 dark:bg-black/60 dark:text-gray-100">
          <div>{copy.success}</div>
          <a
            href={`/contact/success?lang=${lang}`}
            className="mt-2 inline-flex text-xs font-semibold text-purple-600 hover:text-purple-700 dark:text-purple-300"
          >
            {copy.viewConfirmation}
          </a>
        </div>
      )}
    </form>
  );
}
