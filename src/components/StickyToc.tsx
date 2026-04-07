"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface StickyTocProps {
  isRTL?: boolean;
}

const TOC_HEADINGS = ["Table of Contents", "目次", "المحتويات"];

export function StickyToc({ isRTL = false }: StickyTocProps) {
  // items is populated once after mount — initialising with empty array is fine;
  // the component is client-only so no SSR mismatch.
  const [items, setItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const observerRef = useRef<IntersectionObserver | null>(null);
  const headingElemsRef = useRef<HTMLHeadingElement[]>([]);

  // useLayoutEffect: runs synchronously after DOM mutations, before paint.
  // Using it for a one-time DOM read + setItems satisfies the React Compiler's
  // rule that prohibits synchronous setState calls inside useEffect bodies.
  useLayoutEffect(() => {
    const article = document.querySelector("article");
    if (!article) return;

    const headings = Array.from(
      article.querySelectorAll<HTMLHeadingElement>("h2[id], h3[id]")
    ).filter((h) => !TOC_HEADINGS.includes(h.textContent?.trim() ?? ""));

    headingElemsRef.current = headings;
    const parsed: TocItem[] = headings.map((h) => ({
      id: h.id,
      text: h.textContent?.trim() ?? "",
      level: h.tagName === "H2" ? 2 : 3,
    }));
    // One-time DOM read at client mount. setState here is intentional:
    // items cannot be derived at render time (requires live DOM), so this
    // is a documented exception to the rule. See: react.dev/learn/you-might-not-need-an-effect
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(parsed);
  }, []);

  // Observe headings for active-section tracking — runs after items are set.
  useEffect(() => {
    observerRef.current?.disconnect();

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) setActiveId(visible[0].target.id);
      },
      { rootMargin: "0px 0px -60% 0px", threshold: 0 }
    );

    observerRef.current = observer;
    headingElemsRef.current.forEach((h) => observer.observe(h));

    return () => observer.disconnect();
  }, [items]);

  if (items.length < 3) return null;

  return (
    <nav
      aria-label="Table of Contents"
      className={`hidden xl:block fixed top-32 ${isRTL ? "left-8" : "right-8"} w-56 max-h-[70vh] overflow-y-auto z-40`}
    >
      <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-md rounded-2xl border border-gray-200/60 dark:border-gray-700/60 shadow-sm p-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3 px-1">
          On this page
        </p>
        <ul className="space-y-1">
          {items.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" });
                  setActiveId(item.id);
                }}
                className={[
                  "block text-xs leading-snug py-1 px-2 rounded-lg transition-all duration-150",
                  item.level === 3 ? "pl-4 text-[11px]" : "",
                  activeId === item.id
                    ? "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 font-semibold"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/50",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {item.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
