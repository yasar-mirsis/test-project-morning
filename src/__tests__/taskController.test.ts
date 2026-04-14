import request from 'supertest';
import app from '../index';
import { taskRepository } from '../repositories/taskRepository';

describe('TaskController', () => {
  beforeEach(async () => {
    // Clear repository before each test
    await taskRepository.clear();
  });

  describe('POST /tasks', () => {
    it('should create a new task and return 201 with task data', async () => {
      const taskData = {
        title: 'New Task',
        description: 'Task description',
        dueDate: '2024-12-31',
      };

      const response = await request(app)
        .post('/tasks')
        .send(taskData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.title).toBe('New Task');
      expect(response.body.data.description).toBe('Task description');
      expect(response.body.data.dueDate).toBe('2024-12-31');
      expect(response.body.data.status).toBe('pending');
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.createdAt).toBeDefined();
      expect(response.body.data.updatedAt).toBeDefined();
    });

    it('should create task with default status when not provided', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({ title: 'Task without status' })
        .expect(201);

      expect(response.body.data.status).toBe('pending');
    });

    it('should return 400 when title is missing', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({ description: 'No title' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('ValidationError');
      expect(response.body.errors).toContain('Title is required');
    });

    it('should return 400 when title is empty', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({ title: '' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('Title cannot be empty');
    });

    it('should return 400 when dueDate format is invalid', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({ title: 'Task', dueDate: '12/31/2024' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('Due date must be in YYYY-MM-DD format');
    });

    it('should return 400 when status is invalid', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({ title: 'Task', status: 'invalid' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('Status must be one of: pending, in_progress, completed, cancelled');
    });

    it('should return 400 when description is too long', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({ title: 'Task', description: 'a'.repeat(1001) })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('Description must be 1000 characters or less');
    });

    it('should return 400 when title is too long', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({ title: 'a'.repeat(201) })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('Title must be 200 characters or less');
    });
  });

  describe('GET /tasks', () => {
    it('should return empty array when no tasks exist', async () => {
      const response = await request(app)
        .get('/tasks')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });

    it('should return all tasks when none are filtered', async () => {
      await taskRepository.save({ title: 'Task 1', dueDate: null, status: 'pending' });
      await taskRepository.save({ title: 'Task 2', dueDate: null, status: 'completed' });

      const response = await request(app)
        .get('/tasks')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it('should filter tasks by status query parameter', async () => {
      await taskRepository.save({ title: 'Task 1', dueDate: null, status: 'pending' });
      await taskRepository.save({ title: 'Task 2', dueDate: null, status: 'completed' });
      await taskRepository.save({ title: 'Task 3', dueDate: null, status: 'pending' });

      const response = await request(app)
        .get('/tasks?status=pending')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data.every((t: any) => t.status === 'pending')).toBe(true);
    });

    it('should return 400 for invalid status filter', async () => {
      const response = await request(app)
        .get('/tasks?status=invalid')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('ValidationError');
    });

    it('should return tasks with correct fields', async () => {
      await taskRepository.save({
        title: 'Task with all fields',
        description: 'Description',
        dueDate: '2024-12-31',
        status: 'pending',
      });

      const response = await request(app)
        .get('/tasks')
        .expect(200);

      const task = response.body.data[0];
      expect(task).toHaveProperty('id');
      expect(task).toHaveProperty('title');
      expect(task).toHaveProperty('description');
      expect(task).toHaveProperty('dueDate');
      expect(task).toHaveProperty('status');
      expect(task).toHaveProperty('createdAt');
      expect(task).toHaveProperty('updatedAt');
    });
  });

  describe('GET /tasks/:id', () => {
    it('should return a task when it exists', async () => {
      const savedTask = await taskRepository.save({
        title: 'Find me',
        dueDate: null,
        status: 'pending',
      });

      const response = await request(app)
        .get(`/tasks/${savedTask.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(savedTask.id);
      expect(response.body.data.title).toBe('Find me');
    });

    it('should return 404 when task does not exist', async () => {
      const response = await request(app)
        .get('/tasks/999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('NotFoundError');
      expect(response.body.message).toBe('Task with ID 999 not found');
    });

    it('should return 400 for invalid task ID format', async () => {
      const response = await request(app)
        .get('/tasks/invalid')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('ValidationError');
      expect(response.body.message).toBe('Invalid task ID format');
    });
  });

  describe('PUT /tasks/:id', () => {
    it('should update a task completely and return 200', async () => {
      const savedTask = await taskRepository.save({
        title: 'Original Title',
        description: 'Original description',
        dueDate: '2024-01-01',
        status: 'pending',
      });

      const response = await request(app)
        .put(`/tasks/${savedTask.id}`)
        .send({
          title: 'Updated Title',
          description: 'Updated description',
          dueDate: '2024-12-31',
          status: 'completed',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Updated Title');
      expect(response.body.data.description).toBe('Updated description');
      expect(response.body.data.dueDate).toBe('2024-12-31');
      expect(response.body.data.status).toBe('completed');
      expect(response.body.data.createdAt).toBe(savedTask.createdAt);
    });

    it('should return 404 when updating non-existent task', async () => {
      const response = await request(app)
        .put('/tasks/999')
        .send({ title: 'Updated' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('NotFoundError');
    });

    it('should return 400 when update data is invalid', async () => {
      const savedTask = await taskRepository.save({ title: 'Task', dueDate: null, status: 'pending' });

      const response = await request(app)
        .put(`/tasks/${savedTask.id}`)
        .send({ title: '' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('ValidationError');
    });

    it('should return 400 for invalid task ID format', async () => {
      const response = await request(app)
        .put('/tasks/invalid')
        .send({ title: 'Updated' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid task ID format');
    });
  });

  describe('PATCH /tasks/:id', () => {
    it('should partially update a task and return 200', async () => {
      const savedTask = await taskRepository.save({
        title: 'Original Title',
        description: 'Original description',
        dueDate: '2024-01-01',
        status: 'pending',
      });

      const response = await request(app)
        .patch(`/tasks/${savedTask.id}`)
        .send({ title: 'New Title' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('New Title');
      expect(response.body.data.description).toBe('Original description'); // Unchanged
      expect(response.body.data.dueDate).toBe('2024-01-01'); // Unchanged
      expect(response.body.data.status).toBe('pending'); // Unchanged
    });

    it('should return 404 when patching non-existent task', async () => {
      const response = await request(app)
        .patch('/tasks/999')
        .send({ title: 'New Title' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('NotFoundError');
    });

    it('should return 400 when patch data is invalid', async () => {
      const savedTask = await taskRepository.save({ title: 'Task', dueDate: null, status: 'pending' });

      const response = await request(app)
        .patch(`/tasks/${savedTask.id}`)
        .send({ status: 'invalid' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('ValidationError');
    });

    it('should update multiple fields in a single patch', async () => {
      const savedTask = await taskRepository.save({ title: 'Original', status: 'pending', dueDate: null });

      const response = await request(app)
        .patch(`/tasks/${savedTask.id}`)
        .send({ title: 'Updated', status: 'completed' })
        .expect(200);

      expect(response.body.data.title).toBe('Updated');
      expect(response.body.data.status).toBe('completed');
    });

    it('should handle patch with null dueDate', async () => {
      const savedTask = await taskRepository.save({ title: 'Task', dueDate: '2024-01-01', status: 'pending' });

      const response = await request(app)
        .patch(`/tasks/${savedTask.id}`)
        .send({ dueDate: null })
        .expect(200);

      expect(response.body.data.dueDate).toBeNull();
    });
  });

  describe('DELETE /tasks/:id', () => {
    it('should delete a task and return 204 No Content', async () => {
      const savedTask = await taskRepository.save({ title: 'Delete me', dueDate: null, status: 'pending' });

      const response = await request(app)
        .delete(`/tasks/${savedTask.id}`)
        .expect(204);

      expect(response.body).toEqual({});

      // Verify task is deleted
      const getResponse = await request(app).get(`/tasks/${savedTask.id}`).expect(404);
      expect(getResponse.body.success).toBe(false);
    });

    it('should return 404 when deleting non-existent task', async () => {
      const response = await request(app)
        .delete('/tasks/999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('NotFoundError');
    });

    it('should return 400 for invalid task ID format', async () => {
      const response = await request(app)
        .delete('/tasks/invalid')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid task ID format');
    });
  });

  describe('API response format', () => {
    it('should return consistent success response structure', async () => {
      const createResponse = await request(app)
        .post('/tasks')
        .send({ title: 'Test Task' })
        .expect(201);

      expect(createResponse.body).toHaveProperty('success');
      expect(createResponse.body).toHaveProperty('data');
    });

    it('should return consistent error response structure for validation errors', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('errors');
    });

    it('should return consistent error response structure for not found errors', async () => {
      const response = await request(app)
        .get('/tasks/999')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('message');
    });
  });
});
