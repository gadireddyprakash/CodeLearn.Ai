import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Mail, Lock, ArrowLeft, CheckCircle, RefreshCw, Eye, EyeOff, Zap, Shield } from 'lucide-react';

type Step = 'email' | 'otp' | 'password' | 'success';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    window.alert(`📧 Password reset code sent to ${email}\n\nYour OTP: ${code}\n\n(In production this would be emailed)`);
    setStep('otp');
  };

  const handleVerifyOtp = () => {
    setError('');
    if (otp !== generatedOtp) { setError('Incorrect OTP. Please try again.'); return; }
    setStep('password');
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep('success'); }, 1000);
  };

  const handleResend = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setOtp('');
    setError('');
    window.alert(`📧 New code sent to ${email}\n\nYour OTP: ${code}`);
  };

  return (
    <div className="min-h-screen bg-[#050818] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(99,102,241,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.07) 1px,transparent 1px)',
        backgroundSize: '60px 60px'
      }} />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-white">CodeLearn</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">
            {step === 'success' ? 'Password reset!' : 'Reset your password'}
          </h1>
          <p className="text-gray-400 text-sm">
            {step === 'email' && 'Enter your email to receive a reset code'}
            {step === 'otp' && `Enter the 6-digit code sent to ${email}`}
            {step === 'password' && 'Choose a strong new password'}
            {step === 'success' && 'You can now sign in with your new password'}
          </p>
        </div>

        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-2xl">
          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
          )}

          {step === 'email' && (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" />
                </div>
              </div>
              <button type="submit" className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/20">
                Send reset code
              </button>
            </form>
          )}

          {step === 'otp' && (
            <div className="space-y-5">
              <div className="text-center">
                <div className="w-14 h-14 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-7 h-7 text-indigo-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 text-center">Verification code</label>
                <input type="text" inputMode="numeric" maxLength={6} value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g,'').slice(0,6))}
                  placeholder="000000" autoFocus
                  className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white text-center text-3xl font-bold tracking-[0.5em] placeholder-gray-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" />
                <div className="flex justify-center mt-2 gap-1">
                  {[0,1,2,3,4,5].map(i => <div key={i} className={`w-8 h-1 rounded-full ${i < otp.length ? 'bg-indigo-500' : 'bg-white/10'}`} />)}
                </div>
              </div>
              <button onClick={handleVerifyOtp} disabled={otp.length !== 6}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                Verify code
              </button>
              <div className="flex justify-between text-sm">
                <button onClick={() => setStep('email')} className="text-gray-500 hover:text-gray-300 transition-colors">← Back</button>
                <button onClick={handleResend} className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 transition-colors">
                  <RefreshCw className="w-3.5 h-3.5" /> Resend
                </button>
              </div>
            </div>
          )}

          {step === 'password' && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">New password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type={showPass ? 'text' : 'password'} required value={newPassword}
                    onChange={e => setNewPassword(e.target.value)} placeholder="Min 6 characters" minLength={6}
                    className="w-full pl-11 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Confirm password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type="password" required value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" />
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Resetting…</> : 'Reset password'}
              </button>
            </form>
          )}

          {step === 'success' && (
            <div className="text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <p className="text-gray-400 text-sm">Your password has been successfully reset.</p>
              <button onClick={() => navigate('/login')}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-xl transition-all">
                Sign in now
              </button>
            </div>
          )}

          {step !== 'success' && (
            <Link to="/login" className="mt-5 flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
