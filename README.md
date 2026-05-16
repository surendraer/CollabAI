# CollabAI ⚡

An AI-powered collaborative workspace platform designed for modern teams. Manage projects, track tasks, and communicate in real-time.

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd CollabAI
npm install
```

### 2. Environment Variables
1. Create `server/.env` based on `server/.env.example`
2. Create `client/.env` based on `client/.env.example`
3. Add your MongoDB Atlas connection string and random JWT secrets to `server/.env`.

### 3. Run Development Servers
```bash
# This single command starts both the Express backend and Vite frontend!
npm run dev
```

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:5000

---

## 🏗️ Current Status: Phase 1 Completed

**What's built so far:**
- Full MERN monorepo architecture setup
- Production-grade Authentication system (JWT with refresh token rotation)
- Email verification & Password Reset flows (via Resend)
- Secure, HTTP-only cookie management
- Complete frontend UI for Auth (Landing, Login, Register, Forgot/Reset Password)
- Protected routing and Dashboard shell
- Premium Dark Theme UI with Tailwind v3, Framer Motion, and Lucide Icons

**Next up: Phase 2 (Workspaces)**
- Creating workspaces, inviting members, RBAC.

---
## IMPORTANT PROJECT CONTEXT FOR AI ASSISTANTS

This project is intentionally designed to be:

* 100% free to build and deploy
* Resume worthy
* Production-grade
* Built using the MERN stack
* Scalable but beginner-manageable
* Modern and visually impressive
* Suitable for internships and placements

The objective is NOT to create a simple CRUD app.

The objective is to demonstrate strong full-stack engineering skills using modern MERN stack practices.

This project should feel like a real SaaS platform.

---

# IMPORTANT DEVELOPMENT RULES

## Build Philosophy

While developing this project:

* Prioritize clean architecture
* Use reusable components
* Write scalable backend code
* Keep APIs modular
* Avoid overengineering initially
* Implement features incrementally
* Focus heavily on UI polish
* Write production-quality code
* Use TypeScript everywhere possible
* Follow modern best practices

---

# IMPORTANT COST CONSTRAINTS

This entire project MUST remain FREE.

Do NOT use:

* Paid APIs
* Paid infrastructure
* Paid authentication services
* Paid Redis services
* AWS paid services
* Firebase paid features
* Expensive third-party tools

Only use:

* Free-tier services
* Open-source libraries
* Self-hosted solutions where possible

---

# REQUIRED FREE STACK

## Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* shadcn/ui
* Zustand
* TanStack Query
* Framer Motion
* React Router
* Socket.IO Client

---

## Backend

* Node.js
* Express.js
* MongoDB Atlas Free Tier
* Mongoose
* Socket.IO
* JWT Authentication
* Zod Validation

---

## Deployment

### Frontend

Deploy using Vercel Free Tier.

### Backend

Deploy using Render Free Tier.

### Database

Use MongoDB Atlas Free Tier.

---

# AI FEATURES MUST USE FREE SOLUTIONS

## Preferred AI Provider

Use OpenRouter free models.

Examples:

* DeepSeek
* Mistral
* Llama

Do NOT require paid OpenAI APIs.

If API limits are exceeded:

* gracefully fallback
* show proper error handling
* optionally use mock AI responses

---

# FEATURES THAT SHOULD BE IMPLEMENTED FIRST

Priority order:

1. Authentication
2. Workspace system
3. Projects & tasks
4. Kanban board
5. Realtime updates
6. Chat system
7. Notifications
8. Dashboard analytics
9. AI integrations
10. Deployment & optimization

---

# FEATURES TO SKIP INITIALLY

Do NOT overcomplicate the first version.

Skip initially:

* Kubernetes
* Microservices
* Complex DevOps
* Paid Redis services
* Enterprise scaling
* Advanced distributed systems
* Overly complex caching layers

Focus on building a polished MVP first.

---

# UI/UX EXPECTATIONS

The UI should look modern and premium.

Inspired by:

* Notion
* Linear
* Trello
* Slack
* Jira

Requirements:

* Clean spacing
* Smooth animations
* Responsive layout
* Dark/light mode
* Modern SaaS design
* Mobile-friendly
* Fast and smooth interactions

---

# CODE QUALITY EXPECTATIONS

The project should demonstrate:

* Proper folder structure
* Separation of concerns
* Reusable components
* Custom hooks
* Clean API architecture
* Proper middleware usage
* Error handling
* Validation
* Secure authentication
* Optimistic UI updates
* Good naming conventions
* Modular services

---

# RECRUITER IMPRESSION GOAL

When someone sees this project, it should communicate:

* Strong MERN stack knowledge
* Understanding of scalable applications
* Realtime systems knowledge
* Modern React expertise
* Backend architecture skills
* Authentication & security knowledge
* Deployment experience
* Product thinking
* Clean UI/UX skills

---

# FINAL PROJECT GOAL

By the end, this should feel like a real startup SaaS product instead of a tutorial project.

The project should be polished enough to:

* showcase on resume
* discuss in interviews
* feature on GitHub portfolio
* demonstrate production-level skills
* help secure internships/jobs

---

A production-grade AI-powered collaborative workspace platform built with the MERN stack.

CollabAI combines project management, realtime collaboration, team communication, analytics, and AI productivity tools into a scalable full-stack application designed to demonstrate advanced MERN stack engineering skills.

---

# Project Vision

Most student MERN projects are simple CRUD applications with limited architecture and no production-level thinking.

CollabAI is intentionally designed to demonstrate:

* Scalable backend architecture
* Realtime systems
* Authentication & authorization
* Complex MongoDB modeling
* Modern React patterns
* AI integration
* Performance optimization
* Production deployment
* DevOps practices
* Clean UI/UX

This project is intended to be:

* Resume worthy
* Internship worthy
* Placement worthy
* Open-source worthy
* Portfolio worthy

---

# Core Features

## Authentication & Security

* JWT Authentication
* Refresh Token Rotation
* Google OAuth Login
* Email Verification
* Forgot Password Flow
* Reset Password Flow
* Protected Routes
* Role-Based Access Control (RBAC)
* Session Management
* Rate Limiting
* Secure HTTP-only Cookies

---

## Workspace Management

* Create Workspaces
* Invite Team Members
* Workspace Roles

  * Owner
  * Admin
  * Manager
  * Member
* Workspace Settings
* Team Management
* Member Permissions

---

## Project Management

* Create Projects
* Project Status Tracking
* Team Assignment
* Project Deadlines
* Labels & Tags
* Project Analytics

---

## Kanban Task System

* Drag-and-Drop Kanban Board
* Task Priorities
* Task Assignment
* Due Dates
* Subtasks
* Activity Logs
* Task Attachments
* Task Comments
* Task History Tracking
* Filters & Search
* Infinite Scroll
* Optimistic UI Updates

---

## Realtime Collaboration

* Live Task Updates
* Online Presence
* Typing Indicators
* Live Notifications
* Realtime Activity Feed
* Collaborative Workspace Updates

Powered using Socket.IO.

---

## Team Chat System

* Workspace Chat
* Project Chat
* Direct Messaging
* Emoji Reactions
* File Sharing
* Read Receipts
* Unread Message Count
* Realtime Messaging

---

# AI Features

## AI Task Breakdown

Example:

Input:

> Build authentication system

AI Output:

* Create login form
* Add validation
* Setup JWT backend
* Create protected routes
* Add refresh token logic

---

## AI Sprint Summary

Generate summaries of team progress.

---

## AI Bug Explanation

Paste an error and get:

* Simplified explanation
* Possible causes
* Suggested fixes

---

## AI Meeting Notes

Convert meeting notes into:

* Action items
* Task lists
* Team assignments

---

## AI Productivity Insights

Analyze:

* Team productivity
* Task completion trends
* Workload distribution

---

# Analytics Dashboard

* Productivity Charts
* Task Completion Graphs
* Team Performance Metrics
* Workspace Activity Heatmaps
* Burndown Charts
* AI-generated Insights

---

# File Upload System

* Profile Pictures
* Task Attachments
* Chat Uploads
* Workspace Files

Integrated with Cloudinary.

---

# Notification System

* In-App Notifications
* Email Notifications
* Mention Alerts
* Assignment Alerts
* Due Date Reminders

Powered using Redis + BullMQ.

---

# Recommended Tech Stack

## Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* React Router
* Zustand
* TanStack Query
* Socket.IO Client
* Framer Motion
* shadcn/ui
* Recharts

---

## Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* Socket.IO
* JWT
* Zod Validation
* Redis
* BullMQ
* Winston Logger

---

## DevOps & Deployment

* Docker
* Docker Compose
* GitHub Actions
* Vercel
* Render
* MongoDB Atlas
* Cloudinary

---

# System Architecture

## Frontend Architecture

```txt
client/
 ├── src/
 │   ├── api/
 │   ├── assets/
 │   ├── components/
 │   ├── context/
 │   ├── hooks/
 │   ├── layouts/
 │   ├── lib/
 │   ├── pages/
 │   ├── routes/
 │   ├── services/
 │   ├── store/
 │   ├── styles/
 │   ├── types/
 │   ├── utils/
 │   └── main.tsx
