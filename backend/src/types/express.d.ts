/**
 * Type augmentation for Express Request interface
 * Extends the Request object to include custom properties
 */
declare module 'express-serve-static-core' {
  interface Request {
    userId?: string;
  }
}

export {};
