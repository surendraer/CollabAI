# CollabAI Development Plan, Design Specifications & Reference Guide

This document serves as the single source of truth for the CollabAI platform. It consolidates the architecture, styling specifications, phase-by-phase roadmap, deployment procedures, cost constraints, and system upgrades.

---

## 1. Project Philosophy & Cost Constraints

CollabAI is an AI-powered team collaboration platform built using the MERN stack with TypeScript. The repository is configured to meet the following core developer principles:

- **100% Free to Build and Deploy**: The platform must not consume any paid APIs or paid infrastructure.
- **Production Grade**: Implements real-world patterns like JWT refresh token rotation, strict TypeScript typing, input sanitization, rate limiting, and defensive security headers.
- **Premium Aesthetics**: Utilizes a highly polished, warm paper Notion-like design system instead of default templates.
- **Free-Tier Stack**:
  - **Local Database**: In-memory MongoDB (`mongodb-memory-server`) with an auto-configured `launchTimeout: 120000` to prevent cold start failures on Windows.
  - **Production Database**: MongoDB Atlas Free Tier.
  - **Backend Hosting**: Render Free Tier.
  - **Frontend Hosting**: Vercel Free Tier.
  - **Transactional Emails**: Resend Free Tier (3,000 free emails/month).
  - **AI Engine**: Generous developer free tiers (e.g., Google Gemini Developer API or free models on OpenRouter).

---

## 2. Phase-by-Phase Roadmap

### PHASE 1: ✅ AUTHENTICATION SYSTEM (COMPLETE)
- **Status**: Production-ready.
- **Core Features**:
  - User registration with email verification.
  - Login/logout with JWT access tokens (15-min lifespan) + automatic Refresh Token rotation (7-day lifespan) stored in secure, HTTP-only cookies.
  - Reset password flow via transactional verification emails.
  - Security protections: Helmet, CORS configuration, MongoDB input sanitization, rate limiting on critical endpoints.
  - Reusable layout components (AuthLayout split-screen) with Framer Motion transitions.

### PHASE 2: 🚀 WORKSPACE MANAGEMENT (NEXT)
- **Goals**: Create isolated workspaces to support team-based collaboration.
- **Backend Tasks**:
  - Create **Workspace Model**: `name`, `description`, `owner` (User ID), `members` (array of Member IDs), `settings`.
  - Create **Member Model**: Join dates, permissions, and roles (`Owner`, `Admin`, `Manager`, `Member`).
  - Implement workspace invitation flows via tokenized URLs:
    - `POST /api/workspaces/:id/invite`
    - `POST /api/workspaces/:id/join/:token`
  - Implement middleware verifying member access to specific workspaces.
- **Frontend Tasks**:
  - Workspace selector/switcher sidebar component.
  - Workspace creation modal.
  - Workspace settings, member tables, and invitation UI.
  - React Context/Zustand workspace store integration.

### PHASE 3: PROJECTS & TASK MANAGEMENT
- **Goals**: Organize projects and manage Kanban-ready tasks.
- **Backend Tasks**:
  - **Project Model**: `name`, `description`, `workspaceId`, `owner`, `members`, `status` (`active`/`archived`).
  - **Task Model**: `title`, `description`, `projectId`, `assigneeId`, `priority` (`high`/`medium`/`low`), `status` (`todo`/`in-progress`/`done`), `dueDate`, `subtasks`, `comments`, `attachments`, `activityLog`.
  - Full-text search and filtering endpoints.
- **Frontend Tasks**:
  - Project dashboard and list views.
  - Task detailed view drawer/modal (rich-text description and comment thread).
  - Inline task creation, priority selectors, and date pickers.

### PHASE 4: KANBAN BOARD WITH DRAG-AND-DROP
- **Goals**: Visual workspace task management.
- **Backend Tasks**:
  - Move/reorder task endpoint (`PATCH /api/tasks/:id/move`).
  - Column card indexing tracking.
- **Frontend Tasks**:
  - Integration of `@dnd-kit/core` or `react-beautiful-dnd`.
  - Optimistic UI updates during drag actions.
  - Column CRUD operations, swimlanes, and persistent URL state filters.

### PHASE 5: REAL-TIME COLLABORATION
- **Goals**: Multi-user sync and presence indicator indicators.
- **Backend Tasks**:
  - Integrate `Socket.IO` server.
  - Presence tracking (`user:online`, `user:offline` events).
  - Broadcast real-time board updates.
- **Frontend Tasks**:
  - Socket client state wrappers.
  - Active user list badges.
  - Real-time task modification sync and live typing indicators.

### PHASE 6: TEAM CHAT & NOTIFICATIONS
- **Goals**: In-app group/direct messaging and notification system.
- **Backend Tasks**:
  - **Message Model** (workspace/project/DM chats) and Socket integrations.
  - **Notification Model** (mentions, assignments, due dates) and read/unread endpoints.
- **Frontend Tasks**:
  - Workspace chat sidebar and message feed with emoji reactions.
  - Notification center bell widget.
  - Mention autocomplete selector (`@username`).

### PHASE 7: AI PRODUCTIVITY FEATURES
- **Goals**: Use free AI models to boost collaboration.
- **Features**:
  - **AI Task Breakdown**: Suggest subtasks from a main task description.
  - **AI Sprint Summary**: Synthesize weekly progress logs.
  - **AI Bug Analyzer**: Input a console error and receive potential fixes.
  - **AI Meeting Notes Extractor**: Turn raw text into actionable tasks.
- **Technology**: official Google Gemini SDK (`@google/generative-ai`) utilizing the free tier API.

