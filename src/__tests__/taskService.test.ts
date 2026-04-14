import { taskService, NotFoundError, ValidationError } from '../services/taskService';
import { taskRepository } from '../repositories/taskRepository';

describe('TaskService', () => {
  beforeEach(async () => {
    // Clear repository before each test
    await taskRepository.clear();
  });

  describe('create', () => {
    it('should create a new task with valid data', async () => {
      const taskData = {
        title: 'New Task',
        description: 'Task description',
        dueDate: '2024-12-31',
      };

      const task = await taskService.create(taskData);

      expect(task.id).toBeDefined();
      expect(task.title).toBe('New Task');
      expect(task.description).toBe('Task description');
      expect(task.dueDate).toBe('2024-12-31');
      expect(task.status).toBe('pending');
      expect(task.createdAt).toBeDefined();
      expect(task.updatedAt).toBeDefined();
    });

    it('should set default status to "pending" when not provided', async () => {
      const task = await taskService.create({ title: 'Task without status' });

      expect(task.status).toBe('pending');
    });

    it('should use provided valid status', async () => {
      const task = await taskService.create({
        title: 'Task with status',
        status: 'completed',
      });

      expect(task.status).toBe('completed');
    });

    it('should throw ValidationError when title is missing', async () => {
      await expect(taskService.create({} as unknown)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when title is empty', async () => {
      await expect(taskService.create({ title: '' })).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when dueDate format is invalid', async () => {
      await expect(
        taskService.create({ title: 'Task', dueDate: '12/31/2024' })
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when status is invalid', async () => {
      await expect(
        taskService.create({ title: 'Task', status: 'invalid' })
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when description is too long', async () => {
      await expect(
        taskService.create({ title: 'Task', description: 'a'.repeat(1001) })
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('findAll', () => {
    it('should return empty array when no tasks exist', async () => {
      const tasks = await taskService.findAll();

      expect(tasks).toEqual([]);
    });

    it('should return all tasks when none are filtered', async () => {
      await taskService.create({ title: 'Task 1' });
      await taskService.create({ title: 'Task 2' });

      const tasks = await taskService.findAll();

      expect(tasks).toHaveLength(2);
    });

    it('should filter tasks by status', async () => {
      await taskService.create({ title: 'Task 1', status: 'pending' });
      await taskService.create({ title: 'Task 2', status: 'completed' });
      await taskService.create({ title: 'Task 3', status: 'pending' });

      const pendingTasks = await taskService.findAll('pending');

      expect(pendingTasks).toHaveLength(2);
      expect(pendingTasks.every(t => t.status === 'pending')).toBe(true);
    });

    it('should throw ValidationError for invalid status filter', async () => {
      await expect(taskService.findAll('invalid')).rejects.toThrow(ValidationError);
    });
  });

  describe('findById', () => {
    it('should return a task when it exists', async () => {
      const createdTask = await taskService.create({ title: 'Find me' });

      const foundTask = await taskService.findById(createdTask.id);

      expect(foundTask.id).toBe(createdTask.id);
      expect(foundTask.title).toBe('Find me');
    });

    it('should throw NotFoundError when task does not exist', async () => {
      await expect(taskService.findById(999)).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError with correct message', async () => {
      try {
        await taskService.findById(999);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundError);
        if (error instanceof NotFoundError) {
          expect(error.message).toBe('Task with ID 999 not found');
        }
      }
    });
  });

  describe('update', () => {
    it('should update an existing task completely', async () => {
      const createdTask = await taskService.create({
        title: 'Original Title',
        description: 'Original description',
        dueDate: '2024-01-01',
        status: 'pending',
      });

      const updateData = {
        title: 'Updated Title',
        description: 'Updated description',
        dueDate: '2024-12-31',
        status: 'completed',
      };

      const updatedTask = await taskService.update(createdTask.id, updateData);

      expect(updatedTask.id).toBe(createdTask.id);
      expect(updatedTask.title).toBe('Updated Title');
      expect(updatedTask.description).toBe('Updated description');
      expect(updatedTask.dueDate).toBe('2024-12-31');
      expect(updatedTask.status).toBe('completed');
      expect(updatedTask.createdAt).toBe(createdTask.createdAt);
      expect(updatedTask.updatedAt).not.toBe(createdTask.updatedAt);
    });

    it('should throw NotFoundError when updating non-existent task', async () => {
      await expect(
        taskService.update(999, { title: 'Updated' })
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw ValidationError when update data is invalid', async () => {
      const createdTask = await taskService.create({ title: 'Task' });

      await expect(
        taskService.update(createdTask.id, { title: '' })
      ).rejects.toThrow(ValidationError);
    });

    it('should preserve creation timestamp on update', async () => {
      const createdTask = await taskService.create({ title: 'Task' });

      const updatedTask = await taskService.update(createdTask.id, { title: 'Updated' });

      expect(updatedTask.createdAt).toBe(createdTask.createdAt);
    });

    it('should update modification timestamp on update', async () => {
      const createdTask = await taskService.create({ title: 'Task' });

      const updatedTask = await taskService.update(createdTask.id, { title: 'Updated' });

      expect(updatedTask.updatedAt).not.toBe(createdTask.updatedAt);
    });
  });

  describe('patch', () => {
    it('should partially update an existing task', async () => {
      const createdTask = await taskService.create({
        title: 'Original Title',
        description: 'Original description',
        dueDate: '2024-01-01',
        status: 'pending',
      });

      const updatedTask = await taskService.patch(createdTask.id, { title: 'New Title' });

      expect(updatedTask.id).toBe(createdTask.id);
      expect(updatedTask.title).toBe('New Title');
      expect(updatedTask.description).toBe('Original description');
      expect(updatedTask.dueDate).toBe('2024-01-01');
      expect(updatedTask.status).toBe('pending');
    });

    it('should throw NotFoundError when patching non-existent task', async () => {
      await expect(taskService.patch(999, { title: 'New Title' })).rejects.toThrow(NotFoundError);
    });

    it('should throw ValidationError when patch data is invalid', async () => {
      const createdTask = await taskService.create({ title: 'Task' });

      await expect(taskService.patch(createdTask.id, { status: 'invalid' })).rejects.toThrow(ValidationError);
    });

    it('should update multiple fields in a single patch', async () => {
      const createdTask = await taskService.create({ title: 'Original', status: 'pending' });

      const updatedTask = await taskService.patch(createdTask.id, {
        title: 'Updated',
        status: 'completed',
      });

      expect(updatedTask.title).toBe('Updated');
      expect(updatedTask.status).toBe('completed');
    });

    it('should handle patch with null dueDate', async () => {
      const createdTask = await taskService.create({ title: 'Task', dueDate: '2024-01-01' });

      const updatedTask = await taskService.patch(createdTask.id, { dueDate: null });

      expect(updatedTask.dueDate).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete an existing task', async () => {
      const createdTask = await taskService.create({ title: 'Delete me' });

      await taskService.delete(createdTask.id);

      await expect(taskService.findById(createdTask.id)).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError when deleting non-existent task', async () => {
      await expect(taskService.delete(999)).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError with correct message', async () => {
      try {
        await taskService.delete(999);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundError);
        if (error instanceof NotFoundError) {
          expect(error.message).toBe('Task with ID 999 not found');
        }
      }
    });
  });

  describe('business rules', () => {
    it('should enforce title uniqueness implicitly through ID assignment', async () => {
      const task1 = await taskService.create({ title: 'Same Title' });
      const task2 = await taskService.create({ title: 'Same Title' });

      expect(task1.id).not.toBe(task2.id);
      expect(task1.title).toBe(task2.title);
    });

    it('should maintain valid status throughout lifecycle', async () => {
      const task = await taskService.create({ title: 'Task', status: 'pending' });

      expect(task.status).toBe('pending');

      const updated = await taskService.patch(task.id, { status: 'in_progress' });
      expect(updated.status).toBe('in_progress');

      const completed = await taskService.update(task.id, {
        title: 'Task',
        status: 'completed',
      });
      expect(completed.status).toBe('completed');
    });

    it('should handle task with all optional fields', async () => {
      const task = await taskService.create({
        title: 'Full Task',
        description: 'Complete description',
        dueDate: '2024-12-31',
        status: 'in_progress',
      });

      expect(task.description).toBe('Complete description');
      expect(task.dueDate).toBe('2024-12-31');
      expect(task.status).toBe('in_progress');
    });
  });
});
