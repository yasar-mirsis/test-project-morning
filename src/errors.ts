/**
 * Custom Error Classes
 * 
 * Provides a hierarchy of custom error classes for consistent error handling
 * throughout the application.
 */

/**
 * Base class for application-specific errors
 * 
 * All custom errors extend this class to provide consistent error handling,
 * logging, and response formatting.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: any;

  /**
   * Creates a new AppError
   * 
   * @param message - Human-readable error message
   * @param statusCode - HTTP status code (default: 500)
   * @param isOperational - Whether this is an operational error (true) vs programming error (false)
   * @param details - Additional error details/context
   */
  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;

    // Maintain proper stack trace for where our error was thrown
    // Use captureStackTrace if available (Node.js/V8), otherwise use standard stack
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    } else {
      // Fallback for non-V8 environments
      Object.defineProperty(this, 'stack', {
        value: new Error(message).stack,
        writable: true,
        configurable: true
      });
    }
  }

  /**
   * Formats the error into a standardized response object
   * 
   * @returns Formatted error object with error, message, and optional details
   */
  toJSON() {
    const response: any = {
      error: this.constructor.name,
      message: this.message
    };

    if (this.details !== undefined) {
      response.details = this.details;
    }

    return response;
  }
}

/**
 * Validation error - thrown when input validation fails
 * 
 * HTTP Status Code: 400 Bad Request
 */
export class ValidationError extends AppError {
  /**
   * Creates a new ValidationError
   * 
   * @param message - Validation error message
   * @param details - Validation details (e.g., field-specific errors)
   */
  constructor(message: string = 'Validation failed', details?: any) {
    super(message, 400, true, details);
    this.name = 'ValidationError';
  }
}

/**
 * Not Found error - thrown when a requested resource doesn't exist
 * 
 * HTTP Status Code: 404 Not Found
 */
export class NotFoundError extends AppError {
  /**
   * Creates a new NotFoundError
   * 
   * @param message - Not found error message
   * @param resource - The type of resource that was not found
   * @param details - Additional details about the missing resource
   */
  constructor(
    message: string = 'Resource not found',
    resource?: string,
    details?: any
  ) {
    const finalMessage = resource 
      ? `${message}: ${resource}` 
      : message;
    
    super(finalMessage, 404, true, details);
    this.name = 'NotFoundError';
  }
}

/**
 * Conflict error - thrown when there's a resource conflict
 * 
 * HTTP Status Code: 409 Conflict
 */
export class ConflictError extends AppError {
  /**
   * Creates a new ConflictError
   * 
   * @param message - Conflict error message
   * @param details - Additional conflict details
   */
  constructor(message: string = 'Resource conflict', details?: any) {
    super(message, 409, true, details);
    this.name = 'ConflictError';
  }
}

/**
 * Unauthorized error - thrown when authentication is required
 * 
 * HTTP Status Code: 401 Unauthorized
 */
export class UnauthorizedError extends AppError {
  /**
   * Creates a new UnauthorizedError
   * 
   * @param message - Unauthorized error message
   */
  constructor(message: string = 'Unauthorized') {
    super(message, 401, true);
    this.name = 'UnauthorizedError';
  }
}

/**
 * Forbidden error - thrown when access is denied
 * 
 * HTTP Status Code: 403 Forbidden
 */
export class ForbiddenError extends AppError {
  /**
   * Creates a new ForbiddenError
   * 
   * @param message - Forbidden error message
   */
  constructor(message: string = 'Access forbidden') {
    super(message, 403, true);
    this.name = 'ForbiddenError';
  }
}
