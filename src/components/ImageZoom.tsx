"use client";

import React, { useState } from "react";

interface ImageZoomProps {
  src: string;
  alt: string;
  title?: string;
  width?: number | string;
  height?: number | string;
  className?: string;
}

export function ImageZoom({ src, alt, title, className = "" }: ImageZoomProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        title={title}
        className={`cursor-zoom-in transition-transform duration-200 hover:scale-105 ${className}`}
        onClick={() => setIsOpen(true)}
      />

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setIsOpen(false)}
          role="dialog"
          aria-label="Image lightbox"
        >
          <div
            className="relative max-w-4xl max-h-[90vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              title={title}
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            />
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
              aria-label="Close image"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            {title && (
              <div className="absolute bottom-4 left-4 right-4 text-white text-sm bg-black/50 px-3 py-2 rounded-lg">
                {title}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
