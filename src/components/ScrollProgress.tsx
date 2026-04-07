"use client";

import React, { useEffect, useState } from "react";

export function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      
      if (documentHeight > 0) {
        setProgress((scrollPosition / documentHeight) * 100);
      } else {
        setProgress(0);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial measure

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-1.5 z-50 bg-transparent">
      <div 
        className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 transition-all duration-150 ease-out shadow-[0_0_10px_rgba(168,85,247,0.5)]"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
