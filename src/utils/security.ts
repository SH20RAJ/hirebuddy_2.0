/**
 * Security utilities for input validation, sanitization, and environment checks
 */

// Environment variable validation
export class EnvironmentValidator {
  private static requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_AWS_API_BASE_URL',
    'NEXT_PUBLIC_GOOGLE_CLIENT_ID'
  ];

  // Sensitive variables that should NEVER have NEXT_PUBLIC_ prefix
  private static forbiddenPublicVars = [
    'NEXT_PUBLIC_GOOGLE_CLIENT_SECRET',
    'NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY',
    'NEXT_PUBLIC_GITHUB_CLIENT_SECRET',
    'NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY',
    'NEXT_PUBLIC_STRIPE_SECRET_KEY',
    'NEXT_PUBLIC_OPENAI_API_KEY',
  ];

  static validateEnvironment(): { isValid: boolean; missingVars: string[]; exposedSecrets: string[] } {
    const missingVars: string[] = [];
    const exposedSecrets: string[] = [];
    
    // Check for required variables
    this.requiredVars.forEach(varName => {
      if (!process.env[varName]) {
        missingVars.push(varName);
      }
    });

    // Check for exposed secrets
    this.forbiddenPublicVars.forEach(varName => {
      if (process.env[varName]) {
        exposedSecrets.push(varName);
        console.error(`SECURITY RISK: ${varName} is exposed to the client! Remove NEXT_PUBLIC_ prefix and move to server-side.`);
      }
    });

    // Log security warnings in development
    if (process.env.NODE_ENV === 'development' && exposedSecrets.length > 0) {
      console.warn(`
SECURITY WARNING: The following sensitive variables are exposed to the client:
${exposedSecrets.map(v => `- ${v}`).join('\n')}

These should be moved to server-side environment without the NEXT_PUBLIC_ prefix.
      `);
    }

    return {
      isValid: missingVars.length === 0 && exposedSecrets.length === 0,
      missingVars,
      exposedSecrets
    };
  }

  static logEnvironmentStatus(): void {
    const validation = this.validateEnvironment();
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Environment Validation Status:', {
        isValid: validation.isValid,
        missingVars: validation.missingVars,
        exposedSecrets: validation.exposedSecrets
      });
    }
  }

  static getSecureEnvVar(key: string): string {
    const value = process.env[key];
    if (!value) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
  }
}

// Input validation and sanitization utilities
export class InputValidator {
  // Email validation
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // URL validation
  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // Sanitize HTML to prevent XSS
  static sanitizeHtml(input: string): string {
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  // Validate and sanitize file names
  static sanitizeFileName(fileName: string): string {
    return fileName
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_')
      .substring(0, 255);
  }

  // SQL injection prevention (basic)
  static sanitizeSqlInput(input: string): string {
    return input.replace(/['";\\]/g, '');
  }

  // Rate limiting helper
  static createRateLimiter(maxRequests: number, windowMs: number) {
    const requests = new Map<string, number[]>();
    
    return (identifier: string): boolean => {
      const now = Date.now();
      const windowStart = now - windowMs;
      
      if (!requests.has(identifier)) {
        requests.set(identifier, []);
      }
      
      const userRequests = requests.get(identifier)!;
      
      // Remove old requests outside the window
      const validRequests = userRequests.filter(time => time > windowStart);
      
      if (validRequests.length >= maxRequests) {
        return false; // Rate limit exceeded
      }
      
      validRequests.push(now);
      requests.set(identifier, validRequests);
      
      return true; // Request allowed
    };
  }
}

// CSRF protection utilities
export class CSRFProtection {
  static generateToken(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  static validateToken(token: string, expectedToken: string): boolean {
    return token === expectedToken;
  }
}

// Content Security Policy helpers
export class CSPHelper {
  static getDefaultCSP(): string {
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https:",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'"
    ].join('; ');
  }
}

// Password strength validation
export class PasswordValidator {
  static validateStrength(password: string): {
    isValid: boolean;
    score: number;
    feedback: string[];
  } {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 8) score += 1;
    else feedback.push('Password should be at least 8 characters long');

    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('Password should contain lowercase letters');

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('Password should contain uppercase letters');

    if (/\d/.test(password)) score += 1;
    else feedback.push('Password should contain numbers');

    if (/[^a-zA-Z\d]/.test(password)) score += 1;
    else feedback.push('Password should contain special characters');

    return {
      isValid: score >= 4,
      score,
      feedback
    };
  }
}

// Session security
export class SessionSecurity {
  static generateSessionId(): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  static isSessionExpired(timestamp: number, maxAge: number): boolean {
    return Date.now() - timestamp > maxAge;
  }
}

// File upload security
export class FileUploadSecurity {
  private static allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'text/plain'
  ];

  private static maxFileSize = 10 * 1024 * 1024; // 10MB

  static validateFile(file: File): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.allowedMimeTypes.includes(file.type)) {
      errors.push(`File type ${file.type} is not allowed`);
    }

    if (file.size > this.maxFileSize) {
      errors.push(`File size exceeds maximum allowed size of ${this.maxFileSize / 1024 / 1024}MB`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}