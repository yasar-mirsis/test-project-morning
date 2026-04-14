# Analysis Document: test-project-morning

## Stakeholders

| Stakeholder | Role | Priority |
|-------------|------|----------|
| End Users | Individuals who will create and manage tasks | High |
| Product Owner | Defines requirements and priorities | High |
| Development Team | Implements the API | High |
| QA Team | Validates functionality | Medium |

## User Stories

### US-1: Create a New Task
**As a** user, **I want to** create a new task with a title, description, due date, and initial status, **so that** I can track my work items.

**Acceptance Criteria:**
- Given the API is running, when I send a POST request to `/tasks` with valid data, then a new task is created with status "pending" by default.
- Given I send a POST request without a title, then the server returns a 400 Bad Request error.
- Given I send a POST request with an invalid date format, then the server returns a 400 Bad Request error.
- Given a task is created, then it is assigned a unique ID.

### US-2: Retrieve All Tasks
**As a** user, **I want to** retrieve a list of all tasks, **so that** I can view my complete task list.

**Acceptance Criteria:**
- Given tasks exist in the database, when I send a GET request to `/tasks`, then all tasks are returned.
- Given no tasks exist, when I send a GET request, then an empty array is returned.
- Given I request tasks, then each task includes id, title, description, dueDate, and status fields.

### US-3: Retrieve a Single Task
**As a** user, **I want to** retrieve a specific task by its ID, **so that** I can view its details.

**Acceptance Criteria:**
- Given a task exists with ID 1, when I send a GET request to `/tasks/1`, then the task details are returned.
- Given a task with ID 999 does not exist, when I send a GET request to `/tasks/999`, then a 404 Not Found error is returned.

### US-4: Update a Task
**As a** user, **I want to** update an existing task's properties, **so that** I can modify task details as work progresses.

**Acceptance Criteria:**
- Given a task exists, when I send a PUT request to `/tasks/{id}` with updated fields, then the task is updated and the new data is returned.
- Given a task exists, when I send a PATCH request to `/tasks/{id}` with partial data, then only specified fields are updated.
- Given a task with ID 999 does not exist, when I send an update request, then a 404 Not Found error is returned.
- Given I try to set status to an invalid value, then a 400 Bad Request error is returned.

### US-5: Delete a Task
**As a** user, **I want to** delete a task, **so that** I can remove completed or unnecessary items.

**Acceptance Criteria:**
- Given a task exists, when I send a DELETE request to `/tasks/{id}`, then the task is removed and a 204 No Content response is returned.
- Given a task with ID 999 does not exist, when I send a DELETE request, then a 404 Not Found error is returned.

### US-6: Filter Tasks by Status
**As a** user, **I want to** filter tasks by their status, **so that** I can view tasks in a specific state.

**Acceptance Criteria:**
- Given tasks with different statuses exist, when I send a GET request to `/tasks?status=pending`, then only pending tasks are returned.
- Given an invalid status filter is provided, then a 400 Bad Request error is returned.

## Functional Requirements

### FR-1: Task Creation (Must)
- The API must support POST `/tasks` endpoint.
- Request body must include: title (string, required), description (string, optional), dueDate (ISO 8601 date, optional).
- Status defaults to "pending" if not provided.
- Response must return created task with generated ID.

### FR-2: Task Retrieval (Must)
- The API must support GET `/tasks` to list all tasks.
- The API must support GET `/tasks/:id` to retrieve a single task.
- GET `/tasks` must support optional query parameter `status` for filtering.

### FR-3: Task Update (Must)
- The API must support PUT `/tasks/:id` for full updates.
- The API must support PATCH `/tasks/:id` for partial updates.
- Valid status values: "pending", "in-progress", "done".

### FR-4: Task Deletion (Must)
- The API must support DELETE `/tasks/:id`.
- Deletion must permanently remove the task from the database.

### FR-5: Database Operations (Must)
- SQLite must be used as the database.
- Database must persist data between server restarts.
- Tasks table must have columns: id (INTEGER PRIMARY KEY), title (TEXT NOT NULL), description (TEXT), dueDate (TEXT), status (TEXT DEFAULT 'pending'), createdAt (TEXT), updatedAt (TEXT).

### FR-6: Error Handling (Should)
- Invalid requests must return appropriate HTTP status codes (400, 404, 500).
- Error responses must include a descriptive error message.

