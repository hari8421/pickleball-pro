export type AuthFieldErrors = Record<string, string>;

const USERNAME_PATTERN = /^[a-zA-Z0-9._-]{3,32}$/;

export function validateLoginFields(username: string, password: string): AuthFieldErrors {
  const errors: AuthFieldErrors = {};
  const trimmedUsername = username.trim();

  if (!trimmedUsername) errors.username = 'Username is required.';
  if (!password) errors.password = 'Password is required.';

  return errors;
}

export function validateRegistrationFields(
  username: string,
  displayName: string,
  password: string,
  confirmPassword: string
): AuthFieldErrors {
  const errors = validateLoginFields(username, password);
  const trimmedUsername = username.trim();
  const trimmedDisplayName = displayName.trim();

  if (trimmedUsername && !USERNAME_PATTERN.test(trimmedUsername)) {
    errors.username = 'Use 3–32 letters, numbers, dots, dashes, or underscores.';
  }
  if (!trimmedDisplayName) {
    errors.displayName = 'Display name is required.';
  } else if (trimmedDisplayName.length < 2) {
    errors.displayName = 'Display name must be at least 2 characters.';
  }
  if (password && password.length < 6) {
    errors.password = 'Password must be at least 6 characters.';
  }
  if (password && confirmPassword !== password) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  return errors;
}

export function getSafeReturnTo(value: string | null, fallback = '/'): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return fallback;
  return value;
}
