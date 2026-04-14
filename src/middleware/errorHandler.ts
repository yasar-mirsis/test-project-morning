import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError, NotFoundError } from '../errors';

/**
 * Error Response Interface
 * 
 * Standardized structure for error responses across the API
 */
interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  details?: any;
  stack?: string;
  timestamp: string;
}

/**
 * Formats an error into a standardized error response object
 * 
 * @param error - The error to format
 * @param includeStack - Whether to include stack trace (default: false in production)
 * @returns Formatted error response object
 */
export function formatError(error: Error, includeStack: boolean = false): ErrorResponse {
  const response: ErrorResponse = {
    success: false,
    error: error.name || 'Error',
    message: error.message,
    timestamp: new Date().toISOString()
  };

  // Check if it's an AppError with details
  if (error instanceof AppError && error.details !== undefined) {
    response.details = error.details;
  }

  // Include stack trace in development or when explicitly requested
  if (includeStack && error.stack) {
    response.stack = error.stack;
  }

  return response;
}

/**
 * Error Handler Middleware
 * 
 * Centralized error handling middleware that catches errors, logs them,
 * and sends appropriate HTTP responses with status codes.
 * 
 * - 400 for validation errors
 * - 404 for not found errors
 * - 500 for server errors
 * 
 * @param err - The error object
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log the error
  console.error(`[${new Date().toISOString()}] Error: ${err.message}`);
  console.error(`Stack: ${err.stack}`);

  // Determine status code and format response
  let statusCode: number = 500;
  let errorResponse: ErrorResponse;

  if (err instanceof AppError) {
    // Handle operational errors (validation, not found, etc.)
    statusCode = err.statusCode;
    errorResponse = formatError(err, process.env.NODE_ENV === 'development');
  } else {
    // Handle unexpected errors
    errorResponse = formatError(err, process.env.NODE_ENV === 'development');
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
}

/**
 * Not Found Middleware
 * 
 * Middleware that returns a 404 response for unmatched routes.
 * Should be placed after all route definitions.
 * 
 * @param req - Express request object
 * @param res - Express response object
 */
export function notFound(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: 'NotFoundError',
    message: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString()
  });
}

/**
 * Async Handler Wrapper
 * 
 * Wraps async route handlers to automatically catch and forward errors
 * to the error handling middleware.
 * 
 * @param fn - Async handler function
 * @returns Express handler function
 * 
 * @example
 * router.get('/tasks', asyncHandler(async (req, res) => {
 *   const tasks = await taskService.findAll();
 *   res.json({ success: true, data: tasks });
 * }));
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Creates a new NotFoundError for a specific resource
 * 
 * @param resourceType - Type of resource (e.g., 'Task', 'User')
 * @param resourceId - ID of the resource
 * @returns NotFoundError instance
 */
export function createNotFoundError(resourceType: string, resourceId: string | number): NotFoundError {
  return new NotFoundError(`${resourceType} not found`, `${resourceType} with ID ${resourceId}`, {
    resourceType,
    resourceId
  });
}

/**
 * Creates a new ValidationError for specific fields
 * 
 * @param field - The field that failed validation
 * @param message - Validation error message
 * @returns ValidationError instance
 */
export function createValidationError(field: string, message: string): ValidationError {
  return new ValidationError(`Validation failed for field '${field}'`, { field, message });
}

// Export main middleware as default for Express app.use()
export default errorHandler;
