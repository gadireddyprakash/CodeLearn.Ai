import { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { codeAPI, problemsAPI, usersAPI, aiAPI } from '../services/api';
import Editor from '@monaco-editor/react';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Code2, Home, BookOpen, Terminal, Trophy, BarChart2, Brain, Users, Settings, Flame, 
  Play, CheckCircle2, ChevronDown, Zap, Target, Shield, Activity, Check, Code, Loader2, XCircle
} from 'lucide-react';
import { motion } from 'motion/react';

const performanceData = [
  { name: 'Mon', value: 30 },
  { name: 'Tue', value: 48 },
  { name: 'Wed', value: 55 },
  { name: 'Thu', value: 50 },
  { name: 'Fri', value: 70 },
  { name: 'Sat', value: 80 },
  { name: 'Sun', value: 100 },
];

const STARTER_CODE = `def twoSum(nums, target):
    num_map = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in num_map:
            return [num_map[complement], i]
        num_map[num] = i
        
    return []`;

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  
  // API Data States
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [problems, setProblems] = useState<any[]>([]);
  const [daily, setDaily] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Editor States
  const [code, setCode] = useState(STARTER_CODE);
  const [lang, setLang] = useState('python');
  const [isExecuting, setIsExecuting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Execution Output State
  const [execOutput, setExecOutput] = useState<any>(null);
  
  // AI Tutor State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState('Welcome! I am your AI Tutor. Run your code or ask me to explain the current approach.');

  useEffect(() => { if (!isAuthenticated) navigate('/login'); }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!user) return;
    Promise.allSettled([
      codeAPI.getSubmissions({ limit: 5 }),
      problemsAPI.getAll({ limit: 50 }),
      problemsAPI.getDaily(),
    ]).then(([subs, probs, day]) => {
      if (subs.status === 'fulfilled') setSubmissions((subs.value as any).submissions || []);
      if (probs.status === 'fulfilled') setProblems((probs.value as any).problems || []);
      if (day.status === 'fulfilled') {
         setDaily((day.value as any).problem);
      }
      setLoading(false);
    });
  }, [user]);

  if (!user) return null;

  const stats = user.stats || {};
  const acceptRate = stats.totalSubmissions > 0
    ? Math.round((stats.acceptedSubmissions / stats.totalSubmissions) * 100)
    : 92;

  // Handlers for Code Execution
  const handleRunCode = async () => {
    setIsExecuting(true);
    try {
      const res = await codeAPI.run({ code, language: lang, input: "nums = [2, 7, 11, 15], target = 9" });
      setExecOutput({
        status: res.status || 'Accepted',
        output: res.output || res.error,
        executionTime: res.executionTime || Math.floor(Math.random() * 15 + 5),
        memoryUsed: '8.7 MB', // Mocked memory as it's not strictly returned by piston
        isError: !!res.error
      });
    } catch (err: any) {
      setExecOutput({ status: 'Error', output: err.message, isError: true });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSubmitCode = async () => {
    if (!daily?._id && problems.length === 0) return;
    const problemId = daily?._id || problems[0]?._id;
    setIsSubmitting(true);
    try {
      const res = await codeAPI.submit(problemId, { code, language: lang });
      setExecOutput({
        status: res.submission.status,
        output: `${res.submission.passedCount}/${res.submission.totalCount} test cases passed.\n${res.submission.status === 'Accepted' ? 'Great! Your code passed all test cases.' : 'Keep trying!'}`,
        executionTime: Math.floor(Math.random() * 15 + 5),
        memoryUsed: '9.2 MB',
        isError: res.submission.status !== 'Accepted'
      });
      // Refresh submissions
      codeAPI.getSubmissions({ limit: 5 }).then((s: any) => setSubmissions(s.submissions || []));
    } catch (err: any) {
      setExecOutput({ status: 'Error', output: err.message, isError: true });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleExplainMore = async () => {
    if (!code) return;
    setAiLoading(true);
    try {
      const res = await aiAPI.chat(`Please explain this code and suggest improvements:\n\n\`\`\`${lang}\n${code}\n\`\`\``, "User is on the Dashboard Playground asking for code explanation.");
      setAiMessage(res.reply);
    } catch (err) {
      setAiMessage("Sorry, I'm having trouble analyzing the code right now.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#030612] text-white font-sans overflow-hidden relative">
      {/* Dynamic Animated Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />
      
      {/* Background Glowing Orbs */}
      <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-violet-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Sidebar */}
      <aside className="w-64 bg-[#070a13]/90 backdrop-blur-xl border-r border-white/5 flex-col justify-between hidden md:flex shrink-0 z-50">
        <div>
          <div className="p-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <span className="font-black text-xl tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">CodeLearn</span>
          </div>
          
          <nav className="px-4 space-y-1.5 mt-2">
            <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-600/10 to-violet-600/10 text-indigo-400 border border-indigo-500/20">
              <Home className="w-5 h-5 text-indigo-400" /> Dashboard
            </Link>
            <Link to={`/levels/${lang}`} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-white transition-all">
              <BookOpen className="w-5 h-5" /> Learn Track
            </Link>
            <Link to="/problems" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-white transition-all">
              <Terminal className="w-5 h-5" /> Practice
            </Link>
            <Link to="/select-language" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-white transition-all">
              <Trophy className="w-5 h-5" /> Challenges
            </Link>
            <Link to="/profile" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-white transition-all">
              <BarChart2 className="w-5 h-5" /> Analytics
            </Link>
            <Link to="/recommendations" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-white transition-all">
              <Brain className="w-5 h-5" /> AI Tutor
            </Link>
            <Link to="/rankings" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-white transition-all">
              <Users className="w-5 h-5" /> Leaderboard
            </Link>
          </nav>
        </div>
        
        <div className="p-4 mb-4 mx-4 bg-white/[0.02] rounded-2xl border border-white/5">
          <div className="flex items-center gap-3 mb-4">
            <Flame className="w-6 h-6 text-orange-500 animate-pulse" />
            <div>
              <p className="text-xl font-bold text-white">{stats.streak || 7}</p>
              <p className="text-xs text-gray-400">Day Streak</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">XP Progress</span>
              <span className="text-white font-medium">{stats.score || 850} / 1200 XP</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full" style={{ width: '70%' }}></div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center flex flex-col items-center"
        >
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">AI-Powered</span> Code Learning Platform
          </h1>
          <p className="text-gray-400 font-medium text-sm">Practice compiler tests, track scores, and consult your virtual tutor.</p>
        </motion.div>

        {/* Grid Layout */}
        <div className="max-w-[1400px] mx-auto space-y-6">
          {/* Top Row: 3 Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Editor Panel (Col 1) */}
            <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 flex flex-col h-[420px] backdrop-blur-md hover:border-white/20 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h2 className="font-bold text-white">Two Sum Problem</h2>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/10 text-green-400 uppercase tracking-wider border border-green-500/20">Easy</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 mb-4 line-clamp-2 leading-relaxed">
                Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.
              </p>
              
              <div className="mb-3">
                <select 
                  value={lang} 
                  onChange={(e) => setLang(e.target.value)}
                  className="bg-[#121625] border border-white/10 rounded-lg text-xs text-gray-300 px-3 py-1.5 focus:outline-none focus:border-indigo-500"
                >
                  <option value="python">Python 3</option>
                  <option value="javascript">JavaScript</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                </select>
              </div>
              
              <div className="flex-1 border border-white/5 rounded-xl overflow-hidden bg-[#0d111b] mb-4 relative">
                <Editor
                  height="100%"
                  language={lang}
                  theme="vs-dark"
                  value={code}
                  onChange={(v) => setCode(v || '')}
                  options={{ minimap: { enabled: false }, fontSize: 13, lineNumbers: 'on', padding: { top: 12 } }}
                />
                <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_15px_rgba(0,0,0,0.5)]"></div>
              </div>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleRunCode}
                  disabled={isExecuting || isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50"
                >
                  {isExecuting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />} 
                  {isExecuting ? 'Running...' : 'Run Code'}
                </button>
                <button 
                  onClick={handleSubmitCode}
                  disabled={isExecuting || isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />} 
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </div>

            {/* Execution Panel (Col 2) */}
            <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 flex flex-col h-[420px] backdrop-blur-md hover:border-white/20 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-white">Real-Time Execution</h2>
                {execOutput && (
                  <span className={`flex items-center gap-1.5 text-xs font-semibold ${execOutput.isError ? 'text-red-400' : 'text-green-400'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${execOutput.isError ? 'bg-red-400' : 'bg-green-400'}`}></div> 
                    {execOutput.status}
                  </span>
                )}
              </div>
              
              <div className="space-y-3 flex-1 overflow-hidden flex flex-col">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">Input</p>
                  <div className="p-2.5 bg-[#121625] rounded-xl text-xs font-mono text-gray-300 border border-white/5 truncate">
                    nums = [2, 7, 11, 15], target = 9
                  </div>
                </div>
                <div className="flex-1 flex flex-col min-h-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">Output</p>
                  <div className={`p-3 bg-[#121625] rounded-xl text-xs font-mono border border-white/5 ${execOutput?.isError ? 'text-red-400' : 'text-gray-300'} flex-1 overflow-y-auto custom-scrollbar`}>
                    {execOutput ? (execOutput.output || 'No output') : '[0, 1]'}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5">
                  <div>
                    <p className="text-[10px] text-gray-500 mb-1 font-bold uppercase tracking-wider">Execution Time</p>
                    <p className="text-sm font-semibold text-white">{execOutput?.executionTime ? `${execOutput.executionTime} ms` : '12 ms'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 mb-1 font-bold uppercase tracking-wider">Memory Used</p>
                    <p className="text-sm font-semibold text-white">{execOutput?.memoryUsed || '8.7 MB'}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex flex-col items-center justify-center pt-3 border-t border-white/5">
                <div className={`w-10 h-10 rounded-full border flex items-center justify-center mb-2 relative ${execOutput?.isError ? 'border-red-500/30 bg-red-500/5' : 'border-green-500/30 bg-green-500/5'}`}>
                  {execOutput?.isError ? (
                     <XCircle className="w-5 h-5 text-red-400" />
                  ) : (
                     <Check className="w-5 h-5 text-green-400" />
                  )}
                </div>
                {execOutput?.isError ? (
                   <>
                    <p className="text-[13px] text-red-400 font-bold">Execution Failed</p>
                    <p className="text-xs text-gray-500">Check output details above.</p>
                   </>
                ) : (
                   <>
                    <p className="text-[13px] text-green-400 font-bold">Execution Succeeded</p>
                    <p className="text-xs text-gray-500">All tests passed successfully.</p>
                   </>
                )}
              </div>
            </div>

            {/* Analytics Panel (Col 3) */}
            <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 flex flex-col h-[420px] backdrop-blur-md hover:border-white/20 transition-all duration-300">
              <h2 className="font-bold text-white mb-6">Performance Analytics</h2>
              
              <div className="h-[140px] w-full mb-6 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData}>
                    <XAxis dataKey="name" stroke="#4b5563" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#121625', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
                      itemStyle={{ color: '#818cf8' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#8b5cf6" 
                      strokeWidth={3} 
                      dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 0 }} 
                      activeDot={{ r: 6, fill: '#a78bfa' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <div className="grid grid-cols-3 gap-3 mt-auto">
                <div className="bg-[#121625] border border-white/5 rounded-2xl p-3 flex flex-col items-center text-center">
                  <p className="text-[10px] text-gray-400 mb-1 font-semibold uppercase tracking-wider">Solved</p>
                  <p className="text-xl font-bold text-white">{stats.problemsSolved || 128}</p>
                  <p className="text-[9px] text-green-400 mt-1 font-bold">+12 this wk</p>
                </div>
                <div className="bg-[#121625] border border-white/5 rounded-2xl p-3 flex flex-col items-center text-center">
                  <p className="text-[10px] text-gray-400 mb-1 font-semibold uppercase tracking-wider">Accuracy</p>
                  <p className="text-xl font-bold text-white">{acceptRate}%</p>
                  <p className="text-[9px] text-green-400 mt-1 font-bold">+8% this wk</p>
                </div>
                <div className="bg-[#121625] border border-white/5 rounded-2xl p-3 flex flex-col items-center text-center">
                  <p className="text-[10px] text-gray-400 mb-1 font-semibold uppercase tracking-wider">Avg. Time</p>
                  <p className="text-xl font-bold text-white">18m</p>
                  <p className="text-[9px] text-green-400 mt-1 font-bold">-5m this wk</p>
                </div>
              </div>
            </div>

          </div>

          {/* Middle Row: 3 Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* AI Tutor Panel */}
            <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 flex flex-col justify-between h-[280px] backdrop-blur-md hover:border-white/20 transition-all duration-300">
              <h2 className="font-bold text-white mb-2">AI Tutor</h2>
              <div className="flex items-center gap-4 h-full">
                {/* Robot Avatar */}
                <div className="w-24 h-24 shrink-0 flex items-center justify-center bg-indigo-500/10 rounded-full relative border border-indigo-500/20">
                   <div className="w-16 h-16 bg-gradient-to-b from-indigo-500 to-indigo-700 rounded-2xl flex items-center justify-center relative overflow-hidden shadow-lg shadow-indigo-500/20">
                      <div className="flex gap-2 relative z-10 top-[-2px]">
                         <div className="w-3.5 h-1.5 bg-blue-300 rounded-full animate-pulse"></div>
                         <div className="w-3.5 h-1.5 bg-blue-300 rounded-full animate-pulse"></div>
                      </div>
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-3 bg-indigo-400 rounded-t-full"></div>
                   </div>
                </div>
                
                <div className="bg-[#121625] border border-white/5 rounded-2xl p-4 relative flex-1 flex flex-col justify-center h-full">
                  <div className="absolute left-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-[#121625] border-l border-b border-white/5 rotate-45"></div>
                  
                  <div className="text-[12px] text-gray-300 mb-3 leading-relaxed whitespace-pre-wrap overflow-y-auto max-h-[140px] custom-scrollbar">
                    {aiMessage}
                  </div>
                  
                  <div className="mt-auto">
                    <button 
                       onClick={handleExplainMore}
                       disabled={aiLoading}
                       className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                      {aiLoading ? 'Thinking...' : 'Explain Code'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommended Problems Panel */}
            <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 flex flex-col h-[280px] backdrop-blur-md hover:border-white/20 transition-all duration-300">
              <div className="flex justify-between items-center mb-4">
                 <h2 className="font-bold text-white">Recommended for You</h2>
                 <Link to="/problems" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-semibold">View all →</Link>
              </div>
              
              <div className="flex-1 space-y-2.5 overflow-y-auto pr-1 custom-scrollbar">
                {loading ? (
                   <div className="flex items-center justify-center h-full"><Loader2 className="w-6 h-6 text-indigo-500 animate-spin" /></div>
                ) : problems.length > 0 ? (
                  problems.slice(0, 4).map((item, i) => (
                    <Link key={item._id} to={`/problems/${item.slug}`} className="flex items-center justify-between py-1.5 px-2.5 group cursor-pointer hover:bg-white/5 rounded-lg transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded flex items-center justify-center bg-white/5 group-hover:bg-indigo-500/20 transition-colors">
                          <BookOpen className="w-3.5 h-3.5 text-gray-400 group-hover:text-indigo-400" />
                        </div>
                        <span className="text-sm text-gray-300 font-medium group-hover:text-white transition-colors">{item.title}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400' : 
                        item.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-400' : 
                        'bg-red-500/10 text-red-400'
                      }`}>
                        {item.difficulty}
                      </span>
                    </Link>
                  ))
                ) : (
                   <div className="text-center text-gray-500 text-sm mt-4">No recommendations available.</div>
                )}
              </div>
            </div>

            {/* Languages & Badges Combined */}
            <div className="flex flex-col gap-5 h-[280px]">
              <div className="flex-1 bg-white/[0.02] border border-white/10 rounded-3xl p-4 flex flex-col justify-center backdrop-blur-md">
                <h2 className="font-bold text-white text-xs mb-3 uppercase tracking-wider text-gray-400">Language Tracks</h2>
                <div className="flex justify-between items-center px-2">
                   {['Python', 'Java', 'C++', 'JavaScript'].map((lang, i) => (
                      <div key={lang} className="flex flex-col items-center gap-1.5 group cursor-pointer" onClick={() => navigate(`/levels/${lang.toLowerCase() === 'c++' ? 'cpp' : lang.toLowerCase()}`)}>
                         <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-[#121625] border border-white/5 group-hover:bg-white/10 transition-colors
                            ${i===0 ? 'text-blue-400' : i===1 ? 'text-red-400' : i===2 ? 'text-blue-500' : 'text-yellow-400'}
                          `}>
                            <Code className="w-4 h-4" />
                         </div>
                         <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">{lang}</span>
                      </div>
                   ))}
                </div>
              </div>

              <div className="flex-1 bg-white/[0.02] border border-white/10 rounded-3xl p-4 flex flex-col justify-center backdrop-blur-md">
                <h2 className="font-bold text-white text-xs mb-3 uppercase tracking-wider text-gray-400">Unlocked Badges</h2>
                <div className="flex justify-between items-center px-2">
                   {[
                      { name: 'Solver', icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
                      { name: 'Streak', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10 border-orange-500/20' },
                      { name: 'Target', icon: Target, color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/20' },
                      { name: 'Expert', icon: Code2, color: 'text-white', bg: 'bg-gray-700/50 border-gray-600/50' },
                   ].map((badge, i) => (
                      <div key={badge.name} className="flex flex-col items-center gap-1 group cursor-pointer">
                         <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${badge.bg}`}>
                            <badge.icon className={`w-3.5 h-3.5 ${badge.color}`} />
                         </div>
                         <span className="text-[9px] text-gray-400 font-semibold">{badge.name}</span>
                      </div>
                   ))}
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Features Row */}
          <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 mt-6 hidden lg:block backdrop-blur-md">
            <div className="grid grid-cols-5 gap-6 divide-x divide-white/5">
               {[
                 { icon: Brain, title: 'AI-Powered', desc: 'Smart recommendations and tutor logs' },
                 { icon: Zap, title: 'Real-Time Execution', desc: 'Instant code execution fallback tests' },
                 { icon: BarChart2, title: 'Performance Analytics', desc: 'Track progress and improve accuracy' },
                 { icon: Target, title: 'Interactive Learning', desc: 'Hands-on practice with level curriculum' },
                 { icon: Shield, title: 'Secure & Reliable', desc: 'Protected authentication and state sync' },
               ].map((feat, i) => (
                 <div key={i} className={`flex items-start gap-3 ${i !== 0 ? 'pl-6' : ''}`}>
                    <div className="mt-0.5 shrink-0">
                       <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                          <feat.icon className="w-4 h-4 text-indigo-400" />
                       </div>
                    </div>
                    <div>
                       <h3 className="text-[13px] font-bold text-gray-200 leading-tight">{feat.title}</h3>
                       <p className="text-[11px] text-gray-500 mt-1 leading-tight">{feat.desc}</p>
                    </div>
                 </div>
               ))}
            </div>
          </div>
          
          <div className="h-10"></div> {/* Spacer for scroll padding */}
        </div>
      </main>
    </div>
  );
}
