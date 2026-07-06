# Research Collab 🔬

Research Collab is a next-generation, AI-driven workspace and laboratory management platform designed for modern academic, scientific, and product research teams. It integrates structured research workflow pipelines, real-time collaboration, secure communication channels, asset management, and an advanced suite of academic AI tools into a single, cohesive, premium web interface.

---

## ✨ Key Architectural Features

### 🏛️ Academic Lab Hierarchy
Unlike generic project management software, Research Collab centers around **Labs** (led by a Principal Investigator). A Lab acts as the parent container for all research endeavors, papers, and team configurations.
- **Principal Investigator (PI) / Owner:** Full administrative control over the entire Lab container, billing, settings, and Workspace structures.
- **Lab Assistant:** Administrative manager tier. Responsible for operational tasks, inviting members, managing pipelines, and updating task assignments.
- **Researcher:** Core workspace contributor. Has full edit access within workspaces to create tasks, manage documents, upload assets, and collaborate.
- **Student:** View-only access or limited edit access (can create and update their own tasks, participate in discussions, and view dashboard materials).

### 🛠️ Lab Workspaces & Customizable Pipelines
Workspaces representing individual research papers, grants, or projects are nested inside Labs.
- **Paper & Project Types:** Choose workspace profiles tailored specifically to write research papers or build physical/software project deliverables.
- **Customizable Pipeline Stages:** Workspaces replace traditional Kanban boards with custom Research Pipeline Stages (`PipelineStage` model) representing complex research review cycles (e.g. from *Literature Review* and *Data Collection* through *Drafting* and *Peer Review*).
- **Default Seeded Stages:** "Upcoming Milestones" ➡️ "Active Research" ➡️ "Completed & Approved".

### 📅 Consolidated Lab Calendar
Never miss a submission deadline or milestone. The **Lab Calendar** aggregates deadlines and dues from every project and workspace within the active Lab, presenting them in a beautiful, unified visual monthly layout.

### 👥 Real-Time Collaborative Workspace
- **Instant Synchronization:** Powered by Socket.IO, task movements, board reorderings, and chat updates update instantly without refresh.
- **Real-Time Messaging:** Workspace-wide chat rooms, project-specific channels, and secure direct messages (DMs) between lab members.
- **Collaborator Presence & Typing Indicators:** Live status overlays show who is online, who is working on what, and when a colleague is typing.

### 🤖 Advanced Gemini-Powered AI Suite
Integrated with Google Gemini (`gemini-2.0-flash`), the platform provides an intelligence layer optimized for research workflows:
- **Literature Review Assistant [NEW]:** Input a topic or abstract, and Gemini generates a structured academic synopsis outlining major sub-themes, dominant methodologies, identified bottlenecks/research gaps, and recommended search queries (with keywords for Google Scholar).
- **Meeting Notes Parser:** Paste raw meeting transcripts or minutes, and the AI automatically extracts actionable tasks, maps them to team members, and drafts task descriptions.
- **Task Breakdown Generator:** Automatically decomposes large research tasks into 4-6 specific, logical subtasks.
- **Sprint Velocity Summary:** Synthesizes task completion data, milestone achievements, and blockers into weekly velocity markdown reports.
- **AI Bug Explainer & Log Analyzer:** Paste console error stack traces to receive a plain-english explanation of the error along with 3 clear, actionable steps for a fix.

---

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state management), TanStack Query (data fetching), Framer Motion (premium animations), Socket.IO Client.
- **Backend:** Node.js, Express.js (TypeScript), MongoDB (Mongoose schemas), Socket.IO (real-time communication), Winston Logger (structured logging), Zod (request validation).
- **Communications & Alerts:** Brevo SMTP / Resend (email dispatches for verification, passwords, and task mentions), custom WebSocket room-based dispatch.
- **Asset Storage:** Cloudinary integration for paper attachments and user avatars.

---

## 📂 Repository Directory Structure

```txt
CollabAI/
 ├── client/               # React Frontend (Vite, Tailwind, Zustand)
 │    └── src/
 │         ├── api/         # Axios API service layers
 │         ├── components/  # Reusable UI elements (layout, dialogs, charts)
 │         ├── hooks/       # Custom React hooks (auth, query adapters)
 │         ├── pages/       # Route-level screens (Dashboard, Board, Calendar, DMs)
 │         ├── store/       # Zustand client-side global state stores
 │         └── main.tsx     # Client entry point
 └── server/               # Node.js/Express Backend API Server
      └── src/
           ├── config/      # Database, Gemini, and service configurations
           ├── controllers/ # Express business logic and endpoint handlers
           ├── middleware/  # Authentication, error handling, and authorization
           ├── models/      # Mongoose MongoDB models
           ├── routes/      # Express API routers (auth, labs, workspaces, ai)
           ├── services/    # External service integrations (Gemini, Socket.IO, Email)
           ├── utils/       # Migration helpers, custom AppError structure, logging
           └── server.ts    # Backend server entry point
```

---

## 🚀 Getting Started

### 1. Clone the Repository & Install Dependencies
Run the workspace install shortcut in the root directory to set up dependencies for both `client` and `server`:
```bash
git clone <your-repo-url>
cd CollabAI
npm run install:all
```

### 2. Configure Environment Variables
Create the environment files in their respective folders:

#### Backend Settings (`server/.env`)
Create `server/.env` and update the following variables:
```env
PORT=5000
NODE_ENV=development

# Database configuration
# Set to 'memory' to spin up a local MongoDB instance automatically
MONGODB_URI=mongodb://localhost:27017/researchcollab

# JWT Security Secrets
JWT_SECRET=your_jwt_access_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Email Service (Brevo SMTP configuration)
EMAIL_HOST=smtp-relay.brevo.com
EMAIL_PORT=587
EMAIL_FROM_ADDRESS=no-reply@yourdomain.com
EMAIL_USER=your_smtp_username
EMAIL_PASS=your_smtp_password
EMAIL_FROM_NAME="Research Collab"

# Optional: Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# URLs
CLIENT_URL=http://localhost:5173

# AI Assistant Config (Google Gemini API Key)
# If left blank, services fall back gracefully to structured mock data
GEMINI_API_KEY=your_gemini_api_key
```

#### Frontend Settings (`client/.env`)
Create `client/.env` and specify:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Run Development Servers
Start the client and server concurrently with a single command from the root directory:
```bash
npm run dev
```
- **Web App URL:** [http://localhost:5173](http://localhost:5173)
- **Backend API URL:** [http://localhost:5000](http://localhost:5000)
- **Backend API Docs/Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)
