import { createBrowserRouter } from 'react-router';

// Existing pages (kept for backwards compat)
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import SelectLanguage from './pages/SelectLanguage';
import Levels from './pages/Levels';
import LevelDetail from './pages/LevelDetail';
import MCQTest from './pages/MCQTest';
import CodingChallenge from './pages/CodingChallenge';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';

// New full-featured pages
import ProblemsPage from './pages/Problems';
import ProblemSolverPage from './pages/ProblemSolver';
import PlaygroundPage from './pages/Playground';
import LMSPage from './pages/LMS';
import GroupDetailPage from './pages/GroupDetail';
import ResumeBuilderPage from './pages/ResumeBuilder';
import RecommendationsPage from './pages/Recommendations';
import LeaderboardPage from './pages/LeaderboardPage';

// New Level Progression
import LanguageSelection from './pages/LanguageSelection';
import LevelMap from './pages/LevelMap';
import LevelConcept from './pages/LevelConcept';
import LevelTest from './pages/LevelTest';

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#050818]">
    <div className="text-center">
      <h1 className="text-7xl font-black text-indigo-500 mb-4">404</h1>
      <p className="text-xl text-gray-300 mb-6">Page not found</p>
      <a href="/dashboard" className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-colors font-semibold">Go to Dashboard</a>
    </div>
  </div>
);

export const router = createBrowserRouter([
  // Public
  { path: '/', element: <Home /> },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '/signup', element: <Register /> },
  { path: '/forgot-password', element: <ForgotPassword /> },

  // Core app
  { path: '/dashboard', element: <Dashboard /> },
  { path: '/profile', element: <Profile /> },

  // Existing learning path (preserved)
  { path: '/select-language-legacy', element: <SelectLanguage /> },
  { path: '/levels-legacy', element: <Levels /> },
  { path: '/level-legacy/:levelId', element: <LevelDetail /> },
  { path: '/level-legacy/:levelId/mcq', element: <MCQTest /> },
  { path: '/level-legacy/:levelId/code', element: <CodingChallenge /> },

  // New Level Progression (10 Levels)
  { path: '/select-language', element: <LanguageSelection /> },
  { path: '/levels/:language', element: <LevelMap /> },
  { path: '/levels/:language/:levelNumber/concept', element: <LevelConcept /> },
  { path: '/levels/:language/:levelNumber/test', element: <LevelTest /> },

  // Problems
  { path: '/problems', element: <ProblemsPage /> },
  { path: '/problems/:slug', element: <ProblemSolverPage /> },

  // Playground
  { path: '/playground', element: <PlaygroundPage /> },

  // LMS
  { path: '/lms', element: <LMSPage /> },
  { path: '/lms/groups/:id', element: <GroupDetailPage /> },

  // AI
  { path: '/resume', element: <ResumeBuilderPage /> },
  { path: '/recommendations', element: <RecommendationsPage /> },

  // Leaderboard (both paths point to new page)
  { path: '/leaderboard', element: <LeaderboardPage /> },
  { path: '/rankings', element: <LeaderboardPage /> },

  // Admin
  { path: '/admin/login', element: <AdminLogin /> },
  { path: '/admin/dashboard', element: <AdminDashboard /> },

  { path: '*', element: <NotFound /> },
]);
