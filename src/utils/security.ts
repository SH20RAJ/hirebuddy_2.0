/**
 * Security utilities for input validation, sanitization, and environment checks
 */

// Environment variable validation
export class EnvironmentValidator {
  private static requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_OPENAI_API_KEY',
    'VITE_AWS_API_BASE_URL',
    'VITE_GOOGLE_CLIENT_ID'
  ];

  static validateEnvironment(): { isValid: boolean; missingVars: string[] } {
    const missingVars: string[] = [];
    
    this.requiredVars.forEach(varName => {
      if (!import.meta.env[varName]) {
        missingVars.push(varName);
      }
    });

    return {
      isValid: missingVars.length === 0,
      missingVars
    };
  }

  static getSecureEnvVar(key: string): string {
    const value = import.meta.env[key];
    if (!value) {
      throw new Error(`Required environment variable ${key} is not configured`);
    }
    return value;
  }
}

// Input sanitization
export class InputSanitizer {
  /**
   * Sanitize HTML input to prevent XSS attacks
   */
  static sanitizeHtml(input: string): string {
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Sanitize email input
   */
  static sanitizeEmail(email: string): string {
    return email.toLowerCase().trim();
  }

  /**
   * Sanitize URL input
   */
  static sanitizeUrl(url: string): string {
    try {
      const parsedUrl = new URL(url);
      // Only allow http and https protocols
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new Error('Invalid URL protocol');
      }
      return parsedUrl.toString();
    } catch {
      throw new Error('Invalid URL format');
    }
  }

  /**
   * Remove potentially dangerous characters from general text input
   */
  static sanitizeText(text: string): string {
    return text
      .trim()
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, ''); // Remove event handlers
  }
}

// Input validation
export class InputValidator {
  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  /**
   * Validate URL format
   */
  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate that a string doesn't contain potential injection attacks
   */
  static isSafeText(text: string): boolean {
    const dangerousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+=/i,
      /<iframe/i,
      /<object/i,
      /<embed/i,
      /eval\(/i,
      /Function\(/i
    ];

    return !dangerousPatterns.some(pattern => pattern.test(text));
  }

  /**
   * Validate API response structure
   */
  static validateApiResponse(response: any, expectedFields: string[]): boolean {
    if (!response || typeof response !== 'object') {
      return false;
    }

    return expectedFields.every(field => field in response);
  }
}

// Security headers and CSP
export class SecurityHeaders {
  /**
   * Get recommended security headers for API requests
   */
  static getSecureHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    };
  }
}



// Error handling without information leakage
export class SecureErrorHandler {
  /**
   * Create user-safe error message without exposing sensitive information
   */
  static createSafeError(error: any, userMessage?: string): Error {
    // Log the full error for debugging (but not to user)
    console.error('Detailed error:', error);

    // Return sanitized error for user
    const safeMessage = userMessage || 'An error occurred. Please try again.';
    return new Error(safeMessage);
  }

  /**
   * Check if error message is safe to show to users
   */
  static isSafeErrorMessage(message: string): boolean {
    const sensitivePatterns = [
      /api[_-]?key/i,
      /secret/i,
      /token/i,
      /password/i,
      /internal server error/i,
      /database/i,
      /connection/i,
      /authentication failed/i
    ];

    return !sensitivePatterns.some(pattern => pattern.test(message));
  }
} 