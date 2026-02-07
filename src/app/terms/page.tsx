import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | NeoWhisper",
  description:
    "Terms of Service for using NeoWhisper's website, content, and contact channels.",
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        Terms of Service
      </h1>
      <p className="mt-4 text-sm text-gray-700 dark:text-gray-200">
        Last updated: {new Date().toISOString().slice(0, 10)}
      </p>

      <section className="mt-8 space-y-4 text-sm leading-relaxed text-gray-700 dark:text-gray-200">
        <p>
          By using this site you agree to use it lawfully and respect
          intellectual property rights. Content is provided “as is” without
          warranties. NeoWhisper is not liable for indirect or consequential
          damages arising from site use.
        </p>
        <p>
          You may not misuse contact forms or attempt to disrupt site
          operations. We may update these terms at any time; continued use means
          you accept the updated terms.
        </p>
        <p>
          For questions about these terms, contact{" "}
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
