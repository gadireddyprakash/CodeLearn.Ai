import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Shield, LogOut, Users, TrendingUp, Code2, RefreshCw, Ban, CheckCircle, UserCog, Activity, BarChart3, AlertTriangle, BookOpen, Edit3, Save, X, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { usersAPI, adminLevelAPI, problemsAPI } from '../services/api';

const LANGUAGES = ['python', 'javascript', 'cpp', 'java'];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'stats' | 'users' | 'levels' | 'problems'>('stats');
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  // Level management state
  const [selectedLang, setSelectedLang] = useState('python');
  const [levels, setLevels] = useState<any[]>([]);
  const [levelsLoading, setLevelsLoading] = useState(false);
  const [editingLevel, setEditingLevel] = useState<any>(null);
  const [expandedLevel, setExpandedLevel] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [modalTab, setModalTab] = useState<'general' | 'mcqs' | 'coding'>('general');
  const [activeCodingIdx, setActiveCodingIdx] = useState<number | null>(null);

  // Problem management state
  const [problems, setProblems] = useState<any[]>([]);
  const [problemsLoading, setProblemsLoading] = useState(false);
  const [editingProblem, setEditingProblem] = useState<any>(null);

  // User edit state
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editingUserPass, setEditingUserPass] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userStr = localStorage.getItem('user');
    if (!token || !userStr) { navigate('/admin/login'); return; }
    try { const u = JSON.parse(userStr); if (u.role !== 'admin') { navigate('/admin/login'); return; } }
    catch { navigate('/admin/login'); return; }
    loadData();
  }, [navigate]);

  useEffect(() => {
    if (tab === 'levels') loadLevels();
    if (tab === 'problems') loadProblems();
  }, [tab, selectedLang]);

  const loadProblems = async () => {
    setProblemsLoading(true);
    try {
      const res = await problemsAPI.getAdminAll();
      setProblems(res.problems || []);
    } catch (e: any) { setError(e.message); }
    finally { setProblemsLoading(false); }
  };

  const loadData = async () => {
    setLoading(true); setError('');
    try {
      const [ur, sr] = await Promise.allSettled([usersAPI.getAllUsers(), usersAPI.getAdminStats()]);
      if (ur.status === 'fulfilled') setUsers((ur.value as any).users || []);
      if (sr.status === 'fulfilled') setStats((sr.value as any).stats);
      if (ur.status === 'rejected') setError((ur.reason as any).message);
    } finally { setLoading(false); }
  };

  const loadLevels = async () => {
    setLevelsLoading(true);
    try {
      const res = await adminLevelAPI.getLevels(selectedLang);
      setLevels(res.levels || []);
    } catch (e: any) { setError(e.message); }
    finally { setLevelsLoading(false); }
  };

  const handleBlockToggle = async (uid: string, blocked: boolean) => {
    setActionLoading(uid);
    try { await usersAPI.blockUser(uid, !blocked); setUsers(p => p.map(u => (u._id === uid || u.id === uid) ? { ...u, isBlocked: !blocked } : u)); }
    catch (e: any) { alert(e.message); }
    finally { setActionLoading(null); }
  };

  const handleRoleChange = async (uid: string, role: string) => {
    setActionLoading(uid + '-r');
    try { await usersAPI.setRole(uid, role); setUsers(p => p.map(u => (u._id === uid || u.id === uid) ? { ...u, role } : u)); }
    catch (e: any) { alert(e.message); }
    finally { setActionLoading(null); }
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;
    const uid = editingUser._id || editingUser.id;
    setActionLoading(uid + '-s');
    try {
      const dataToSave: any = {
        username: editingUser.username,
        email: editingUser.email,
        role: editingUser.role,
        fullName: editingUser.profile?.fullName || '',
      };
      if (editingUserPass) {
        dataToSave.password = editingUserPass;
      }
      const res = await usersAPI.updateUser(uid, dataToSave);
      setUsers(p => p.map(u => (u._id === uid || u.id === uid) ? { ...u, ...res.user } : u));
      setEditingUser(null);
      setEditingUserPass('');
      alert('User updated successfully!');
    } catch (e: any) {
      alert(e.message || 'Failed to update user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (uid: string) => {
    const confirmName = prompt('Type DELETE to confirm user deletion:');
    if (confirmName !== 'DELETE') {
      alert('Deletion cancelled: confirmation code did not match.');
      return;
    }
    setActionLoading(uid + '-d');
    try {
      await usersAPI.deleteUser(uid);
      setUsers(p => p.filter(u => (u._id !== uid && u.id !== uid)));
      alert('User deleted successfully!');
    } catch (e: any) {
      alert(e.message || 'Delete failed');
    } finally {
      setActionLoading(null);
    }
  };

  const startEditLevel = (level: any) => {
    setEditingLevel(JSON.parse(JSON.stringify(level))); // deep copy
    setModalTab('general');
    setActiveCodingIdx(null);
  };

  const addMCQ = () => {
    setEditingLevel((p: any) => ({
      ...p,
      mcqs: [...(p.mcqs || []), { question: '', options: ['', '', '', ''], correctOptionIndex: 0 }]
    }));
  };

  const removeMCQ = (i: number) => {
    setEditingLevel((p: any) => ({ ...p, mcqs: p.mcqs.filter((_: any, idx: number) => idx !== i) }));
  };

  const updateMCQ = (i: number, field: string, val: any) => {
    setEditingLevel((p: any) => {
      const mcqs = [...p.mcqs];
      mcqs[i] = { ...mcqs[i], [field]: val };
      return { ...p, mcqs };
    });
  };

  const updateMCQOption = (mcqIdx: number, optIdx: number, val: string) => {
    setEditingLevel((p: any) => {
      const mcqs = [...p.mcqs];
      const opts = [...mcqs[mcqIdx].options];
      opts[optIdx] = val;
      mcqs[mcqIdx] = { ...mcqs[mcqIdx], options: opts };
      return { ...p, mcqs };
    });
  };

  const addCodingQuestion = () => {
    setEditingLevel((p: any) => ({
      ...p,
      codingQuestions: [...(p.codingQuestions || []), {
        title: 'New Coding Question',
        description: '',
        difficulty: 'Easy',
        constraints: '',
        hints: [],
        starterCode: { python: '', javascript: '', cpp: '', java: '' },
        testCases: []
      }]
    }));
    setActiveCodingIdx((editingLevel?.codingQuestions?.length || 0));
  };

  const updateCodingQuestion = (i: number, field: string, val: any) => {
    setEditingLevel((p: any) => {
      const qs = [...(p.codingQuestions || [])];
      qs[i] = { ...qs[i], [field]: val };
      return { ...p, codingQuestions: qs };
    });
  };

  const removeCodingQuestion = (i: number) => {
    setEditingLevel((p: any) => {
      const qs = p.codingQuestions.filter((_: any, idx: number) => idx !== i);
      return { ...p, codingQuestions: qs };
    });
    setActiveCodingIdx(null);
  };

  const saveLevel = async () => {
    setSaving(true);
    try {
      const parsedCodingQs = (editingLevel.codingQuestions || []).map((q: any) => {
        let tc = q.testCases;
        let sc = q.starterCode;
        if (typeof tc === 'string') {
          try { tc = JSON.parse(tc); } catch { throw new Error(`Invalid JSON in Test Cases for: ${q.title}`); }
        }
        if (typeof sc === 'string') {
          try { sc = JSON.parse(sc); } catch { throw new Error(`Invalid JSON in Starter Code for: ${q.title}`); }
        }
        return { ...q, testCases: tc, starterCode: sc };
      });

      await adminLevelAPI.updateLevel(editingLevel._id, {
        title: editingLevel.title,
        conceptText: editingLevel.conceptText,
        youtubeUrl: editingLevel.youtubeUrl,
        mcqs: editingLevel.mcqs,
        codingQuestions: parsedCodingQs,
      });
      setLevels(p => p.map(l => l._id === editingLevel._id ? { ...l, ...editingLevel, codingQuestions: parsedCodingQs } : l));
      setEditingLevel(null);
      alert('Level saved successfully!');
    } catch (e: any) { alert(e.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const admin = (() => { try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; } })();

  return (
    <div className="min-h-screen bg-[#050818] text-white">
      <div className="fixed inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(239,68,68,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(239,68,68,0.03) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />

      {/* Header */}
      <header className="relative z-10 border-b border-white/5 bg-[#050818]/80 backdrop-blur-xl sticky top-0">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black">Admin Dashboard</h1>
              <p className="text-xs text-gray-400">Welcome, {admin.username || 'Admin'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={loadData} className="p-2 text-gray-400 hover:text-white"><RefreshCw className="w-4 h-4" /></button>
            <Link to="/dashboard" className="text-xs text-gray-400 hover:text-gray-200 px-3 py-1.5 border border-white/10 rounded-lg">User View</Link>
            <button onClick={() => { localStorage.removeItem('authToken'); localStorage.removeItem('user'); navigate('/admin/login'); }}
              className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 rounded-xl text-sm font-semibold transition-all">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {error && <div className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4" />{error}</div>}

        {/* Tabs */}
        <div className="flex gap-2 mb-8 p-1 bg-white/[0.02] border border-white/5 rounded-xl w-fit">
          {([['stats', BarChart3, 'Statistics'], ['users', Users, 'Users'], ['levels', BookOpen, 'Level Manager'], ['problems', Code2, 'Problems']] as const).map(([id, Icon, label]) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${tab === id ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}>
              <Icon className="w-4 h-4" />{label}
            </button>
          ))}
        </div>

        {/* ── STATS ── */}
        {tab === 'stats' && (
          <div>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Activity className="w-5 h-5 text-red-400" />Platform Statistics</h2>
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-32 bg-white/5 rounded-2xl animate-pulse" />)}</div>
            ) : stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'from-blue-500 to-indigo-500' },
                  { label: 'Active Today', value: stats.activeToday, icon: Activity, color: 'from-green-500 to-emerald-500' },
                  { label: 'Problems', value: stats.totalProblems, icon: Code2, color: 'from-violet-500 to-purple-500' },
                  { label: 'Submissions', value: stats.totalSubmissions, icon: TrendingUp, color: 'from-amber-500 to-orange-500' },
                ].map(s => (
                  <div key={s.label} className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center mb-4`}><s.icon className="w-5 h-5 text-white" /></div>
                    <p className="text-3xl font-black text-white">{s.value?.toLocaleString() ?? '—'}</p>
                    <p className="text-sm text-gray-400 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── USERS ── */}
        {tab === 'users' && (
          <div>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><UserCog className="w-5 h-5 text-red-400" />User Management <span className="text-sm font-normal text-gray-400">({users.length})</span></h2>
            {loading ? <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />)}</div> : (
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
                <table className="w-full">
                  <thead><tr className="border-b border-white/5 bg-white/[0.02]">
                    {['User', 'Role', 'Solved', 'Score', 'Status', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">{h}</th>)}
                  </tr></thead>
                  <tbody className="divide-y divide-white/5">
                    {users.map((u: any) => {
                      const uid = u._id || u.id;
                      return (
                        <tr key={uid} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-sm font-bold">{u.username?.[0]?.toUpperCase()}</div>
                              <div><p className="text-sm font-medium text-white">{u.username}</p><p className="text-xs text-gray-500">{u.email}</p></div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <select value={u.role} onChange={e => handleRoleChange(uid, e.target.value)} disabled={actionLoading === uid + '-r'}
                              className="text-xs bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-gray-300 focus:outline-none">
                              {['student', 'teacher', 'admin'].map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-300">{u.stats?.problemsSolved ?? 0}</td>
                          <td className="px-4 py-3 text-sm text-gray-300">{u.stats?.score ?? 0}</td>
                          <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${u.isBlocked ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>{u.isBlocked ? 'Blocked' : 'Active'}</span></td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <button onClick={() => handleBlockToggle(uid, u.isBlocked)} disabled={actionLoading === uid}
                                className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg font-semibold transition-all disabled:opacity-50 ${u.isBlocked ? 'bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20' : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20'}`}>
                                {actionLoading === uid ? <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" /> : u.isBlocked ? <><CheckCircle className="w-3 h-3" />Unblock</> : <><Ban className="w-3 h-3" />Block</>}
                              </button>
                              <button onClick={() => { setEditingUser(JSON.parse(JSON.stringify(u))); setEditingUserPass(''); }}
                                className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded-lg font-semibold transition-all">
                                <Edit3 className="w-3 h-3" /> Edit
                              </button>
                              <button onClick={() => handleDeleteUser(uid)} disabled={u.role === 'admin'}
                                className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg font-semibold transition-all ${
                                  u.role === 'admin' 
                                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-50' 
                                    : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20'
                                }`}>
                                <Trash2 className="w-3 h-3" /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {users.length === 0 && <div className="text-center py-12 text-gray-500"><Users className="w-10 h-10 mx-auto mb-2 text-gray-700" /><p>No users found</p></div>}
              </div>
            )}
          </div>
        )}

        {/* ── LEVELS ── */}
        {tab === 'levels' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2"><BookOpen className="w-5 h-5 text-red-400" />Level Manager</h2>
              <div className="flex gap-2">
                {LANGUAGES.map(l => (
                  <button key={l} onClick={() => setSelectedLang(l)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold capitalize transition-all ${selectedLang === l ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {levelsLoading ? <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />)}</div> : (
              <div className="space-y-3">
                {levels.map((level: any) => (
                  <div key={level._id} className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
                    <div className="flex items-center justify-between p-5 cursor-pointer" onClick={() => setExpandedLevel(expandedLevel === level._id ? null : level._id)}>
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded font-bold">L{level.levelNumber}</span>
                          <h3 className="font-bold text-white">{level.title}</h3>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{level.mcqs?.length || 0} MCQs · {level.codingQuestions?.length || 0} Coding Questions</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={e => { e.stopPropagation(); startEditLevel(level); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs font-semibold rounded-lg border border-indigo-500/20 transition-all">
                          <Edit3 className="w-3 h-3" /> Edit Level
                        </button>
                        {expandedLevel === level._id ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                      </div>
                    </div>
                    {expandedLevel === level._id && (
                      <div className="border-t border-white/5 p-5">
                        <p className="text-xs font-bold text-gray-400 uppercase mb-3">MCQ Preview</p>
                        <div className="space-y-2">
                          {(level.mcqs || []).slice(0, 5).map((mcq: any, i: number) => (
                            <div key={i} className="p-3 bg-white/5 rounded-lg">
                              <p className="text-sm text-white mb-1">{i + 1}. {mcq.question}</p>
                              <p className="text-xs text-green-400">✓ Answer: {mcq.options?.[mcq.correctOptionIndex]}</p>
                            </div>
                          ))}
                          {(level.mcqs?.length || 0) > 5 && <p className="text-xs text-gray-500">+{level.mcqs.length - 5} more MCQs (click Edit to see all)</p>}
                        </div>
                        {level.codingQuestions?.length > 0 && (
                          <div className="mt-4">
                            <p className="text-xs font-bold text-gray-400 uppercase mb-2">Coding Questions</p>
                            <div className="flex flex-wrap gap-2">
                              {level.codingQuestions.map((q: any) => (
                                <span key={q._id} className="text-xs px-2 py-1 bg-white/5 rounded text-gray-300">{q.title}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── PROBLEMS ── */}
        {tab === 'problems' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2"><Code2 className="w-5 h-5 text-red-400" />Problem Manager</h2>
              <button onClick={() => setEditingProblem({ title: '', description: '', difficulty: 'Easy', category: 'Other', isDailyChallenge: false, testCases: [] })} 
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-bold transition-all">
                <Plus className="w-4 h-4" /> New Problem
              </button>
            </div>
            
            {problemsLoading ? <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />)}</div> : (
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
                <table className="w-full">
                  <thead><tr className="border-b border-white/5 bg-white/[0.02]">
                    {['Title', 'Category', 'Difficulty', 'Daily', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">{h}</th>)}
                  </tr></thead>
                  <tbody className="divide-y divide-white/5">
                    {problems.map((p: any) => (
                      <tr key={p._id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-white">{p.title}</td>
                        <td className="px-4 py-3 text-sm text-gray-400">{p.category}</td>
                        <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded font-semibold ${p.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400' : p.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-red-500/10 text-red-400'}`}>{p.difficulty}</span></td>
                        <td className="px-4 py-3 text-sm">{p.isDailyChallenge ? '✅' : '-'}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => setEditingProblem(p)} className="text-indigo-400 hover:text-indigo-300 text-xs flex items-center gap-1"><Edit3 className="w-3 h-3"/> Edit</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Level Modal */}
      {editingLevel && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0a0d20] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/10 flex-shrink-0">
              <h2 className="text-lg font-black">Edit Level {editingLevel.levelNumber} — {editingLevel.title}</h2>
              <button onClick={() => setEditingLevel(null)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            {/* Modal Tabs */}
            <div className="flex gap-2 px-5 pt-4 border-b border-white/5 flex-shrink-0">
              {[
                { id: 'general', label: 'General Info' },
                { id: 'mcqs', label: 'MCQs' },
                { id: 'coding', label: 'Coding Questions' }
              ].map(t => (
                <button key={t.id} onClick={() => setModalTab(t.id as any)}
                  className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${modalTab === t.id ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-gray-400 hover:text-gray-200'}`}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              
              {/* --- GENERAL TAB --- */}
              {modalTab === 'general' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Level Title</label>
                    <input value={editingLevel.title} onChange={e => setEditingLevel((p: any) => ({ ...p, title: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">YouTube Video URL</label>
                    <input value={editingLevel.youtubeUrl || ''} onChange={e => setEditingLevel((p: any) => ({ ...p, youtubeUrl: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                      placeholder="e.g. https://www.youtube.com/watch?v=kqtD5dpnC8U" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Concept Text (Markdown)</label>
                    <textarea value={editingLevel.conceptText || ''} onChange={e => setEditingLevel((p: any) => ({ ...p, conceptText: e.target.value }))}
                      className="w-full h-64 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-indigo-500 resize-none"
                      placeholder="Explain the level's concepts here..." />
                  </div>
                </div>
              )}

              {/* --- MCQS TAB --- */}
              {modalTab === 'mcqs' && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-bold text-gray-400 uppercase">MCQ Questions ({editingLevel.mcqs?.length || 0}/10)</label>
                    <button onClick={addMCQ} disabled={(editingLevel.mcqs?.length || 0) >= 10}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 rounded-lg border border-indigo-500/30 disabled:opacity-40 transition-all">
                      <Plus className="w-3 h-3" /> Add MCQ
                    </button>
                  </div>
                  <div className="space-y-4">
                    {(editingLevel.mcqs || []).map((mcq: any, i: number) => (
                      <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-xl">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <span className="text-xs font-bold text-indigo-400 mt-1">Q{i + 1}</span>
                          <textarea value={mcq.question} onChange={e => updateMCQ(i, 'question', e.target.value)} rows={2} placeholder="Question text"
                            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none" />
                          <button onClick={() => removeMCQ(i)} className="text-red-400 hover:text-red-300 mt-1"><Trash2 className="w-4 h-4" /></button>
                        </div>
                        <div className="space-y-2">
                          {(mcq.options || ['', '', '', '']).map((opt: string, oIdx: number) => (
                            <div key={oIdx} className="flex items-center gap-2">
                              <input type="radio" name={`correct-${i}`} checked={mcq.correctOptionIndex === oIdx} onChange={() => updateMCQ(i, 'correctOptionIndex', oIdx)}
                                className="accent-green-500 flex-shrink-0" />
                              <input value={opt} onChange={e => updateMCQOption(i, oIdx, e.target.value)} placeholder={`Option ${oIdx + 1}`}
                                className={`flex-1 bg-white/5 border rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none text-sm ${mcq.correctOptionIndex === oIdx ? 'border-green-500/50 bg-green-500/5' : 'border-white/10 focus:border-indigo-500'}`} />
                              <span className="text-xs text-gray-600 w-8">{['A','B','C','D'][oIdx]}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* --- CODING QUESTIONS TAB --- */}
              {modalTab === 'coding' && (
                <div className="flex h-full gap-4">
                  {/* Left List */}
                  <div className="w-1/3 border-r border-white/10 pr-4 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-xs font-bold text-gray-400 uppercase">Coding Qs ({editingLevel.codingQuestions?.length || 0})</label>
                      <button onClick={addCodingQuestion}
                        className="p-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg border border-indigo-500/30 transition-all">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                      {(editingLevel.codingQuestions || []).map((q: any, i: number) => (
                        <button key={i} onClick={() => setActiveCodingIdx(i)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all truncate ${activeCodingIdx === i ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}>
                          {i + 1}. {q.title || 'Untitled'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Right Detail Panel */}
                  <div className="flex-1 overflow-y-auto pr-2">
                    {activeCodingIdx !== null && editingLevel.codingQuestions?.[activeCodingIdx] ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-bold text-indigo-400">Question Details</h3>
                          <button onClick={() => removeCodingQuestion(activeCodingIdx)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-red-500/20 text-red-400 rounded-lg border border-red-500/20 hover:bg-red-500/30">
                            <Trash2 className="w-3 h-3" /> Remove
                          </button>
                        </div>
                        
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">Title</label>
                          <input value={editingLevel.codingQuestions[activeCodingIdx].title || ''} onChange={e => updateCodingQuestion(activeCodingIdx, 'title', e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-gray-400 mb-1 block">Difficulty</label>
                            <select value={editingLevel.codingQuestions[activeCodingIdx].difficulty || 'Easy'} onChange={e => updateCodingQuestion(activeCodingIdx, 'difficulty', e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500">
                              <option value="Easy">Easy</option>
                              <option value="Medium">Medium</option>
                              <option value="Hard">Hard</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 mb-1 block">Constraints</label>
                            <input value={editingLevel.codingQuestions[activeCodingIdx].constraints || ''} onChange={e => updateCodingQuestion(activeCodingIdx, 'constraints', e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" />
                          </div>
                        </div>

                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">Description (Markdown)</label>
                          <textarea value={editingLevel.codingQuestions[activeCodingIdx].description || ''} onChange={e => updateCodingQuestion(activeCodingIdx, 'description', e.target.value)} rows={4}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none font-mono" />
                        </div>

                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">Test Cases (JSON format)</label>
                          <textarea 
                            value={typeof editingLevel.codingQuestions[activeCodingIdx].testCases === 'string' 
                              ? editingLevel.codingQuestions[activeCodingIdx].testCases 
                              : JSON.stringify(editingLevel.codingQuestions[activeCodingIdx].testCases || [], null, 2)} 
                            onChange={e => updateCodingQuestion(activeCodingIdx, 'testCases', e.target.value)} rows={6}
                            className="w-full bg-[#0d1117] border border-white/10 rounded-lg px-3 py-2 text-xs text-green-400 focus:outline-none focus:border-indigo-500 font-mono resize-none" 
                            placeholder='[ { "input": "2 3", "expectedOutput": "5", "isHidden": false } ]' />
                          <p className="text-xs text-gray-500 mt-1">Warning: Invalid JSON will fail execution. Make sure it is an array of objects.</p>
                        </div>
                        
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">Starter Code (JSON format)</label>
                          <textarea 
                            value={typeof editingLevel.codingQuestions[activeCodingIdx].starterCode === 'string' 
                              ? editingLevel.codingQuestions[activeCodingIdx].starterCode 
                              : JSON.stringify(editingLevel.codingQuestions[activeCodingIdx].starterCode || {}, null, 2)} 
                            onChange={e => updateCodingQuestion(activeCodingIdx, 'starterCode', e.target.value)} rows={4}
                            className="w-full bg-[#0d1117] border border-white/10 rounded-lg px-3 py-2 text-xs text-amber-400 focus:outline-none focus:border-indigo-500 font-mono resize-none" 
                            placeholder='{ "python": "def solve():\n  pass", "javascript": "function solve() {}" }' />
                        </div>

                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-500">
                        Select a question to edit
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-5 border-t border-white/10 flex-shrink-0">
              <button onClick={saveLevel} disabled={saving}
                className="flex-1 py-2.5 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving…</> : <><Save className="w-4 h-4" />Save Changes</>}
              </button>
              <button onClick={() => setEditingLevel(null)} className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Problem Modal */}
      {editingProblem && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0a0d20] border border-white/10 rounded-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h2 className="text-lg font-black">{editingProblem._id ? 'Edit Problem' : 'New Problem'}</h2>
              <button onClick={() => setEditingProblem(null)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div><label className="text-xs text-gray-400 mb-1 block">Title</label><input value={editingProblem.title} onChange={e=>setEditingProblem({...editingProblem, title: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs text-gray-400 mb-1 block">Difficulty</label><select value={editingProblem.difficulty} onChange={e=>setEditingProblem({...editingProblem, difficulty: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"><option>Easy</option><option>Medium</option><option>Hard</option></select></div>
                <div><label className="text-xs text-gray-400 mb-1 block">Category</label><select value={editingProblem.category} onChange={e=>setEditingProblem({...editingProblem, category: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"><option>Arrays</option><option>Strings</option><option>Math</option><option>Other</option></select></div>
              </div>
              <div><label className="text-xs text-gray-400 mb-1 block">Description</label><textarea value={editingProblem.description} onChange={e=>setEditingProblem({...editingProblem, description: e.target.value})} rows={3} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none font-mono" /></div>
              
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Test Cases (JSON array)</label>
                <textarea value={typeof editingProblem.testCases === 'string' ? editingProblem.testCases : JSON.stringify(editingProblem.testCases || [], null, 2)} 
                  onChange={e=>setEditingProblem({...editingProblem, testCases: e.target.value})} rows={4} 
                  className="w-full bg-[#0d1117] border border-white/10 rounded-lg px-3 py-2 text-xs text-green-400 focus:outline-none focus:border-indigo-500 font-mono resize-none" 
                  placeholder='[ { "input": "2 3", "expectedOutput": "5", "isHidden": false } ]' />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Starter Code (JSON object)</label>
                  <textarea value={typeof editingProblem.starterCode === 'string' ? editingProblem.starterCode : JSON.stringify(editingProblem.starterCode || {}, null, 2)} 
                    onChange={e=>setEditingProblem({...editingProblem, starterCode: e.target.value})} rows={4} 
                    className="w-full bg-[#0d1117] border border-white/10 rounded-lg px-3 py-2 text-xs text-amber-400 focus:outline-none focus:border-indigo-500 font-mono resize-none" 
                    placeholder='{ "python": "# Code here\n" }' />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Solution (JSON object)</label>
                  <textarea value={typeof editingProblem.solution === 'string' ? editingProblem.solution : JSON.stringify(editingProblem.solution || {}, null, 2)} 
                    onChange={e=>setEditingProblem({...editingProblem, solution: e.target.value})} rows={4} 
                    className="w-full bg-[#0d1117] border border-white/10 rounded-lg px-3 py-2 text-xs text-blue-400 focus:outline-none focus:border-indigo-500 font-mono resize-none" 
                    placeholder='{ "python": "print(1)\n" }' />
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <input type="checkbox" checked={editingProblem.isDailyChallenge} onChange={e=>setEditingProblem({...editingProblem, isDailyChallenge: e.target.checked})} className="w-4 h-4 accent-indigo-500" />
                <label className="text-sm text-white font-medium">Set as Daily Challenge</label>
              </div>
              {editingProblem.isDailyChallenge && (
                <div><label className="text-xs text-gray-400 mb-1 block mt-2">Daily Challenge Date</label><input type="date" value={editingProblem.dailyChallengeDate ? new Date(editingProblem.dailyChallengeDate).toISOString().split('T')[0] : ''} onChange={e=>setEditingProblem({...editingProblem, dailyChallengeDate: e.target.value})} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 [color-scheme:dark]" /></div>
              )}
            </div>
            <div className="p-5 border-t border-white/10 flex gap-3">
              <button onClick={async () => {
                try {
                  setSaving(true);
                  // parse json before saving
                  const toSave = { ...editingProblem };
                  if (typeof toSave.testCases === 'string') toSave.testCases = JSON.parse(toSave.testCases || '[]');
                  if (typeof toSave.starterCode === 'string') toSave.starterCode = JSON.parse(toSave.starterCode || '{}');
                  if (typeof toSave.solution === 'string') toSave.solution = JSON.parse(toSave.solution || '{}');

                  if (toSave._id) await problemsAPI.update(toSave._id, toSave);
                  else await problemsAPI.create(toSave);
                  loadProblems(); setEditingProblem(null);
                } catch(e:any) { alert(e.message || 'Error parsing JSON or saving'); } finally { setSaving(false); }
              }} disabled={saving} className="flex-1 py-2.5 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-colors">{saving ? 'Saving...' : 'Save Problem'}</button>
              <button onClick={() => setEditingProblem(null)} className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl">Cancel</button>
            </div>
          </div>
        </div>
      )}
      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0a0d20] border border-white/10 rounded-2xl w-full max-w-md flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h2 className="text-lg font-black">Edit User Details</h2>
              <button onClick={() => setEditingUser(null)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Username</label>
                <input value={editingUser.username || ''} onChange={e=>setEditingUser({...editingUser, username: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Email</label>
                <input type="email" value={editingUser.email || ''} onChange={e=>setEditingUser({...editingUser, email: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Full Name</label>
                <input value={editingUser.profile?.fullName || ''} onChange={e=>setEditingUser({...editingUser, profile: { ...(editingUser.profile || {}), fullName: e.target.value }})} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Role</label>
                <select value={editingUser.role || 'student'} onChange={e=>setEditingUser({...editingUser, role: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500">
                  <option value="student">student</option>
                  <option value="teacher">teacher</option>
                  <option value="admin">admin</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Reset Password (leave blank to keep current)</label>
                <input type="password" value={editingUserPass} onChange={e=>setEditingUserPass(e.target.value)} placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" />
              </div>
            </div>
            <div className="p-5 border-t border-white/10 flex gap-3">
              <button onClick={handleSaveUser} className="flex-1 py-2.5 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-colors">Save Changes</button>
              <button onClick={() => setEditingUser(null)} className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}