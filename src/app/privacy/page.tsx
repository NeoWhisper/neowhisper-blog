import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | NeoWhisper",
  description:
    "Privacy policy outlining how NeoWhisper collects, uses, and protects visitor information.",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        Privacy Policy
      </h1>
      <p className="mt-4 text-sm text-gray-700 dark:text-gray-200">
        Last updated: {new Date().toISOString().slice(0, 10)}
      </p>

      <section className="mt-8 space-y-4 text-sm leading-relaxed text-gray-700 dark:text-gray-200">
        <p>
          NeoWhisper collects only the information necessary to operate and
          improve this website, respond to inquiries, and provide requested
          services. We do not sell your personal data.
        </p>
        <p>
          Data you submit through forms (such as name, email, company, and
          project details) is used solely to respond to your inquiry. Form
          submissions are transmitted over HTTPS and delivered via our email
          provider.
        </p>
        <p>
          Analytics and advertising scripts (including Google Analytics and
          Google AdSense, when enabled) may set cookies to understand site usage
          and serve relevant content. You can disable cookies in your browser
          settings.
        </p>
        <p>
          If you have questions about this policy or want your data removed,
          contact us at{" "}
          <a
            className="text-purple-600 hover:underline dark:text-purple-300"
            href="mailto:neowhisperhq@gmail.com"
          >
            neowhisperhq@gmail.com
          </a>
          .
        </p>
      </section>
    </main>
  );
}
