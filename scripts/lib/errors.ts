/**
 * Error classification and structured logging (Phase 3)
 * Guard clauses, early returns, functional error handling
 */

export type ErrorSeverity = "fatal" | "retryable" | "warning" | "info";

export type ClassifiedError = {
  readonly message: string;
  readonly severity: ErrorSeverity;
  readonly context?: Record<string, unknown>;
  readonly recoverable: boolean;
};

// Error patterns for classification (data-driven, not nested ifs)
const RETRYABLE_PATTERNS = [
  /rate.?limit/i,
  /timeout/i,
  /network/i,
  /econnrefused/i,
  /socket hang up/i,
  /model loading was stopped/i,
  /insufficient system resources/i,
  /temporarily unavailable/i,
];

const FATAL_PATTERNS = [
  /invalid.?api.?key/i,
  /authentication failed/i,
  /not found/i,
  /does not exist/i,
  /invalid request/i,
];

/**
 * Classify error by severity using pattern matching (functional, not nested ifs)
 */
export const classifyError = (
  error: unknown,
  context?: Record<string, unknown>,
): ClassifiedError => {
  const message = error instanceof Error ? error.message : String(error);
  const lowerMessage = message.toLowerCase();

  // Pattern matching with early return (guard clause style)
  const isRetryable = RETRYABLE_PATTERNS.some((pattern) =>
    pattern.test(lowerMessage),
  );
  if (isRetryable) {
    return {
      message,
      severity: "retryable",
      context,
      recoverable: true,
    };
  }

  const isFatal = FATAL_PATTERNS.some((pattern) => pattern.test(lowerMessage));
  if (isFatal) {
    return {
      message,
      severity: "fatal",
      context,
      recoverable: false,
    };
  }

  // Default: warning (recoverable but shouldn't retry blindly)
  return {
    message,
    severity: "warning",
    context,
    recoverable: true,
  };
};

// Structured log entry
export type LogEntry = {
  readonly timestamp: string;
  readonly level: "error" | "warn" | "info" | "debug";
  readonly message: string;
  readonly component: string;
  readonly operation: string;
  readonly context?: Record<string, unknown>;
  readonly error?: ClassifiedError;
};

/**
 * Structured logger for production observability
 */
export const createLogger = (component: string) => ({
  error: (message: string, error: unknown, context?: Record<string, unknown>) => {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: "error",
      message,
      component,
      operation: context?.operation as string || "unknown",
      context,
      error: classifyError(error, context),
    };
    console.error(JSON.stringify(entry));
  },

  warn: (message: string, context?: Record<string, unknown>) => {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: "warn",
      message,
      component,
      operation: context?.operation as string || "unknown",
      context,
    };
    console.warn(JSON.stringify(entry));
  },

  info: (message: string, context?: Record<string, unknown>) => {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: "info",
      message,
      component,
      operation: context?.operation as string || "unknown",
      context,
    };
    console.log(JSON.stringify(entry));
  },

  debug: (message: string, context?: Record<string, unknown>) => {
    if (process.env.DEBUG) {
      const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level: "debug",
        message,
        component,
        operation: context?.operation as string || "unknown",
        context,
      };
      console.log(JSON.stringify(entry));
    }
  },
});

export type Logger = ReturnType<typeof createLogger>;
