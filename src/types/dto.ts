import { TaskStatus } from './task';

/**
 * Data Transfer Object for creating a new task
 */
export interface CreateTaskDto {
  title: string;
  description?: string;
  dueDate?: string;
  status?: TaskStatus;
}

/**
 * Data Transfer Object for updating an existing task
 */
export interface UpdateTaskDto {
  title?: string;
  description?: string;
  dueDate?: string;
  status?: TaskStatus;
}

/**
 * Data Transfer Object for partial task updates
 */
export interface PartialUpdateTaskDto {
  title?: string;
  description?: string;
  dueDate?: string;
  status?: string;
}

/**
 * API Response interface
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Paginated response interface
 */
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page?: number;
  limit?: number;
}
