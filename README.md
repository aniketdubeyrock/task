# TaskFlow – Enterprise Team Task Management Platform

[![Backend](https://img.shields.io/badge/Spring_Boot-3.3.5-brightgreen.svg?logo=springboot)](https://spring.io/projects/spring-boot)
[![Kotlin](https://img.shields.io/badge/Kotlin-1.9.25-purple.svg?logo=kotlin)](https://kotlinlang.org/)
[![Frontend](https://img.shields.io/badge/React-18.3.1-blue.svg?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6.3-3178c6.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Database](https://img.shields.io/badge/PostgreSQL-18-336791.svg?logo=postgresql)](https://www.postgresql.org/)
[![UI Style](https://img.shields.io/badge/Design-Saffron_&_Ember-orange.svg)](https://tailwindcss.com/)

**TaskFlow** is an enterprise-grade full-stack task and project management platform built to fulfill the **Full Stack Engineer Take-Home Assignment**. It features a reactive, strictly-typed **Spring Boot 3 + Kotlin** REST API and a **React 18 + TypeScript + Vite** frontend styled with a modern **Saffron & Ember** design system (`#FF9933` radiant saffron, Plus Jakarta Sans typography, glassmorphism, spring-animated modals, and real-time in-app notifications).

---

## 🌟 Key Highlights & Features

1. **Authentication & Role-Based Access Control (RBAC)**:
   - Stateless JWT authentication via Spring Security 6 filter chain (`JwtAuthFilter.kt`, `JwtService.kt`).
   - Secure password hashing using BCrypt.
   - Distinct roles: `SUPERADMIN` and `USER` (Team Member).
   - One-click demo credentials switcher in the header profile dropdown.

2. **Real-time In-App Notification System**:
   - Backend `Notification` entity linked to recipients, actors, and tasks.
   - Automatic notification dispatch whenever a task is assigned or reassigned to a team member.
   - Interactive header **Notification Bell Dropdown** with animated unread badge count (`animate-ping`), time-ago relative stamps, individual mark-as-read, and a "Mark all read" button.

3. **Interactive Kanban Board**:
   - 3 columns: **To Do**, **In Progress**, and **Done** powered by `@dnd-kit/core` and `@dnd-kit/sortable`.
   - **Optimistic UI Updates**: Instant client-side card progression with automatic rollback on network failure.
   - Automatic overdue deadline detection (`⚠️ Overdue` badges).
   - Multi-parameter filtering by priority, assignee, search keyword, and custom sorting strategies.

4. **Saffron & Warm Ember UI Redesign**:
   - Brand color palette: Radiant Saffron (`#F97316` / `#FF9933`), warm amber gradients, and deep slate (`#0F172A`).
   - Clean **Plus Jakarta Sans** typography loaded from Google Fonts.
   - Spring-physics animated modals (`framer-motion`) with backdrop blur and saffron accent headers.
   - Layered depth shadows (`card-saffron-glow`) and responsive layout for mobile, tablet, and desktop.

5. **Analytics & Project Summary**:
   - Real-time project completion calculation:
     $$\text{Progress} = \frac{\text{Completed Tasks}}{\text{Total Tasks}} \times 100$$
   - Visual status distribution donut chart and project metric cards.
   - OpenAPI / Swagger 3 interactive documentation at `/swagger-ui.html`.

---

## 🛠️ Technology Stack

| Layer | Technology | Description |
|---|---|---|
| **Backend Framework** | Spring Boot 3.3.5 | Modern enterprise Java/Kotlin framework |
| **Language & Build** | Kotlin 1.9.25, Gradle 9.2.0 | Idiomatic Kotlin JVM with Gradle wrapper |
| **Persistence & ORM** | Spring Data JPA, Hibernate | PostgreSQL relational persistence |
| **Security & Auth** | Spring Security 6, JJWT (0.12.6) | Stateless token-based JWT authentication |
| **API Documentation** | Springdoc OpenAPI (Swagger UI 2.6.0) | Interactive documentation at `/swagger-ui.html` |
| **Frontend Framework** | React 18.3.1, Vite 5.4.11 | High-performance bundling and JSX rendering |
| **Language** | TypeScript 5.6.3 | Full end-to-end type safety |
| **Styling & Icons** | Tailwind CSS 3.4.15, Lucide React | Saffron aesthetic with Plus Jakarta Sans |
| **Animations** | Framer Motion 11.11.17 | Fluid spring modals and layout animations |
| **Drag & Drop** | `@dnd-kit/core`, `@dnd-kit/sortable` | Robust drag-and-drop Kanban interaction |
| **Testing** | JUnit 5, MockK, SpringMockK, Vitest, RTL | Unit & integration tests for backend and frontend |

---

## 🏛️ Design Patterns & Architecture

### 1. Strategy Pattern (`com.taskflow.service.strategy.*`)
- Decouples task sorting criteria from the `TaskService` business logic.
- Defined `TaskSortStrategy` interface with concrete implementations:
  - `DueDateSortStrategy`: Sorts by task deadline.
  - `PrioritySortStrategy`: Sorts by priority rank (`HIGH` > `MEDIUM` > `LOW`).
  - `TitleSortStrategy`: Sorts alphabetically by task title.
  - `CreatedAtSortStrategy`: Sorts by task creation date.
- `TaskSortingContext` dynamically selects the strategy based on the query parameter `?sortBy=dueDate`.

### 2. Repository Pattern (`com.taskflow.repository.*`)
- Separates data persistence from business logic using Spring Data `JpaRepository` and `JpaSpecificationExecutor`.
- Implements custom JPQL queries such as `findAllByOwnerOrAssignee` to support team project visibility.

### 3. Factory / DTO Mapper Pattern (`com.taskflow.dto.Mappers.kt`)
- Extension functions (`User.toDto()`, `Project.toDto()`, `Task.toDto()`, `Notification.toDto()`) ensure JPA entities are never leaked directly over HTTP.
- Encapsulates dynamic business logic like overdue calculation (`isOverdue = dueDate < now && status != DONE`).

### 4. Layered Architecture
- Strict separation of concerns:
  $$\text{Client (React)} \longleftrightarrow \text{Controller (REST)} \longleftrightarrow \text{Service (Business Rules)} \longleftrightarrow \text{Repository (Data Access)} \longleftrightarrow \text{PostgreSQL}$$
- Centralized error handling using `@RestControllerAdvice` in `GlobalExceptionHandler.kt` providing a uniform `ApiResponse<T>` envelope with field-level validation errors.

---

## 🧠 State Management Explanation

* **Authentication & User Profile**: Managed via React Context (`AuthContext.tsx`), providing access token storage in `localStorage`, user session state, and synchronous role checkers (`isSuperAdmin`).
* **API Requests & Board State**: Managed through structured React hooks and custom Axios wrappers (`api.ts`), ensuring optimistic UI updates on the Kanban board with instant local reordering and automatic rollback if the backend call fails.

---

## ⚖️ Assumptions & Trade-Offs

1. **Project Ownership vs. Assignee Collaboration**:
   - *Requirement*: The assignment states *"Users can only see and change projects they own."*
   - *Real-world Conflict*: If strictly enforced, a team member assigned a task by the Super Admin can never see or complete the task because they do not own the project.
   - *Resolution*: Users can see projects they **own** OR where they are **assigned to at least one task**. Non-owners have board visibility and can update their own task statuses, while project deletion remains restricted to owners.
2. **In-App Notifications vs. SMTP Email**:
   - While email requires external SMTP credentials, an in-app notification center provides immediate, reliable feedback directly within the UI, complete with unread badges, timestamps, and mark-as-read actions.

---

## 🔑 Demo Login Credentials

The application is seeded automatically on initial boot via [`DatabaseSeeder.kt`](file:///c:/Users/Aniket/Desktop/React%20projects/assignmentbyaniket/backend/src/main/kotlin/com/taskflow/config/DatabaseSeeder.kt):

| Role | Email | Password | Access Rights |
|---|---|---|---|
| **Super Admin** | `superadmin@taskflow.dev` | `SuperAdmin123!` | Full access to all projects, tasks, and team management |
| **Team Member** | `jane@taskflow.dev` | `Password123!` | Access to owned projects & assigned tasks, with seeded notification |
| **Team Member** | `bob@taskflow.dev` | `Password123!` | Standard developer account with sample project access |

---

## 🏁 Quickstart Guide

### 🚀 Option A: One-Command Docker Compose (Production Stack)
Starts PostgreSQL, Spring Boot backend, and React frontend simultaneously with one command:
```bash
docker compose up --build
```
* **Frontend**: `http://localhost:5173`
* **Backend API**: `http://localhost:5000`
* **Swagger UI Docs**: `http://localhost:5000/swagger-ui.html`

---

### Option B: Run Concurrently with Node/JVM
From the project root:
```powershell
npm run dev
```
* Backend runs at: `http://localhost:5000`
* Frontend runs at: `http://localhost:5173`

---

### Option C: Run in Separate Terminals

#### Terminal 1 — Backend (Spring Boot 3 + Kotlin)
```powershell
cd "c:\Users\Aniket\Desktop\React projects\assignmentbyaniket\backend"
.\gradlew.bat bootRun
```
* **Swagger UI Documentation**: `http://localhost:5000/swagger-ui.html`
* **Health Check**: `http://localhost:5000/api/health`

#### Terminal 2 — Frontend (React 18 + Vite)
```powershell
cd "c:\Users\Aniket\Desktop\React projects\assignmentbyaniket\frontend"
npm run dev
```
* Open `http://localhost:5173` in your browser.

---

## 🧪 Running Automated Tests

### Backend Tests (JUnit 5 + MockK + SpringBootTest)
```powershell
cd "c:\Users\Aniket\Desktop\React projects\assignmentbyaniket\backend"
.\gradlew.bat test
```
*Covers TaskService business logic, Strategy pattern sorting, validation rules, RBAC authorization, and REST integration.*

### Frontend Tests (Vitest + React Testing Library)
```powershell
cd "c:\Users\Aniket\Desktop\React projects\assignmentbyaniket\frontend"
npm test
```
*Covers Buttons, Badge variants, Priority indicators, and Empty State components.*
