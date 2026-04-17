"use client";

import { useEffect } from "react";
import { slugify } from "@/lib/slugs";

/**
 * SnapResolver handles legacy anchor links (e.g. #AI_IT_Trends) 
 * by redirecting them to the modern slugified format (#ai-it-trends).
 * 
 * It runs once on mount to handle inbound links, and listens for hash changes.
 */
export function SnapResolver() {
  useEffect(() => {
    const handleLegacyHash = () => {
      const hash = window.location.hash.slice(1);
      if (!hash) return;

      // If the exact ID doesn't exist on the page
      if (!document.getElementById(hash)) {
        const decoded = decodeURIComponent(hash);
        // Normalize the legacy hash: replace underscores/dashes with spaces, then slugify
        const normalized = slugify(decoded.replace(/_/g, " ").replace(/-/g, " "));
        const target = document.getElementById(normalized);

        if (target) {
          // Smoothly scroll to the matched heading
          target.scrollIntoView({ behavior: "smooth" });
          
          // Update URL to reflect clean ID without reloading
          window.history.replaceState(null, "", `#${normalized}`);
        }
      }
    };

    // Run on mount for initial landing
    handleLegacyHash();
    
    // Listen for manual hash changes (back/forward or clicks)
    window.addEventListener("hashchange", handleLegacyHash);
    return () => window.removeEventListener("hashchange", handleLegacyHash);
  }, []);

  return null; // Side-effect only component
}
