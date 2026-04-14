import { Request, Response, NextFunction } from 'express';
import { taskService, NotFoundError, ValidationError } from '../services/taskService';
import { CreateTaskDto, UpdateTaskDto } from '../types/dto';

/**
 * TaskController - HTTP Request/Response Handler for Task Operations
 * 
 * This controller handles the HTTP request/response lifecycle for task operations.
 * It parses incoming requests, calls the appropriate service methods, and formats responses.
 */
class TaskController {
  /**
   * Create a new task
   * 
   * Handles POST /tasks
   * - Parses request body
   * - Calls service.create
   * - Returns 201 with created task or 400 with validation errors
   * 
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next middleware function
   */
  async createTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const taskData: CreateTaskDto = req.body;

      const task = await taskService.create(taskData);

      res.status(201).json({
        success: true,
        data: task
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.name,
          message: error.message,
          errors: error.errors
        });
        return;
      }
      next(error);
    }
  }

  /**
   * Get all tasks
   * 
   * Handles GET /tasks
   * - Accepts optional status query parameter
   * - Calls service.findAll
   * - Returns 200 with task array
   * 
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next middleware function
   */
  async getAllTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const status = req.query.status as string | undefined;

      const tasks = await taskService.findAll(status);

      res.status(200).json({
        success: true,
        data: tasks
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.name,
          message: error.message,
          errors: error.errors
        });
        return;
      }
      next(error);
    }
  }

  /**
   * Get a task by ID
   * 
   * Handles GET /tasks/:id
   * - Calls service.findById
   * - Returns 200 with task or 404 if not found
   * 
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next middleware function
   */
  async getTaskById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          error: 'ValidationError',
          message: 'Invalid task ID format'
        });
        return;
      }

      const task = await taskService.findById(id);

      res.status(200).json({
        success: true,
        data: task
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.name,
          message: error.message
        });
        return;
      }
      next(error);
    }
  }

  /**
   * Update a task completely
   * 
   * Handles PUT /tasks/:id
   * - Validates request body
   * - Calls service.update
   * - Returns 200 with updated task or 404/400 errors
   * 
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next middleware function
   */
  async updateTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const taskData: UpdateTaskDto = req.body;

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          error: 'ValidationError',
          message: 'Invalid task ID format'
        });
        return;
      }

      const task = await taskService.update(id, taskData);

      res.status(200).json({
        success: true,
        data: task
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.name,
          message: error.message
        });
        return;
      }
      if (error instanceof ValidationError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.name,
          message: error.message,
          errors: error.errors
        });
        return;
      }
      next(error);
    }
  }

  /**
   * Partially update a task
   * 
   * Handles PATCH /tasks/:id
   * - Validates request body
   * - Calls service.patch
   * - Returns 200 with updated task or 404/400 errors
   * 
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next middleware function
   */
  async patchTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const taskData: Partial<UpdateTaskDto> = req.body;

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          error: 'ValidationError',
          message: 'Invalid task ID format'
        });
        return;
      }

      const task = await taskService.patch(id, taskData);

      res.status(200).json({
        success: true,
        data: task
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.name,
          message: error.message
        });
        return;
      }
      if (error instanceof ValidationError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.name,
          message: error.message,
          errors: error.errors
        });
        return;
      }
      next(error);
    }
  }

  /**
   * Delete a task
   * 
   * Handles DELETE /tasks/:id
   * - Calls service.delete
   * - Returns 204 No Content on success or 404 if not found
   * 
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next middleware function
   */
  async deleteTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          error: 'ValidationError',
          message: 'Invalid task ID format'
        });
        return;
      }

      await taskService.delete(id);

      res.status(204).send();
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.name,
          message: error.message
        });
        return;
      }
      next(error);
    }
  }
}

// Export singleton instance
export const taskController = new TaskController();
export { TaskController };
