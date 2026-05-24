/**
 * Input Sanitization Service
 * Prevents XSS attacks and normalizes user input
 */

// HTML entities to escape
const HTML_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
  "/": "&#x2F;",
};

/**
 * Escapes HTML special characters to prevent XSS
 */
export const escapeHtml = (text: string): string => {
  if (!text) return "";
  return text.replace(/[&<>"'\/]/g, (char) => HTML_ENTITIES[char]);
};

/**
 * Sanitizes tweet/post content
 * - Trims whitespace
 * - Escapes HTML
 * - Limits length
 */
export const sanitizeTweetContent = (content: string, maxLength: number = 280): string => {
  if (!content) return "";
  const trimmed = content.trim();
  const escaped = escapeHtml(trimmed);
  return escaped.substring(0, maxLength);
};

/**
 * Sanitizes username
 * - Allows only alphanumeric, underscore, dash
 * - Max 30 characters
 */
export const sanitizeUsername = (username: string): string => {
  if (!username) return "";
  const trimmed = username.trim().toLowerCase();
  const sanitized = trimmed.replace(/[^a-z0-9_-]/g, "");
  return sanitized.substring(0, 30);
};

/**
 * Sanitizes display name
 * - Trims whitespace
 * - Escapes HTML
 * - Max 50 characters
 */
export const sanitizeDisplayName = (name: string, maxLength: number = 50): string => {
  if (!name) return "";
  const trimmed = name.trim();
  const escaped = escapeHtml(trimmed);
  return escaped.substring(0, maxLength);
};

/**
 * Validates email domain
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Sanitizes bio/description
 */
export const sanitizeBio = (bio: string, maxLength: number = 160): string => {
  if (!bio) return "";
  const trimmed = bio.trim();
  const escaped = escapeHtml(trimmed);
  return escaped.substring(0, maxLength);
};
