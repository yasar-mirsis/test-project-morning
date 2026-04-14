import { TaskStatus } from './task';

/**
 * Data Transfer Object for creating a new task
 * 
 * Validation Constraints:
 * - title: Required, max 200 characters
 * - description: Optional, max 1000 characters
 * - dueDate: Optional, ISO 8601 format
 * - status: Optional, defaults to "pending"
 */
export interface CreateTaskDto {
  title: string;
  description?: string;
  dueDate?: string;
  status?: TaskStatus;
}

/**
 * Data Transfer Object for updating an existing task
 * 
 * All fields are optional for partial updates
 */
export interface UpdateTaskDto {
  title?: string;
  description?: string;
  dueDate?: string;
  status?: TaskStatus;
}

/**
 * Validation result type
 * Used to communicate validation outcomes
 */
export interface ValidationResult {
  success: boolean;
  errors: string[];
}

/**
 * Generic API response type for standardized responses
 * 
 * Examples:
 * Success response:
 *   { success: true, data: { id: 1, title: "Task", ... } }
 * 
 * Error response:
 *   { success: false, error: "Validation failed", message: "Title is required" }
 */
export type APIResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

/**
 * Paginated response type
 */
export type PaginatedResponse<T> = {
  success: boolean;
  data: T[];
  total: number;
  page?: number;
  limit?: number;
};
