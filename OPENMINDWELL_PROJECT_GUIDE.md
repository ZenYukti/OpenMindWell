# 📘 OpenMindWell - Complete Project Guide

> **Version 1.0** | Last Updated: November 2024

---

## ⚠️ CRITICAL SAFETY DISCLAIMER

**OpenMindWell is NOT a substitute for professional mental health care.**

This platform provides:
- ✅ Peer support and community connection
- ✅ Self-help resources and coping strategies  
- ✅ A safe space to share experiences

This platform does NOT provide:
- ❌ Professional therapy or counseling
- ❌ Medical diagnosis or treatment
- ❌ Emergency crisis intervention
- ❌ Licensed mental health services

**IF YOU ARE IN CRISIS:**
- 🇺🇸 Call/Text **988** (Suicide & Crisis Lifeline)
- 🇺🇸 Text **HOME** to **741741** (Crisis Text Line)
- 🌍 Find international helplines: **findahelpline.com**
- 🚨 Call emergency services (911/112/999) for immediate danger

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Architecture](#architecture)
5. [Folder Structure](#folder-structure)
6. [Environment Variables](#environment-variables)
7. [Local Development Setup](#local-development-setup)
8. [Free Service Accounts Setup](#free-service-accounts-setup)
9. [Deployment Guide](#deployment-guide)
10. [Security & Privacy](#security--privacy)
11. [Contributing](#contributing)
12. [Roadmap](#roadmap)

---

## 🌟 Project Overview

**OpenMindWell** is a free, open-source mental health support platform designed to provide anonymous peer support, self-help tools, and curated resources. Built with modern web technologies and deployed entirely on free-tier services.

### Why OpenMindWell?

- **Accessibility**: 100% free to use, no premium features
- **Privacy**: Anonymous accounts, no personal data required
- **Safety**: AI-powered crisis detection with automatic resource suggestions
- **Community**: Peer-to-peer support in moderated chat rooms
- **Open Source**: Transparent, auditable, and community-driven

### Target Audience

- Individuals seeking peer support for mental wellness
- People exploring self-help strategies
- Communities building mental health awareness
- Open-source contributors (GSoC, Hacktoberfest, etc.)

---

## 🎯 Features

### 1. **Anonymous Chat Rooms** 💬
- 6 pre-created support rooms (Anxiety, Depression, PTSD, etc.)
- **✅ Real-time WebSocket messaging** (fully implemented)
- Anonymous/pseudonymous usernames
- Emoji avatars (no photos)
- Auto-reconnection with exponential backoff
- Message history (last 50 messages)
- User join/leave notifications
- Crisis alerts with helpline numbers

### 2. **AI Crisis Detection** 🤖
- **✅ Active in real-time chat** - scans every message
- HuggingFace emotion analysis (twitter-roberta-base-emotion)
- Keyword-based fallback system (no API key required)
- Automatic crisis alerts with US & India helplines
- 4-tier risk levels (low, medium, high, critical)
- Visual highlighting of crisis messages (red background)
- Moderator notifications (backend ready)

### 3. **Private Journaling** 📝
- End-to-end private entries (only visible to user)
- Mood tracking (1-5 scale)
- Tagging system
- Reflection prompts

### 4. **Habit Tracking** ✅
- Custom habit creation
- Daily logging with notes
- Streak tracking
- Progress visualization (coming soon)

### 5. **Resource Library** 📚
- Curated mental health articles
- Crisis hotlines (US & International)
- Breathing exercises and guided meditations
- Categorized by type (hotline, article, exercise)

### 6. **Moderation System** 🛡️
- User reporting functionality
- Moderator dashboard (volunteer-only)
- Flagged message review
- Community guidelines enforcement

### 7. **Volunteer Program** 🤝
- Trained peer support volunteers
- Moderator privileges
- Community safety oversight

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: React 18 with Vite 5
- **Router**: React Router DOM 6
- **Language**: TypeScript 5.3
- **Styling**: Tailwind CSS 3.4
- **Auth**: Supabase Auth (anonymous sign-in)
- **State**: React Hooks
- **HTTP Client**: Fetch API
- **WebSocket**: Native WebSocket API

### **Backend**
- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.18
- **Language**: TypeScript 5.3
- **WebSocket**: ws library 8.16
- **Database**: Supabase (PostgreSQL 15)
- **Auth**: JWT validation
- **AI**: HuggingFace Inference API
- **Security**: Helmet, CORS, Rate Limiting

### **Database**
- **Service**: Supabase (managed PostgreSQL)
- **ORM**: None (direct SQL queries via Supabase client)
- **Security**: Row Level Security (RLS) policies
- **Tables**: 8 (profiles, rooms, messages, journal_entries, habits, habit_logs, resources, reports, volunteers)

### **AI/ML**
- **Provider**: HuggingFace
- **Model**: `cardiffnlp/twitter-roberta-base-emotion`
- **Task**: Emotion classification (7 emotions)
- **Fallback**: Keyword-based pattern matching

### **Deployment**
- **Hosting**: Self-hosted (VPS, home server, or Raspberry Pi)
- **Containerization**: Docker & Docker Compose
- **Database**: Supabase (free tier) or self-hosted PostgreSQL
- **Version Control**: Git/GitHub

### **Development Tools**
- **Package Manager**: npm
- **Linting**: TypeScript compiler
- **Monorepo**: Workspaces with concurrently

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER DEVICES                            │
│                  (Web Browsers - Desktop/Mobile)                │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React 18 + Vite)                   │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Routes: / → /onboarding → /dashboard                  │ │
│  │  Components: RoomsList, JournalForm, HabitTracker, etc.  │ │
│  │  API Client: lib/api.ts (REST) + WebSocket client        │ │
│  └───────────────────────────────────────────────────────────┘ │
│                  Self-hosted on your server                      │
└───────────┬────────────────────────────────┬────────────────────┘
            │                                │
            │ HTTP/REST                      │ WebSocket (wss://)
            │                                │
            ▼                                ▼
┌──────────────────────────────────────────────────────────────────┐
│                  BACKEND (Express.js + ws)                       │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  REST API Routes:                                          │ │
│  │  - /api/journal (GET/POST/PUT/DELETE)                     │ │
│  │  - /api/habits (GET/POST/PUT/DELETE)                      │ │
│  │  - /api/rooms (GET rooms, GET messages)                   │ │
│  │  - /api/resources (GET by category)                       │ │
│  │  - /api/moderation (GET reports, POST flag)               │ │
│  │                                                             │ │
│  │  WebSocket Server:                                         │ │
│  │  - Real-time chat messaging                                │ │
│  │  - Room join/leave events                                  │ │
│  │  - Crisis detection integration                            │ │
│  │                                                             │ │
│  │  Services:                                                  │ │
│  │  - Crisis Detection (HuggingFace API + keywords)          │ │
│  │  - Chat Server (WebSocket management)                      │ │
│  └────────────────────────────────────────────────────────────┘ │
│                  Self-hosted on your server                      │
└───────────────────────────┬──────────────────────────────────────┘
                            │
                            │ Supabase Client SDK
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   SUPABASE (Database + Auth)                    │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  PostgreSQL Database (8 tables):                          │ │
│  │  - profiles (user info)                                   │ │
│  │  - rooms (chat rooms)                                     │ │
│  │  - messages (chat history + risk_level)                  │ │
│  │  - journal_entries (private notes)                        │ │
│  │  - habits (user habits)                                   │ │
│  │  - habit_logs (daily tracking)                            │ │
│  │  - resources (curated content)                            │ │
│  │  - reports (moderation flags)                             │ │
│  │  - volunteers (moderator access)                          │ │
│  │                                                             │ │
│  │  Row Level Security (RLS):                                 │ │
│  │  - Users can only see/edit their own data                 │ │
│  │  - Messages visible to room members only                   │ │
│  │  - Journal entries completely private                      │ │
│  │                                                             │ │
│  │  Authentication:                                            │ │
│  │  - Anonymous sign-in (no email required)                   │ │
│  │  - JWT tokens for API authentication                       │ │
│  └───────────────────────────────────────────────────────────┘ │
│                      Managed by: Supabase                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTPS API Calls
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    HUGGINGFACE INFERENCE API                    │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Model: cardiffnlp/twitter-roberta-base-emotion          │ │
│  │  Input: Chat message text                                 │ │
│  │  Output: Emotion scores (anger, fear, sadness, etc.)     │ │
│  │  Rate Limit: 1000 calls/day (free tier)                  │ │
│  └───────────────────────────────────────────────────────────┘ │
│                      Managed by: HuggingFace                    │
└─────────────────────────────────────────────────────────────────┘
```

### WebSocket Architecture (Real-Time Chat)

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + useWebSocket)              │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  ChatRoom Component:                                      │ │
│  │  - Message input & display                                │ │
│  │  - Crisis alert banner                                    │ │
│  │  - Connection status indicator                            │ │
│  │                                                             │ │
│  │  useWebSocket Hook:                                        │ │
│  │  - Auto-connect on mount                                   │ │
│  │  - Auto-reconnect (exponential backoff, max 5 attempts)   │ │
│  │  - Event handlers: onMessage, onConnect, onDisconnect     │ │
│  │  - sendMessage() function                                  │ │
│  └───────────────────────────────────────────────────────────┘ │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ WebSocket (ws:// or wss://)
                             │ Events: JOIN, LEAVE, CHAT
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              BACKEND (Express + ws WebSocket Server)            │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  ChatServer Class:                                        │ │
│  │  - Room Map (roomId → Set<{ws, userId, nickname}>)       │ │
│  │  - Heartbeat/ping every 30s                               │ │
│  │  - Message handlers: handleJoin, handleLeave, handleChat │ │
│  │                                                             │ │
│  │  Message Flow:                                             │ │
│  │  1. Receive CHAT event                                     │ │
│  │  2. Run detectCrisis(content) → riskLevel                 │ │
│  │  3. Save to DB: {content, risk_level, user_id, room_id}  │ │
│  │  4. broadcastToRoom() → all connected clients             │ │
│  │  5. If crisis: send CRISIS_ALERT to sender                │ │
│  └───────────────────────────────────────────────────────────┘ │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ Supabase Client SDK
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                 SUPABASE (PostgreSQL + Storage)                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  messages table:                                          │ │
│  │  - id, room_id, user_id, content                          │ │
│  │  - risk_level (none, low, medium, high, critical)        │ │
│  │  - created_at                                              │ │
│  │                                                             │ │
│  │  Row Level Security:                                       │ │
│  │  - Users can read messages in rooms they've joined        │ │
│  │  - Messages persist for history (last 50 loaded on join)  │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow Examples

**1. User Joins Chat Room (Full WebSocket Flow):**
```
User clicks "Join Room" → ChatRoom modal opens
  → useWebSocket.connect() → WebSocket to ws://localhost:3001
  → Send JOIN {roomId, userId, nickname}
  → Backend: add to rooms Map
  → Backend: SELECT last 50 messages WHERE room_id = ?
  → Send HISTORY {messages: [...]} to client
  → Frontend: setMessages(history)
  → User sees chat interface with history
```

**2. User Sends Message with Crisis Content:**
```
User types "I feel hopeless" → clicks Send
  → useWebSocket.sendMessage(content)
  → Send CHAT {roomId, userId, content, timestamp}
  → Backend: detectCrisis(content) → {riskLevel: "medium", isCrisis: true}
  → Backend: INSERT INTO messages (content, risk_level)
  → Backend: broadcastToRoom(CHAT message with risk_level)
  → All users receive message
  → Frontend: render with red background (crisis styling)
  → Backend: send CRISIS_ALERT to sender only
  → Sender sees: "⚠️ CRISIS DETECTED - Call 988 | 9152987821"
```

**3. User Creates Journal Entry:**
```
User writes entry → Frontend form → HTTP POST /api/journal
  → Backend validates JWT → Supabase insert (with RLS check)
  → Return success → Update UI
```

**3. User Joins Chat Room (Full Implementation):**
```
User clicks "Join Room" → ChatRoom modal opens
  → useWebSocket hook connects to ws://localhost:3001
  → Send JOIN message {roomId, userId, nickname}
  → Backend validates & adds user to room Map
  → Backend fetches last 50 messages from DB
  → Frontend receives HISTORY message → displays messages
  → User types message → sends CHAT event
  → Backend runs detectCrisis() on message content
  → Backend saves to DB with risk_level
  → Backend broadcasts to all room members
  → If crisis detected: sends CRISIS_ALERT to sender
  → Frontend shows red banner with helplines
  → Auto-scroll to latest message
```

---

## 📁 Folder Structure

```
openmindwell/
│
├── backend/                              # Node.js Express backend
│   ├── src/
│   │   ├── config/
│   │   │   └── index.ts                  # Config validation & export
│   │   ├── lib/
│   │   │   └── supabase.ts               # Supabase client & types
│   │   ├── middleware/
│   │   │   └── auth.ts                   # JWT authentication
│   │   ├── routes/
│   │   │   ├── journal.ts                # Journal CRUD endpoints
│   │   │   ├── habits.ts                 # Habits CRUD + logging
│   │   │   ├── resources.ts              # Resource listing
│   │   │   ├── rooms.ts                  # Room & message queries
│   │   │   └── moderation.ts             # Reporting & flagging
│   │   ├── services/
│   │   │   ├── crisisDetection.ts        # ✅ AI + keyword crisis detection
│   │   │   └── chatServer.ts             # ✅ WebSocket server (COMPLETE)
│   │   ├── scripts/
│   │   │   └── setupDatabase.ts          # Helper for DB setup
│   │   └── index.ts                      # Main Express server + WS init
│   ├── database/
│   │   └── schema.sql                    # PostgreSQL schema (CRITICAL)
│   ├── .env.example                      # Backend env template
│   ├── Dockerfile                        # Docker container config
│   ├── package.json                      # Backend dependencies
│   └── tsconfig.json                     # TypeScript config
│
├── frontend/                             # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   └── ChatRoom.tsx              # ✅ Real-time chat UI (NEW)
│   │   ├── hooks/
│   │   │   └── useWebSocket.ts           # ✅ WebSocket client hook (NEW)
│   │   ├── pages/
│   │   │   ├── Home.tsx                  # Landing page
│   │   │   ├── Onboarding.tsx            # Nickname setup
│   │   │   └── Dashboard.tsx             # ✅ Updated with ChatRoom
│   │   ├── lib/
│   │   │   ├── api.ts                    # REST API client
│   │   │   └── supabase.ts               # Supabase auth client
│   │   ├── App.tsx                       # React Router config
│   │   ├── main.tsx                      # App entry point
│   │   └── index.css                     # Tailwind styles
│   ├── .env.example                      # Frontend env template
│   ├── Dockerfile                        # ✅ Container config (NEW)
│   ├── nginx.conf                        # ✅ Production server (NEW)
│   ├── vite.config.ts                    # Vite configuration
│   ├── tailwind.config.ts                # Tailwind config
│   ├── postcss.config.js                 # PostCSS config
│   ├── package.json                      # Frontend dependencies
│   └── tsconfig.json                     # TypeScript config
│
├── .github/                              # (Future) CI/CD workflows
├── docker-compose.yml                    # ✅ Self-hosting deployment (NEW)
├── .gitignore
├── OPENMINDWELL_PROJECT_GUIDE.md         # 📖 Complete guide (UPDATED)
├── README.md
├── CONTRIBUTING.md
├── PROJECT_SUMMARY.md                    # Quick reference
├── LICENSE
└── package.json                          # Root scripts (npm run dev)
├── .gitignore                            # Git ignore rules
├── package.json                          # Monorepo scripts
├── README.md                             # Project README
├── LICENSE                               # MIT License
├── CONTRIBUTING.md                       # Contribution guide
├── OPENMINDWELL_PROJECT_GUIDE.md         # ← YOU ARE HERE
└── PROJECT_SUMMARY.md                    # Quick reference checklist
```

### Key File Descriptions

| File | Purpose |
|------|---------|
| `backend/database/schema.sql` | **MOST IMPORTANT** - Defines all database tables, RLS policies, and seed data. Run this in Supabase SQL editor. |
| `backend/src/index.ts` | Main backend entry point. Starts Express server and WebSocket server. |
| `backend/src/services/crisisDetection.ts` | Analyzes messages for mental health crises using HuggingFace AI and keyword patterns. |
| `backend/src/services/chatServer.ts` | Manages WebSocket connections, room memberships, message broadcasting. |
| `frontend/src/app/dashboard/page.tsx` | Main application interface with tabs for Rooms, Journal, Habits, Resources. |
| `frontend/src/lib/api.ts` | HTTP client for backend API calls (journal, habits, etc.). |
| `.env.example` files | Templates for environment variables. Copy to `.env` and fill in. |

---

## 🔐 Environment Variables

### Backend Variables (`backend/.env`)

| Variable | Description | Example | Required? |
|----------|-------------|---------|-----------|
| `SUPABASE_URL` | Your Supabase project URL | `https://abc123.supabase.co` | ✅ Yes |
| `SUPABASE_ANON_KEY` | Supabase anonymous/public key | `eyJhbG...` | ✅ Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (admin) | `eyJhbG...` | ✅ Yes |
| `HUGGINGFACE_API_TOKEN` | HuggingFace API token | `hf_abc123...` | ⚠️ Optional* |
| `FRONTEND_URL` | Frontend domain for CORS | `http://localhost:3000` | ✅ Yes |
| `PORT` | Backend server port | `3001` | ⚠️ Optional** |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window (ms) | `900000` (15 min) | ❌ No |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` | ❌ No |

*Falls back to keyword-based crisis detection if not provided.  
**Defaults to `3001` if not set. Configure this on your server as needed.

### Frontend Variables (`frontend/.env`)

| Variable | Description | Example | Required? |
|----------|-------------|---------|-----------|
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:3001` | ✅ Yes |
| `VITE_WS_URL` | WebSocket server URL | `ws://localhost:3001` | ✅ Yes |
| `VITE_SUPABASE_URL` | Supabase project URL | `https://abc123.supabase.co` | ✅ Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key | `eyJhbG...` | ✅ Yes |

**Production values:**
- `VITE_API_BASE_URL`: `https://your-domain.com` (or your server IP)
- `VITE_WS_URL`: `wss://your-domain.com` (or your server IP)

---

## 🚀 Local Development Setup

### Prerequisites

- **Node.js** 18+ (check with `node -v`)
- **npm** 9+ (check with `npm -v`)
- **Git** (check with `git --version`)
- **Supabase account** (free tier)
- **HuggingFace account** (optional, free tier)

### Step-by-Step Setup

#### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/openmindwell.git
cd openmindwell
```

#### 2. Install Root Dependencies

```bash
npm install
```

This installs `concurrently` for running multiple servers.

#### 3. Install Backend Dependencies

```bash
cd backend
npm install
cd ..
```

#### 4. Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

#### 5. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click **"New Project"**
3. Choose organization, name your project (e.g., `openmindwell`)
4. Set a strong database password (save it!)
5. Select a region (closest to you)
6. Wait ~2 minutes for project to provision

#### 6. Apply Database Schema

1. In Supabase dashboard, click **"SQL Editor"** (left sidebar)
2. Open `backend/database/schema.sql` in your code editor
3. **Copy the entire file** (it's ~400 lines)
4. Paste into Supabase SQL Editor
5. Click **"Run"** (or press `Ctrl+Enter`)
6. You should see success message and 8 tables created
7. Click **"Table Editor"** to verify tables exist

#### 7. Get Supabase Credentials

1. In Supabase dashboard, click **"Project Settings"** (gear icon)
2. Click **"API"** in left sidebar
3. Copy these values:
   - **Project URL** (under "Config")
   - **anon public** key (under "Project API keys")
   - **service_role** key (under "Project API keys" - click "Reveal")

#### 8. Configure Backend Environment

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
HUGGINGFACE_API_TOKEN=hf_YourTokenHere  # Optional for now
FRONTEND_URL=http://localhost:3000
PORT=3001
```

#### 9. Configure Frontend Environment

```bash
cd ../frontend
cp .env.example .env
```

Edit `frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 10. Run the Application

From the **root directory**:

```bash
npm run dev
```

This starts:
- Backend on http://localhost:3001
- Frontend on http://localhost:3000

#### 11. Test the Application

1. Open http://localhost:3000 in your browser
2. You should see the landing page with crisis disclaimers
3. Click **"Get Started"**
4. Enter a nickname (e.g., `TestUser123`)
5. Select an avatar emoji
6. Click **"Continue"**
7. You should see the dashboard with 4 tabs
8. Click **"Support Rooms"** tab → see 6 pre-created rooms
9. **✅ Click "Join Room →"** on any room
10. **✅ Chat modal opens** with real-time WebSocket connection
11. **✅ Type a message** and press Send → see it appear instantly
12. **✅ Test crisis detection**: Type "I feel hopeless" → see message highlighted
13. **✅ Test crisis alert**: Type "I want to hurt myself" → red banner appears with helplines
14. Open a second browser window (incognito) and join the same room with a different nickname
15. **✅ Send messages between windows** → see real-time sync
16. Close one window → see "User left the room" notification

#### 12. Verify Database

In Supabase Table Editor, check:
- **profiles** table has your new user
- **rooms** table has 6 rooms
- **resources** table has 8 resources

---

## 🆓 Free Service Accounts Setup

### Supabase (Database + Auth)

**Free Tier Limits:**
- 500 MB database storage
- 2 GB bandwidth/month
- 50,000 monthly active users
- Unlimited API requests

**Setup:**
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub (recommended)
4. Create new organization (free)
5. Create new project
6. Save database password
7. Wait for provisioning (~2 min)
8. Apply schema from `backend/database/schema.sql`

**Get Credentials:**
- Project Settings → API
- Copy URL and both API keys

### HuggingFace (AI Crisis Detection)

**Free Tier Limits:**
- 1,000 API calls/day
- Rate limit: 30 requests/min
- Public models only

**Setup:**
1. Go to [huggingface.co](https://huggingface.co)
2. Click "Sign Up" (use Google/GitHub)
3. Verify email
4. Click profile icon → Settings
5. Click "Access Tokens" (left sidebar)
6. Click "New token"
7. Name: `openmindwell-crisis-detection`
8. Role: **Read**
9. Click "Generate"
10. Copy token (starts with `hf_...`)
11. Save in `backend/.env` as `HUGGINGFACE_API_TOKEN`

**Optional:** If you skip this, the backend will use keyword-based detection (less accurate but functional).

---

## 🌐 Self-Hosting Guide

### Why Self-Host?

- **100% Privacy**: Your data stays on your server
- **No Vendor Lock-in**: Full control over your infrastructure
- **Zero Recurring Costs**: Run on home server or cheap VPS (~$5/month)
- **True Open Source**: Own your mental health platform

### Hosting Options

| Option | Cost | Difficulty | Best For |
|--------|------|------------|----------|
| **Home Server / Raspberry Pi** | $0 | Medium | Tech enthusiasts, full control |
| **DigitalOcean Droplet** | $6/mo | Easy | Reliable, simple setup |
| **Linode / Vultr VPS** | $5/mo | Easy | Budget-friendly |
| **AWS EC2 Free Tier** | $0 (1 year) | Hard | Existing AWS users |
| **Oracle Cloud Free Tier** | $0 (forever) | Medium | Free ARM instance |

### Prerequisites

- Linux server (Ubuntu 22.04 recommended)
- Docker & Docker Compose installed
- Domain name (optional, can use IP)
- SSL certificate (Let's Encrypt free)

---

## 📦 Docker Deployment (Recommended)

### Step 1: Prepare Your Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose -y

# Add your user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

### Step 2: Clone Repository

```bash
git clone https://github.com/ZenYukti/OpenMindWell.git
cd OpenMindWell
```

### Step 3: Configure Environment Variables

```bash
# Backend environment
cp backend/.env.example backend/.env
nano backend/.env
# Fill in your Supabase credentials

# Frontend environment
cp frontend/.env.example frontend/.env
nano frontend/.env
# Update API URLs to your server domain/IP
```

### Step 4: Create Docker Compose File

Create `docker-compose.yml` in project root:

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
    env_file:
      - ./backend/.env
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "80:80"
    env_file:
      - ./frontend/.env
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  backend_data:
```

### Step 5: Deploy

```bash
# Build and start containers
docker-compose up -d

# Check logs
docker-compose logs -f

# Verify running
docker-compose ps
```

Your app is now live at `http://your-server-ip`!

---

## 🔐 SSL Setup (Production)

### Using Nginx + Let's Encrypt

```bash
# Install Nginx
sudo apt install nginx certbot python3-certbot-nginx -y

# Create Nginx config
sudo nano /etc/nginx/sites-available/openmindwell
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # WebSocket
    location /ws {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }
}
```

Enable and get SSL:

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/openmindwell /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

---

## 🏠 Home Server / Raspberry Pi Deployment

### Requirements
- Raspberry Pi 4 (4GB+ RAM recommended)
- MicroSD card (32GB+)
- Stable internet connection
- Static local IP or DDNS service

### Setup

1. **Install Raspberry Pi OS Lite (64-bit)**
   - Use Raspberry Pi Imager
   - Enable SSH in settings

2. **Follow Docker deployment steps above**

3. **Port Forwarding**
   - Router settings: Forward ports 80 (HTTP) and 443 (HTTPS) to Pi's local IP

4. **Dynamic DNS (if no static IP)**
   - Use DuckDNS, No-IP, or Cloudflare
   - Update DNS automatically with cron job

### Power Management

```bash
# Auto-restart on reboot
sudo systemctl enable docker
docker update --restart unless-stopped $(docker ps -aq)
```

---

## ✅ Post-Deployment Checklist

- [ ] Frontend loads without errors
- [ ] Backend health check passes (`/health` or `/api/health`)
- [ ] CORS is configured correctly
- [ ] WebSocket connects successfully
- [ ] Database queries work (check Supabase logs)
- [ ] Crisis detection triggers (test with keyword "suicide")
- [ ] Anonymous sign-in works
- [ ] SSL certificate is valid (if using HTTPS)
- [ ] Environment variables are set correctly
- [ ] Firewall allows ports 80, 443, 3001

### Monitoring Your Deployment

```bash
# Check container status
docker-compose ps

# View live logs
docker-compose logs -f

# Restart services
docker-compose restart

# Update to latest code
git pull
docker-compose down
docker-compose up -d --build
```

### Troubleshooting

**Frontend won't load:**
- Check Docker logs: `docker-compose logs frontend`
- Verify environment variables in `.env`
- Ensure port 80 is not blocked by firewall

**Backend errors:**
- Check logs: `docker-compose logs backend`
- Verify Supabase credentials are correct
- Test database connection in Supabase dashboard
- Ensure `schema.sql` was applied

**WebSocket won't connect:**
- Check Nginx configuration for WebSocket upgrade headers
- Verify `wss://` protocol in frontend env vars
- Test direct connection to port 3001

**CORS errors:**
- Check `FRONTEND_URL` in backend `.env`
- Ensure it matches your domain exactly (include `https://`)
- Restart backend after env changes

---

## 🔒 Security & Privacy

### Row Level Security (RLS)

OpenMindWell uses PostgreSQL Row Level Security to ensure data privacy:

**Profiles:**
- Users can only read/update their own profile
- Enforced by: `auth.uid() = user_id`

**Journal Entries:**
- **Completely private** - only visible to entry owner
- No admin access
- Enforced by: `auth.uid() = user_id`

**Messages:**
- Visible to all users in the same room
- Enforced by: `room_id IN (SELECT id FROM rooms)`

**Habits & Habit Logs:**
- Users can only see/edit their own habits
- Enforced by: `auth.uid() = user_id`

**Resources:**
- Public read access for all users
- Only admins can insert/update

**Reports:**
- Users can create reports
- Only moderators can view all reports

### Authentication Flow

1. User clicks "Get Started"
2. Frontend calls `supabase.auth.signInAnonymously()`
3. Supabase creates anonymous session (JWT token)
4. Frontend receives session with `access_token`
5. All API calls include: `Authorization: Bearer <access_token>`
6. Backend validates JWT using Supabase public key
7. Backend extracts `user_id` from token claims
8. Database RLS policies enforce access based on `auth.uid()`

### Anonymous vs Pseudonymous

- **Anonymous**: No personal data (email, phone, real name)
- **Pseudonymous**: Users choose a nickname + emoji avatar
- **Session-based**: If user clears browser data, they lose access (by design for privacy)

### Crisis Detection Privacy

- Messages are analyzed for crisis keywords/emotions
- No data is sent to third parties except HuggingFace (temporary processing)
- HuggingFace does NOT store messages
- Risk levels are stored in database for moderation only

### Data Retention

- **Messages**: Kept indefinitely (for moderation/context)
- **Journal Entries**: Kept until user deletes
- **Accounts**: Anonymous accounts are permanent (no deletion flow yet)
- **Logs**: Backend logs rotate after 7 days (Render/Railway default)

### Moderation Best Practices

- All moderators should complete training (TODO: create guide)
- Review flagged messages within 24 hours
- Escalate critical risk messages to platform admins
- Never share user data outside platform
- Ban users only for severe violations (spam, abuse, illegal content)

### Vulnerabilities to Monitor

- **SQL Injection**: Mitigated by parameterized queries via Supabase client
- **XSS**: Mitigated by React's auto-escaping
- **CSRF**: Mitigated by SameSite cookies + JWT
- **Rate Limiting**: Implemented in backend (100 req/15min per IP)
- **DDoS**: Mitigated by Vercel/Render infrastructure

---

## 🤝 Contributing

### Ways to Contribute

- 🐛 **Bug Reports**: Open GitHub issues
- ✨ **Feature Requests**: Use issue templates
- 📝 **Documentation**: Improve this guide
- 💻 **Code**: Submit pull requests
- 🎨 **Design**: UI/UX improvements
- 🌍 **Localization**: Translate to other languages

### Development Workflow

1. **Fork** the repository on GitHub
2. **Clone** your fork: `git clone https://github.com/yourusername/openmindwell.git`
3. **Install dependencies**: `npm install` (root, then backend, then frontend)
4. **Set up environment**: Copy `.env.example` files and configure
5. **Apply DB schema**: Run `schema.sql` in Supabase SQL Editor
6. **Create branch**: `git checkout -b feature/your-feature`
7. **Start dev servers**: `npm run dev` from root directory
8. **Make changes** and test locally:
   - Backend changes: Check http://localhost:3001/health
   - Frontend changes: Hot reload at http://localhost:3000
   - WebSocket changes: Test in chat rooms with multiple browser tabs
   - Database changes: Verify in Supabase Table Editor
9. **Test crisis detection**: Send messages with keywords like "hopeless", "suicide"
10. **Commit**: `git commit -m "feat: add new feature"`
11. **Push**: `git push origin feature/your-feature`
12. **Open Pull Request** on GitHub with description of changes

### Commit Message Convention

Use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style (formatting, no logic change)
- `refactor:` - Code restructuring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

Examples:
```
feat: add breathing exercise timer
fix: resolve WebSocket reconnection bug
docs: update deployment guide for Railway
```

### Code of Conduct

**We are committed to:**
- Respectful and inclusive communication
- Constructive feedback
- Prioritizing user safety and privacy
- Transparency in decision-making

**Zero tolerance for:**
- Harassment, hate speech, or discrimination
- Sharing private user data
- Malicious code or security exploits
- Spam or off-topic content

**Reporting:** Email conduct@openmindwell.org (TODO: set up)

### Getting Help

- 💬 **GitHub Discussions**: Ask questions, share ideas
- 📧 **Email**: support@openmindwell.org (TODO)
- 💻 **Discord**: Coming soon

---

## 🗺️ Roadmap

### Phase 1: Foundation ✅ COMPLETE
- [x] Anonymous authentication
- [x] Basic chat rooms (6 pre-created)
- [x] **Real-time chat UI (WebSocket client)** ✅ NEW
- [x] **WebSocket auto-reconnection** ✅ NEW
- [x] **Message history loading** ✅ NEW
- [x] **User join/leave events** ✅ NEW
- [x] AI crisis detection (HuggingFace + keywords)
- [x] **Crisis alerts in chat** ✅ NEW
- [x] Private journaling
- [x] Habit tracking
- [x] Resource library
- [x] Moderation system (backend ready)
- [x] **Self-hosting deployment (Docker)** ✅ NEW
- [x] **Production Nginx config** ✅ NEW

### Phase 2: Enhanced UX (Next 3 Months)
- [ ] Notification system (new messages, @mentions)
- [ ] User profiles (bio, status, preferred pronouns)
- [ ] Direct messaging (1-on-1 private chats)
- [ ] Emoji reactions on messages
- [ ] Message editing/deletion
- [ ] Dark mode toggle
- [ ] Mobile-responsive chat improvements
- [ ] Voice messages (optional)
- [ ] File sharing (images only, moderated)

### Phase 3: Community Features (3-6 Months)
- [ ] Guided meditation audio
- [ ] Breathing exercise timer
- [ ] Mood tracking visualizations
- [ ] Habit streak leaderboard (opt-in)
- [ ] Volunteer application flow
- [ ] Peer support badge system
- [ ] Weekly wellness challenges

### Phase 4: Scale & Localization (6-12 Months)
- [ ] Internationalization (Spanish, French, Hindi, etc.)
- [ ] Mobile apps (React Native)
- [ ] Advanced moderation (auto-ban repeat offenders)
- [ ] Analytics dashboard (aggregate stats)
- [ ] Professional referral network
- [ ] Integration with external crisis lines
- [ ] Offline mode (PWA)

### Long-Term Vision
- [ ] AI therapy chatbot (ethical, limited scope)
- [ ] Video/audio chat rooms
- [ ] Support groups with facilitators
- [ ] Research partnerships (anonymized data)
- [ ] Fundraising for free tier expansion
- [ ] Certification program for moderators

---

## 📞 Support & Contact

### For Users
- **In Crisis?** Call 988 (US) or visit findahelpline.com
- **Technical Issues**: GitHub Issues
- **General Questions**: support@openmindwell.org (TODO)

### For Contributors
- **GitHub**: [github.com/yourusername/openmindwell](https://github.com/yourusername/openmindwell)
- **Discussions**: GitHub Discussions tab
- **Discord**: Coming soon

### For Researchers
- **Data Access**: Contact research@openmindwell.org (TODO)
- **Partnerships**: partnerships@openmindwell.org (TODO)

---

## 📄 License

MIT License - See [LICENSE](./LICENSE) file.

**Ethical Use Clause:**  
While this software is open-source, we ask that derivative works:
1. Maintain prominent mental health crisis disclaimers
2. Do NOT claim to provide professional medical services
3. Respect user privacy and anonymity
4. Contribute improvements back to the community

---

## 🙏 Acknowledgments

- **Supabase** - For generous free tier and excellent DX
- **HuggingFace** - For democratizing AI/ML access
- **Vercel** - For seamless Next.js hosting
- **Render/Railway** - For free backend hosting
- **Mental health advocates** - For inspiration and guidance
- **Open-source community** - For tools and support

---

## 📚 Additional Resources

### Mental Health Organizations
- **NAMI** (National Alliance on Mental Illness): nami.org
- **Mental Health America**: mhanational.org
- **Crisis Text Line**: crisistextline.org

### Development Resources
- **Next.js Docs**: nextjs.org/docs
- **Supabase Docs**: supabase.com/docs
- **TypeScript Handbook**: typescriptlang.org/docs

### Similar Projects
- **7 Cups**: 7cups.com (peer support chat)
- **TalkLife**: talklife.com (anonymous community)
- **Wysa**: wysa.io (AI chatbot)

---

**Last Updated**: November 23, 2024  
**Version**: 1.0.0  
**Maintainers**: OpenMindWell Core Team

---

*Built with 💙 by people who care about mental wellness*

*Remember: It's okay to not be okay. Seeking help is a sign of strength.*
