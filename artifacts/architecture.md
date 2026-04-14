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

### 6. Error Handler
**Responsibility:** Centralized error handling; formats error responses; logs errors.

**Interfaces:**
- `handleError(err: Error, req, res): void`
- `notFound(req, res): void`

**Dependencies:** None

---

## Data Model

### Task Entity

```typescript
interface Task {
  id: number;              // Unique identifier (auto-generated)
  title: string;           // Required, max 200 characters
  description: string;     // Optional, max 1000 characters
  dueDate: string | null;  // Optional, ISO 8601 format (YYYY-MM-DD)
  status: TaskStatus;      // Required, one of: "pending" | "in_progress" | "completed"
  createdAt: string;       // Auto-generated, ISO 8601 datetime
  updatedAt: string;       // Auto-generated, ISO 8601 datetime
}
```

### TaskStatus Enum

```typescript
type TaskStatus = "pending" | "in_progress" | "completed";
```

### Data Transfer Objects (DTOs)

**CreateTaskDto:**
```typescript
interface CreateTaskDto {
  title: string;           // Required
  description?: string;    // Optional
  dueDate?: string;        // Optional, ISO 8601
  status?: TaskStatus;     // Optional, defaults to "pending"
}
```

**UpdateTaskDto:**
```typescript
interface UpdateTaskDto {
  title?: string;
  description?: string;
  dueDate?: string;
  status?: TaskStatus;
}
```

### Relationships

- **Single Entity:** Task is a standalone entity with no relationships to other entities.
- **Future Extensibility:** Architecture supports adding User entity for task ownership, Category entity for task categorization.

## API Contracts

### POST /tasks
**Create a new task**

**Request:**
- Method: POST
- Path: `/tasks`
- Headers: `Content-Type: application/json`
- Body:
```json
{
  "title": "string (required, 1-200 chars)",
  "description": "string (optional, max 1000 chars)",
  "dueDate": "string (optional, ISO 8601 YYYY-MM-DD)",
  "status": "string (optional, one of: pending|in_progress|completed)"
}
```

**Response:**
- Success (201 Created):
```json
{
  "id": 1,
  "title": "string",
  "description": "string",
  "dueDate": "2026-05-01",
  "status": "pending",
  "createdAt": "2026-04-14T10:30:00Z",
  "updatedAt": "2026-04-14T10:30:00Z"
}
```
- Client Error (400 Bad Request): `{"error": "Validation failed: message"}`
- Server Error (500 Internal Server Error): `{"error": "Internal server error"}`

---

### GET /tasks
**Retrieve all tasks (with optional status filter)**

**Request:**
- Method: GET
- Path: `/tasks`
- Query Parameters:
  - `status` (optional): Filter by status (pending|in_progress|completed)

**Response:**
- Success (200 OK):
```json
[
  {
    "id": 1,
    "title": "string",
    "description": "string",
    "dueDate": "2026-05-01",
    "status": "pending",
    "createdAt": "2026-04-14T10:30:00Z",
    "updatedAt": "2026-04-14T10:30:00Z"
  }
]
```
- Client Error (400 Bad Request): `{"error": "Invalid status filter"}`

---

### GET /tasks/:id
**Retrieve a single task by ID**

**Request:**
- Method: GET
- Path: `/tasks/:id`
- Path Parameters:
  - `id` (required): Task ID (integer)

**Response:**
- Success (200 OK):
```json
{
  "id": 1,
  "title": "string",
  "description": "string",
  "dueDate": "2026-05-01",
  "status": "pending",
  "createdAt": "2026-04-14T10:30:00Z",
  "updatedAt": "2026-04-14T10:30:00Z"
}
```
- Not Found (404 Not Found): `{"error": "Task not found"}`

---

### PUT /tasks/:id
**Full update of a task**

**Request:**
- Method: PUT
- Path: `/tasks/:id`
- Headers: `Content-Type: application/json`
- Path Parameters:
  - `id` (required): Task ID (integer)
- Body:
```json
{
  "title": "string",
  "description": "string",
  "dueDate": "2026-05-01",
  "status": "pending"
}
```
*All fields required in full update*

