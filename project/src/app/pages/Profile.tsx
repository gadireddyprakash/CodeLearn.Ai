import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import Navbar from '../components/Navbar';
import {
  User, Mail, MapPin, Edit2, Save, X, Github, Linkedin,
  Globe, Code2, CheckCircle2, Star, Flame, TrendingUp, BookOpen, Plus, Trash2
} from 'lucide-react';

export default function Profile() {
  const navigate = useNavigate();
  const { user, isAuthenticated, refreshUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>({});
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => { if (!isAuthenticated) navigate('/login'); }, [isAuthenticated, navigate]);
  useEffect(() => { if (user?.profile) setProfile({ ...user.profile }); }, [user]);

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      await authAPI.updateProfile(profile);
      await refreshUser();
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  const handleCancel = () => { setProfile({ ...user?.profile }); setEditing(false); setError(''); };

  const addEducation = () => setProfile((p: any) => ({ ...p, education: [...(p.education || []), { institution: '', degree: '', field: '', startYear: '', endYear: '' }] }));
  const removeEducation = (i: number) => setProfile((p: any) => ({ ...p, education: p.education.filter((_: any, idx: number) => idx !== i) }));
  const updateEducation = (i: number, field: string, value: string) => setProfile((p: any) => {
    const edu = [...(p.education || [])]; edu[i] = { ...edu[i], [field]: value }; return { ...p, education: edu };
  });

  if (!user) return null;
  const stats = user.stats || {};

  const field = (label: string, key: string, icon: any, placeholder: string, type = 'text') => (
    <div>
      <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">{label}</label>
      <div className="relative">
        {icon && <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">{icon}</div>}
        <input type={type} value={profile[key] || ''} disabled={!editing}
          onChange={e => setProfile((p: any) => ({ ...p, [key]: e.target.value }))}
          placeholder={editing ? placeholder : '—'}
          className={`w-full ${icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 rounded-xl text-sm transition-all ${editing ? 'bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500' : 'bg-transparent border border-transparent text-gray-300 cursor-default'}`}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050818] text-white">
      <div className="fixed inset-0 pointer-events-none" style={{backgroundImage:'linear-gradient(rgba(99,102,241,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.04) 1px,transparent 1px)',backgroundSize:'60px 60px'}} />
      <Navbar />
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-3xl font-black shadow-xl shadow-indigo-500/20">
              {user.username?.[0]?.toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">{profile.fullName || user.username}</h1>
              <p className="text-gray-400 text-sm mt-0.5">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${user.role === 'admin' ? 'bg-red-500/20 text-red-400 border border-red-500/20' : user.role === 'teacher' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/20' : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/20'}`}>
                  {user.role}
                </span>
                <span className="text-xs text-gray-500">Joined {new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {saved && <span className="flex items-center gap-1.5 text-green-400 text-sm"><CheckCircle2 className="w-4 h-4" />Saved!</span>}
            {!editing ? (
              <button onClick={() => setEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-sm font-medium transition-all">
                <Edit2 className="w-3.5 h-3.5" /> Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={handleCancel} className="flex items-center gap-1.5 px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-sm font-medium transition-all">
                  <X className="w-3.5 h-3.5" /> Cancel
                </button>
                <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition-all disabled:opacity-50">
                  <Save className="w-3.5 h-3.5" /> {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            )}
          </div>
        </div>

        {error && <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Solved', value: stats.problemsSolved || 0, icon: Code2, color: 'text-green-400' },
            { label: 'Score', value: stats.score || 0, icon: Star, color: 'text-amber-400' },
            { label: 'Streak', value: `${stats.streak || 0}d`, icon: Flame, color: 'text-orange-400' },
            { label: 'Submissions', value: stats.totalSubmissions || 0, icon: TrendingUp, color: 'text-indigo-400' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
              <s.icon className={`w-7 h-7 ${s.color}`} />
              <div>
                <p className="text-xl font-black text-white">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {/* Basic Info */}
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-4">
            <h2 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2"><User className="w-4 h-4 text-indigo-400" />Basic Info</h2>
            {field('Full Name', 'fullName', null, 'Your full name')}
            {field('Bio', 'bio', null, 'Tell us about yourself')}
            {field('Location', 'location', <MapPin className="w-4 h-4" />, 'City, Country')}
          </div>

          {/* Links */}
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-4">
            <h2 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2"><Globe className="w-4 h-4 text-indigo-400" />Links</h2>
            {field('GitHub', 'github', <Github className="w-4 h-4" />, 'https://github.com/username')}
            {field('LinkedIn', 'linkedin', <Linkedin className="w-4 h-4" />, 'https://linkedin.com/in/name')}
            {field('Website', 'website', <Globe className="w-4 h-4" />, 'https://yoursite.com')}
          </div>

          {/* Skills */}
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
            <h2 className="font-bold text-white text-sm uppercase tracking-wider mb-4 flex items-center gap-2"><BookOpen className="w-4 h-4 text-indigo-400" />Skills</h2>
            {editing ? (
              <textarea
                value={(profile.skills || []).join(', ')}
                onChange={e => setProfile((p: any) => ({ ...p, skills: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean) }))}
                placeholder="Python, JavaScript, React, Node.js..."
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm focus:outline-none focus:border-indigo-500 resize-none"
                rows={3}
              />
            ) : (
              <div className="flex flex-wrap gap-2">
                {(profile.skills || user.stats?.languagesUsed || []).length > 0
                  ? (profile.skills || user.stats?.languagesUsed || []).map((s: string) => (
                      <span key={s} className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-full text-xs font-medium">{s}</span>
                    ))
                  : <p className="text-gray-500 text-sm">{editing ? '' : 'No skills added yet.'}</p>
                }
              </div>
            )}
          </div>

          {/* Education */}
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2"><BookOpen className="w-4 h-4 text-indigo-400" />Education</h2>
              {editing && <button onClick={addEducation} className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"><Plus className="w-3.5 h-3.5" />Add</button>}
            </div>
            <div className="space-y-3">
              {(profile.education || []).length === 0 && <p className="text-gray-500 text-sm">No education added.</p>}
              {(profile.education || []).map((edu: any, i: number) => (
                <div key={i} className="p-3 bg-white/5 rounded-xl relative">
                  {editing && <button onClick={() => removeEducation(i)} className="absolute top-2 right-2 text-gray-500 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>}
                  {editing ? (
                    <div className="space-y-2 pr-6">
                      <input value={edu.institution} onChange={e => updateEducation(i,'institution',e.target.value)} placeholder="Institution" className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-600 text-xs focus:outline-none focus:border-indigo-500" />
                      <div className="grid grid-cols-2 gap-2">
                        <input value={edu.degree} onChange={e => updateEducation(i,'degree',e.target.value)} placeholder="Degree" className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-600 text-xs focus:outline-none focus:border-indigo-500" />
                        <input value={edu.field} onChange={e => updateEducation(i,'field',e.target.value)} placeholder="Field" className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-600 text-xs focus:outline-none focus:border-indigo-500" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input type="number" value={edu.startYear} onChange={e => updateEducation(i,'startYear',e.target.value)} placeholder="Start Year" className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-600 text-xs focus:outline-none focus:border-indigo-500" />
                        <input type="number" value={edu.endYear} onChange={e => updateEducation(i,'endYear',e.target.value)} placeholder="End Year" className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-600 text-xs focus:outline-none focus:border-indigo-500" />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="font-semibold text-white text-sm">{edu.institution}</p>
                      <p className="text-xs text-gray-400">{edu.degree} in {edu.field} · {edu.startYear}–{edu.endYear}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Languages used */}
        {(user.stats?.languagesUsed?.length || 0) > 0 && (
          <div className="mt-5 bg-white/[0.02] border border-white/5 rounded-2xl p-5">
            <h2 className="font-bold text-white text-sm uppercase tracking-wider mb-3 flex items-center gap-2"><Code2 className="w-4 h-4 text-indigo-400" />Languages Used in Submissions</h2>
            <div className="flex flex-wrap gap-2">
              {user.stats.languagesUsed.map((lang: string) => (
                <span key={lang} className="px-3 py-1 bg-violet-500/10 border border-violet-500/20 text-violet-300 rounded-full text-xs font-medium">{lang}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
