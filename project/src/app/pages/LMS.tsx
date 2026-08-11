import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Link, useNavigate } from 'react-router';
import { groupsAPI, problemsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Users, Plus, LogIn, BookOpen, ClipboardList,
  TrendingUp, Calendar, Copy, Check, ChevronRight,
  GraduationCap, School, Award, AlertCircle, X
} from 'lucide-react';

export default function LMSPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isTeacher = user?.role === 'teacher' || user?.role === 'admin';

  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    groupsAPI.getMy()
      .then((d: any) => setGroups(d.groups || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const copyJoinCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#050818] text-white p-6 relative">
      <Navbar />
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <School className="w-8 h-8 text-indigo-600" />
              {isTeacher ? 'My Classrooms' : 'My Classes'}
            </h1>
            <p className="text-gray-400 mt-1">
              {isTeacher ? 'Manage your groups, assignments, and track student progress' : 'Join groups and view your assignments'}
            </p>
          </div>
          <div className="flex gap-3">
            {!isTeacher && (
              <button
                onClick={() => setShowJoinModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/[0.03] border border-white/10 text-gray-200 rounded-xl font-medium hover:border-indigo-400 transition-colors"
              >
                <LogIn className="w-4 h-4" /> Join Group
              </button>
            )}
            {isTeacher && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-4 h-4" /> Create Group
              </button>
            )}
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Groups', value: groups.length, icon: Users, color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30' },
            { label: isTeacher ? 'Total Students' : 'Assignments', value: isTeacher ? groups.reduce((a, g) => a + (g.students?.length || 0), 0) : groups.reduce((a, g) => a + (g.assignments?.length || 0), 0), icon: isTeacher ? GraduationCap : ClipboardList, color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
            { label: 'Active Groups', value: groups.filter(g => g.isActive).length, icon: TrendingUp, color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30' },
          ].map(stat => (
            <div key={stat.label} className="bg-white/[0.03] rounded-xl p-5 border border-white/10 flex items-center gap-4">
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-gray-400">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Groups List */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
          </div>
        ) : groups.length === 0 ? (
          <div className="bg-white/[0.03] rounded-2xl border border-white/10 p-16 text-center">
            <School className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              {isTeacher ? 'No groups yet' : 'You haven\'t joined any groups'}
            </h3>
            <p className="text-gray-400 dark:text-gray-500 mb-6">
              {isTeacher ? 'Create your first classroom to get started' : 'Ask your teacher for a join code'}
            </p>
            {isTeacher ? (
              <button onClick={() => setShowCreateModal(true)} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors">
                Create First Group
              </button>
            ) : (
              <button onClick={() => setShowJoinModal(true)} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors">
                Join a Group
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {groups.map(group => (
              <GroupCard
                key={group._id}
                group={group}
                isTeacher={isTeacher}
                copiedCode={copiedCode}
                onCopy={copyJoinCode}
                onView={() => navigate(`/lms/groups/${group._id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateGroupModal
          onClose={() => setShowCreateModal(false)}
          onCreated={(g: any) => { setGroups(prev => [g, ...prev]); setShowCreateModal(false); }}
        />
      )}
      {showJoinModal && (
        <JoinGroupModal
          onClose={() => setShowJoinModal(false)}
          onJoined={(g: any) => { setGroups(prev => [g, ...prev]); setShowJoinModal(false); }}
        />
      )}
    </div>
  );
}

function GroupCard({ group, isTeacher, copiedCode, onCopy, onView }: any) {
  return (
    <div className="bg-white/[0.03] rounded-2xl border border-white/10 p-6 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all hover:shadow-lg">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-white">{group.name}</h3>
          {group.description && <p className="text-sm text-gray-400 mt-1">{group.description}</p>}
        </div>
        <div className={`w-3 h-3 rounded-full mt-1 ${group.isActive ? 'bg-green-500' : 'bg-gray-300'}`} title={group.isActive ? 'Active' : 'Inactive'} />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-50 bg-white/5 rounded-lg p-3 text-center">
          <p className="text-xl font-bold text-white">
            {isTeacher ? group.students?.length || 0 : group.assignments?.length || 0}
          </p>
          <p className="text-xs text-gray-400">{isTeacher ? 'Students' : 'Assignments'}</p>
        </div>
        <div className="bg-gray-50 bg-white/5 rounded-lg p-3 text-center">
          <p className="text-xl font-bold text-white">{group.assignments?.length || 0}</p>
          <p className="text-xs text-gray-400">Assignments</p>
        </div>
      </div>

      {isTeacher && group.joinCode && (
        <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-3 mb-4">
          <span className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">Join Code:</span>
          <span className="font-mono font-bold text-indigo-700 dark:text-indigo-300 tracking-widest">{group.joinCode}</span>
          <button onClick={() => onCopy(group.joinCode)} className="ml-auto text-indigo-500 hover:text-indigo-700 transition-colors">
            {copiedCode === group.joinCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      )}

      {group.teacher && !isTeacher && (
        <p className="text-sm text-gray-400 mb-4">
          Teacher: <span className="font-medium text-gray-700 dark:text-gray-300">{group.teacher.username}</span>
        </p>
      )}

      <button
        onClick={onView}
        className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
      >
        View Group <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function CreateGroupModal({ onClose, onCreated }: any) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!name.trim()) { setError('Group name is required'); return; }
    setLoading(true);
    try {
      const data: any = await groupsAPI.create({ name: name.trim(), description });
      onCreated(data.group);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <Modal title="Create New Group" onClose={onClose}>
      <div className="space-y-4">
        {error && <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg flex items-center gap-2"><AlertCircle className="w-4 h-4" />{error}</div>}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Group Name *</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g., DSA Batch 2025" className="w-full px-4 py-2.5 border border-white/10 rounded-xl bg-white/[0.03] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional description..." className="w-full px-4 py-2.5 border border-white/10 rounded-xl bg-white/[0.03] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none" rows={3} />
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-white/10 rounded-xl text-sm font-medium text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Cancel</button>
          <button onClick={handleSubmit} disabled={loading} className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors">
            {loading ? 'Creating…' : 'Create Group'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function JoinGroupModal({ onClose, onJoined }: any) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = async () => {
    if (!code.trim()) { setError('Enter a join code'); return; }
    setLoading(true);
    try {
      const data: any = await groupsAPI.join(code.trim());
      onJoined(data.group);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <Modal title="Join a Group" onClose={onClose}>
      <div className="space-y-4">
        {error && <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg flex items-center gap-2"><AlertCircle className="w-4 h-4" />{error}</div>}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Join Code *</label>
          <input
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            placeholder="Enter 6-character code e.g. ABC123"
            maxLength={6}
            className="w-full px-4 py-2.5 border border-white/10 rounded-xl bg-white/[0.03] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-mono tracking-widest text-center text-lg"
          />
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-white/10 rounded-xl text-sm font-medium text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Cancel</button>
          <button onClick={handleJoin} disabled={loading} className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors">
            {loading ? 'Joining…' : 'Join Group'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/[0.03] rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
