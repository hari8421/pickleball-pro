import { describe, expect, it } from 'vitest';
import { getSafeReturnTo, validateLoginFields, validateRegistrationFields } from './authValidation';

describe('auth validation', () => {
  it('requires login credentials', () => {
    expect(validateLoginFields('', '')).toEqual({
      username: 'Username is required.',
      password: 'Password is required.',
    });
  });

  it('rejects weak registration fields', () => {
    const errors = validateRegistrationFields('bad name', 'A', '123', '456');
    expect(errors.username).toContain('Use 3–32');
    expect(errors.displayName).toBe('Display name must be at least 2 characters.');
    expect(errors.password).toBe('Password must be at least 6 characters.');
    expect(errors.confirmPassword).toBe('Passwords do not match.');
  });

  it('allows internal redirects but blocks external redirects', () => {
    expect(getSafeReturnTo('/games?filter=mine')).toBe('/games?filter=mine');
    expect(getSafeReturnTo('//example.com', '/dashboard')).toBe('/dashboard');
    expect(getSafeReturnTo('https://example.com', '/dashboard')).toBe('/dashboard');
  });
});