```

---

## Backend Architecture

```txt
server/
 ├── src/
 │   ├── config/
 │   ├── constants/
 │   ├── controllers/
 │   ├── database/
 │   ├── jobs/
 │   ├── middleware/
 │   ├── models/
 │   ├── routes/
 │   ├── services/
 │   ├── sockets/
 │   ├── utils/
 │   ├── validators/
 │   ├── app.ts
 │   └── server.ts
```

---

# Database Design

## Collections

```txt
users
workspaces
members
projects
tasks
subtasks
messages
notifications
activitylogs
attachments
sessions
```

---

# Recommended MongoDB Schemas

## User

```js
{
  name,
  email,
  password,
  avatar,
  role,
  verified,
  refreshToken,
  createdAt,
  updatedAt
}
```

---

## Workspace

```js
{
  name,
  description,
  owner,
  members,
  projects,
  createdAt
}
```

---

## Project

```js
{
  title,
  description,
  workspace,
  members,
  status,
  deadlines,
  createdBy
}
```

---

## Task

```js
{
  title,
  description,
  assignee,
  priority,
  labels,
  dueDate,
  status,
  comments,
  attachments,
  subtasks,
  activityLogs
}
```

---

# Recommended API Structure

## Authentication Routes

```txt
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
GET    /api/auth/me
```

---

## Workspace Routes

```txt
POST   /api/workspaces
GET    /api/workspaces
GET    /api/workspaces/:id
PATCH  /api/workspaces/:id
DELETE /api/workspaces/:id
POST   /api/workspaces/:id/invite
```

---

## Project Routes

```txt
POST   /api/projects
GET    /api/projects
GET    /api/projects/:id
PATCH  /api/projects/:id
DELETE /api/projects/:id
```

---

## Task Routes

```txt
POST   /api/tasks
GET    /api/tasks
GET    /api/tasks/:id
PATCH  /api/tasks/:id
DELETE /api/tasks/:id
```

---

# Realtime Socket Events

```txt
connection
user:online
user:offline
message:send
message:receive
task:create
task:update
task:delete
notification:new
typing:start
typing:stop
```

---

# State Management Strategy

## Use Zustand For

* Authentication State
* Theme State
* UI Modals
* User Preferences

---

## Use TanStack Query For

* Server State
* API Caching
* Data Synchronization
* Optimistic Updates

---

# UI/UX Design Principles

## Goals

* Clean dashboard design
* Modern SaaS aesthetic
* Responsive on all devices
* Fast loading experience
* Smooth animations
* Accessible components

---

# Recommended UI Sections

## Public Pages

* Landing Page
* Features Page
* Pricing Page
* Login Page
* Register Page
* Forgot Password Page

---

## Private Pages

* Dashboard
* Workspace Overview
* Project Board
* Task Detail Page
* Team Chat
* Analytics Dashboard
* User Profile
* Settings
* Notification Center

---

# Important Advanced Features

## 1. Docker Support

Add:

* Dockerfile
* docker-compose.yml

This demonstrates deployment knowledge.

---

## 2. CI/CD Pipeline

Use GitHub Actions for:

* Linting
* Testing
* Build checks
* Deployment

---

## 3. Centralized Error Handling

Implement:

* Custom Error Classes
* Global Error Middleware
* Proper HTTP Status Codes

---

## 4. API Validation

Use:

* Zod
  or
* Joi

---

## 5. Logging System

Use Winston Logger.

Log:

* Errors
* Requests
* Auth Events
* Database Events

---

## 6. Security Enhancements

Add:

* Helmet
* CORS
* Rate Limiting
* Input Sanitization
* Mongo Injection Protection
* XSS Protection

---

## 7. Performance Optimization

Add:

* Lazy Loading
* Code Splitting
* Memoization
* Pagination
* MongoDB Indexing
* Redis Caching

---

# Redis Use Cases

Use Redis for:

* Session caching
* Notification queues
* Rate limiting
* Frequently accessed dashboard data
* Background jobs

---

# BullMQ Jobs

Recommended Jobs:

* Email sending
* AI processing
* Notification delivery
* Scheduled reminders
* Daily summaries

---

# Search & Filtering

Implement:

* Full-text MongoDB search
* Filters by:

  * Priority
  * Assignee
  * Status
  * Workspace
  * Labels

---

# Suggested Frontend Libraries

## UI Components

* shadcn/ui

## Icons

* Lucide React

## Charts

* Recharts

## Animation

* Framer Motion

## Drag & Drop

* dnd-kit

---

# Suggested Backend Libraries

```txt
bcryptjs
jsonwebtoken
cookie-parser
cors
dotenv
helmet
morgan
winston
zod
multer
cloudinary
socket.io
redis
bullmq
nodemailer
```

---

# Environment Variables

## Backend

```env
PORT=
MONGODB_URI=
JWT_SECRET=
JWT_REFRESH_SECRET=
REDIS_URL=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
OPENAI_API_KEY=
CLIENT_URL=
```

---

## Frontend

```env
VITE_API_URL=
VITE_SOCKET_URL=
```

---

# Development Roadmap

# Phase 1

## Setup & Authentication

* Setup frontend & backend
* Configure TypeScript
* Setup MongoDB
* Create authentication system
* Create protected routes

---

# Phase 2

## Workspace & Team Management

* Create workspaces
* Invite members
* Setup RBAC permissions

---

# Phase 3

## Projects & Tasks

* Kanban board
* Drag-and-drop
* Task CRUD
* Activity logs

---

# Phase 4

## Realtime Features

* Socket.IO integration
* Live updates
* Online presence

---

# Phase 5

## Chat System

* Workspace chat
* Realtime messaging
* Notifications

---

# Phase 6

## AI Integration

* AI summaries
* AI task breakdown
* AI bug explanation

---

# Phase 7

## Analytics Dashboard

* Charts
* Insights
* Productivity reports

---

# Phase 8

## Production Features

* Docker
* CI/CD
* Testing
* Security
* Performance optimization

---

# GitHub Standards

## Repository Must Include

* Proper README
* Screenshots
* Demo GIFs
* Architecture diagram
* API documentation
* Environment setup guide
* Deployment links
* Contributing guidelines

---

# README Sections To Add Later

## Add:

* Screenshots
* Live Demo Link
* API Docs Link
* Video Walkthrough
* Architecture Diagram

---

# Suggested GitHub Repository Names

* collab-ai
* collabai-platform
* taskflow-ai
* syncspace
* teamforge
* workgrid-ai

---

# Suggested Commit Strategy

Use conventional commits:

```txt
feat:
fix:
refactor:
docs:
style:
test:
chore:
```

Example:

```txt
feat(auth): implement refresh token rotation
```

---

# Suggested Branch Strategy

```txt
main
develop
feature/auth
feature/tasks
feature/chat
feature/ai
```

---

# Suggested Testing Stack

## Backend

* Jest
* Supertest

## Frontend

* Vitest
* React Testing Library

---

# Deployment Architecture

## Frontend

Deploy on Vercel.

---

## Backend

Deploy on Render or Railway.

---

## Database

Use MongoDB Atlas.

---

## Media Storage

Use Cloudinary.

---

# Production Checklist

## Backend

* Environment variables secured
* Helmet configured
* Rate limiter enabled
* Validation added
* Logging implemented
* Error handling added

---

## Frontend

* Responsive design
* Lazy loading
* Error boundaries
* Skeleton loaders
* Accessibility checks

---

# Resume Bullet Point

> Developed a production-grade MERN collaboration platform featuring realtime task synchronization using Socket.IO, JWT authentication, RBAC authorization, AI-powered productivity tools, analytics dashboards, Redis-based background jobs, and scalable REST APIs. Deployed using Vercel, Render, and MongoDB Atlas.

---

# Interview Questions This Project Helps You Answer

* Explain JWT authentication.
* Explain refresh token rotation.
* How does Socket.IO work?
* Explain optimistic updates.
* Why use Redis?
* Explain MongoDB indexing.
* How do you structure scalable React apps?
* Explain RBAC authorization.
* How does TanStack Query work?
* How do background jobs work?
* Explain Docker deployment.
* Explain CI/CD pipelines.

---

# Future Improvements

## Possible Future Features

* Video Calls
* Screen Sharing
* AI Voice Assistant
* Calendar Integration
* GitHub Integration
* Slack Integration
* Mobile App
* Microservices Architecture
* Kubernetes Deployment

---

# Final Goal

This project should feel like a real SaaS product.

Not a tutorial clone.

Not a simple CRUD app.

The objective is to demonstrate:

* Engineering maturity
* System design thinking
* Full-stack expertise
* Modern development practices
* Product-level implementation skills

---

# Recommended Build Mindset

While building:

* Prioritize clean architecture
* Write reusable components
* Keep APIs modular
* Avoid tightly coupled code
* Think scalability first
* Build incrementally
* Continuously refactor
* Document everything

---

# Important Advice

Do not rush to finish quickly.

A polished, production-grade project with:

* clean UI
* strong architecture
* realtime features
* AI integration
* proper deployment

is significantly more valuable than multiple small projects.

Focus on quality over quantity.

---

# End Goal

By the end of this project, you should be able to confidently say:

“I can design, build, optimize, secure, and deploy a production-level full-stack MERN application.”