**Response:**
- Success (200 OK): Updated task object
- Not Found (404 Not Found): `{"error": "Task not found"}`
- Client Error (400 Bad Request): `{"error": "Validation failed: message"}`

---

### PATCH /tasks/:id
**Partial update of a task**

**Request:**
- Method: PATCH
- Path: `/tasks/:id`
- Headers: `Content-Type: application/json`
- Path Parameters:
  - `id` (required): Task ID (integer)
- Body:
```json
{
  "title": "string (optional)",
  "description": "string (optional)",
  "dueDate": "2026-05-01 (optional)",
  "status": "pending (optional)"
}
```
*At least one field required*

**Response:**
- Success (200 OK): Updated task object
- Not Found (404 Not Found): `{"error": "Task not found"}`
- Client Error (400 Bad Request): `{"error": "Validation failed: message"}`

---

### DELETE /tasks/:id
**Delete a task**

**Request:**
- Method: DELETE
- Path: `/tasks/:id`
- Path Parameters:
  - `id` (required): Task ID (integer)

**Response:**
- Success (204 No Content): Empty body
- Not Found (404 Not Found): `{"error": "Task not found"}`

## Technology Stack

| Component | Technology | Justification |
|-----------|------------|---------------|
| Runtime | Node.js (v20 LTS) | Non-blocking I/O ideal for I/O-bound APIs; large ecosystem; aligns with modern JS development |
| Framework | Express.js | Lightweight, mature, extensive middleware ecosystem; minimal boilerplate for REST APIs |
| Language | TypeScript | Static typing improves maintainability; catches errors at compile time; excellent IDE support |
| Validation | Joi or express-validator | Mature validation libraries; expressive schema definitions; clear error messages |
| Testing | Jest + Supertest | Jest is industry standard for JS testing; Supertest enables easy HTTP endpoint testing |
| Data Storage | In-memory (Map/Array) | Simple, fast, no external dependencies for initial implementation; easily replaceable |
| HTTP Client | Axios (for testing) | Promise-based; widely used; excellent for testing external API calls |
| Error Handling | Custom middleware | Centralized error handling; consistent error responses; easier debugging |
| Logging | Winston | Structured logging; multiple transport options; production-ready |
| Environment Config | dotenv | Simple environment variable management; 12-factor compliant |

**Assumptions:**
- Initial deployment targets single-instance operation
- No authentication required for MVP (can be added later)
- Data persistence not required initially (in-memory acceptable)
- Maximum expected load: 1000 requests/minute

## Data Flow

### Request Lifecycle: POST /tasks

1. **Client Request** → User sends POST request to `/tasks` with JSON body
2. **Express Router** → Routes request to `TaskController.createTask()`
3. **Validation Layer** → `ValidationUtils.validateTaskCreate()` validates input
   - Checks title is present and valid length
   - Validates date format if dueDate provided
   - Validates status if provided
4. **Controller** → Extracts validated data, calls `TaskService.create()`
5. **Service** → Applies business logic:
   - Sets default status to "pending" if not provided
   - Generates unique ID
   - Sets createdAt and updatedAt timestamps
6. **Repository** → `TaskRepository.save()` stores task in memory
   - Returns saved task with generated ID
7. **Service** → Returns task to Controller
8. **Controller** → Formats response with 201 status
9. **Express** → Returns JSON response to client

### Request Lifecycle: GET /tasks?status=pending

1. **Client Request** → User sends GET request to `/tasks?status=pending`
2. **Express Router** → Routes request to `TaskController.getAllTasks()`
3. **Validation Layer** → Validates status parameter if provided
4. **Controller** → Extracts query params, calls `TaskService.findAll(status)`
5. **Service** → Calls `TaskRepository.findAll(status)`
6. **Repository** → Filters tasks by status (if provided) from in-memory store
7. **Repository** → Returns filtered array of tasks
8. **Service** → Returns array to Controller
9. **Controller** → Formats response with 200 status
10. **Express** → Returns JSON array to client

### Request Lifecycle: GET /tasks/:id (Not Found)

