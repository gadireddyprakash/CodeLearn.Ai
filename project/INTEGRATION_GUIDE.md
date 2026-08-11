# Code-UI - Full-Stack Code Learning Platform

A comprehensive code learning application with React frontend, designed to connect with Spring Boot backend and MongoDB database.

## 🎯 Features Implemented

### Frontend (React)

#### 1. **Authentication Pages**
- User Registration (email, username, password)
- Login with JWT token handling
- Protected routes for authenticated users

#### 2. **Dashboard**
- User profile display
- Learning statistics:
  - Time spent learning
  - Levels completed (X/10)
  - Overall progress percentage
  - Average score across all levels
- Recent activity feed
- Quick access to continue learning

#### 3. **Language Selection**
- Choose between Java or Python
- Course overview for each language
- Initialize user progress for selected language

#### 4. **Course Structure (10 Levels)**
Each level contains:
- **Learning Content**: Markdown-based educational material with code examples
- **MCQ Test**: 10 multiple choice questions
  - Timer (10 minutes)
  - Score 70% (7/10) to unlock coding section
  - Instant feedback and results
- **Coding Challenges**: 15 problems per level
  - 5 Easy (5 points each)
  - 5 Medium (10 points each)
  - 5 Hard (15 points each)
  - Monaco Code Editor integration
  - Real-time code execution
  - Test case validation

#### 5. **Scoring System**
- MCQ Score (40%) + Coding Score (60%) = Total Level Score
- Minimum 60% required to unlock next level
- Failed levels must be repeated
- Final score: Average across all 10 levels

#### 6. **UI Components**
- Responsive design
- Clean, modern interface
- Progress tracking visualizations
- Level status indicators (locked/current/completed)
- Code editor with syntax highlighting

## 🏗️ Architecture

### Frontend Structure
```
src/app/
├── context/
│   └── AuthContext.tsx          # Authentication state management
├── data/
│   └── mockData.ts              # Mock course data (for development)
├── pages/
│   ├── Home.tsx                 # Landing page
│   ├── Login.tsx                # Login page
│   ├── Register.tsx             # Registration page
│   ├── Dashboard.tsx            # User dashboard
│   ├── SelectLanguage.tsx       # Language selection
│   ├── Levels.tsx               # Course levels overview
│   ├── LevelDetail.tsx          # Level learning content
│   ├── MCQTest.tsx              # MCQ quiz interface
│   └── CodingChallenge.tsx      # Code editor & challenges
├── services/
│   └── api.ts                   # API service layer
├── types/
│   └── index.ts                 # TypeScript type definitions
├── routes.tsx                   # React Router configuration
└── App.tsx                      # Main app component
```

## 🔌 Backend Integration

### Spring Boot API Endpoints Required

#### Authentication Endpoints
```java
POST /api/auth/signup
Request: { email, username, password }
Response: { token, user }

POST /api/auth/login
Request: { email, password }
Response: { token, user }

GET /api/auth/me
Headers: Authorization: Bearer <token>
Response: { id, email, username, createdAt }
```

#### Progress Endpoints
```java
GET /api/progress?language=java
Headers: Authorization: Bearer <token>
Response: UserProgress object

PUT /api/progress
Headers: Authorization: Bearer <token>
Request: Partial<UserProgress>
Response: Updated UserProgress
```

#### Course Endpoints
```java
GET /api/courses/{language}/levels
Headers: Authorization: Bearer <token>
Response: Level[]

GET /api/courses/{language}/levels/{levelId}
Headers: Authorization: Bearer <token>
Response: Level object
```

#### Submission Endpoints
```java
POST /api/submissions/mcq
Headers: Authorization: Bearer <token>
Request: { levelId, answers: Record<string, number> }
Response: { score, passed, correct, total }

POST /api/submissions/code
Headers: Authorization: Bearer <token>
Request: { questionId, code, language, userId, levelId }
Response: ExecutionResult

POST /api/submissions/execute
Headers: Authorization: Bearer <token>
Request: { code, language, input }
Response: { success, output, error, testCasesPassed, totalTestCases }
```

### Judge0 Integration (Backend)

Your Spring Boot backend should integrate with Judge0 API for code execution:

```java
// Example Spring Boot service for Judge0
@Service
public class CodeExecutionService {
    
    @Value("${judge0.api.url}")
    private String judge0Url;
    
    @Value("${judge0.api.key}")
    private String judge0Key;
    
    public ExecutionResult executeCode(String code, String language, String input) {
        // 1. Get language ID for Judge0
        int languageId = getLanguageId(language);
        
        // 2. Submit code to Judge0
        String submissionToken = submitToJudge0(code, languageId, input);
        
        // 3. Poll for results
        return getExecutionResult(submissionToken);
    }
    
    private int getLanguageId(String language) {
        // Java: 62, Python: 71
        return language.equals("java") ? 62 : 71;
    }
}
```

