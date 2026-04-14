import { Router } from 'express';
import { tasksRouter } from './tasks';

const router = Router();

// Mount task routes under /tasks
router.use('/tasks', tasksRouter);

export { router as default };
