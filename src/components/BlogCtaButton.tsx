"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type MouseEvent } from "react";

interface BlogCtaButtonProps {
  href?: string;
  label?: string;
  lang?: string;
}

export default function BlogCtaButton({
  href = "/blog",
  label = "Visit the Blog",
  lang,
}: BlogCtaButtonProps) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const buttonRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    const target = buttonRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (isNavigating) return;
    setIsNavigating(true);

    const target = lang ? `${href}?lang=${lang}` : href;
    const nav = () => router.push(target);

    // Subtle page transition when supported
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const startViewTransition = (document as any)?.startViewTransition;
    if (typeof startViewTransition === "function") {
      event.preventDefault();
      startViewTransition(nav);
      return;
    }

    // Let the browser handle navigation for reliability
  };

  return (
    <Link
      href={lang ? `${href}?lang=${lang}` : href}
      onClick={handleClick}
      ref={buttonRef}
      className={`group relative inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition-all duration-300 hover:scale-[1.03] hover:shadow-purple-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/60 ${
        isVisible ? "animate-blog-cta" : ""
      }`}
      aria-label={label}
    >
      <span className="relative z-10">{label}</span>
      <span className="relative z-10 text-base transition-transform duration-300 group-hover:translate-x-0.5">→</span>
      <span className="pointer-events-none absolute inset-0 rounded-full bg-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <span className="pointer-events-none absolute -inset-1 rounded-full bg-pink-500/30 blur-lg opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
    </Link>
  );
}
