/**
 * Task status enum
 */
export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

/**
 * Task entity interface
 */
export interface Task {
  id: number;
  title: string;
  description: string;
  dueDate: Date;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
}
