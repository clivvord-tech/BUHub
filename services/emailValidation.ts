/**
 * Email Validation Service for BinghamHub
 * Only allows @binghamuni.edu.ng emails with exception for owner email
 */

const ALLOWED_DOMAIN = "@binghamuni.edu.ng";
const OWNER_EMAIL = "clivvord@gmail.com";

export const validateEmailDomain = (email: string): { valid: boolean; message: string } => {
  const trimmedEmail = email.trim().toLowerCase();

  // Check if owner email
  if (trimmedEmail === OWNER_EMAIL) {
    return { valid: true, message: "" };
  }

  // Check if ends with allowed domain
  if (trimmedEmail.endsWith(ALLOWED_DOMAIN)) {
    return { valid: true, message: "" };
  }

  return {
    valid: false,
    message: `Only Bingham University students and staff (@binghamuni.edu.ng) can sign up. Contact support if you believe this is an error.`,
  };
};

export const isOwnerEmail = (email: string): boolean => {
  return email.trim().toLowerCase() === OWNER_EMAIL;
};
