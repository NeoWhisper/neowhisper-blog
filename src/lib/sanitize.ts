/**
 * Error message handling for admin actions.
 *
 * Admin actions return database errors that may reveal internal details
 * (table names, constraint names, schema). These should be logged on the
 * server but NOT returned to the client.
 *
 * This module provides generic error messages that don't expose internals.
 */

// Generic messages that don't reveal internal details
// Keep these keys aligned with admin action error cases.
const GENERIC_MESSAGES = {
  groupFetchError: "Failed to check translation group.",
  createGroupError: "Failed to create translation group.",
  createPostError: "Failed to create post.",
  statusUpdateError: "Failed to update post status.",
  deleteError: "Failed to delete post.",
  groupUpdateError: "Failed to update translation group.",
  detailUpdateError: "Failed to update post.",
  postNotFoundError: "Post not found.",
  slugInvalidError: "Slug is invalid.",
  accessDenied: "Access denied.",
  notAuthenticated: "Not authenticated.",
  invalidRequest: "Invalid request.",
  emailError: "Invalid email address.",
  emailServiceError: "Email service unavailable.",
  turnstileError: "Verification failed.",
};

/**
 * Returns a generic error message that doesn't reveal internal details.
 * Error details are logged separately by the calling admin action.
 *
 * @param key - Identifier for the generic message
 * @returns A safe error message
 */
export { GENERIC_MESSAGES };

export function getGenericErrorMessage(key: keyof typeof GENERIC_MESSAGES): string {
  return GENERIC_MESSAGES[key];
}
