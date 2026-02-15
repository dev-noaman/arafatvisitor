/**
 * QR Parser Utility
 * Parse and validate QR code payloads
 */

import { QRToken } from '../types';

/**
 * QR code payload structure
 */
export interface QRCodePayload {
  sessionId: string;
  token?: string;
  expiresAt?: string;
}

/**
 * Parse QR code payload from string
 * @param qrString - The QR code string to parse
 * @returns Parsed QR payload or null if invalid
 */
export function parseQRCode(qrString: string): QRCodePayload | null {
  try {
    // Try to parse as JSON
    const payload = JSON.parse(qrString) as QRCodePayload;

    // Validate required fields
    if (!payload.sessionId) {
      console.error('QR code missing sessionId');
      return null;
    }

    return payload;
  } catch (error) {
    console.error('Failed to parse QR code:', error);
    return null;
  }
}

/**
 * Validate QR code payload
 * @param payload - The parsed QR payload to validate
 * @returns True if valid, false otherwise
 */
export function validateQRPayload(payload: QRCodePayload): boolean {
  // Validate sessionId format (UUID)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(payload.sessionId)) {
    console.error('Invalid sessionId format');
    return false;
  }

  // Validate expiry time if present
  if (payload.expiresAt) {
    const expiryDate = new Date(payload.expiresAt);
    const now = new Date();

    if (isNaN(expiryDate.getTime())) {
      console.error('Invalid expiry date');
      return false;
    }

    if (expiryDate < now) {
      console.error('QR code has expired');
      return false;
    }
  }

  return true;
}

/**
 * Parse and validate QR code in one step
 * @param qrString - The QR code string to parse and validate
 * @returns Valid QRToken or null if invalid
 */
export function parseAndValidateQRCode(qrString: string): QRToken | null {
  const payload = parseQRCode(qrString);

  if (!payload) {
    return null;
  }

  if (!validateQRPayload(payload)) {
    return null;
  }

  return {
    sessionId: payload.sessionId,
    token: payload.token,
    expiresAt: payload.expiresAt || '',
  };
}

/**
 * Check if QR code is expired
 * @param expiresAt - The expiry date string
 * @returns True if expired, false otherwise
 */
export function isQRCodeExpired(expiresAt: string): boolean {
  const expiryDate = new Date(expiresAt);
  const now = new Date();
  return expiryDate < now;
}

/**
 * Format QR code payload for display
 * @param payload - The QR payload to format
 * @returns Formatted string for display
 */
export function formatQRPayload(payload: QRCodePayload): string {
  return JSON.stringify(payload, null, 2);
}