### MongoDB Schema

#### User Collection
```javascript
{
  _id: ObjectId,
  email: String,
  username: String,
  password: String (hashed),
  createdAt: Date
}
```

#### UserProgress Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  language: String,
  currentLevel: Number,
  levelsCompleted: [Number],
  timeSpent: Number,
  progressPercentage: Number,
  scores: [{
    level: Number,
    mcqScore: Number,
    codingScore: Number,
    totalScore: Number,
    passed: Boolean,
    completedAt: Date
  }]
}
```

#### Level Collection
```javascript
{
  _id: ObjectId,
  id: Number,
  language: String,
  title: String,
  description: String,
  learningContent: String,
  mcqQuestions: [{
    id: String,
    question: String,
    options: [String],
    correctAnswer: Number,
    explanation: String
  }],
  codingQuestions: [{
    id: String,
    title: String,
    description: String,
    difficulty: String,
    starterCode: String,
    testCases: [{
      input: String,
      expectedOutput: String,
      isHidden: Boolean
    }],
    points: Number
  }]
}
```

#### Submission Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  levelId: Number,
  questionId: String,
  code: String,
  language: String,
  executionResult: {
    success: Boolean,
    output: String,
    error: String,
    testCasesPassed: Number,
    totalTestCases: Number
  },
  submittedAt: Date
}
```

## 🚀 Getting Started

### Frontend Setup

1. **Install dependencies** (already configured):
```bash
npm install
```

2. **Configure API URL**:
Create a `.env` file:
```env
VITE_API_URL=http://localhost:8080/api
```

3. **Run development server**:
```bash
npm run dev
```

### Backend Setup (Spring Boot)

1. **Create Spring Boot project** with dependencies:
   - Spring Web
   - Spring Security
   - Spring Data MongoDB
   - JWT Library
   - RestTemplate or WebClient

2. **Configure application.properties**:
```properties
spring.data.mongodb.uri=mongodb://localhost:27017/codeui
spring.data.mongodb.database=codeui

jwt.secret=your-secret-key
jwt.expiration=86400000

judge0.api.url=https://judge0-ce.p.rapidapi.com
judge0.api.key=your-rapidapi-key
```

3. **Implement Controllers**:
   - AuthController
   - ProgressController
   - CourseController
   - SubmissionController

4. **Add JWT Security**:
   - JwtTokenProvider
   - JwtAuthenticationFilter
   - SecurityConfig

## 📝 Development Notes

### Current State
- Frontend is fully implemented with mock data
- All UI components are functional
- Authentication uses localStorage (mock JWT)
- API calls are prepared but need backend
- Code execution is simulated (needs Judge0 integration)

### Next Steps
1. Build Spring Boot backend with all endpoints
2. Set up MongoDB and create collections
3. Integrate Judge0 API for code execution
4. Replace mock data with real API calls
5. Add error handling and loading states
6. Implement proper JWT validation
7. Add rate limiting for code execution
8. Deploy frontend and backend

## 🔐 Security Considerations

1. **JWT Tokens**: Store securely, implement refresh tokens
2. **Password Hashing**: Use BCrypt in Spring Boot
3. **Rate Limiting**: Limit code execution attempts
4. **Input Validation**: Validate all user inputs
5. **CORS**: Configure properly for production
6. **Environment Variables**: Never commit secrets

## 🎨 Tech Stack

### Frontend
- React 18
- TypeScript
- React Router 7
- Monaco Editor (VS Code editor)
- Tailwind CSS
- Lucide Icons
- React Markdown

### Backend (To Implement)
- Spring Boot 3.x
- Spring Security + JWT
- MongoDB
- Judge0 API
- Maven/Gradle

## 📦 Package Information

Key packages installed:
- `@monaco-editor/react` - Code editor component
- `react-router` - Navigation and routing
- `react-markdown` - Render learning content
- `lucide-react` - Icon library

## 🤝 API Integration Guide

To connect this frontend to your backend:

1. Update `VITE_API_URL` in `.env` file
2. Remove mock logic from `AuthContext.tsx`
3. Enable real API calls in `services/api.ts`
4. Handle loading and error states
5. Add token refresh mechanism
6. Implement proper error boundaries

## 📄 License

This project is for educational purposes.

---

**Note**: This is a frontend implementation. You need to build the Spring Boot backend separately with all the API endpoints documented above.
