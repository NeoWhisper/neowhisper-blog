export function isLocalizedSlug(slug: string): boolean {
  return slug.endsWith("-ja") || slug.endsWith("-ar");
}
