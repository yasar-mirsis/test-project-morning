import { Task, TaskStatus } from '../types/task';
import { CreateTaskDto, UpdateTaskDto } from '../types/dto';
import { taskRepository } from '../repositories/taskRepository';
import {
  validateTaskCreate,
  validateTaskUpdate,
  validateStatus,
} from '../utils/validation';

/**
 * Custom error class for not found errors
 */
export class NotFoundError extends Error {
  public readonly statusCode = 404;

  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

/**
 * Custom error class for validation errors
 */
export class ValidationError extends Error {
  public readonly statusCode = 400;
  public readonly errors: string[];

  constructor(message: string, errors: string[]) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

/**
 * TaskService - Business Logic Layer for Task Operations
 * 
 * This service orchestrates task operations, enforces business rules,
 * and coordinates between controllers and the repository layer.
 */
class TaskService {
  /**
   * Creates a new task
   * 
   * Validates input using validation utilities, calls repository save,
   * and returns the created task. Throws ValidationError if validation fails.
   * 
   * @param taskData - The task data to create (CreateTaskDto)
   * @returns The created task with id and timestamps
   * @throws ValidationError if validation fails
   */
  async create(taskData: CreateTaskDto): Promise<Task> {
    // Validate input
    const validation = validateTaskCreate(taskData);
    if (!validation.success) {
      throw new ValidationError('Validation failed', validation.errors);
    }

    // Set default status if not provided
    const dataToSave: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
      title: taskData.title,
      description: taskData.description,
      dueDate: taskData.dueDate ?? null,
      status: (taskData.status && validateStatus(taskData.status))
        ? taskData.status
        : 'pending',
    };

    // Save to repository
    const task = await taskRepository.save(dataToSave);
    return task;
  }

  /**
   * Retrieves all tasks
   * 
   * Accepts optional status parameter and passes to repository.
   * 
   * @param status - Optional status filter
   * @returns Array of tasks
   */
  async findAll(status?: string): Promise<Task[]> {
    // Validate status if provided
    if (status && !validateStatus(status)) {
      throw new ValidationError('Validation failed', [`Status must be one of: pending, in_progress, completed, cancelled`]);
    }

    return await taskRepository.findAll(status);
  }

  /**
   * Retrieves a task by its ID
   * 
   * Returns task or throws NotFound error if not found.
   * 
   * @param id - The task ID to find
   * @returns The task if found
   * @throws NotFoundError if task not found
   */
  async findById(id: number): Promise<Task> {
    const task = await taskRepository.findById(id);
    if (!task) {
      throw new NotFoundError(`Task with ID ${id} not found`);
    }
    return task;
  }

  /**
   * Updates an existing task completely
   * 
   * Validates input, calls repository update, returns updated task.
   * Throws NotFound if task not found, ValidationError if validation fails.
   * 
   * @param id - The task ID to update
   * @param taskData - The complete task data (UpdateTaskDto)
   * @returns The updated task
   * @throws NotFoundError if task not found
   * @throws ValidationError if validation fails
   */
  async update(id: number, taskData: UpdateTaskDto): Promise<Task> {
    // Validate input
    const validation = validateTaskUpdate(taskData);
    if (!validation.success) {
      throw new ValidationError('Validation failed', validation.errors);
    }

    // Check if task exists
    const existingTask = await taskRepository.findById(id);
    if (!existingTask) {
      throw new NotFoundError(`Task with ID ${id} not found`);
    }

    // Build complete task object with validated data
    const updatedTaskData: Task = {
      id: existingTask.id,
      title: taskData.title ?? existingTask.title,
      description: taskData.description !== undefined ? taskData.description : existingTask.description,
      dueDate: taskData.dueDate !== undefined ? (taskData.dueDate ?? null) : existingTask.dueDate,
      status: taskData.status ?? existingTask.status,
      createdAt: existingTask.createdAt,
      updatedAt: new Date().toISOString(),
    };

    // Update in repository
    const updatedTask = await taskRepository.update(id, updatedTaskData);
    if (!updatedTask) {
      throw new NotFoundError(`Task with ID ${id} not found`);
    }

    return updatedTask;
  }

  /**
   * Partially updates an existing task
   * 
   * Validates and partially updates only the provided fields.
   * Throws NotFound if task not found, ValidationError if validation fails.
   * 
   * @param id - The task ID to update
   * @param taskData - Partial task data (Partial<UpdateTaskDto>)
   * @returns The updated task
   * @throws NotFoundError if task not found
   * @throws ValidationError if validation fails
   */
  async patch(id: number, taskData: Partial<UpdateTaskDto>): Promise<Task> {
    // Validate input
    const validation = validateTaskUpdate(taskData);
    if (!validation.success) {
      throw new ValidationError('Validation failed', validation.errors);
    }

    // Check if task exists
    const existingTask = await taskRepository.findById(id);
    if (!existingTask) {
      throw new NotFoundError(`Task with ID ${id} not found`);
    }

    // Build partial update object
    const patchData: Partial<UpdateTaskDto> = {
      title: taskData.title,
      description: taskData.description,
      dueDate: taskData.dueDate,
      status: taskData.status,
    };

    // Remove undefined values for partial update
    const cleanPatchData: Partial<UpdateTaskDto> = {};
    if (patchData.title !== undefined) cleanPatchData.title = patchData.title;
    if (patchData.description !== undefined) cleanPatchData.description = patchData.description;
    if (patchData.dueDate !== undefined) cleanPatchData.dueDate = patchData.dueDate;
    if (patchData.status !== undefined) cleanPatchData.status = patchData.status;

    // Patch in repository
    const updatedTask = await taskRepository.patch(id, cleanPatchData);
    if (!updatedTask) {
      throw new NotFoundError(`Task with ID ${id} not found`);
    }

    return updatedTask;
  }

  /**
   * Deletes a task by its ID
   * 
   * Removes task from repository.
   * Throws NotFound if task not found.
   * 
   * @param id - The task ID to delete
   * @throws NotFoundError if task not found
   */
  async delete(id: number): Promise<void> {
    // Check if task exists
    const existingTask = await taskRepository.findById(id);
    if (!existingTask) {
      throw new NotFoundError(`Task with ID ${id} not found`);
    }

    // Delete from repository
    const deleted = await taskRepository.delete(id);
    if (!deleted) {
      throw new NotFoundError(`Task with ID ${id} not found`);
    }
  }
}

// Export singleton instance
export const taskService = new TaskService();
export { TaskService };
