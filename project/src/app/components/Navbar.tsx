import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';
import {
  Zap, Home, BookOpen, Trophy, User, LogOut, Code2,
  Brain, Users, Terminal, Menu, X, ChevronDown, Star
} from 'lucide-react';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [aiDropOpen, setAiDropOpen] = useState(false);
  const [langDropOpen, setLangDropOpen] = useState(false);
  const { user, logout, refreshProgress } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate('/'); };
  const isActive = (path: string) => location.pathname.startsWith(path);

  // Determine current active language from URL or local storage
  const getActiveLanguage = () => {
    const match = location.pathname.match(/\/levels\/(\w+)/);
    if (match) {
      localStorage.setItem('lastLanguage', match[1]);
      return match[1];
    }
    return localStorage.getItem('lastLanguage') || 'python';
  };

  const currentLang = getActiveLanguage();

  const mainLinks = [
    { to: '/dashboard', icon: Home, label: 'Dashboard' },
    { to: `/levels/${currentLang}`, icon: BookOpen, label: 'Levels' },
    { to: '/problems', icon: Code2, label: 'Problems' },
    { to: '/playground', icon: Terminal, label: 'Playground' },
    { to: '/lms', icon: Users, label: 'Classroom' },
    { to: '/rankings', icon: Trophy, label: 'Rankings' },
  ];

  const aiLinks = [
    { to: '/resume', icon: Star, label: 'Resume Builder' },
    { to: '/recommendations', icon: Brain, label: 'AI Roadmap' },
  ];

  const languagesList = [
    { id: 'python', name: 'Python' },
    { id: 'javascript', name: 'JavaScript' },
    { id: 'java', name: 'Java' },
    { id: 'cpp', name: 'C++' }
  ];

  const handleLanguageChange = async (langId: string) => {
    localStorage.setItem('lastLanguage', langId);
    setLangDropOpen(false);
    if (user) {
      // Create initial progress if it doesn't exist
      const progressStr = localStorage.getItem(`progress_${langId}`);
      if (!progressStr) {
        const initialProgress = {
          userId: user.id,
          language: langId,
          currentLevel: 1,
          levelsCompleted: [],
          scores: [],
          timeSpent: 0,
          progressPercentage: 0
        };
        localStorage.setItem(`progress_${langId}`, JSON.stringify(initialProgress));
      }
      await refreshProgress(langId);
    }
    // Navigate directly to the levels track map
    navigate(`/levels/${langId}`);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#050818]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-black text-white tracking-tight hidden sm:block">CodeLearn</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-0.5">
            {mainLinks.map(link => (
              <Link key={link.to} to={link.to}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isActive(link.to) || (link.label === 'Levels' && location.pathname.startsWith('/levels/'))
                    ? 'bg-indigo-600/20 text-indigo-300'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}>
                <link.icon className="w-3.5 h-3.5" />
                {link.label}
              </Link>
            ))}

            {/* AI dropdown */}
            <div className="relative">
              <button
                onClick={() => setAiDropOpen(!aiDropOpen)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  aiLinks.some(l => isActive(l.to))
                    ? 'bg-violet-600/20 text-violet-300'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Brain className="w-3.5 h-3.5" /> AI Tools
                <ChevronDown className={`w-3 h-3 transition-transform ${aiDropOpen ? 'rotate-180' : ''}`} />
              </button>
              {aiDropOpen && (
                <div className="absolute top-full left-0 mt-1 w-44 bg-[#0a0f1e] border border-white/10 rounded-xl shadow-2xl py-1 z-50">
                  {aiLinks.map(link => (
                    <Link key={link.to} to={link.to}
                      onClick={() => setAiDropOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                      <link.icon className="w-4 h-4 text-violet-400" />
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            
            {/* Language Switcher Dropdown (Visible when user is logged in) */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setLangDropOpen(!langDropOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-gray-200 transition-all"
                >
                  <span className="uppercase text-[10px] text-indigo-400 tracking-wider">Track:</span>
                  <span className="capitalize">{currentLang === 'cpp' ? 'C++' : currentLang}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${langDropOpen ? 'rotate-180' : ''}`} />
                </button>
                {langDropOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-36 bg-[#0a0f1e] border border-white/10 rounded-xl shadow-2xl py-1 z-50">
                    {languagesList.map(l => (
                      <button
                        key={l.id}
                        onClick={() => handleLanguageChange(l.id)}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-white/5 ${
                          currentLang === l.id ? 'text-indigo-400 font-bold' : 'text-gray-300'
                        }`}
                      >
                        {l.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* User pill */}
            {user && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-xs font-bold text-white">
                  {user?.username?.[0]?.toUpperCase()}
                </div>
                <span className="text-sm text-gray-200 font-medium max-w-[100px] truncate">{user?.username}</span>
                {user?.role !== 'student' && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${user?.role === 'admin' ? 'bg-red-500/20 text-red-400 border border-red-500/20' : 'bg-amber-500/20 text-amber-400 border border-amber-500/20'}`}>
                    {user?.role}
                  </span>
                )}
              </div>
            )}
            
            {user && (
              <>
                <Link to="/profile" className="hidden md:flex w-8 h-8 items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all">
                  <User className="w-4 h-4" />
                </Link>
                <button onClick={handleLogout} className="hidden md:flex w-8 h-8 items-center justify-center rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            )}
            
            {/* Mobile burger */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 pt-14" onClick={() => setMobileOpen(false)}>
          <div className="absolute top-14 left-0 right-0 bg-[#0a0f1e] border-b border-white/10 p-4 space-y-1" onClick={e => e.stopPropagation()}>
            {[...mainLinks, ...aiLinks].map(link => (
              <Link key={link.to} to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive(link.to) || (link.label === 'Levels' && location.pathname.startsWith('/levels/'))
                    ? 'bg-indigo-600/20 text-indigo-300' 
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }`}>
                <link.icon className="w-4 h-4" /> {link.label}
              </Link>
            ))}
            
            {/* Mobile Language switch options */}
            <div className="py-2.5 border-t border-white/5 mt-2">
              <p className="text-xs text-gray-500 px-4 mb-2 uppercase font-semibold tracking-wider">Switch Learning Track</p>
              <div className="grid grid-cols-4 gap-1 px-2">
                {languagesList.map(l => (
                  <button
                    key={l.id}
                    onClick={() => { setMobileOpen(false); handleLanguageChange(l.id); }}
                    className={`py-1.5 text-xs rounded-lg font-bold transition-all border ${
                      currentLang === l.id
                        ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/30'
                        : 'bg-white/5 text-gray-400 border-transparent hover:text-white'
                    }`}
                  >
                    {l.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-white/5 mt-2 flex gap-2">
              <Link to="/profile" onClick={() => setMobileOpen(false)} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 text-gray-300 text-sm font-medium">
                <User className="w-4 h-4" /> Profile
              </Link>
              <button onClick={handleLogout} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/10 text-red-400 text-sm font-medium">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Spacer */}
      <div className="h-14" />
    </>
  );
}
