# AGENTS.md — test-project-morning

This file describes the project for AI agents working on implementation issues.

## Project Context

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
**As a** user, **I want to** filter tasks by their status, **so that** I can view task

[... truncated for brevity ...]

## Architecture

# System Architecture: test-project-morning

## System Overview

test-project-morning is a RESTful Task Management API that enables users to create, retrieve, update, and delete tasks. The system provides a simple CRUD interface with filtering capabilities, designed for simplicity, maintainability, and testability.

**Key Characteristics:**
- RESTful API architecture
- Stateless request handling
- In-memory data storage (with extensibility for persistence)
- JSON-based request/response format
- Synchronous request-response pattern

**Stakeholder Alignment:**
- End Users: Direct API consumers requiring simple task management
- Product Owner: Clear requirements defined through user stories
- Development Team: Modular architecture for easy implementation
- QA Team: Well-defined contracts for test validation

## Components

### 1. API Gateway / Router
**Responsibility:** Entry point for all HTTP requests; routes requests to appropriate handlers.

**Interfaces:**
- `route(method: string, path: string, handler: Function): void`
- `middleware(chain: Middleware[]): void`

**Dependencies:** Express.js framework

---

### 2. Task Controller
**Responsibility:** Handles HTTP request/response lifecycle for task operations; validates input; formats output.

**Interfaces:**
- `createTask(req, res): Promise<void>` - Handles POST /tasks
- `getAllTasks(req, res): Promise<void>` - Handles GET /tasks
- `getTaskById(req, res): Promise<void>` - Handles GET /tasks/:id
- `updateTask(req, res): Promise<void>` - Handles PUT /tasks/:id
- `patchTask(req, res): Promise<void>` - Handles PATCH /tasks/:id
- `deleteTask(req, res): Promise<void>` - Handles DELETE /tasks/:id

**Dependencies:** Task Service, Validation Utils

---

### 3. Task Service
**Responsibility:** Business logic layer; orchestrates task operations; enforces business rules.

**Interfaces:**
- `create(taskData: CreateTaskDto): Promise<Task>`
- `findAll(status?: string): Promise<Task[]>`
- `findById(id: number): Promise<Task | null>`
- `update(id: number, taskData: UpdateTaskDto): Promise<Task>`
- `patch(id: number, taskData: Partial<UpdateTaskDto>): Promise<Task>`
- `delete(id: number): Promise<void>`

**Dependencies:** Task Repository, Validation Utils

---

### 4. Task Repository
**Responsibility:** Data access layer; handles CRUD operations; abstracts storage mechanism.

**Interfaces:**
- `save(task: Task): Promise<Task>`
- `findAll(status?: string): Promise<Task[]>`
- `findById(id: number): Promise<Task | null>`
- `update(id: number, task: Task): Promise<Task>`
- `delete(id: number): Promise<boolean>`

**Dependencies:** In-memory store (extensible)

---

### 5. Validation Utils
**Responsibility:** Input validation; format checking; business rule enforcement.

**Interfaces:**
- `validateTaskCreate(data: any): ValidationResult`
- `validateTaskUpdate(data: any): ValidationResult`
- `validateStatus(status: string): boolean`
- `validateDateFormat(date: string): boolean`

**Dependencies:** None

---

### 6. Error

[... truncated for brevity ...]

## Working Guidelines

- Read this file and README.md before starting any work
- Follow existing code patterns and conventions
- Write clean, production-quality code with proper error handling
- Create or update tests if a testing setup exists
- Do NOT run git commands — the pipeline handles commits and pushes
- Do NOT ask questions — you are running in an automated pipeline