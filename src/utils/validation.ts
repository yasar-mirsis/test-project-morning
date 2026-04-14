import { TaskStatus } from '../types/task';
import { CreateTaskDto, UpdateTaskDto, ValidationResult } from '../types/dto';

/**
 * Valid task status values
 */
const VALID_STATUSES: TaskStatus[] = ['pending', 'in_progress', 'completed', 'cancelled'];

/**
 * Validates if a status is a valid TaskStatus value
 * @param status - The status string to validate
 * @returns true if status is valid, false otherwise
 */
export function validateStatus(status: string): boolean {
  return VALID_STATUSES.includes(status as TaskStatus);
}

/**
 * Validates if a date string matches YYYY-MM-DD format
 * @param date - The date string to validate
 * @returns true if date format is valid, false otherwise
 */
export function validateDateFormat(date: string): boolean {
  if (typeof date !== 'string') {
    return false;
  }
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  return regex.test(date);
}

/**
 * Validates input for creating a new task
 * Checks:
 * - title is present and 1-200 characters
 * - description if present is 0-1000 characters
 * - dueDate if present matches YYYY-MM-DD format
 * - status if present is a valid TaskStatus
 * @param data - The data to validate
 * @returns ValidationResult with success status and any errors
 */
export function validateTaskCreate(data: CreateTaskDto): ValidationResult {
  const errors: string[] = [];

  // Validate title - required, 1-200 characters
  if (data.title === undefined || data.title === null) {
    errors.push('Title is required');
  } else if (typeof data.title !== 'string') {
    errors.push('Title must be a string');
  } else if (data.title.trim().length === 0) {
    errors.push('Title cannot be empty');
  } else if (data.title.length > 200) {
    errors.push('Title must be 200 characters or less');
  }

  // Validate description - optional, 0-1000 characters if present
  if (data.description !== undefined && data.description !== null) {
    if (typeof data.description !== 'string') {
      errors.push('Description must be a string');
    } else if (data.description.length > 1000) {
      errors.push('Description must be 1000 characters or less');
    }
  }

  // Validate dueDate - optional, must match YYYY-MM-DD format if present
  if (data.dueDate !== undefined && data.dueDate !== null) {
    if (typeof data.dueDate !== 'string') {
      errors.push('Due date must be a string');
    } else if (!validateDateFormat(data.dueDate)) {
      errors.push('Due date must be in YYYY-MM-DD format');
    }
  }

  // Validate status - optional, must be a valid TaskStatus if present
  if (data.status !== undefined && data.status !== null) {
    if (!validateStatus(data.status)) {
      errors.push(`Status must be one of: ${VALID_STATUSES.join(', ')}`);
    }
  }

  return {
    success: errors.length === 0,
    errors
  };
}

/**
 * Validates input for updating a task
 * Validates only the fields that are provided (partial update)
 * @param data - The data to validate
 * @returns ValidationResult with success status and any errors
 */
export function validateTaskUpdate(data: UpdateTaskDto): ValidationResult {
  const errors: string[] = [];

  // Validate title if provided - 1-200 characters
  if (data.title !== undefined) {
    if (data.title === null || data.title === undefined) {
      // Skip validation if explicitly undefined (handled by partial update logic)
    } else if (typeof data.title !== 'string') {
      errors.push('Title must be a string');
    } else if (data.title.trim().length === 0) {
      errors.push('Title cannot be empty');
    } else if (data.title.length > 200) {
      errors.push('Title must be 200 characters or less');
    }
  }

  // Validate description if provided - 0-1000 characters
  if (data.description !== undefined) {
    if (data.description !== null && typeof data.description !== 'string') {
      errors.push('Description must be a string');
    } else if (data.description !== null && data.description.length > 1000) {
      errors.push('Description must be 1000 characters or less');
    }
  }

  // Validate dueDate if provided - must match YYYY-MM-DD format
  if (data.dueDate !== undefined) {
    if (data.dueDate !== null && typeof data.dueDate !== 'string') {
      errors.push('Due date must be a string');
    } else if (data.dueDate !== null && !validateDateFormat(data.dueDate)) {
      errors.push('Due date must be in YYYY-MM-DD format');
    }
  }

  // Validate status if provided - must be a valid TaskStatus
  if (data.status !== undefined) {
    if (data.status !== null && !validateStatus(data.status)) {
      errors.push(`Status must be one of: ${VALID_STATUSES.join(', ')}`);
    }
  }

  return {
    success: errors.length === 0,
    errors
  };
}

/**
 * Formats validation errors into a consistent error object
 * @param errors - Array of error messages
 * @returns Formatted error object
 */
export function getValidationErrors(errors: string[]): {
  message: string;
  errors: string[];
  details: { field: string; message: string }[];
} {
  const formattedErrors = errors.map((error) => {
    // Try to extract field name from error message
    const fieldMatch = error.match(/^(Title|Description|Due date|Status)/);
    const field = fieldMatch ? fieldMatch[1] : 'Unknown';
    return { field, message: error };
  });

  return {
    message: 'Validation failed',
    errors,
    details: formattedErrors
  };
}

/**
 * Helper function to check if a value is a non-empty string
 * @param value - The value to check
 * @returns true if value is a non-empty string
 */
export function isNonEmptyString(value: unknown): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}
