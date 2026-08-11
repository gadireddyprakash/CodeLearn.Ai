import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { Mail, Lock, Eye, EyeOff, Zap, ArrowRight, Shield, Settings, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [portal, setPortal] = useState<'user' | 'admin'>('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Admin Seed state
  const [settingUp, setSettingUp] = useState(false);
  const [setupDone, setSetupDone] = useState(false);
  const [setupMsg, setSetupMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (portal === 'admin') {
        const data = await authAPI.login({ email, password });
        if (data.user.role !== 'admin') {
          setError('Access denied: admin role required.');
          setLoading(false);
          return;
        }
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/admin/dashboard');
      } else {
        await login(email, password);
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const u = JSON.parse(userStr);
          if (u.role === 'admin') {
            navigate('/admin/dashboard');
            return;
          }
        }
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleSetupAdmin = async () => {
    setSettingUp(true);
    setError('');
    setSetupMsg('');
    try {
      const res = await authAPI.seedAdmin('codelearn-setup-2024');
      setSetupDone(true);
      setSetupMsg(res.message || 'Admin seeded successfully!');
      setEmail('admin@codelearn.com');
      setPassword('admin123');
    } catch (err: any) {
      setError(err.message || 'Admin seeding failed.');
    } finally {
      setSettingUp(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030612] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Dynamic Animated Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-60" />
      
      {/* Background Glow Spheres */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1], 
          x: [0, 30, 0], 
          y: [0, -30, 0] 
        }}
        transition={{ 
          duration: 12, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" 
      />
      <motion.div 
        animate={{ 
          scale: [1.2, 1, 1.2], 
          x: [0, -40, 0], 
          y: [0, 40, 0] 
        }}
        transition={{ 
          duration: 15, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[160px] pointer-events-none" 
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo and Greeting */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br transition-all duration-500 flex items-center justify-center shadow-2xl ${
              portal === 'admin' 
                ? 'from-red-500 to-rose-600 shadow-red-500/30' 
                : 'from-indigo-500 to-violet-600 shadow-indigo-500/30'
            }`}>
              {portal === 'admin' ? <Shield className="w-6 h-6 text-white" /> : <Zap className="w-6 h-6 text-white" />}
            </div>
            <span className="text-3xl font-black text-white tracking-tight">CodeLearn</span>
          </div>
          
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {portal === 'admin' ? 'Administrator Console' : 'Welcome back'}
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {portal === 'admin' ? 'Access restricted to system administrators' : 'Sign in to continue your learning journey'}
          </p>
        </div>

        {/* Portal Toggle Tabs */}
        <div className="grid grid-cols-2 p-1 bg-white/[0.02] border border-white/5 rounded-xl mb-6 backdrop-blur-md">
          <button
            type="button"
            onClick={() => { setPortal('user'); setError(''); }}
            className={`py-2.5 rounded-lg text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
              portal === 'user'
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Zap className="w-4 h-4" /> Student & Teacher
          </button>
          <button
            type="button"
            onClick={() => { setPortal('admin'); setError(''); }}
            className={`py-2.5 rounded-lg text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
              portal === 'admin'
                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Shield className="w-4 h-4" /> Admin Portal
          </button>
        </div>

        {/* Login Card */}
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-8 backdrop-blur-2xl shadow-2xl relative overflow-hidden transition-all duration-500 hover:border-white/20">
          
          {/* Subtle top glow bar */}
          <div className={`absolute top-0 left-0 right-0 h-[2px] transition-all duration-500 bg-gradient-to-r ${
            portal === 'admin' ? 'from-red-500 to-rose-500' : 'from-indigo-500 to-violet-500'
          }`} />

          <AnimatePresence mode="wait">
            <motion.div
              key={portal}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {error && (
                <div className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2 animate-shake">
                  <span className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0 animate-ping" />
                  <span>{error}</span>
                </div>
              )}

              {setupDone && portal === 'admin' && (
                <div className="mb-5 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{setupMsg} credentials filled below.</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="name@codelearn.com"
                      className={`w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm focus:outline-none focus:ring-1 transition-all ${
                        portal === 'admin' 
                          ? 'focus:border-red-500 focus:ring-red-500' 
                          : 'focus:border-indigo-500 focus:ring-indigo-500'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-gray-300">Password</label>
                    {portal !== 'admin' && (
                      <Link to="/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                        Forgot password?
                      </Link>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full pl-11 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm focus:outline-none focus:ring-1 transition-all ${
                        portal === 'admin' 
                          ? 'focus:border-red-500 focus:ring-red-500' 
                          : 'focus:border-indigo-500 focus:ring-indigo-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed ${
                    portal === 'admin'
                      ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 shadow-red-500/20'
                      : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-indigo-500/20'
                  }`}
                >
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in…</>
                  ) : (
                    <>
                      {portal === 'admin' ? 'Authorize Console' : 'Sign in'}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              {portal === 'admin' && (
                <div className="mt-4 pt-4 border-t border-white/5">
                  <button
                    onClick={handleSetupAdmin}
                    disabled={settingUp || setupDone}
                    className="w-full py-2.5 flex items-center justify-center gap-2 text-sm font-semibold rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 transition-all disabled:opacity-50"
                  >
                    {settingUp ? (
                      <><div className="w-4 h-4 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" /> Seeding Admin…</>
                    ) : setupDone ? (
                      <><CheckCircle2 className="w-4 h-4" /> Database Admin Initialized</>
                    ) : (
                      <><Settings className="w-4 h-4" /> Setup & Recover Admin Account</>
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {portal !== 'admin' && (
            <div className="mt-6 pt-6 border-t border-white/5 text-center">
              <p className="text-sm text-gray-500">
                Don't have an account yet?{' '}
                <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors">
                  Create free account
                </Link>
              </p>
            </div>
          )}
        </div>

        {/* Dynamic Autofill Credentials Drawer */}
        <div className="mt-6 p-5 bg-white/[0.01] border border-white/5 rounded-2xl backdrop-blur-lg">
          <p className="text-xs text-gray-500 text-center mb-3 font-semibold uppercase tracking-wider">
            Quick Credentials Autofill
          </p>
          
          <div className="grid grid-cols-3 gap-2">
            {[
              { role: 'Student', em: 'student@codelearn.com', pw: 'student123', color: 'text-indigo-400', theme: 'user' },
              { role: 'Teacher', em: 'teacher@codelearn.com', pw: 'teacher123', color: 'text-violet-400', theme: 'user' },
              { role: 'Admin', em: 'admin@codelearn.com', pw: 'admin123', color: 'text-red-400', theme: 'admin' }
            ].map(cred => (
              <button
                key={cred.role}
                type="button"
                onClick={() => {
                  setPortal(cred.theme as 'user' | 'admin');
                  setEmail(cred.em);
                  setPassword(cred.pw);
                }}
                className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-xl transition-all flex flex-col items-center justify-center text-center group"
              >
                <span className={`text-xs font-bold ${cred.color}`}>{cred.role}</span>
                <span className="text-[10px] text-gray-500 group-hover:text-gray-300 mt-0.5 truncate max-w-[80px]">
                  {cred.em.split('@')[0]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
