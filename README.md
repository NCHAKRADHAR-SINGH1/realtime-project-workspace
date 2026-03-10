# 🚀 Realtime Project Workspace

A modern **team collaboration platform** with Kanban boards, real-time updates, drag-and-drop task management, and activity tracking. Built with React, Node.js, PostgreSQL, and WebSockets.

---

## ✨ Features

- 🔐 **JWT Authentication** — Secure login/register with role-based access (Admin/Member)
- 📋 **Project Management** — Create, update, delete projects with full CRUD
- 🗂 **Kanban Board** — Three-column board: To-Do, In Progress, Done
- 🎯 **Task Management** — Create tasks with title, description, priority, assignee, and due date
- 🖱 **Drag & Drop** — Move tasks between columns using @hello-pangea/dnd
- ⚡ **Real-Time Updates** — Live task updates via WebSockets (Socket.IO)
- 📜 **Activity Timeline** — Auto-tracked log of all task operations
- 🔍 **Search & Filters** — Filter tasks by status, priority, assignee, and text
- 📎 **File Attachments** — Upload files to tasks (images, PDFs, text files)
- 📊 **Project Analytics** — Completion %, tasks by status, priority, and member
- 📱 **Responsive UI** — Mobile-friendly layout with sidebar navigation
- 🎨 **Modern Design** — Clean UI with Tailwind CSS, animations, and toasts

---

## 🛠 Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 18.x | UI framework |
| Vite | 5.x | Build tool |
| Tailwind CSS | 3.x | Styling |
| React Router | 6.x | Routing |
| Socket.IO Client | 4.x | Real-time communication |
| @hello-pangea/dnd | 16.x | Drag and drop |
| React Toastify | 10.x | Notifications |
| Axios | 1.x | HTTP client |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js | 18+ | Runtime |
| Express.js | 4.x | Web framework |
| PostgreSQL | 14+ | Database |
| Sequelize | 6.x | ORM |
| Socket.IO | 4.x | WebSockets |
| JWT (jsonwebtoken) | 9.x | Authentication |
| bcryptjs | 2.x | Password hashing |
| express-validator | 7.x | Input validation |
| Multer | 1.x | File uploads |

---

## 📁 Project Structure

```
realtime-project-workspace/
├── README.md
├── .gitignore
├── backend/
│   ├── package.json
│   ├── .env.example
│   ├── server.js
│   ├── config/
│   │   └── database.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── role.js
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── index.js
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
│   │   └── socketHandler.js
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

## ✅ Prerequisites

- **Node.js** >= 18.0.0
- **PostgreSQL** >= 14
- **npm** >= 9.0.0

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/NCHAKRADHAR-SINGH1/realtime-project-workspace.git
cd realtime-project-workspace
```

### 2. Database Setup

```sql
-- Connect to PostgreSQL and create the database
CREATE DATABASE realtime_workspace;
```

### 3. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your database credentials and JWT secret

# Start the server (development with auto-reload)
npm run dev

# Or start in production
npm start
```

The backend will start on `http://localhost:5000`. It will automatically sync the database tables on startup.

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy and configure environment variables
cp .env.example .env
# Update VITE_API_URL if your backend is not on port 5000

# Start development server
npm run dev
```

The frontend will start on `http://localhost:5173`.

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=realtime_workspace
DB_USER=postgres
DB_PASSWORD=yourpassword
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5000
```

---

## 📡 API Documentation

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register a new user | No |
| POST | `/api/auth/login` | Login and get JWT token | No |
| GET | `/api/auth/me` | Get current user info | Yes |

### Projects

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/projects` | List user's projects (paginated) | Yes |
| POST | `/api/projects` | Create a new project | Yes |
| GET | `/api/projects/:id` | Get project with tasks | Yes |
| PUT | `/api/projects/:id` | Update project | Yes (Owner/Admin) |
| DELETE | `/api/projects/:id` | Delete project | Yes (Owner/Admin) |
| POST | `/api/projects/:id/members` | Look up member by email | Yes |
| GET | `/api/projects/:id/analytics` | Get project analytics | Yes |

