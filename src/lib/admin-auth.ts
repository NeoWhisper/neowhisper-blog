function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map(normalizeEmail)
    .filter(Boolean);
}

export function isAllowedAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const allowlist = getAdminEmails();
  if (allowlist.length === 0) return false;
  return allowlist.includes(normalizeEmail(email));
}
