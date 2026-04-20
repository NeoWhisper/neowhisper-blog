/**
 * Unit tests for error classification (Phase 4)
 * Tests functional error pattern matching
 */

import { classifyError } from "./errors";

describe("classifyError", () => {
  describe("retryable errors", () => {
    it("classifies rate limit errors as retryable", () => {
      const error = new Error("rate limit exceeded");
      const result = classifyError(error);
      expect(result.severity).toBe("retryable");
      expect(result.recoverable).toBe(true);
    });

    it("classifies timeout errors as retryable", () => {
      const error = new Error("Request timeout");
      const result = classifyError(error);
      expect(result.severity).toBe("retryable");
      expect(result.recoverable).toBe(true);
    });

    it("classifies network errors as retryable", () => {
      const error = new Error("ECONNREFUSED connection refused");
      const result = classifyError(error);
      expect(result.severity).toBe("retryable");
      expect(result.recoverable).toBe(true);
    });

    it("classifies model loading errors as retryable", () => {
      const error = new Error(
        "model loading was stopped due to insufficient system resources",
      );
      const result = classifyError(error);
      expect(result.severity).toBe("retryable");
      expect(result.recoverable).toBe(true);
    });
  });

  describe("fatal errors", () => {
    it("classifies invalid API key as fatal", () => {
      const error = new Error("Invalid API key");
      const result = classifyError(error);
      expect(result.severity).toBe("fatal");
      expect(result.recoverable).toBe(false);
    });

    it("classifies authentication failures as fatal", () => {
      const error = new Error("Authentication failed");
      const result = classifyError(error);
      expect(result.severity).toBe("fatal");
      expect(result.recoverable).toBe(false);
    });

    it("classifies not found as fatal", () => {
      const error = new Error("model does not exist");
      const result = classifyError(error);
      expect(result.severity).toBe("fatal");
      expect(result.recoverable).toBe(false);
    });
  });

  describe("warning errors", () => {
    it("classifies unknown errors as warning", () => {
      const error = new Error("Something went wrong");
      const result = classifyError(error);
      expect(result.severity).toBe("warning");
      expect(result.recoverable).toBe(true);
    });

    it("handles non-Error types", () => {
      const result = classifyError("string error");
      expect(result.severity).toBe("warning");
      expect(result.message).toBe("string error");
    });
  });

  describe("context preservation", () => {
    it("preserves context in result", () => {
      const context = { operation: "test", attempt: 1 };
      const error = new Error("timeout");
      const result = classifyError(error, context);
      expect(result.context).toEqual(context);
    });
  });
});
