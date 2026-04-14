/**
 * Task status type
 */
export type TaskStatus = 'pending' | 'in_progress' | 'completed';

/**
 * Task entity interface
 * 
 * Fields:
 * - id: Unique identifier (number)
 * - title: Task title (string, max 200 characters)
 * - description: Task description (string, max 1000 characters, optional)
 * - dueDate: Due date in ISO 8601 format (string or null)
 * - status: Current task status (TaskStatus)
 * - createdAt: Creation timestamp in ISO 8601 format (string)
 * - updatedAt: Last update timestamp in ISO 8601 format (string)
 */
export interface Task {
  id: number;
  title: string;
  description?: string;
  dueDate: string | null;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}
