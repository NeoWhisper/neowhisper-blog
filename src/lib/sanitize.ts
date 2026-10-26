/**
 * Error message sanitization utility to prevent XSS vulnerabilities.
 *
 * Admin actions return database errors that may contain malicious content
 * from other admins. This utility sanitizes error messages before returning
 * them to the client.
 */

export function sanitizeErrorMessage(message: string): string {
  let sanitized = message;

  // Remove HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, "");

  // Remove script tags and content
  sanitized = sanitized.replace(/<script\b[^>]*>.*?<\/script>/gi, "");

  // Remove event handler attributes (onclick, onerror, etc.)
  sanitized = sanitized.replace(/\s+on\w+\s*=\s*["'][^"']*["']/g, "");

  // Remove JavaScript URLs
  sanitized = sanitized.replace(/javascript:/gi, "");

  // Remove vbscript URLs
  sanitized = sanitized.replace(/vbscript:/gi, "");

  // Remove data URLs
  sanitized = sanitized.replace(/data:text\/html/gi, "");

  // Remove null bytes (potential injection)
  sanitized = sanitized.replace(/\0/g, "");

  // Remove backticks (potential template injection)
  sanitized = sanitized.replace(/`/g, "");

  // Escape HTML special characters
  sanitized = sanitized
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");

  return sanitized.trim();
}