1. **Client Request** → User sends GET request to `/tasks/999`
2. **Express Router** → Routes request to `TaskController.getTaskById()`
3. **Controller** → Extracts id from path params, calls `TaskService.findById(999)`
4. **Service** → Calls `TaskRepository.findById(999)`
5. **Repository** → Searches in-memory store, returns null
6. **Service** → Returns null to Controller
7. **Controller** → Detects null, throws NotFoundError
8. **Error Handler** → Catches error, formats 404 response
9. **Express** → Returns `{"error": "Task not found"}` with 404 status

### Request Lifecycle: DELETE /tasks/:id

1. **Client Request** → User sends DELETE request to `/tasks/1`
2. **Express Router** → Routes request to `TaskController.deleteTask()`
3. **Controller** → Extracts id, calls `TaskService.delete(1)`
4. **Service** → Calls `TaskRepository.delete(1)`
5. **Repository** → Removes task from store, returns true
6. **Service** → Returns to Controller
7. **Controller** → Returns 204 No Content (empty body)
8. **Express** → Sends response to client

## Security Considerations

### Current Scope (MVP)
- **No Authentication:** API is publicly accessible (assumption for MVP)
- **No Authorization:** No user-specific access control (single-user scenario)
- **Input Validation:** All inputs validated to prevent injection attacks
- **Rate Limiting:** Not implemented (can be added via express-rate-limit)

### Security Measures Implemented
1. **Input Validation:** All request bodies validated before processing
2. **Type Safety:** TypeScript prevents type-related vulnerabilities
3. **Error Handling:** Generic error messages prevent information leakage
4. **No SQL Injection:** In-memory storage eliminates SQL injection risk

### Future Security Enhancements
1. **Authentication:** Add JWT or OAuth2 middleware
2. **Authorization:** Implement role-based access control (RBAC)
3. **Rate Limiting:** Prevent abuse with request throttling
4. **HTTPS:** Enforce TLS for production deployments
5. **CORS:** Configure appropriate cross-origin policies
6. **Helmet:** Add security headers via helmet.js middleware
7. **Audit Logging:** Track all mutations for compliance

### Data Protection
- **Sensitive Data:** No sensitive data (PII, credentials) stored
- **Data Retention:** Tasks persist until deleted (no auto-expiry)
- **Backup:** In-memory data lost on restart (acceptable for MVP)

## Scalability Notes

### Current Architecture Limitations
- **In-Memory Storage:** Data lost on server restart; not suitable for production
- **Single Instance:** No session affinity needed (stateless), but no load balancing
- **No Caching:** Every request hits the data store

### Horizontal Scaling Strategy
1. **Stateless Design:** All handlers are stateless; can deploy multiple instances
2. **External Data Store:** Replace in-memory store with PostgreSQL/Redis
3. **Load Balancer:** Add NGINX or AWS ALB for traffic distribution
4. **Session Management:** Not needed (stateless API)

### Vertical Scaling Path
1. **Node.js Clustering:** Utilize all CPU cores via cluster module
2. **Memory Optimization:** Stream large responses; paginate results
3. **Performance Monitoring:** Add APM (New Relic, Datadog) for insights

### Database Migration Path
**Phase 1 (Current):** In-memory Map/Array
**Phase 2:** SQLite for local persistence
**Phase 3:** PostgreSQL for production with:
- Connection pooling (pg-pool)
- Migrations (Knex.js or Prisma)
- Indexes on status, dueDate fields

### Caching Strategy
- **Future:** Add Redis cache for GET /tasks endpoint
- **TTL:** 5-minute cache for task lists
- **Invalidation:** Clear cache on any task mutation

### Performance Benchmarks (Target)
- **Latency:** < 100ms for CRUD operations
- **Throughput:** 1000+ requests/second
- **Concurrency:** 100+ simultaneous connections

### Monorepo Structure (Future)
```
/app/projects/test-project-morning/
├── apps/
│   ├── api/              # Express API
│   └── web/              # Future frontend
├── packages/
│   ├── shared/           # Shared types, utils
│   └── database/         # Database layer abstraction
└── artifacts/            # Architecture, docs
```

---

**Document Version:** 1.0  
**Last Updated:** 2026-04-14  
**Author:** SDLC Architecture Pipeline
