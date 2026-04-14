import { taskRepository, TaskRepository } from '../repositories/taskRepository';
import { TaskStatus } from '../types/task';

describe('TaskRepository', () => {
  let repository: TaskRepository;

  beforeEach(async () => {
    // Create a new instance for each test to ensure isolation
    repository = new TaskRepository();
    await repository.clear();
  });

  describe('save', () => {
    it('should save a new task and return it with generated id and timestamps', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test description',
        dueDate: '2024-12-31',
        status: 'pending' as TaskStatus,
      };

      const task = await repository.save(taskData);

      expect(task.id).toBeDefined();
      expect(task.title).toBe('Test Task');
      expect(task.description).toBe('Test description');
      expect(task.dueDate).toBe('2024-12-31');
      expect(task.status).toBe('pending');
      expect(task.createdAt).toBeDefined();
      expect(task.updatedAt).toBeDefined();
    });

    it('should assign unique IDs to multiple tasks', async () => {
      const task1 = await repository.save({ title: 'Task 1', dueDate: null, status: 'pending' });
      const task2 = await repository.save({ title: 'Task 2', dueDate: null, status: 'pending' });
      const task3 = await repository.save({ title: 'Task 3', dueDate: null, status: 'pending' });

      expect(task1.id).toBe(1);
      expect(task2.id).toBe(2);
      expect(task3.id).toBe(3);
    });

    it('should handle tasks without description', async () => {
      const task = await repository.save({ title: 'Task without description', dueDate: null, status: 'pending' });

      expect(task.title).toBe('Task without description');
      expect(task.description).toBeUndefined();
    });

    it('should handle tasks with null dueDate', async () => {
      const task = await repository.save({ title: 'Task', dueDate: null, status: 'pending' });

      expect(task.dueDate).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return empty array when no tasks exist', async () => {
      const tasks = await repository.findAll();
      expect(tasks).toEqual([]);
    });

    it('should return all tasks when none are filtered', async () => {
      await repository.save({ title: 'Task 1', dueDate: null, status: 'pending' });
      await repository.save({ title: 'Task 2', dueDate: null, status: 'completed' });
      await repository.save({ title: 'Task 3', dueDate: null, status: 'pending' });

      const tasks = await repository.findAll();

      expect(tasks).toHaveLength(3);
      expect(tasks.map(t => t.title)).toEqual(['Task 1', 'Task 2', 'Task 3']);
    });

    it('should filter tasks by status', async () => {
      await repository.save({ title: 'Task 1', dueDate: null, status: 'pending' });
      await repository.save({ title: 'Task 2', dueDate: null, status: 'completed' });
      await repository.save({ title: 'Task 3', dueDate: null, status: 'pending' });

      const pendingTasks = await repository.findAll('pending');

      expect(pendingTasks).toHaveLength(2);
      expect(pendingTasks.every(t => t.status === 'pending')).toBe(true);
    });

    it('should return empty array when filtering by non-existent status', async () => {
      await repository.save({ title: 'Task 1', dueDate: null, status: 'pending' });

      const tasks = await repository.findAll('completed');

      expect(tasks).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return a task when it exists', async () => {
      const savedTask = await repository.save({ title: 'Test Task', dueDate: null, status: 'pending' });

      const foundTask = await repository.findById(savedTask.id);

      expect(foundTask).toBeDefined();
      expect(foundTask?.id).toBe(savedTask.id);
      expect(foundTask?.title).toBe('Test Task');
    });

    it('should return null when task does not exist', async () => {
      const task = await repository.findById(999);

      expect(task).toBeNull();
    });

    it('should return null for non-existent ID in populated repository', async () => {
      await repository.save({ title: 'Task 1', dueDate: null, status: 'pending' });

      const task = await repository.findById(999);

      expect(task).toBeNull();
    });
  });

  describe('update', () => {
    it('should update an existing task completely', async () => {
      const savedTask = await repository.save({ title: 'Original Title', dueDate: null, status: 'pending' });

      const updatedTaskData = {
        ...savedTask,
        title: 'Updated Title',
        status: 'completed' as TaskStatus,
      };

      const updatedTask = await repository.update(savedTask.id, updatedTaskData);

      expect(updatedTask).toBeDefined();
      expect(updatedTask?.title).toBe('Updated Title');
      expect(updatedTask?.status).toBe('completed');
      expect(updatedTask?.id).toBe(savedTask.id);
      expect(updatedTask?.createdAt).toBe(savedTask.createdAt); // Preserve creation timestamp
      expect(updatedTask?.updatedAt).not.toBe(savedTask.updatedAt); // Update modification timestamp
    });

    it('should return null when updating non-existent task', async () => {
      const updatedTask = await repository.update(999, {
        id: 999,
        title: 'Non-existent',
        dueDate: null,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      expect(updatedTask).toBeNull();
    });

    it('should preserve id when updating', async () => {
      const savedTask = await repository.save({ title: 'Task', dueDate: null, status: 'pending' });

      const updatedTaskData = {
        id: 999, // Attempt to change ID
        title: 'Updated',
        dueDate: null,
        status: 'pending',
        createdAt: savedTask.createdAt,
        updatedAt: new Date().toISOString(),
      };

      const updatedTask = await repository.update(savedTask.id, updatedTaskData);

      expect(updatedTask?.id).toBe(savedTask.id); // ID should be preserved
    });
  });

  describe('patch', () => {
    it('should partially update an existing task', async () => {
      const savedTask = await repository.save({
        title: 'Original Title',
        description: 'Original description',
        dueDate: '2024-01-01',
        status: 'pending',
      });

      const updatedTask = await repository.patch(savedTask.id, { title: 'New Title' });

      expect(updatedTask).toBeDefined();
      expect(updatedTask?.title).toBe('New Title');
      expect(updatedTask?.description).toBe('Original description'); // Unchanged
      expect(updatedTask?.dueDate).toBe('2024-01-01'); // Unchanged
      expect(updatedTask?.status).toBe('pending'); // Unchanged
      expect(updatedTask?.updatedAt).not.toBe(savedTask.updatedAt); // Updated timestamp
    });

    it('should return null when patching non-existent task', async () => {
      const updatedTask = await repository.patch(999, { title: 'New Title' });

      expect(updatedTask).toBeNull();
    });

    it('should update multiple fields in a single patch', async () => {
      const savedTask = await repository.save({ title: 'Original', dueDate: null, status: 'pending' });

      const updatedTask = await repository.patch(savedTask.id, {
        title: 'Updated Title',
        status: 'completed',
      });

      expect(updatedTask?.title).toBe('Updated Title');
      expect(updatedTask?.status).toBe('completed');
    });

    it('should handle patch with null dueDate', async () => {
      const savedTask = await repository.save({ title: 'Task', dueDate: '2024-01-01', status: 'pending' });

      const updatedTask = await repository.patch(savedTask.id, { dueDate: null });

      expect(updatedTask?.dueDate).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete an existing task', async () => {
      const savedTask = await repository.save({ title: 'Task to delete', dueDate: null, status: 'pending' });

      const deleted = await repository.delete(savedTask.id);

      expect(deleted).toBe(true);

      const foundTask = await repository.findById(savedTask.id);
      expect(foundTask).toBeNull();
    });

    it('should return false when deleting non-existent task', async () => {
      const deleted = await repository.delete(999);

      expect(deleted).toBe(false);
    });

    it('should allow re-creating task with same ID after deletion', async () => {
      const savedTask = await repository.save({ title: 'Task 1', dueDate: null, status: 'pending' });
      await repository.delete(savedTask.id);

      // Note: The repository uses auto-increment IDs, so new task will have different ID
      const newTask = await repository.save({ title: 'Task 2', dueDate: null, status: 'pending' });

      expect(newTask.id).toBeGreaterThan(savedTask.id);
    });
  });

  describe('seed', () => {
    it('should seed repository with multiple tasks', async () => {
      const tasksData = [
        { title: 'Task 1', description: 'Desc 1', status: 'pending' as TaskStatus },
        { title: 'Task 2', description: 'Desc 2', status: 'completed' as TaskStatus },
        { title: 'Task 3', status: 'in_progress' as TaskStatus },
      ];

      await repository.seed(tasksData);

      const tasks = await repository.findAll();

      expect(tasks).toHaveLength(3);
      expect(tasks[0].title).toBe('Task 1');
      expect(tasks[0].description).toBe('Desc 1');
      expect(tasks[0].status).toBe('pending');
    });

    it('should use default status "pending" when not provided', async () => {
      await repository.seed([{ title: 'Task without status' }]);

      const tasks = await repository.findAll();
      expect(tasks[0].status).toBe('pending');
    });

    it('should use null dueDate when not provided', async () => {
      await repository.seed([{ title: 'Task without dueDate' }]);

      const tasks = await repository.findAll();
      expect(tasks[0].dueDate).toBeNull();
    });
  });

  describe('clear', () => {
    it('should clear all tasks from repository', async () => {
      await repository.save({ title: 'Task 1', dueDate: null, status: 'pending' });
      await repository.save({ title: 'Task 2', dueDate: null, status: 'pending' });

      await repository.clear();

      const tasks = await repository.findAll();
      expect(tasks).toEqual([]);
    });

    it('should reset ID counter after clear', async () => {
      await repository.save({ title: 'Task 1', dueDate: null, status: 'pending' });
      await repository.save({ title: 'Task 2', dueDate: null, status: 'pending' });

      await repository.clear();

      const newTask = await repository.save({ title: 'Task 3', dueDate: null, status: 'pending' });

      expect(newTask.id).toBe(1);
    });
  });

  describe('count', () => {
    it('should return 0 when no tasks exist', async () => {
      const count = await repository.count();
      expect(count).toBe(0);
    });

    it('should return correct count after adding tasks', async () => {
      await repository.save({ title: 'Task 1', dueDate: null, status: 'pending' });
      await repository.save({ title: 'Task 2', dueDate: null, status: 'pending' });
      await repository.save({ title: 'Task 3', dueDate: null, status: 'pending' });

      const count = await repository.count();
      expect(count).toBe(3);
    });

    it('should return updated count after deletion', async () => {
      const task = await repository.save({ title: 'Task', dueDate: null, status: 'pending' });

      await repository.delete(task.id);

      const count = await repository.count();
      expect(count).toBe(0);
    });
  });
});
