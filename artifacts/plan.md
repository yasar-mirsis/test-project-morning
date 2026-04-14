## Overview

This plan outlines the implementation of test-project-morning, a RESTful Task Management API built with Node.js, Express.js, and TypeScript. The API provides full CRUD operations for tasks with filtering capabilities, input validation, and proper error handling. The architecture follows a layered approach with Controller → Service → Repository pattern, using in-memory storage for simplicity. The implementation will include 8 sequential tasks covering project setup, data models, validation, service layer, controller, routes, error handling, and testing infrastructure.

## Tasks

### 1. Project Initialization and TypeScript Configuration
**Description:** Set up the Node.js project with TypeScript, install required dependencies, and configure the project structure. Install Express.js, TypeScript, and development dependencies including ts-node, @types/node, @types/express, @types/node-fetch for testing, and nodemon for development. Create the basic folder structure with src directories for controllers, services, repositories, validators, routes, types, and utils. Configure tsconfig.json with proper compiler options for ES2020 target, commonjs module system, strict mode enabled, and proper path aliases. Create a basic package.json with scripts for dev, build, start, and test commands.

**Files to create:**
- /app/projects/test-project-morning/package.json
- /app/projects/test-project-morning/tsconfig.json
- /app/projects/test-project-morning/src/index.ts
- /app/projects/test-project-morning/src/types/task.ts
- /app/projects/test-project-morning/src/types/dto.ts
- /app/projects/test-project-morning/.env.example

**Files to modify:**
- None

**Complexity:** Low
**Dependencies:** None

### 2. Data Models and Type Definitions
**Description:** Define all TypeScript interfaces and types required for the task management system. Create the Task interface with fields: id (number), title (string, max 200), description (string, max 1000, optional), dueDate (string ISO 8601 or null), status (TaskStatus enum), createdAt (string ISO 8601), updatedAt (string ISO 8601). Define TaskStatus type as "pending" | "in_progress" | "completed". Create CreateTaskDto interface with title (required), description (optional), dueDate (optional), status (optional, defaults to "pending"). Create UpdateTaskDto interface with optional title, description, dueDate, status fields. Create ValidationResult type with success boolean and errors array. Create APIResponse generic type for standardized responses.

**Files to create:**
- /app/projects/test-project-morning/src/types/task.ts
- /app/projects/test-project-morning/src/types/dto.ts

**Files to modify:**
- None

**Complexity:** Low
**Dependencies:** 1

### 3. Validation Utilities
**Description:** Implement input validation utilities for task operations. Create validateTaskCreate function that checks: title is present and 1-200 characters, description if present is 0-1000 characters, dueDate if present matches YYYY-MM-DD format, status if present is valid TaskStatus. Create validateTaskUpdate function that validates only provided fields. Create validateStatus function that checks if status is one of the valid TaskStatus values. Create validateDateFormat function that validates YYYY-MM-DD format with regex ^\d{4}-\d{2}-\d{2}$. Create getValidationErrors function that formats validation errors into a consistent error object. Export all validation utilities from src/utils/validation.ts.

**Files to create:**
- /app/projects/test-project-morning/src/utils/validation.ts

**Files to modify:**
- None

**Complexity:** Medium
**Dependencies:** 2

### 4. Task Repository (Data Access Layer)
**Description:** Implement the TaskRepository class for in-memory data persistence. Create an in-memory Map or array to store tasks. Implement save method that creates a new task with generated id, sets createdAt and updatedAt timestamps, and returns the saved task. Implement findAll method that filters by optional status parameter. Implement findById method that returns null if task not found. Implement update method that updates task fields, preserves id and timestamps, returns updated task or null. Implement patch method that partially updates task fields. Implement delete method that removes task and returns boolean. Add a seed method for test data. Export from src/repositories/taskRepository.ts.

**Files to create:**
- /app/projects/test-project-morning/src/repositories/taskRepository.ts
- /app/projects/test-project-morning/src/repositories/index.ts

**Files to modify:**
- None

**Complexity:** Medium
**Dependencies:** 2

### 5. Task Service (Business Logic Layer)
**Description:** Implement the TaskService class containing business logic for task operations. Create create method that validates input using validation utilities, calls repository save, and returns the created task with 400 error if validation fails. Create findAll method that accepts optional status parameter and passes to repository. Create findById method that returns task or throws NotFound error. Create update method that validates input, calls repository update, returns updated task or throws NotFound if not found. Create patch method that validates and partially updates. Create delete method that removes task and throws NotFound if not found. Add error handling for all operations. Export from src/services/taskService.ts.

**Files to create:**
- /app/projects/test-project-morning/src/services/taskService.ts
- /app/projects/test-project-morning/src/services/index.ts

**Files to modify:**
- None

**Complexity:** Medium
**Dependencies:** 3, 4

### 6. Task Controller and Routes
**Description:** Implement the TaskController class to handle HTTP request/response lifecycle. Create createTask handler for POST /tasks that parses body, calls service create, returns 201 with task or 400 with validation errors. Create getAllTasks handler for GET /tasks that accepts optional status query parameter, calls service findAll, returns 200 with task array. Create getTaskById handler for GET /tasks/:id that calls service findById, returns 200 with task or 404 if not found. Create updateTask handler for PUT /tasks/:id that validates body, calls service update, returns 200 with updated task or 404/400 errors. Create patchTask handler for PATCH /tasks/:id for partial updates. Create deleteTask handler for DELETE /tasks/:id, returns 204 on success or 404 if not found. Create routes file with Express router mounting all handlers. Export from src/controllers/taskController.ts and src/routes/tasks.ts.

