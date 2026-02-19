export function getSafeNextPath(value: string | null): string {
    if (!value || !value.startsWith("/") || value.startsWith("//")) return "/admin";
    return value;
}