### Tasks

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/tasks/project/:projectId` | Get tasks with filters | Yes |
| POST | `/api/tasks` | Create a new task | Yes |
| GET | `/api/tasks/:id` | Get single task | Yes |
| PUT | `/api/tasks/:id` | Update task | Yes |
| DELETE | `/api/tasks/:id` | Delete task | Yes |
| PUT | `/api/tasks/:id/move` | Move task (status + position) | Yes |
| POST | `/api/tasks/:id/attachment` | Upload file attachment | Yes |

### Activities

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/activities/project/:projectId` | Get project activities (paginated) | Yes |

---

## 🔌 WebSocket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `join-project` | Client → Server | Join a project room |
| `leave-project` | Client → Server | Leave a project room |
| `task-created` | Server → Client | New task was created |
| `task-updated` | Server → Client | Task was updated |
| `task-moved` | Server → Client | Task was moved to new column |
| `task-deleted` | Server → Client | Task was deleted |
| `activity-created` | Server → Client | New activity log entry |

---

## 🗄 Database Schema

### Users
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | STRING | User's full name |
| email | STRING | Unique email address |
| password | STRING | Bcrypt-hashed password |
| role | ENUM | 'admin' or 'member' |
| avatar | STRING | Avatar URL (optional) |

### Projects
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| title | STRING | Project title |
| description | TEXT | Project description |
| ownerId | UUID | FK → Users.id |

### Tasks
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| title | STRING | Task title |
| description | TEXT | Task description |
| status | ENUM | 'todo', 'in-progress', 'done' |
| priority | ENUM | 'low', 'medium', 'high' |
| position | INTEGER | Order within column |
| projectId | UUID | FK → Projects.id |
| assigneeId | UUID | FK → Users.id (nullable) |
| attachment | STRING | File path (nullable) |
| dueDate | DATE | Due date (nullable) |

### Activities
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| action | STRING | Activity description |
| taskId | UUID | FK → Tasks.id (nullable) |
| projectId | UUID | FK → Projects.id |
| userId | UUID | FK → Users.id |
| metadata | JSONB | Additional data |

### Relationships
- User → has many Projects (as owner)
- User → has many Tasks (as assignee)
- User → has many Activities
- Project → belongs to User (owner)
- Project → has many Tasks
- Project → has many Activities
- Task → belongs to Project
- Task → belongs to User (assignee)
- Task → has many Activities

---

## 🎁 Bonus Features Included

- ✅ Task search with debounced input
- ✅ Multi-filter: status, priority, assignee
- ✅ File upload for task attachments (max 5MB)
- ✅ Project analytics (completion %, tasks by status/priority/member)
- ✅ Responsive design (mobile + desktop)
- ✅ Activity auto-creation on all task operations
- ✅ Socket.IO JWT authentication
- ✅ Collapsible activity sidebar on project board
- ✅ Optimistic UI updates for drag-and-drop
- ✅ Pagination for all list endpoints

---

## 🚢 Deployment

### Backend — Render

1. Create a new **Web Service** on [render.com](https://render.com)
2. Connect your GitHub repository
3. Set **Root Directory** to `backend`
4. Set **Build Command** to `npm install`
5. Set **Start Command** to `npm start`
6. Add environment variables in the Render dashboard
7. Add a **PostgreSQL** database on Render and connect it

### Frontend — Vercel or Netlify

#### Vercel
```bash
cd frontend
npx vercel --prod
```
Set `VITE_API_URL` to your Render backend URL.

#### Netlify
1. Connect your GitHub repo to Netlify
2. Set **Base directory** to `frontend`
3. Set **Build command** to `npm run build`
4. Set **Publish directory** to `frontend/dist`
5. Add environment variable `VITE_API_URL`

---

## 📄 License

MIT License — feel free to use and modify this project.