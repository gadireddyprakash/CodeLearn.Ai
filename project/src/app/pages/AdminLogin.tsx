import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Shield, Mail, Lock, Eye, EyeOff, ArrowLeft, Settings, CheckCircle2 } from 'lucide-react';
import { authAPI } from '../services/api';
import { motion } from 'motion/react';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@codelearn.com');
  const [password, setPassword] = useState('admin123');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [settingUp, setSettingUp] = useState(false);
  const [setupDone, setSetupDone] = useState(false);
  const [setupMsg, setSetupMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const data = await authAPI.login({ email, password });
      if (data.user.role !== 'admin') { setError('Access denied: admin role required.'); return; }
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally { setLoading(false); }
  };

  const handleSetupAdmin = async () => {
    setSettingUp(true); setError(''); setSetupMsg('');
    try {
      const res = await authAPI.seedAdmin('codelearn-setup-2024');
      setSetupDone(true);
      setSetupMsg(res.message || 'Admin ready!');
    } catch (err: any) {
      setError(err.message || 'Setup failed');
    } finally { setSettingUp(false); }
  };

  return (
    <div className="min-h-screen bg-[#030612] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-60" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-red-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-red-500/30"
          >
            <Shield className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-2xl font-black text-white tracking-tight">Admin Portal</h1>
          <p className="text-gray-400 text-sm mt-1">Restricted access control console</p>
        </div>

        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-red-500 to-rose-500" />
          
          {error && <div className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

          {setupDone && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{setupMsg} — You can now log in below.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input type={showPass ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-red-500/20 disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in…</> : 'Sign in as Admin'}
            </button>
          </form>

          {/* One-click setup button */}
          <div className="mt-4 pt-4 border-t border-white/5">
            <p className="text-xs text-gray-500 text-center mb-3">Initialize admin account database setup:</p>
            <button
              onClick={handleSetupAdmin}
              disabled={settingUp || setupDone}
              className="w-full py-2.5 flex items-center justify-center gap-2 text-sm font-semibold rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 transition-all disabled:opacity-50"
            >
              {settingUp
                ? <><div className="w-4 h-4 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />Setting up…</>
                : setupDone
                  ? <><CheckCircle2 className="w-4 h-4" />Admin initialized ✓</>
                  : <><Settings className="w-4 h-4" />Initialize Admin Account</>
              }
            </button>
          </div>

          <div className="mt-4 text-center">
            <Link to="/login" className="flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to user login portal
            </Link>
          </div>
          <div className="mt-4 p-3 bg-red-500/5 border border-red-500/10 rounded-xl text-center">
            <p className="text-xs text-gray-500">Credentials: <span className="text-red-400 font-mono">admin@codelearn.com</span> / <span className="text-red-400 font-mono">admin123</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
