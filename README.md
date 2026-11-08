# SuperTodo – Full-Stack Weekly Task Management Application

> ⚠️ **Important Demo Server Notice**  
> **The backend server may take a few minutes (around 4–5 minutes) to spin up upon initial access or launch.**  
> As this is a demo deployment hosted on a free/demo cloud instance, the server goes into a dormant state when idle and requires a brief spin-up period (cold start) to initialize the Node.js runtime and MySQL database connection pool. Please allow a few minutes during the first request.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Architecture & Request Flow](#architecture--request-flow)
4. [Key Features](#key-features)
   - [Authentication & Session Flow](#1-authentication--session-flow)
   - [Strict Weekly Cycle Rule (Monday–Sunday)](#2-strict-weekly-cycle-rule-mondaysunday)
   - [Responsive Dashboard (PC & Mobile)](#3-responsive-dashboard-pc--mobile)
   - [Mobile-Exclusive Feature: Swipe-to-Delete](#4-mobile-exclusive-feature-swipe-to-delete)
   - [Task Management (CRUD & Interactive Controls)](#5-task-management-crud--interactive-controls)
   - [Search & Filtering](#6-real-time-search)
   - [Weekly Overview & Tabbed Filtering (/weekly)](#7-weekly-overview--tabbed-filtering)
   - [Custom Confirmation Modal](#8-custom-confirmation-modal)
5. [API Endpoints Reference](#api-endpoints-reference)
6. [Environment Variables & Setup Guide](#environment-variables--setup-guide)

---

## Project Overview

**SuperTodo** is a modern, responsive full-stack weekly task management platform. Built with **Next.js 16 (App Router)** and an **Express.js / Sequelize MySQL** backend, the application strictly enforces an ISO weekly schedule (Monday to Sunday) where users organize, track, and complete daily tasks within the active week cycle.

---

## Tech Stack

### Frontend
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Server Components + Client Components)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Server State Management**: [TanStack Query v5](https://tanstack.com/query) (React Query)
- **Global Client State**: [Redux Toolkit](https://redux-toolkit.js.org/)
- **HTTP Client**: [Axios](https://axios-http.com/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/)
- **ORM**: [Sequelize ORM](https://sequelize.org/)
- **Database**: [MySQL](https://www.mysql.com/)
- **Authentication**: JSON Web Tokens (`jsonwebtoken`) & `bcrypt` for salted password hashing
- **Validation**: Strict server-side validation and database transactions (`sequelize.transaction()`)

---

## Architecture & Request Flow

To protect backend infrastructure and hide internal ports and domains from browser DevTools, all frontend API calls route through **Next.js Server Route Handlers** acting as a secure proxy:

```
[ Browser / Client UI ]
        │
        ▼ (TanStack Query Hook)
[ Frontend API Layer (src/api/*.api.ts) ]
        │
        ▼ (Relative call: /api/tasks, /api/auth)
[ Next.js Server Route Handlers (src/app/api/*) ]
        │
        ▼ (Server-to-Server with Bearer Authorization / Cookies)
[ Express Backend (http://localhost:5000/api/*) ]
        │
        ▼
[ Sequelize ORM & MySQL Database ]
```

---

## Key Features

### 1. Authentication & Session Flow
- **User Registration**:
  - Requires First Name, Last Name, Email, Password, and Password Confirmation.
  - Strict password validation: minimum 8 characters with at least 1 uppercase letter, 1 lowercase letter, and 1 special character.
  - Unique email enforcement on the database level.
- **Direct Login on Register**:
  - Upon successful registration, the backend automatically issues a JWT session token and user profile in the registration response.
  - The user is **immediately authenticated and redirected to the dashboard** (`/`) without needing a secondary login step.
- **Secure Token Storage**:
  - Authentication tokens are maintained securely using `auth_token` cookies with `SameSite=Lax` and configurable `HttpOnly` security.
- **Logout Flow**:
  - Logout triggers the `/api/auth/logout` endpoint which purges the `auth_token` cookie on the server, clears client Redux and local state, and routes to `/login`.

---

### 2. Strict Weekly Cycle Rule (Monday–Sunday)
- Every week begins on **Monday at 00:00:00** and concludes on **Sunday at 23:59:59**.
- Each Monday, the weekly cycle automatically restarts.
- Task queries, analytics, search, and date-range limits are constrained to the current week's 7 days.
- When creating or editing tasks, date pickers are locked within the active Monday-to-Sunday boundaries.

---

### 3. Responsive Dashboard (PC & Mobile)

#### 🖥️ Desktop / PC Experience
- **7-Day Menu Sidebar**: Fixed left navigation showing all 7 days of the active week with day names, date numbers, and a real-time status indicator for "Today". Clicking any day dynamically displays that day's tasks.
- **Top Summary Cards**:
  - **Task Complete Box**: Light blue accent (`#EDF2FE`), checkmark icon, and real-time count of completed tasks this week.
  - **Task Pending Box**: Light rose accent (`#FDECEE`), pending icon, and real-time count of pending tasks this week.
  - *These top status cards remain persistently visible regardless of which day is selected.*
- **Weekly Progress Bar**: Real-time progress bar calculated dynamically from completed vs. total tasks.
- **Top Bar**: Search bar and **Add Task** button in brand primary color (`#4566EC`), which slides open a right-hand drawer.

#### 📱 Mobile Phone Experience
- **Matches Wireframe Specifications**:
  - Top search input with magnifying glass icon.
  - Horizontal 7-day carousel with day abbreviations, date numbers, and active indicator dot.
  - Dual status cards (Completed vs. Pending) and weekly progress bar.
  - Floating Action Button (FAB) anchored at the bottom-center (`#4566EC`) with a plus icon opening a bottom-sheet task drawer.

---

### 4. Mobile-Exclusive Feature: Swipe-to-Delete
- **Touch Gesture Recognition**: Active exclusively on touch viewports (`< 768px`).
- **Interactive Visual Feedback**: Swiping left on any task card slides the card with your finger to reveal a vibrant red delete banner with a trash icon.
- **Scroll Protection**: If the user is scrolling vertically through tasks, vertical gesture prioritization prevents accidental swipe triggers.
- **Confirmation Trigger**: Dragging past the 60px threshold and releasing automatically activates the custom **Delete Confirmation Modal** before deleting the task.

---

### 5. Task Management (CRUD & Interactive Controls)
- **Task Schema**:
  - `title`: Short descriptive title.
  - `description`: Detailed notes or task details.
  - `date`: Restricted to the current ISO week (`YYYY-MM-DD`).
  - `time`: Scheduled time (`HH:MM`).
  - `priority`: `low` (Emerald), `medium` (Amber), `high` (Red/Rose).
  - `status`: `in_progress` (default) or `completed`.
- **Chronological Sorting**: Tasks within any given day are sorted by time ascending.
- **One-Click Completion**: Custom checkbox toggles task status between `in_progress` and `completed` with immediate strikethrough styling and cache invalidation.
- **Task Drawer**: Slide-over drawer on PC; bottom sheet on mobile. Supports creating new tasks and editing existing tasks.

---

### 6. Real-Time Search
- Keyword search matches across both **task titles** and **task descriptions** within the current week.
- Built-in **250ms debouncing** ensures snappy performance without unnecessary network load.
- Provides a **Clear search** button that restores the day view upon dismissal.

---

### 7. Weekly Overview & Tabbed Filtering (`/weekly`)
- **"View All" Button**:
  - Positioned at the top-right corner of the tasks section header on both PC and mobile.
  - Styled as a blue text button (`#4566EC`).
  - Clicking "View All" switches the task pane to the **Whole Week View**.
- **Two Tabs in Weekly View**:
  1. **Pending (`count`)**: Fetches all unfinished tasks for the current week (`status: "in_progress"`).
  2. **Completed (`count`)**: Fetches all completed tasks for the current week (`status: "completed"`).
- **Backend Endpoint**: Uses `/api/tasks/weekly` which queries tasks via Sequelize `Op.between` across `firstDayOfWeek` and `lastDayOfWeek`, grouped by date.
- **Navigation Toggle**: Displays a **"Back to Daily"** button or returns to day view whenever a user clicks any day in the sidebar/carousel.

---

### 8. Custom Confirmation Modal
- Reusable, accessible confirmation dialog built for destructive or sensitive actions:
  - **Delete Task**: Danger variant (`#DC2626` confirm button) with explicit warning.
  - **Edit Task**: Informational / warning variant when updating task fields.
  - **Sign Out**: Warning variant preventing accidental logouts.

---

## API Endpoints Reference

### Authentication Routes (`/api/auth`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Registers a new user & immediately returns session token + user profile |
| `POST` | `/api/auth/login` | Authenticates user with email & password, sets session cookie |
| `POST` | `/api/auth/logout` | Clears `auth_token` cookie and terminates session |

### Task Routes (`/api/tasks`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/tasks` | Create a new task for the current week |
| `PUT` | `/api/tasks` | Update an existing task (title, status, priority, time, etc.) |
| `DELETE` | `/api/tasks` | Delete a task by ID |
| `POST` | `/api/tasks/by-date` | Get all tasks for a specific date (`YYYY-MM-DD`) |
| `GET` | `/api/tasks/count-summary` | Get weekly summary counts (total, completed, pending) |
| `POST` | `/api/tasks/weekly` | Get all weekly tasks grouped by date, optionally filtered by `status` |
| `GET` | `/api/tasks/search?q=...` | Search tasks within the current week by keyword |

---

## Environment Variables & Setup Guide

### 1. Prerequisites
- **Node.js**: v18.x or higher
- **MySQL Server**: v8.x or compatible cloud database

---

### 2. Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   npm install
   ```
2. Configure `.env` in `backend/`:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=todo_db
   DB_PORT=3306
   JWT_SECRET=super_secret_jwt_key_12345
   JWT_EXPIRATION=7d
   ```
3. Start the backend:
   ```bash
   npm run dev
   # or
   node index.js
   ```

---

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   npm install
   ```
2. Configure `.env.local` in `frontend/`:
   ```env
   # Backend target URL (read server-side by Next.js proxy route handlers)
   BACKEND_API_URL=http://localhost:5000/api
   NEXT_BACKEND_API_URL=http://localhost:5000/api

   # Client-facing base URL (routes to Next.js route handlers)
   NEXT_PUBLIC_API_BASE_URL=/api
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Access the web app at [http://localhost:3000](http://localhost:3000).

---

### 4. Production Build Verification
To compile the frontend for production:
```bash
npm run build
npm run start
```
Both TypeScript compilation (`npx tsc --noEmit`) and the production Webpack build compile cleanly with 0 errors.
