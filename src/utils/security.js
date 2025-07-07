// Security configuration and helpers
export const SecurityConfig = {
  // Content Security Policy
  CSP: {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", "https://unpkg.com"],
    'style-src': ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    'font-src': ["'self'", "https://fonts.gstatic.com"],
    'img-src': ["'self'", "data:", "https:"],
    'connect-src': ["'self'", "https://*.supabase.co", "wss://*.supabase.co"]
  },

  // Input validation patterns
  VALIDATION: {
    userId: /^[a-zA-Z0-9_-]{3,50}$/,
    date: /^\d{4}-\d{2}-\d{2}$/,
    hour: /^HR[1-9]|HR1[0-2]$/,
    fileName: /^[a-zA-Z0-9._-]{1,255}$/
  },

  // Rate limiting
  RATE_LIMITS: {
    fileUpload: { requests: 10, windowMs: 60000 }, // 10 uploads per minute
    analysis: { requests: 30, windowMs: 60000 },   // 30 analysis per minute
    dataFetch: { requests: 100, windowMs: 60000 }  // 100 data fetch per minute
  }
};

// Input sanitization functions
export const sanitizeInput = {
  // Sanitize user ID
  userId: (input) => {
    if (typeof input !== 'string') return null;
    const cleaned = input.trim().toLowerCase();
    return SecurityConfig.VALIDATION.userId.test(cleaned) ? cleaned : null;
  },

  // Sanitize date input
  date: (input) => {
    if (typeof input !== 'string') return null;
    const cleaned = input.trim();
    if (!SecurityConfig.VALIDATION.date.test(cleaned)) return null;
    
    // Additional date validation
    const date = new Date(cleaned);
    return isNaN(date.getTime()) ? null : cleaned;
  },

  // Sanitize hour input
  hour: (input) => {
    if (typeof input !== 'string') return null;
    const cleaned = input.trim().toUpperCase();
    return SecurityConfig.VALIDATION.hour.test(cleaned) ? cleaned : null;
  },

  // Sanitize file name
  fileName: (input) => {
    if (typeof input !== 'string') return null;
    const cleaned = input.trim();
    return SecurityConfig.VALIDATION.fileName.test(cleaned) ? cleaned : null;
  },

  // Generic XSS prevention
  text: (input) => {
    if (typeof input !== 'string') return '';
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocols
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }
};

// File upload security
export const FileUploadSecurity = {
  // Allowed file types
  ALLOWED_TYPES: [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
    'text/csv' // .csv
  ],

  // Maximum file size (5MB)
  MAX_SIZE: 5 * 1024 * 1024,

  // Validate file
  validateFile: (file) => {
    const errors = [];

    if (!file) {
      errors.push('No file provided');
      return { valid: false, errors };
    }

    // Check file size
    if (file.size > FileUploadSecurity.MAX_SIZE) {
      errors.push(`File size too large. Maximum: ${FileUploadSecurity.MAX_SIZE / 1024 / 1024}MB`);
    }

    // Check file type
    if (!FileUploadSecurity.ALLOWED_TYPES.includes(file.type)) {
      errors.push(`Invalid file type. Allowed: Excel (.xlsx, .xls) or CSV (.csv)`);
    }

    // Check file name
    if (!sanitizeInput.fileName(file.name)) {
      errors.push('Invalid file name. Use only letters, numbers, dots, hyphens, and underscores');
    }

    return { valid: errors.length === 0, errors };
  }
};

// Rate limiting utility
export class RateLimiter {
  constructor() {
    this.requests = new Map();
  }

  // Check if request is allowed
  isAllowed(key, limit) {
    const now = Date.now();
    const windowStart = now - limit.windowMs;
    
    if (!this.requests.has(key)) {
      this.requests.set(key, []);
    }

    const userRequests = this.requests.get(key);
    
    // Remove old requests outside the window
    while (userRequests.length > 0 && userRequests[0] < windowStart) {
      userRequests.shift();
    }

    // Check if under limit
    if (userRequests.length >= limit.requests) {
      return false;
    }

    // Add current request
    userRequests.push(now);
    return true;
  }

  // Get remaining requests
  getRemaining(key, limit) {
    const now = Date.now();
    const windowStart = now - limit.windowMs;
    
    if (!this.requests.has(key)) {
      return limit.requests;
    }

    const userRequests = this.requests.get(key)
      .filter(timestamp => timestamp > windowStart);
    
    return Math.max(0, limit.requests - userRequests.length);
  }
}

// Environment variable validation
export const validateEnvConfig = () => {
  const required = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
  const missing = [];

  required.forEach(key => {
    if (!import.meta.env[key]) {
      missing.push(key);
    }
  });

  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing);
    return false;
  }

  return true;
};

// Secure localStorage wrapper
export const secureStorage = {
  set: (key, value) => {
    try {
      // Validate key
      const sanitizedKey = sanitizeInput.text(key);
      if (!sanitizedKey) throw new Error('Invalid storage key');

      // Serialize and store
      const serialized = JSON.stringify(value);
      localStorage.setItem(sanitizedKey, serialized);
      return true;
    } catch (error) {
      console.error('Storage error:', error);
      return false;
    }
  },

  get: (key) => {
    try {
      const sanitizedKey = sanitizeInput.text(key);
      if (!sanitizedKey) return null;

      const item = localStorage.getItem(sanitizedKey);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Storage retrieval error:', error);
      return null;
    }
  },

  remove: (key) => {
    try {
      const sanitizedKey = sanitizeInput.text(key);
      if (sanitizedKey) {
        localStorage.removeItem(sanitizedKey);
      }
    } catch (error) {
      console.error('Storage removal error:', error);
    }
  }
};
