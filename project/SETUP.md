# 🚀 CodeLearn Platform — Complete Setup Guide

## What Was Built

This is now a **complete full-stack AI-powered platform** with:

| Feature | Status |
|---|---|
| Online Code Compiler (7 languages) | ✅ Built |
| LeetCode-style Problem System | ✅ Built |
| JWT Authentication (real backend) | ✅ Built |
| Teacher/Student LMS | ✅ Built |
| AI Resume Builder (Anthropic Claude) | ✅ Built |
| Resume Analyzer + Score | ✅ Built |
| AI Learning Recommendations | ✅ Built |
| Leaderboard | ✅ Built |
| Code Playground | ✅ Built |
| Admin Panel (existing) | ✅ Preserved |
| All Existing Pages | ✅ Preserved |

---

## 📁 Project Structure

```
project/
├── backend/                  ← NEW: Node.js + Express API
│   ├── config/db.js          ← MongoDB connection
│   ├── controllers/          ← authController, codeController, etc.
│   ├── middleware/auth.js     ← JWT protect middleware
│   ├── models/               ← User, Problem, Submission, Group
│   ├── routes/               ← auth, problems, code, groups, ai, users
│   ├── utils/judge0.js       ← Code execution engine
│   ├── utils/seed.js         ← Database seeder
│   ├── server.js             ← Express app entry point
│   ├── .env.example          ← Environment variables template
│   └── package.json
│
└── src/app/
    ├── pages/
    │   ├── Problems.tsx       ← NEW: LeetCode-style problem list
    │   ├── ProblemSolver.tsx  ← NEW: Monaco editor + Judge0
    │   ├── Playground.tsx     ← NEW: Free coding environment
    │   ├── LMS.tsx            ← NEW: Teacher/Student groups
    │   ├── GroupDetail.tsx    ← NEW: Assignments & performance
    │   ├── ResumeBuilder.tsx  ← NEW: AI resume + analyzer
    │   ├── Recommendations.tsx← NEW: AI learning roadmap
    │   ├── LeaderboardPage.tsx← NEW: Full leaderboard with podium
    │   └── ... (existing pages preserved)
    ├── services/api.ts        ← UPDATED: Connects to real backend
    ├── context/AuthContext.tsx← UPDATED: Real JWT auth
    └── routes.tsx             ← UPDATED: All routes registered
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or pnpm

---

### Step 1: Backend Setup

```bash
cd backend

# Copy environment file
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/codelearn
JWT_SECRET=change_this_to_a_random_long_string_abc123xyz
JWT_EXPIRES_IN=7d
JUDGE0_API_KEY=your_key_here          # optional, mock works without it
ANTHROPIC_API_KEY=your_key_here       # optional, mock works without it
CLIENT_URL=http://localhost:5173
```

```bash
# Install dependencies
npm install

# Seed database with 8 sample problems + test users
npm run seed

# Start server (development mode with auto-reload)
npm run dev
```

✅ Backend running at **http://localhost:5000**

---

### Step 2: Frontend Setup

```bash
# In the project root (not backend/)
npm install    # or: pnpm install

npm run dev    # or: pnpm dev
```

✅ Frontend running at **http://localhost:5173**

---

### Step 3: Test the App

Open http://localhost:5173 and login with:

| Role | Email | Password |
|---|---|---|
| **Admin** | admin@codelearn.com | admin123 |
| **Teacher** | teacher@codelearn.com | teacher123 |
| **Student** | student@codelearn.com | student123 |

---

## 🔑 API Keys (Optional)

The app works fully without API keys using **mock responses**.

### Judge0 (Real Code Execution)
1. Go to https://rapidapi.com/judge0-official/api/judge0-ce
2. Sign up for free (50 submissions/day free tier)
3. Copy your API key → paste into `JUDGE0_API_KEY` in `.env`

### Anthropic Claude (Real AI Features)
1. Go to https://console.anthropic.com
2. Create API key
3. Paste into `ANTHROPIC_API_KEY` in `.env`

### MongoDB Atlas (Cloud Database)
1. Go to https://www.mongodb.com/atlas
2. Create free cluster
3. Copy connection string → paste into `MONGODB_URI` in `.env`

---

## 🌐 New Page URLs

| Page | URL | Access |
|---|---|---|
| Problem List | /problems | Public |
| Problem Solver | /problems/:slug | Login required |
| Code Playground | /playground | Login required |
| LMS / Groups | /lms | Login required |
| Group Detail | /lms/groups/:id | Login required |
| AI Resume Builder | /resume | Login required |
| AI Recommendations | /recommendations | Login required |
| Leaderboard | /rankings | Public |

---

## 🔌 Backend API Endpoints

```
Auth:
  POST /api/auth/register
  POST /api/auth/login
  GET  /api/auth/me
  PUT  /api/auth/profile

Problems:
  GET  /api/problems
  GET  /api/problems/daily
  GET  /api/problems/:slug
  POST /api/problems          (teacher/admin)

Code:
  POST /api/code/run
  POST /api/code/submit/:problemId
  GET  /api/code/submissions

Groups:
  POST /api/groups            (teacher)
  POST /api/groups/join
  GET  /api/groups/my
  GET  /api/groups/:id
  POST /api/groups/:id/assignments

AI:
  POST /api/ai/resume/generate
  POST /api/ai/resume/analyze
  GET  /api/ai/recommendations

Users:
  GET  /api/users/leaderboard
  GET  /api/users/notes
  POST /api/users/notes
  GET  /api/users/admin/all   (admin only)
```

---

## 🐛 Troubleshooting

**"Cannot connect to backend"**
→ Make sure `npm run dev` is running in the `backend/` folder

**"MongoDB connection failed"**
→ Start MongoDB locally: `mongod` or use Atlas connection string

**"Mock output instead of real code execution"**
→ Add your Judge0 API key to `backend/.env`

**CORS error**
→ Make sure `CLIENT_URL=http://localhost:5173` in backend `.env`

**TypeScript errors on new pages**
→ Run `npm install` to ensure all packages are available

---

## 🎯 Final Year Project Checklist

- ✅ Full-stack with clean MVC architecture
- ✅ JWT authentication with role-based access
- ✅ Real code execution via Judge0
- ✅ MongoDB with proper schemas and relationships
- ✅ AI integration (resume builder, analyzer, recommendations)
- ✅ LMS system (teacher-student-assignment flow)
- ✅ Leaderboard and gamification
- ✅ Dark/light theme support
- ✅ Mobile-responsive design
- ✅ Rate limiting and security middleware
- ✅ Error handling throughout
- ✅ Environment variable management
- ✅ Database seeding for demo