**Files to create:**
- /app/projects/test-project-morning/src/controllers/taskController.ts
- /app/projects/test-project-morning/src/routes/tasks.ts
- /app/projects/test-project-morning/src/routes/index.ts

**Files to modify:**
- /app/projects/test-project-morning/src/index.ts (update to include routes)

**Complexity:** Medium
**Dependencies:** 5

### 7. Error Handling and Middleware
**Description:** Implement centralized error handling middleware and utilities. Create ErrorHandler class with handleError method that catches errors, logs them, and sends appropriate HTTP responses with status codes (400 for validation, 404 for not found, 500 for server errors). Create notFound middleware that returns 404 for unmatched routes. Create error formatting utility that standardizes error response objects with { error: string, message: string, details?: any }. Implement Express error handling middleware with signature (err, req, res, next). Add global error handler in index.ts. Create custom error classes: AppError (base), ValidationError, NotFoundError. Export from src/middleware/errorHandler.ts.

**Files to create:**
- /app/projects/test-project-morning/src/middleware/errorHandler.ts
- /app/projects/test-project-morning/src/errors.ts

**Files to modify:**
- /app/projects/test-project-morning/src/index.ts (add error handling middleware)

**Complexity:** Medium
**Dependencies:** 4, 6

### 8. Testing Infrastructure and Initial Tests
**Description:** Set up testing infrastructure with Jest and Supertest. Install @types/jest, jest, supertest as dev dependencies. Create jest.config.js with proper configuration. Create src/__tests__/setup.ts for test setup. Create test suite for validation utilities with test cases for valid/invalid inputs. Create test suite for task repository with CRUD operations. Create test suite for task service with business logic validation. Create test suite for task controller with API endpoint tests including status codes and response formats. Add test scripts to package.json. Ensure all tests pass with coverage.

**Files to create:**
- /app/projects/test-project-morning/jest.config.js
- /app/projects/test-project-morning/src/__tests__/setup.ts
- /app/projects/test-project-morning/src/__tests__/validation.test.ts
- /app/projects/test-project-morning/src/__tests__/taskRepository.test.ts
- /app/projects/test-project-morning/src/__tests__/taskService.test.ts
- /app/projects/test-project-morning/src/__tests__/taskController.test.ts
- /app/projects/test-project-morning/.gitignore

**Files to modify:**
- /app/projects/test-project-morning/package.json (add test scripts)
- /app/projects/test-project-morning/tsconfig.json (add test path mapping)

**Complexity:** High
**Dependencies:** 2, 3, 4, 5, 6, 7

## File Structure

```
test-project-morning/
├── package.json
├── tsconfig.json
├── jest.config.js
├── .env.example
├── .gitignore
├── src/
│   ├── index.ts
│   ├── types/
│   │   ├── task.ts
│   │   └── dto.ts
│   ├── repositories/
│   │   ├── taskRepository.ts
│   │   └── index.ts
│   ├── services/
│   │   ├── taskService.ts
│   │   └── index.ts
│   ├── controllers/
│   │   └── taskController.ts
│   ├── routes/
│   │   ├── tasks.ts
│   │   └── index.ts
│   ├── middleware/
│   │   └── errorHandler.ts
│   ├── utils/
│   │   └── validation.ts
│   ├── errors.ts
│   └── __tests__/
│       ├── setup.ts
│       ├── validation.test.ts
│       ├── taskRepository.test.ts
│       ├── taskService.test.ts
│       └── taskController.test.ts
├── dist/ (generated on build)
└── artifacts/
    └── plan.md
```

## Testing Strategy

**Unit Testing:**
- Validation utilities: Test all validation functions with valid inputs, invalid inputs, edge cases (empty strings, max lengths, invalid dates, invalid statuses)
- Repository: Test CRUD operations, filtering by status, not found scenarios, timestamp generation
- Service: Test business logic, validation integration, error throwing, status defaults
- Controller: Test request parsing, service integration, response formatting, status codes

**Integration Testing:**
- API endpoints: Test all REST endpoints with Supertest
- POST /tasks: Verify creation, validation errors (400), default status
- GET /tasks: Verify list retrieval, empty array, status filtering
- GET /tasks/:id: Verify single task retrieval, 404 for non-existent
- PUT /tasks/:id: Verify full update, validation errors, 404 for non-existent
- PATCH /tasks/:id: Verify partial update
- DELETE /tasks/:id: Verify deletion, 204 response, 404 for non-existent
- Error handling: Verify error middleware catches and formats errors correctly
- Not found: Verify 404 for unmatched routes

**Test Coverage Requirements:**
- Minimum 80% code coverage
- All validation edge cases covered
- All API status codes verified
- Error scenarios tested

## Risks

1. **In-Memory Storage Durability:** Using in-memory storage means data is lost on server restart. This is acceptable per architecture but should be documented as a limitation for future persistence layer implementation.

2. **Validation Regex Edge Cases:** The YYYY-MM-DD date validation regex may accept invalid dates (e.g., 2024-02-30). Consider adding calendar date validation in TaskService.

3. **Concurrent ID Generation:** Simple incrementing ID counter may have race conditions if multiple requests arrive simultaneously. For a simple API this is acceptable, but production systems should use UUIDs or database sequences.

4. **Middleware Order:** Express middleware order is critical - error handlers must be registered last. Incorrect ordering could cause errors to not be caught properly.

5. **Testing Environment Isolation:** Tests share the same in-memory repository. Each test file needs to reset or use isolated repository instances to prevent test interference.