### PHASE 8: ANALYTICS DASHBOARD & POLISH
- **Goals**: Productivity insights and overall code cleanup.
- **Tasks**:
  - Aggregated performance charts using `Recharts` (completion trends, workload, burndown charts).
  - Export utilities (CSV, PDF).
  - Optimization audits: React bundle splitting, lazy loading, a11y checks, error boundary screens.

---

## 3. Notion-Inspired Design System

The platform adopts a calm, warm-paper aesthetic based on Notion's UI guidelines.

### Color Palette
- **Canvas (Background)**: `#ffffff` (cards and forms)
- **Canvas-Soft (Page Background)**: `#f6f5f4` (page canvas, warm feel)
- **Primary**: `#0075de` (actions, highlights, positive interactions)
- **Primary-Active**: `#005bab` (hover states)
- **Secondary**: `#213183` (deep dark theme branding)
- **Ink (Text)**: `#000000` (main headers)
- **Ink-Secondary**: `#31302e` (body text)
- **Ink-Muted**: `#615d59` (secondary metadata)
- **Ink-Faint**: `#a39e98` (placeholders)
- **Hairline (Borders)**: `#e6e6e6`
- **Decorative Sticker Accents**:
  - Sky: `#62aef0`
  - Purple: `#d6b6f6`
  - Pink: `#ff64c8`
  - Orange: `#dd5b00`
  - Teal: `#2a9d99`
  - Green: `#1aae39`

### Typography (Inter)
- **Display 1**: 64px, Bold, line-height 1.0, tracking `-2.125px`
- **Display 2**: 54px, Bold, line-height 1.04, tracking `-1.875px`
- **Heading 1**: 40px, Bold, line-height 1.1, tracking `-1px`
- **Heading 2**: 26px, Bold, line-height 1.23, tracking `-0.625px`
- **Body Medium**: 16px, Regular, line-height 1.5
- **Caption**: 14px, Regular, line-height 1.43

### Rounded Corners & Shadows
- **Inputs & Borders**: `xs: 4px` / `sm: 5px`
- **CTAs / Primary Buttons**: `md: 8px` (pill-shaped)
- **Cards**: `lg: 12px` with a `1px` border (`#e6e6e6`) and extremely soft shadows.

---

## 4. Phase 1 Authentication Architecture

### JWT Authentication & Security Strategy
1. **Access Token**: Short-lived (15 minutes), returned in the response JSON payload. Transmitted via request headers (`Authorization: Bearer <token>`).
2. **Refresh Token**: Long-lived (7 days), saved in an HTTP-only secure cookie named `refreshToken`. Handled automatically on the server to authenticate token refresh requests (`POST /api/auth/refresh`).
3. **Database Sessions**: Refresh tokens are logged in the `sessions` DB collection to allow session invalidation (logout/revocation).
4. **Passwords**: Salted and hashed using `bcrypt` (12 rounds) before persistence.

### API Routes Table
| Method | Endpoint | Description | Middleware / Validation |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Create user profile & dispatch verify email | Rate-limit (5/hr), Zod register schema |
| **POST** | `/api/auth/login` | Validate credentials, issue tokens, set cookie | Rate-limit (10/hr), Zod login schema |
| **POST** | `/api/auth/logout` | Invalidate active session & clear cookies | Authenticated |
| **POST** | `/api/auth/refresh` | Verify refresh token cookie, rotate token pair | Refresh token cookie validation |
| **POST** | `/api/auth/forgot-password` | Send password reset email with token | Rate-limit (3/day), Zod forgot schema |
| **POST** | `/api/auth/reset-password/:token` | Process password override | Zod reset schema |
| **GET** | `/api/auth/verify-email/:token` | Mark account verification as active | Token check |
| **GET** | `/api/auth/me` | Fetch active profile | Authenticated |

---

## 5. Implementation, Deployment & Troubleshooting

### Local Setup (5 minutes)
1. **Install dependencies in all folders**:
   ```bash
   npm run install:all
   ```
 2. **Launch development environment**:
   ```bash
   npm run dev
   ```
   Starts `concurrently`:
   - Frontend: [http://localhost:5173](http://localhost:5173)
   - Backend: [http://localhost:5000](http://localhost:5000)

### Production Deployment

#### Backend (Render)
- Connect repository, choose service type "Web Service".
- **Build command**: `npm run install:all && npm run build`
- **Start command**: `npm run start:server`
- Configure variables in dashboard:
  - `PORT=5000`
  - `NODE_ENV=production`
  - `MONGODB_URI` (Atlas production string)
  - `JWT_SECRET`, `JWT_REFRESH_SECRET`
  - `RESEND_API_KEY`
  - `CLIENT_URL` (Frontend URL)

#### Frontend (Vercel)
- Set Vite framework, select root directory `client`.
- **Build command**: `npm run build`
- **Output directory**: `dist`
- Configure variables:
  - `VITE_API_URL=https://your-api-domain.com/api`
  - `VITE_SOCKET_URL=https://your-api-domain.com`

---

## 6. Recommended Project Upgrades

1. **Native Gemini Integration**: Instead of routing through OpenRouter or third-party wrappers, use the official `@google/generative-ai` package. This allows utilizing the completely free tier of Gemini 2.5 Flash directly, avoiding billing configurations and maximizing throughput limits.
2. **Type-Safe AxiosError Guards**: Keep all React hooks free of the TypeScript `any` type in error handlers. Casting error objects as `AxiosError<{ message?: string }>` guarantees that linter configurations enforce strict type boundaries across frontend compilation.
3. **Mongoose Duplicate Index Warning Remediation**: Avoid double-indexing schemas by removing manual calls to `.index()` for fields that already possess `unique: true` property constraints.
4. **Increased launchTimeout on MongoMemoryServer**: Windows file execution speeds sometimes cause default 10s startups to crash. Explicit configurations should define `launchTimeout: 120000` for seamless offline database boot-ups.