### FR-7: Input Validation (Must)
- Title must be non-empty and max 255 characters.
- Description must be max 1000 characters if provided.
- Due date must be in valid ISO 8601 format if provided.
- Status must be one of: "pending", "in-progress", "done".

## Non-Functional Requirements

### NFR-1: Technology Stack (Must)
- Backend framework: Express.js
- Language: TypeScript
- Database: SQLite

### NFR-2: API Standards (Must)
- API must follow REST conventions.
- All endpoints must return JSON responses.
- API must use appropriate HTTP methods and status codes.

### NFR-3: Performance (Should)
- API responses must complete within 500ms for typical operations.
- Database queries must be optimized with proper indexing on status field.

### NFR-4: Code Quality (Should)
- TypeScript strict mode must be enabled.
- Code must follow ESLint rules for consistency.
- All types must be explicitly defined.

### NFR-5: Scalability (Could)
- Database connection handling must support concurrent requests.
- Code structure must allow easy migration to other databases if needed.

### NFR-6: Maintainability (Should)
- Routes must be organized by resource.
- Database operations must be separated into repository/data layer.
- Validation logic must be centralized.

## Edge Cases

### EC-1: Empty or Whitespace Titles
- Input: Title contains only spaces or is empty string.
- Expected: Return 400 Bad Request with validation error.

### EC-2: Very Long Input
- Input: Title exceeds 255 characters or description exceeds 1000 characters.
- Expected: Return 400 Bad Request with validation error.

### EC-3: Invalid Date Formats
- Input: dueDate in format "2024/01/15" instead of "2024-01-15T00:00:00Z".
- Expected: Return 400 Bad Request with validation error.

### EC-4: Past Due Dates
- Input: dueDate is in the past.
- Expected: Accept the task (business decision for future consideration).

### EC-5: Concurrent Updates
- Input: Multiple simultaneous updates to the same task.
- Expected: Last write wins; no data corruption occurs.

### EC-6: Non-Existent Task Operations
- Input: GET, PUT, PATCH, DELETE on task ID that doesn't exist.
- Expected: Return 404 Not Found.

### EC-7: Invalid Status Values
- Input: status set to "completed" instead of "done".
- Expected: Return 400 Bad Request with list of valid values.

### EC-8: Database File Locking
- Input: SQLite database file is locked by another process.
- Expected: Return 500 Internal Server Error with appropriate message.

### EC-9: Special Characters in Input
- Input: Title or description contains SQL injection attempts or special characters.
- Expected: Input is properly sanitized; no SQL injection possible.

### EC-10: Malformed JSON
- Input: Request body is not valid JSON.
- Expected: Return 400 Bad Request.

## Assumptions

1. **No Authentication Required**: The API does not require authentication or authorization. All endpoints are publicly accessible.

2. **Single User Context**: The system is designed for single-user or shared task lists without user-specific isolation.

3. **SQLite File Location**: The SQLite database file will be stored in the project root as `tasks.db`.

4. **Server Port**: The Express server will run on port 3000 by default.

5. **No Pagination**: The GET `/tasks` endpoint returns all tasks without pagination (acceptable for small task lists).

6. **No Soft Deletes**: Tasks are permanently deleted; no soft delete or archive functionality is required.

7. **No Task Ordering**: Tasks are returned in creation order (by ID) unless filtered by status.

8. **Status Transitions**: Any status can be changed to any other status without restrictions (e.g., "done" can be changed back to "pending").

9. **No Recurring Tasks**: Tasks are one-time items; no recurring or repeating task functionality is required.

10. **No Attachments**: Tasks cannot have file attachments or images; only text fields are supported.

11. **No Notifications**: The system does not send reminders or notifications for due dates.

12. **Development Environment**: The API is primarily for development/testing; production deployment considerations are out of scope.

## Open Questions

1. Should there be a maximum number of tasks allowed in the system?

2. Should completed tasks be automatically archived or deleted after a certain period?

3. Should due dates support timezone information or always be UTC?

4. Is there a need for task priority levels (high, medium, low) beyond status?

5. Should the API support bulk operations (create multiple tasks, delete multiple tasks)?

6. Is API versioning required (e.g., `/api/v1/tasks`)?

7. Should there be rate limiting to prevent abuse?

8. Is logging required for audit purposes (who created/modified/deleted tasks)?

9. Should the API support task search by title/description text?

10. Are there any compliance requirements (GDPR, data retention policies)?
