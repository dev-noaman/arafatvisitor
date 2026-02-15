/**
 * Validation Utility
 * Form validation rules and helpers
 */

/**
 * Email validation regex
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Phone validation regex (international format)
 */
const PHONE_REGEX = /^\+?[\d\s-]{8,15}$/;

/**
 * UUID validation regex
 */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate email address
 * @param email - Email to validate
 * @returns Validation result
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim() === '') {
    return { isValid: false, error: 'Email is required' };
  }

  if (!EMAIL_REGEX.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  return { isValid: true };
}

/**
 * Validate phone number
 * @param phone - Phone number to validate
 * @returns Validation result
 */
export function validatePhone(phone: string): ValidationResult {
  if (!phone || phone.trim() === '') {
    return { isValid: false, error: 'Phone number is required' };
  }

  if (!PHONE_REGEX.test(phone)) {
    return { isValid: false, error: 'Please enter a valid phone number' };
  }

  return { isValid: true };
}

/**
 * Validate password
 * @param password - Password to validate
 * @param minLength - Minimum password length (default: 6)
 * @returns Validation result
 */
export function validatePassword(password: string, minLength: number = 6): ValidationResult {
  if (!password || password.trim() === '') {
    return { isValid: false, error: 'Password is required' };
  }

  if (password.length < minLength) {
    return { isValid: false, error: `Password must be at least ${minLength} characters` };
  }

  return { isValid: true };
}

/**
 * Validate password confirmation
 * @param password - Password to confirm
 * @param confirmPassword - Confirmation password
 * @returns Validation result
 */
export function validatePasswordConfirmation(
  password: string,
  confirmPassword: string
): ValidationResult {
  if (!confirmPassword || confirmPassword.trim() === '') {
    return { isValid: false, error: 'Please confirm your password' };
  }

  if (password !== confirmPassword) {
    return { isValid: false, error: 'Passwords do not match' };
  }

  return { isValid: true };
}

/**
 * Validate required field
 * @param value - Value to validate
 * @param fieldName - Name of the field for error message
 * @returns Validation result
 */
export function validateRequired(
  value: string,
  fieldName: string = 'This field'
): ValidationResult {
  if (!value || value.trim() === '') {
    return { isValid: false, error: `${fieldName} is required` };
  }

  return { isValid: true };
}

/**
 * Validate minimum length
 * @param value - Value to validate
 * @param minLength - Minimum length
 * @param fieldName - Name of the field for error message
 * @returns Validation result
 */
export function validateMinLength(
  value: string,
  minLength: number,
  fieldName: string = 'This field'
): ValidationResult {
  if (!value || value.trim() === '') {
    return { isValid: false, error: `${fieldName} is required` };
  }

  if (value.length < minLength) {
    return { isValid: false, error: `${fieldName} must be at least ${minLength} characters` };
  }

  return { isValid: true };
}

/**
 * Validate maximum length
 * @param value - Value to validate
 * @param maxLength - Maximum length
 * @param fieldName - Name of the field for error message
 * @returns Validation result
 */
export function validateMaxLength(
  value: string,
  maxLength: number,
  fieldName: string = 'This field'
): ValidationResult {
  if (value.length > maxLength) {
    return { isValid: false, error: `${fieldName} must not exceed ${maxLength} characters` };
  }

  return { isValid: true };
}

/**
 * Validate UUID format
 * @param uuid - UUID to validate
 * @returns Validation result
 */
export function validateUUID(uuid: string): ValidationResult {
  if (!uuid || uuid.trim() === '') {
    return { isValid: false, error: 'UUID is required' };
  }

  if (!UUID_REGEX.test(uuid)) {
    return { isValid: false, error: 'Invalid UUID format' };
  }

  return { isValid: true };
}

/**
 * Validate future date
 * @param dateString - Date string to validate
 * @param fieldName - Name of the field for error message
 * @returns Validation result
 */
export function validateFutureDate(
  dateString: string,
  fieldName: string = 'Date'
): ValidationResult {
  if (!dateString || dateString.trim() === '') {
    return { isValid: false, error: `${fieldName} is required` };
  }

  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return { isValid: false, error: 'Invalid date format' };
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0); // Reset to start of today

  if (date < now) {
    return { isValid: false, error: `${fieldName} must be in the future` };
  }

  return { isValid: true };
}

/**
 * Validate URL
 * @param url - URL to validate
 * @returns Validation result
 */
export function validateURL(url: string): ValidationResult {
  if (!url || url.trim() === '') {
    return { isValid: false, error: 'URL is required' };
  }

  try {
    new URL(url);
    return { isValid: true };
  } catch {
    return { isValid: false, error: 'Please enter a valid URL' };
  }
}

/**
 * Validate form object
 * @param formData - Form data object
 * @param rules - Validation rules object
 * @returns Object with validation results for each field
 */
export function validateForm<T extends Record<string, any>>(
  formData: T,
  rules: Partial<Record<keyof T, (value: any) => ValidationResult>>
): Record<keyof T, ValidationResult> {
  const results = {} as Record<keyof T, ValidationResult>;

  for (const key in rules) {
    const rule = rules[key];
    if (rule) {
      results[key] = rule(formData[key]);
    }
  }

  return results;
}

/**
 * Check if form has any errors
 * @param validationResults - Validation results object
 * @returns True if any errors, false otherwise
 */
export function hasValidationErrors<T extends Record<string, any>>(
  validationResults: Record<keyof T, ValidationResult>
): boolean {
  return Object.values(validationResults).some((result) => !result.isValid);
}
