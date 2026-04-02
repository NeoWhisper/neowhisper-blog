import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { isAllowedAdminEmail } from "@/lib/admin-auth";
import { SITE_ORIGINS } from "@/lib/site-config";

function hasSupabaseEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

function getSupabaseOrigin(): string | null {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!rawUrl) return null;

  try {
    return new URL(rawUrl).origin;
  } catch {
    return null;
  }
}

function buildCsp({
  nonce,
  isDev,
  supabaseOrigin,
}: {
  nonce: string;
  isDev: boolean;
  supabaseOrigin: string | null;
}) {
  const connectSrc = [
    "'self'",
    "https://www.google-analytics.com",
    "https://region1.google-analytics.com",
    "https://www.googletagmanager.com",
    "https://pagead2.googlesyndication.com",
    "https://googleads.g.doubleclick.net",
    "https://adtrafficquality.google",
    "https://ep1.adtrafficquality.google",
    "https://ep2.adtrafficquality.google",
    "https://fundingchoicesmessages.google.com",
    "https://challenges.cloudflare.com",
  ];

  if (supabaseOrigin) {
    connectSrc.push(supabaseOrigin);
  }
  if (isDev) {
    connectSrc.push("ws://127.0.0.1:*", "ws://localhost:*");
  }

  const scriptSrc = [
    "'self'",
    `'nonce-${nonce}'`,
    "'strict-dynamic'",
    "https://www.googletagmanager.com",
    "https://www.google-analytics.com",
    "https://pagead2.googlesyndication.com",
    "https://fundingchoicesmessages.google.com",
    "https://challenges.cloudflare.com",
    "https://tpc.googlesyndication.com",
    "https://googleads.g.doubleclick.net",
  ];
  if (isDev) {
    scriptSrc.push("'unsafe-eval'");
  }

  return [
    "default-src 'self'",
    `script-src ${scriptSrc.join(" ")}`,
    `style-src 'self' 'nonce-${nonce}'`,
    "style-src-attr 'unsafe-inline'",
    "img-src 'self' data: blob: https://www.google-analytics.com https://pagead2.googlesyndication.com https://tpc.googlesyndication.com https://googleads.g.doubleclick.net https://www.googletagmanager.com https://www.gstatic.com https://www.google.com https://adtrafficquality.google https://ep1.adtrafficquality.google https://ep2.adtrafficquality.google",
    "font-src 'self' data: https://fonts.gstatic.com",
    `connect-src ${connectSrc.join(" ")}`,
    "frame-src 'self' https://challenges.cloudflare.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://fundingchoicesmessages.google.com https://adtrafficquality.google https://ep1.adtrafficquality.google https://ep2.adtrafficquality.google https://www.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "manifest-src 'self'",
    "worker-src 'self' blob:",
    "upgrade-insecure-requests",
  ].join("; ");
}

function applySecurityHeaders(response: NextResponse, csp: string) {
  const reportOnly = process.env.CSP_REPORT_ONLY === "true";
  const cspHeaderName = reportOnly
    ? "Content-Security-Policy-Report-Only"
    : "Content-Security-Policy";
  const alternateCspHeaderName = reportOnly
    ? "Content-Security-Policy"
    : "Content-Security-Policy-Report-Only";

  response.headers.set(cspHeaderName, csp);
  response.headers.delete(alternateCspHeaderName);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );
}

function applyMetadataCorsFix(request: NextRequest, response: NextResponse) {
  const pathname = request.nextUrl.pathname;
  if (pathname !== "/robots.txt" && pathname !== "/sitemap.xml") {
    return;
  }

  const allowedOrigins = new Set(SITE_ORIGINS);
  const requestOrigin = request.headers.get("origin");

  if (requestOrigin && allowedOrigins.has(requestOrigin)) {
    response.headers.set("Access-Control-Allow-Origin", requestOrigin);
    const vary = response.headers.get("Vary");
    response.headers.set("Vary", vary ? `${vary}, Origin` : "Origin");
    return;
  }

  // Some metadata routes can re-add a permissive ACAO later if absent.
  // Keep ACAO explicitly empty to avoid wildcard fallback while denying CORS.
  response.headers.set("Access-Control-Allow-Origin", "");
  const vary = response.headers.get("Vary");
  response.headers.set("Vary", vary ? `${vary}, Origin` : "Origin");
}

function addNonceToRequestHeaders(
  request: NextRequest,
  nonce: string,
): Headers {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  return requestHeaders;
}

function redirectWithSecurityHeaders({
  request,
  url,
  csp,
}: {
  request: NextRequest;
  url: URL;
  csp: string;
}) {
  const redirectResponse = NextResponse.redirect(url);
  applySecurityHeaders(redirectResponse, csp);
  applyMetadataCorsFix(request, redirectResponse);
  return redirectResponse;
}

export async function proxy(request: NextRequest) {
  const isDev = process.env.NODE_ENV === "development";
  const nonce = crypto.randomUUID().replace(/-/g, "");
  const csp = buildCsp({
    nonce,
    isDev,
    supabaseOrigin: getSupabaseOrigin(),
  });

  const response = NextResponse.next({
    request: {
      headers: addNonceToRequestHeaders(request, nonce),
    },
  });
  applySecurityHeaders(response, csp);
  applyMetadataCorsFix(request, response);

  if (!request.nextUrl.pathname.startsWith("/admin")) {
    return response;
  }

  if (!hasSupabaseEnv()) {
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (!user || error) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set(
      "next",
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
    );
    return redirectWithSecurityHeaders({ request, url: loginUrl, csp });
  }

  if (!isAllowedAdminEmail(user.email)) {
    return redirectWithSecurityHeaders({
      request,
      url: new URL("/", request.url),
      csp,
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
