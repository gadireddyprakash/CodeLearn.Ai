import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useParams, useNavigate, Link } from 'react-router';
import { groupsAPI, problemsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Users, ClipboardList, TrendingUp, Plus, ArrowLeft,
  CheckCircle2, Clock, AlertCircle, X, BookOpen, Star
} from 'lucide-react';

type TabType = 'assignments' | 'students' | 'performance';

export default function GroupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isTeacher = user?.role === 'teacher' || user?.role === 'admin';

  const [group, setGroup] = useState<any>(null);
  const [performance, setPerformance] = useState<any[]>([]);
  const [tab, setTab] = useState<TabType>('assignments');
  const [loading, setLoading] = useState(true);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const d: any = await groupsAPI.getOne(id!);
        setGroup(d.group);
        if (isTeacher) {
          const p: any = await groupsAPI.getPerformance(id!);
          setPerformance(p.performance || []);
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [id, isTeacher]);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" /></div>;
  if (!group) return <div className="text-center py-20 text-gray-500">Group not found.</div>;

  return (
    <div className="min-h-screen bg-[#050818] text-white p-6 relative">
      <Navbar />
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <button onClick={() => navigate('/lms')} className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors text-sm mb-3">
              <ArrowLeft className="w-4 h-4" /> Back to Groups
            </button>
            <h1 className="text-2xl font-bold text-white">{group.name}</h1>
            {group.description && <p className="text-gray-400 mt-1">{group.description}</p>}
            {isTeacher && group.joinCode && (
              <div className="mt-2 inline-flex items-center gap-2 bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 px-3 py-1.5 rounded-lg text-sm font-medium">
                Join Code: <span className="font-mono font-bold tracking-widest">{group.joinCode}</span>
              </div>
            )}
          </div>
          {isTeacher && (
            <button onClick={() => setShowAssignmentModal(true)} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors">
              <Plus className="w-4 h-4" /> New Assignment
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-6 w-fit">
          {(['assignments', 'students', ...(isTeacher ? ['performance'] : [])] as TabType[]).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${tab === t ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-400 hover:text-gray-700'}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Assignments Tab */}
        {tab === 'assignments' && (
          <div className="space-y-4">
            {group.assignments?.length === 0 ? (
              <EmptyState icon={ClipboardList} message={isTeacher ? 'No assignments yet. Create your first one!' : 'No assignments yet.'} />
            ) : group.assignments?.map((a: any) => (
              <div key={a._id} className="bg-white/[0.03] rounded-xl border border-white/10 p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-white text-lg">{a.title}</h3>
                    {a.description && <p className="text-gray-400 text-sm mt-1">{a.description}</p>}
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                      {a.dueDate && (
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          Due: {new Date(a.dueDate).toLocaleDateString()}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5" />
                        {a.problems?.length || 0} problems
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5" />
                        {a.maxScore} pts
                      </span>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${a.isActive ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400' : 'bg-white/5 text-gray-500'}`}>
                    {a.isActive ? 'Active' : 'Closed'}
                  </div>
                </div>
                {a.problems?.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {a.problems.map((p: any) => (
                      <Link key={p._id} to={`/problems/${p.slug}`} className="text-xs bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-full hover:bg-indigo-100 transition-colors">
                        {p.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Students Tab */}
        {tab === 'students' && (
          <div className="bg-white/[0.03] rounded-xl border border-white/10 overflow-hidden">
            {group.students?.length === 0 ? (
              <EmptyState icon={Users} message="No students yet. Share the join code!" />
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 bg-white/5">
                  <tr>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Student</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Solved</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Score</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {group.students?.map((s: any) => (
                    <tr key={s.user?._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                            {s.user?.username?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className="font-medium text-white text-sm">{s.user?.username}</p>
                            <p className="text-xs text-gray-400">{s.user?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-300">{s.user?.stats?.problemsSolved || 0}</td>
                      <td className="px-5 py-3 text-sm text-gray-300">{s.user?.stats?.score || 0}</td>
                      <td className="px-5 py-3 text-xs text-gray-400">{new Date(s.joinedAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Performance Tab (teacher only) */}
        {tab === 'performance' && isTeacher && (
          <div className="space-y-4">
            {performance.length === 0 ? (
              <EmptyState icon={TrendingUp} message="No performance data yet." />
            ) : performance.map((p: any) => (
              <div key={p.student?._id} className="bg-white/[0.03] rounded-xl border border-white/10 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                      {p.student?.username?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{p.student?.username}</p>
                      <p className="text-xs text-gray-400">{p.student?.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{p.score}</p>
                    <p className="text-xs text-gray-400">total score</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-gray-50 bg-white/5 rounded-lg p-2">
                    <p className="font-bold text-white">{p.totalSubmissions}</p>
                    <p className="text-xs text-gray-400">submissions</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/10 rounded-lg p-2">
                    <p className="font-bold text-green-600">{p.accepted}</p>
                    <p className="text-xs text-gray-400">accepted</p>
                  </div>
                  <div className="bg-gray-50 bg-white/5 rounded-lg p-2">
                    <p className="font-bold text-white">
                      {p.totalSubmissions > 0 ? Math.round((p.accepted / p.totalSubmissions) * 100) : 0}%
                    </p>
                    <p className="text-xs text-gray-400">accuracy</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAssignmentModal && (
        <CreateAssignmentModal
          groupId={id!}
          onClose={() => setShowAssignmentModal(false)}
          onCreated={(a: any) => {
            setGroup((g: any) => ({ ...g, assignments: [...(g.assignments || []), a] }));
            setShowAssignmentModal(false);
          }}
        />
      )}
    </div>
  );
}

function EmptyState({ icon: Icon, message }: { icon: any; message: string }) {
  return (
    <div className="text-center py-16 bg-white/[0.03] rounded-xl border border-white/10">
      <Icon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
      <p className="text-gray-400">{message}</p>
    </div>
  );
}

function CreateAssignmentModal({ groupId, onClose, onCreated }: any) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [maxScore, setMaxScore] = useState(100);
  const [problems, setProblems] = useState<any[]>([]);
  const [allProblems, setAllProblems] = useState<any[]>([]);
  const [selectedProblems, setSelectedProblems] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    problemsAPI.getAll({ limit: 50 } as any).then((d: any) => setAllProblems(d.problems || [])).catch(() => {});
  }, []);

  const toggleProblem = (id: string) => {
    setSelectedProblems(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const handleSubmit = async () => {
    if (!title.trim()) { setError('Title is required'); return; }
    setLoading(true);
    try {
      const data: any = await groupsAPI.createAssignment(groupId, { title, description, problemIds: selectedProblems, dueDate: dueDate || undefined, maxScore });
      onCreated(data.assignment);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/[0.03] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-bold text-white">Create Assignment</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && <div className="bg-red-50 dark:bg-red-900/20 text-red-600 text-sm p-3 rounded-lg">{error}</div>}
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Assignment title *" className="w-full px-4 py-2.5 border border-white/10 rounded-xl bg-white/[0.03] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description (optional)" className="w-full px-4 py-2.5 border border-white/10 rounded-xl bg-white/[0.03] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none" rows={2} />
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-gray-400 mb-1 block">Due Date</label>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full px-4 py-2.5 border border-white/10 rounded-xl bg-white/[0.03] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" style={{ colorScheme: 'dark' }} />
            </div>
            <div className="w-28">
              <label className="text-xs text-gray-400 mb-1 block">Max Score</label>
              <input type="number" value={maxScore} onChange={e => setMaxScore(Number(e.target.value))} className="w-full px-4 py-2.5 border border-white/10 rounded-xl bg-white/[0.03] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Select Problems ({selectedProblems.length} selected)</label>
            <div className="space-y-1 max-h-48 overflow-y-auto border border-white/10 rounded-xl p-2">
              {allProblems.map(p => (
                <label key={p._id} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer">
                  <input type="checkbox" checked={selectedProblems.includes(p._id)} onChange={() => toggleProblem(p._id)} className="accent-indigo-600" />
                  <span className="text-sm text-white flex-1">{p.title}</span>
                  <span className={`text-xs font-medium ${p.difficulty === 'Easy' ? 'text-green-500' : p.difficulty === 'Medium' ? 'text-yellow-500' : 'text-red-500'}`}>{p.difficulty}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-white/10 rounded-xl text-sm font-medium text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Cancel</button>
          <button onClick={handleSubmit} disabled={loading} className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors">
            {loading ? 'Creating…' : 'Create Assignment'}
          </button>
        </div>
      </div>
    </div>
  );
}
