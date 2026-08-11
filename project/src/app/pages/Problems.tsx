import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '../components/Navbar';
import { Link, useNavigate } from 'react-router';
import { problemsAPI, usersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Search, Filter, Trophy, Zap, ChevronRight, Star,
  CheckCircle2, Circle, Lock, BookOpen, Calendar, TrendingUp
} from 'lucide-react';

const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard'];
const CATEGORIES = ['All', 'Arrays', 'Strings', 'LinkedList', 'Trees', 'Graphs', 'DP', 'Math', 'Sorting', 'Searching', 'Recursion'];

const diffColor: Record<string, string> = {
  Easy: 'text-green-500 bg-green-50 bg-green-500/10',
  Medium: 'text-yellow-500 bg-yellow-50 bg-yellow-500/10',
  Hard: 'text-red-500 bg-red-50 bg-red-500/10',
};

export default function ProblemsPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [problems, setProblems] = useState<any[]>([]);
  const [daily, setDaily] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('All');
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [solvedIds, setSolvedIds] = useState<Set<string>>(new Set());

  const fetchProblems = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page };
      if (search) params.search = search;
      if (difficulty !== 'All') params.difficulty = difficulty;
      if (category !== 'All') params.category = category;
      const data = await problemsAPI.getAll(params);
      setProblems(data.problems || []);
      setTotalPages(data.pages || 1);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search, difficulty, category, page]);

  useEffect(() => { fetchProblems(); }, [fetchProblems]);

  useEffect(() => {
    problemsAPI.getDaily().then(d => setDaily(d.problem)).catch(() => {});
  }, []);

  // Load solved problems from submissions
  useEffect(() => {
    if (!isAuthenticated) return;
    import('../services/api').then(({ codeAPI }) => {
      codeAPI.getSubmissions({ limit: 200 }).then((d: any) => {
        const ids = new Set<string>(
          (d.submissions || []).filter((s: any) => s.status === 'Accepted').map((s: any) => s.problem?._id).filter(Boolean)
        );
        setSolvedIds(ids);
      }).catch(() => {});
    });
  }, [isAuthenticated]);

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { setPage(1); fetchProblems(); }
  };

  const counts = { Easy: 0, Medium: 0, Hard: 0 };
  problems.forEach(p => { if (counts[p.difficulty as keyof typeof counts] !== undefined) counts[p.difficulty as keyof typeof counts]++; });

  return (
    <div className="min-h-screen bg-[#050818] text-white">
      <Navbar />
      {/* Header */}
      <div className="bg-[#0a0f1e] border-b border-white/5 sticky top-[56px] z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-indigo-600" />
              <h1 className="text-xl font-bold text-white">Problems</h1>
              <span className="text-sm text-gray-400">
                {problems.length} problems
              </span>
            </div>
            <div className="flex items-center gap-3">
              {isAuthenticated && (
                <div className="flex items-center gap-2 bg-green-50 bg-green-500/10 px-3 py-1.5 rounded-full">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-green-700 text-green-400">
                    {solvedIds.size} solved
                  </span>
                </div>
              )}
              {user?.role === 'teacher' || user?.role === 'admin' ? (
                <button
                  onClick={() => navigate('/problems/create')}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                >
                  + Add Problem
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0 space-y-4">
          {/* Daily Challenge */}
          {daily && (
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl p-4 text-white">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-semibold">Daily Challenge</span>
              </div>
              <p className="font-bold mb-2 leading-tight">{daily.title}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full bg-white/20`}>{daily.difficulty}</span>
              <Link
                to={`/problems/${daily.slug}`}
                className="mt-3 flex items-center gap-1 text-sm text-white/80 hover:text-white transition-colors"
              >
                Solve now <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          )}

          {/* Stats */}
          <div className="bg-white/[0.03] rounded-xl p-4 border border-white/10 space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">My Progress</h3>
            {(['Easy', 'Medium', 'Hard'] as const).map(d => (
              <div key={d} className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${diffColor[d]}`}>{d}</span>
                <div className="flex-1 bg-white/5 rounded-full h-1.5">
                  <div className="bg-indigo-500 rounded-full h-1.5" style={{ width: '30%' }} />
                </div>
              </div>
            ))}
          </div>

          {/* Category Filter */}
          <div className="bg-white/[0.03] rounded-xl p-4 border border-white/10">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Category</h3>
            <div className="space-y-1">
              {CATEGORIES.map(c => (
                <button
                  key={c}
                  onClick={() => { setCategory(c); setPage(1); }}
                  className={`w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors ${
                    category === c
                      ? 'bg-indigo-50 bg-indigo-500/10 text-indigo-600 text-indigo-400 font-medium'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Search + Difficulty Filter */}
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search problems..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="w-full pl-9 pr-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white placeholder-gray-400"
              />
            </div>
            <div className="flex gap-2">
              {DIFFICULTIES.map(d => (
                <button
                  key={d}
                  onClick={() => { setDifficulty(d); setPage(1); }}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors border ${
                    difficulty === d
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white/[0.03] text-gray-300 border-white/10 hover:border-indigo-300'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Problem List */}
          <div className="bg-white/[0.03] rounded-xl border border-white/10 overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-gray-100 dark:border-gray-700 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              <div className="col-span-1">Status</div>
              <div className="col-span-5">Title</div>
              <div className="col-span-2">Difficulty</div>
              <div className="col-span-2">Category</div>
              <div className="col-span-2 text-right">Acceptance</div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : problems.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No problems found. Try a different filter.</p>
              </div>
            ) : (
              problems.map((problem, idx) => {
                const solved = solvedIds.has(problem._id);
                return (
                  <Link
                    key={problem._id}
                    to={`/problems/${problem.slug}`}
                    className={`grid grid-cols-12 gap-4 px-4 py-3.5 items-center hover:bg-indigo-50 hover:bg-white/5 transition-colors border-b border-gray-50 dark:border-gray-700/50 last:border-b-0 ${idx % 2 === 0 ? '' : 'bg-gray-50/50 bg-white/[0.02]'}`}
                  >
                    <div className="col-span-1">
                      {solved ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-300 dark:text-gray-600" />
                      )}
                    </div>
                    <div className="col-span-5">
                      <span className="text-sm font-medium text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                        {problem.title}
                      </span>
                      {problem.tags?.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {problem.tags.slice(0, 3).map((tag: string) => (
                            <span key={tag} className="text-xs text-gray-400 dark:text-gray-500 bg-white/5 px-1.5 py-0.5 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="col-span-2">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${diffColor[problem.difficulty]}`}>
                        {problem.difficulty}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-sm text-gray-400">{problem.category}</span>
                    </div>
                    <div className="col-span-2 text-right">
                      <span className="text-sm text-gray-400">
                        {problem.acceptanceRate || 0}%
                      </span>
                    </div>
                  </Link>
                );
              })
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                    page === p
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white/[0.03] text-gray-300 border border-white/10 hover:border-indigo-300'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
