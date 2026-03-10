# 🚀 Realtime Project Workspace

A **production-ready team collaboration platform** similar to Notion/Trello Lite, featuring real-time collaboration, Kanban boards, drag-and-drop task management, and live activity feeds.

![Tech Stack](https://img.shields.io/badge/React-18-blue?logo=react) ![Node.js](https://img.shields.io/badge/Node.js-Express-green?logo=node.js) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Sequelize-blue?logo=postgresql) ![Socket.IO](https://img.shields.io/badge/Socket.IO-Real--time-black?logo=socket.io) ![License](https://img.shields.io/badge/license-MIT-brightgreen)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [WebSocket Events](#-websocket-events)
- [Database Schema](#-database-schema)
- [Deployment](#-deployment)
- [License](#-license)

---

## ✨ Features

- 🔐 **JWT Authentication** — Secure login/register with role-based access (Admin/Member)
- 📋 **Kanban Board** — Drag-and-drop tasks across To-Do, In-Progress, and Done columns
- ⚡ **Real-time Collaboration** — Live task updates via Socket.IO for all connected users
- 📊 **Project Analytics** — Completion rate, tasks by status/priority, per-member stats
- 📜 **Activity Timeline** — Auto-tracked log of every action in your project
- 🔍 **Search & Filter** — Filter tasks by priority, status, assignee, or free-text search
- 📎 **File Attachments** — Upload files to tasks (10 MB limit, images/PDFs/docs)
- 📱 **Responsive UI** — Tailwind CSS, mobile-friendly layout
- 🛡️ **Rate Limiting** — Protects API from abuse
- 🗄️ **Pagination** — Efficient data loading for large projects

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, Tailwind CSS, React Router v6 |
| **Drag & Drop** | @hello-pangea/dnd |
| **Real-time (client)** | Socket.IO Client |
| **HTTP Client** | Axios |
| **Notifications** | React Toastify |
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL with Sequelize ORM |
| **Real-time (server)** | Socket.IO |
| **Auth** | JWT (jsonwebtoken) + bcryptjs |
| **Validation** | express-validator |
| **File Upload** | Multer |
| **Rate Limiting** | express-rate-limit |

---

## 📁 Project Structure

```
realtime-project-workspace/
├── .gitignore
├── README.md
├── backend/
│   ├── package.json
│   ├── .env.example
│   ├── server.js                  # Entry point: Express + Socket.IO + DB sync
│   ├── config/
│   │   └── database.js            # Sequelize instance
│   ├── middleware/
│   │   ├── auth.js                # JWT auth middleware
│   │   ├── role.js                # Role-based access control
│   │   ├── asyncHandler.js        # Async error wrapper
│   │   ├── errorHandler.js        # Global error handler
│   │   └── rateLimiter.js         # Rate limiting rules
│   ├── models/
│   │   ├── index.js               # Associations + exports
│   │   ├── User.js
│   │   ├── Project.js
│   │   ├── Task.js
│   │   └── Activity.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── projectController.js
│   │   ├── taskController.js
│   │   └── activityController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── projectRoutes.js
│   │   ├── taskRoutes.js
│   │   └── activityRoutes.js
│   ├── sockets/
│   │   └── socketHandler.js       # Socket.IO event handlers
│   ├── validators/
│   │   ├── authValidator.js
│   │   ├── projectValidator.js
│   │   └── taskValidator.js
│   └── utils/
│       ├── apiResponse.js
│       └── pagination.js
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── index.html
    ├── .env.example
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── api/
        │   └── axios.js
        ├── context/
        │   └── AuthContext.jsx
        ├── hooks/
        │   └── useSocket.js
        ├── components/
        │   ├── Navbar.jsx
        │   ├── Sidebar.jsx
        │   ├── TaskCard.jsx
        │   ├── TaskModal.jsx
        │   ├── ProjectCard.jsx
        │   ├── ActivityTimeline.jsx
        │   ├── SearchFilter.jsx
        │   ├── ProtectedRoute.jsx
        │   └── Toast.jsx
        └── pages/
            ├── Login.jsx
            ├── Register.jsx
            ├── Dashboard.jsx
            ├── ProjectBoard.jsx
            ├── ProjectSettings.jsx
            └── NotFound.jsx
```

---

## 📦 Prerequisites

- **Node.js** v18+ ([download](https://nodejs.org/))
- **PostgreSQL** v14+ ([download](https://www.postgresql.org/download/))
- **npm** v9+

---

## 🚀 Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/NCHAKRADHAR-SINGH1/realtime-project-workspace.git
cd realtime-project-workspace
```

### 2. Set up the database

```sql
-- Connect to PostgreSQL and run:
CREATE DATABASE project_workspace;
```

### 3. Configure the backend

```bash
cd backend
cp .env.example .env
# Edit .env with your database credentials and JWT secret
npm install
npm run dev
```

The backend will start on **http://localhost:5000** and automatically sync the database schema.

### 4. Configure the frontend

```bash
cd ../frontend
cp .env.example .env
# Edit .env if your backend runs on a different URL
npm install
npm run dev
```

The frontend will start on **http://localhost:5173**.

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgres://user:password@localhost:5432/project_workspace` |
| `JWT_SECRET` | Secret key for JWT signing | *(required)* |
| `JWT_EXPIRES_IN` | JWT expiry duration | `7d` |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `NODE_ENV` | Environment (`development`/`production`) | `development` |

### Frontend (`frontend/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:5000/api` |
| `VITE_SOCKET_URL` | Socket.IO server URL | `http://localhost:5000` |

---

## 📖 API Documentation

### Auth Routes — `/api/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/register` | ❌ | Register a new user |
| `POST` | `/login` | ❌ | Login and get JWT token |
| `GET` | `/me` | ✅ | Get current authenticated user |

**Register / Login request body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "secret123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1...",
    "user": { "id": "uuid", "name": "Jane Doe", "email": "jane@example.com", "role": "member" }
  }
}
```

---

### Project Routes — `/api/projects` (all protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | List projects for current user (paginated) |
| `POST` | `/` | Create a new project |
| `GET` | `/:id` | Get project details |
| `PUT` | `/:id` | Update project (owner/admin only) |
| `DELETE` | `/:id` | Delete project (owner/admin only) |
| `POST` | `/:id/members` | Add a member to project |
| `GET` | `/:id/analytics` | Get project analytics |

**Pagination query params:** `?page=1&limit=10`

**Analytics response:**
```json
{
  "success": true,
  "data": {
    "totalTasks": 12,
    "completedTasks": 5,
    "completionRate": 41.67,
    "tasksByStatus": { "todo": 4, "in-progress": 3, "done": 5 },
    "tasksByPriority": { "low": 2, "medium": 7, "high": 3 }
  }
}
```

---

### Task Routes — `/api/tasks` (all protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/project/:projectId` | List tasks for a project (paginated, filterable) |
| `POST` | `/` | Create a new task |
| `GET` | `/:id` | Get task details |
| `PUT` | `/:id` | Update task |
| `DELETE` | `/:id` | Delete task |
| `PUT` | `/:id/move` | Move task to a different status column |
| `POST` | `/:id/attachment` | Upload file attachment (`multipart/form-data`) |

**Task filters (query params):** `?status=todo&priority=high&assigneeId=uuid&search=text`

**Move task request body:**
```json
{ "status": "in-progress", "position": 2 }
```

---

### Activity Routes — `/api/activities` (all protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/project/:projectId` | Get activity log for a project (paginated, newest first) |

---

## 🔌 WebSocket Events

Connect to the Socket.IO server with your JWT token:
```javascript
const socket = io('http://localhost:5000', {
  auth: { token: localStorage.getItem('token') }
});
```

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `join-project` | `{ projectId: "uuid" }` | Join a project room for live updates |
| `leave-project` | `{ projectId: "uuid" }` | Leave a project room |

### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `task-created` | `{ task }` | A new task was created |
| `task-updated` | `{ task }` | A task was updated |
| `task-moved` | `{ task }` | A task was moved to a new column |
| `task-deleted` | `{ taskId }` | A task was deleted |
| `activity-created` | `{ activity }` | A new activity was logged |

---

## 🗄️ Database Schema

### Users

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PK, default UUIDV4 |
| `name` | STRING | NOT NULL |
| `email` | STRING | NOT NULL, UNIQUE |
| `password` | STRING | NOT NULL (bcrypt hashed) |
| `role` | ENUM(`admin`, `member`) | default `member` |
| `avatar` | STRING | nullable |

### Projects

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PK, default UUIDV4 |
| `title` | STRING | NOT NULL |
| `description` | TEXT | nullable |
| `ownerId` | UUID | FK → Users |

### Tasks

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PK, default UUIDV4 |
| `title` | STRING | NOT NULL |
| `description` | TEXT | nullable |
| `status` | ENUM(`todo`, `in-progress`, `done`) | default `todo` |
| `priority` | ENUM(`low`, `medium`, `high`) | default `medium` |
| `position` | INTEGER | default `0` |
| `projectId` | UUID | FK → Projects |
| `assigneeId` | UUID | FK → Users, nullable |
| `attachment` | STRING | nullable |
| `dueDate` | DATE | nullable |

### Activities

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PK, default UUIDV4 |
| `action` | STRING | NOT NULL |
| `taskId` | UUID | FK → Tasks, nullable |
| `projectId` | UUID | FK → Projects |
| `userId` | UUID | FK → Users |
| `metadata` | JSONB | nullable |

---

## 🌐 Deployment

### Backend (Render)

1. Create a new **Web Service** on [Render](https://render.com)
2. Connect your GitHub repository
3. Set **Root Directory** to `backend`
4. Set **Build Command**: `npm install`
5. Set **Start Command**: `node server.js`
6. Add all environment variables from `backend/.env.example`
7. Use Render's managed **PostgreSQL** database and set the `DATABASE_URL`

### Frontend (Netlify / Vercel)

1. Deploy on [Netlify](https://netlify.com) or [Vercel](https://vercel.com)
2. Set **Base Directory** to `frontend`
3. Set **Build Command**: `npm run build`
4. Set **Publish Directory**: `frontend/dist`
5. Add environment variables:
   - `VITE_API_URL` = your Render backend URL + `/api`
   - `VITE_SOCKET_URL` = your Render backend URL

---

## 📄 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2026 NCHAKRADHAR-SINGH1

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```