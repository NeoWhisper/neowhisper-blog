"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function AuthCodeRedirect() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (!searchParams) return;
    if (pathname === "/auth/callback") return;

    const code = searchParams.get("code");
    const error = searchParams.get("error");
    const errorCode = searchParams.get("error_code");

    if (!code && !error && !errorCode) return;

    const next = searchParams.get("next") ?? "/admin";
    const params = new URLSearchParams();

    if (code) params.set("code", code);
    if (error) params.set("error", error);
    if (errorCode) params.set("error_code", errorCode);
    params.set("next", next);

    router.replace(`/auth/callback?${params.toString()}`);
  }, [pathname, searchParams, router]);

  return null;
}

