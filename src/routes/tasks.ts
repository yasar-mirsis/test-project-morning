import { Router } from 'express';
import { taskController } from '../controllers/taskController';

/**
 * Tasks Router
 * 
 * Defines all routes for task management operations.
 * Mounts handlers from taskController.
 */
const router = Router();

/**
 * POST /tasks
 * Create a new task
 */
router.post('/', (req, res, next) => {
  taskController.createTask(req, res, next);
});

/**
 * GET /tasks
 * Get all tasks (with optional status filter)
 */
router.get('/', (req, res, next) => {
  taskController.getAllTasks(req, res, next);
});

/**
 * GET /tasks/:id
 * Get a specific task by ID
 */
router.get('/:id', (req, res, next) => {
  taskController.getTaskById(req, res, next);
});

/**
 * PUT /tasks/:id
 * Update a task completely
 */
router.put('/:id', (req, res, next) => {
  taskController.updateTask(req, res, next);
});

/**
 * PATCH /tasks/:id
 * Partially update a task
 */
router.patch('/:id', (req, res, next) => {
  taskController.patchTask(req, res, next);
});

/**
 * DELETE /tasks/:id
 * Delete a task
 */
router.delete('/:id', (req, res, next) => {
  taskController.deleteTask(req, res, next);
});

export { router as tasksRouter };
export default router;
