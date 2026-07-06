# CollabAI ⚡

CollabAI is a production-grade, AI-powered collaborative workspace platform designed for modern teams. It combines project management, real-time collaboration, instant messaging, and AI productivity tools into a single integrated platform.

🔗 **Live Demo:** [https://collab-ai-two.vercel.app/](https://collab-ai-two.vercel.app/)

---

## 🚀 Quick Start

### 1. Clone & Install
Clone the repository and install all dependencies for both frontend and backend using the workspace shortcut:
```bash
git clone <your-repo-url>
cd CollabAI
npm run install:all
```

### 2. Configure Environment Variables
Create the environment configuration files from their templates:
- **Backend:** Create `server/.env` based on `server/.env.example` (add MongoDB connection string, JWT secrets, Resend API keys, Cloudinary credentials, and OpenRouter API keys).
- **Frontend:** Create `client/.env` based on `client/.env.example` (set Vite API and Socket URLs).

### 3. Run Development Servers
Start both the Express backend and Vite frontend concurrently with a single command:
```bash
npm run dev
```
- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend:** [http://localhost:5000](http://localhost:5000)

---

## 🛠️ Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand, TanStack Query, Framer Motion, Socket.IO Client
- **Backend:** Node.js, Express.js, MongoDB (Mongoose), Socket.IO, BullMQ, Redis, Winston Logger, Zod Validation
- **Media Storage:** Cloudinary
- **Deployment:** Vercel (Frontend), Render (Backend), MongoDB Atlas (Database)

---

## ✨ Key Features

- **Authentication & Security:** Production-grade JWT auth with refresh token rotation, secure HTTP-only cookies, Google OAuth, email verification, password reset flow, and role-based access control (RBAC).
- **Workspace & Team Management:** Multiple workspaces, lab/team memberships, role assignments, user management, and workspace settings.
- **Projects & Kanban Task System:** Drag-and-drop Kanban boards, task priorities, subtasks, assignments, activity logging, comments, and file attachments.
- **Real-Time Collaboration:** Socket.IO integration for live task updates, member presence indicators, typing alerts, and real-time chat (direct, project, and workspace rooms).
- **AI Integrations:** Automated task breakdowns, sprint summaries, meeting notes analysis, bug explanations, and productivity insights.
- **Notification System:** In-app and email notifications powered by BullMQ background jobs.

---

## 📂 Directory Structure

```txt
CollabAI/
 ├── client/           # React frontend (Vite)
 │    └── src/
 │         ├── components/   # Reusable UI elements
 │         ├── hooks/        # Custom React hooks
 │         ├── pages/        # Route components (Auth, Dashboard, Board, etc.)
 │         ├── store/        # Zustand state stores
 │         └── main.tsx      # Entry point
 └── server/           # Express backend (Node.js)
      └── src/
           ├── config/       # Databases, services, and middlewares config
           ├── controllers/  # API request handlers
           ├── models/       # Mongoose schemas
           ├── routes/       # Express API routes
           └── server.ts     # Entry point
```
