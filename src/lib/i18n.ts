export const supportedLangs = ["en", "ja", "ar"] as const;
export type SupportedLang = (typeof supportedLangs)[number];

export function normalizeLang(value?: string | null): SupportedLang {
  if (value === "ja" || value === "ar") return value;
  return "en";
}

export function withLang(href: string, lang: SupportedLang) {
  const hasQuery = href.includes("?");
  const hasHash = href.includes("#");

  if (hasHash) {
    const [base, hash] = href.split("#");
    const sep = base.includes("?") ? "&" : "?";
    return `${base}${sep}lang=${lang}#${hash}`;
  }

  return `${href}${hasQuery ? "&" : "?"}lang=${lang}`;
}
