import { Task, TaskStatus } from '../types/task';
import { CreateTaskDto, UpdateTaskDto } from '../types/dto';

/**
 * TaskRepository - Data Access Layer for Task Management
 * 
 * Provides in-memory persistence for tasks using a Map data structure.
 * Implements CRUD operations with proper timestamp management.
 */
class TaskRepository {
  private tasks: Map<number, Task>;
  private nextId: number;

  constructor() {
    this.tasks = new Map<number, Task>();
    this.nextId = 1;
  }

  /**
   * Generates the next unique ID for a new task
   */
  private generateId(): number {
    return this.nextId++;
  }

  /**
   * Creates a new timestamp in ISO 8601 format
   */
  private generateTimestamp(): string {
    return new Date().toISOString();
  }

  /**
   * Saves a new task with generated id and timestamps
   * 
   * @param taskData - The task data to save (without id and timestamps)
   * @returns The saved task with id and timestamps
   */
  async save(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const id = this.generateId();
    const timestamp = this.generateTimestamp();

    const task: Task = {
      ...taskData,
      id,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    this.tasks.set(id, task);
    return task;
  }

  /**
   * Finds all tasks, optionally filtered by status
   * 
   * @param status - Optional status filter
   * @returns Array of tasks matching the filter
   */
  async findAll(status?: string): Promise<Task[]> {
    const allTasks = Array.from(this.tasks.values());

    if (status) {
      return allTasks.filter(task => task.status === status);
    }

    return allTasks;
  }

  /**
   * Finds a task by its ID
   * 
   * @param id - The task ID to find
   * @returns The task if found, null otherwise
   */
  async findById(id: number): Promise<Task | null> {
    const task = this.tasks.get(id);
    return task || null;
  }

  /**
   * Updates an existing task completely
   * 
   * @param id - The task ID to update
   * @param taskData - The complete task data (preserves id and timestamps)
   * @returns The updated task if found, null otherwise
   */
  async update(id: number, taskData: Task): Promise<Task | null> {
    const existingTask = this.tasks.get(id);
    if (!existingTask) {
      return null;
    }

    const updatedTask: Task = {
      ...taskData,
      id, // Preserve the original ID
      createdAt: existingTask.createdAt, // Preserve creation timestamp
      updatedAt: this.generateTimestamp(), // Update modification timestamp
    };

    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  /**
   * Partially updates an existing task
   * 
   * @param id - The task ID to update
   * @param taskData - Partial task data to merge
   * @returns The updated task if found, null otherwise
   */
  async patch(id: number, taskData: Partial<UpdateTaskDto>): Promise<Task | null> {
    const existingTask = this.tasks.get(id);
    if (!existingTask) {
      return null;
    }

    const updatedTask: Task = {
      ...existingTask,
      ...taskData,
      id, // Preserve the original ID
      createdAt: existingTask.createdAt, // Preserve creation timestamp
      updatedAt: this.generateTimestamp(), // Update modification timestamp
    };

    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  /**
   * Deletes a task by its ID
   * 
   * @param id - The task ID to delete
   * @returns true if the task was deleted, false if not found
   */
  async delete(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }

  /**
   * Seeds the repository with test data
   * 
   * @param tasksData - Array of task data to seed
   */
  async seed(tasksData: Array<{ title: string; description?: string; dueDate?: string | null; status?: TaskStatus }>): Promise<void> {
    for (const taskData of tasksData) {
      // Convert undefined to null for dueDate and default status to 'pending' to match Task type
      const normalizedData = {
        title: taskData.title,
        description: taskData.description,
        dueDate: taskData.dueDate ?? null,
        status: taskData.status ?? 'pending',
      };
      await this.save(normalizedData);
    }
  }

  /**
   * Clears all tasks from the repository
   * Useful for testing
   */
  async clear(): Promise<void> {
    this.tasks.clear();
    this.nextId = 1;
  }

  /**
   * Gets the total count of tasks
   * 
   * @returns The number of tasks in the repository
   */
  async count(): Promise<number> {
    return this.tasks.size;
  }
}

// Export singleton instance
export const taskRepository = new TaskRepository();
export { TaskRepository };
