import React, { useState, useRef } from 'react';
import Navbar from '../components/Navbar';
import { aiAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  FileText, Sparkles, Download, Edit3, Check, User,
  GraduationCap, Briefcase, Code2, Award, ChevronDown,
  ChevronRight, Loader2, BarChart3, AlertCircle, Star
} from 'lucide-react';

type TabType = 'builder' | 'preview' | 'analyzer';

export default function ResumeBuilderPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<TabType>('builder');
  const [resume, setResume] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [generating, setGenerating] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [resumeText, setResumeText] = useState('');
  const [error, setError] = useState('');
  const printRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');
    try {
      const data = await aiAPI.generateResume();
      setResume(data.resume);
      setUserData(data.userData);
      setTab('preview');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleAnalyze = async () => {
    if (!resumeText.trim()) { setError('Please paste your resume text first'); return; }
    setAnalyzing(true);
    setError('');
    try {
      const data = await aiAPI.analyzeResume(resumeText);
      setAnalysis(data.analysis);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const handlePrint = () => {
    const content = printRef.current?.innerHTML;
    if (!content) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html><head><title>Resume - ${user?.username}</title>
      <style>
        body { font-family: Arial, sans-serif; color: #111; margin: 0; padding: 20px; }
        h1 { font-size: 24px; margin-bottom: 4px; } h2 { font-size: 16px; border-bottom: 2px solid #4f46e5; padding-bottom: 4px; margin: 16px 0 8px; color: #4f46e5; }
        .chip { display: inline-block; background: #eef2ff; color: #4338ca; padding: 2px 10px; border-radius: 20px; font-size: 12px; margin: 2px; }
        ul { margin: 0; padding-left: 18px; } li { margin-bottom: 4px; font-size: 13px; }
        .header { text-align: center; margin-bottom: 16px; }
        .contact { font-size: 13px; color: #555; margin-top: 4px; }
        @media print { body { margin: 0; } }
      </style></head><body>${content}</body></html>
    `);
    win.document.close();
    win.print();
  };

  return (
    <div className="min-h-screen bg-[#050818] text-white p-6 relative">
      <Navbar />
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <FileText className="w-8 h-8 text-indigo-600" />
            AI Resume Builder
          </h1>
          <p className="text-gray-400 mt-1">
            Generate an ATS-optimized resume from your coding activity, or analyze your existing resume
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 w-fit mb-6">
          {(['builder', 'preview', 'analyzer'] as TabType[]).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${tab === t ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-400 hover:text-gray-700'}`}>
              {t === 'builder' ? '🔨 Builder' : t === 'preview' ? '👁 Preview' : '🔍 Analyzer'}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm p-3 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
          </div>
        )}

        {/* Builder Tab */}
        {tab === 'builder' && (
          <div className="space-y-5">
            {/* Profile info card */}
            <div className="bg-white/[0.03] rounded-2xl border border-white/10 p-6">
              <h2 className="font-semibold text-white mb-4 flex items-center gap-2"><User className="w-4 h-4 text-indigo-600" />Your Profile Data</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Username', value: user?.username || '—' },
                  { label: 'Email', value: user?.email || '—' },
                  { label: 'Problems Solved', value: user?.stats?.problemsSolved || 0 },
                  { label: 'Score', value: user?.stats?.score || 0 },
                ].map(item => (
                  <div key={item.label} className="bg-gray-50 bg-white/5 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-1">{item.label}</p>
                    <p className="font-semibold text-white text-sm">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* What gets auto-fetched */}
            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-200 dark:border-indigo-800 p-6">
              <h2 className="font-semibold text-indigo-800 dark:text-indigo-300 mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> What AI auto-includes
              </h2>
              <div className="grid grid-cols-2 gap-3 text-sm text-indigo-700 dark:text-indigo-300">
                {['Languages from your submissions', 'Solved problem categories as skills', 'Coding stats & achievements', 'Profile education & experience', 'GitHub/LinkedIn links', 'ATS-optimized summary'].map(item => (
                  <div key={item} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-indigo-500 flex-shrink-0" />{item}
                  </div>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-yellow-50 dark:bg-yellow-900/10 rounded-2xl border border-yellow-200 dark:border-yellow-800 p-5">
              <p className="text-sm text-yellow-700 dark:text-yellow-400 font-medium mb-2">💡 Tip: Improve your resume quality</p>
              <p className="text-sm text-yellow-600 dark:text-yellow-500">
                Go to your <a href="/profile" className="underline font-medium">Profile settings</a> and fill in education, work experience, bio, and skills. The AI will use this for a richer resume.
              </p>
            </div>

            <button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-semibold text-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-500/20"
            >
              {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              {generating ? 'Generating your resume…' : 'Generate AI Resume'}
            </button>
          </div>
        )}

        {/* Preview Tab */}
        {tab === 'preview' && (
          <div>
            {!resume ? (
              <div className="text-center py-16 bg-white/[0.03] rounded-2xl border border-white/10">
                <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">No resume generated yet.</p>
                <button onClick={() => setTab('builder')} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors">
                  Go to Builder
                </button>
              </div>
            ) : (
              <div>
                <div className="flex justify-end gap-3 mb-4">
                  <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-white/[0.03] border border-white/10 rounded-xl text-sm font-medium hover:border-indigo-300 transition-colors">
                    <Download className="w-4 h-4" /> Download PDF
                  </button>
                  <button onClick={() => setTab('analyzer')} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors">
                    <BarChart3 className="w-4 h-4" /> Analyze Score
                  </button>
                </div>
                <div ref={printRef} className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                  <ResumePreview resume={resume} userData={userData} username={user?.username || ''} email={user?.email || ''} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Analyzer Tab */}
        {tab === 'analyzer' && (
          <div className="space-y-5">
            <div className="bg-white/[0.03] rounded-2xl border border-white/10 p-6">
              <h2 className="font-semibold text-white mb-3 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-indigo-600" /> Paste Your Resume
              </h2>
              <textarea
                value={resumeText}
                onChange={e => setResumeText(e.target.value)}
                placeholder="Paste your resume text here for AI analysis..."
                className="w-full px-4 py-3 border border-white/10 rounded-xl bg-white/[0.03] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
                rows={10}
              />
              <button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="mt-3 flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <BarChart3 className="w-4 h-4" />}
                {analyzing ? 'Analyzing…' : 'Analyze Resume'}
              </button>
            </div>

            {analysis && <ResumeAnalysis analysis={analysis} />}
          </div>
        )}
      </div>
    </div>
  );
}

function ResumePreview({ resume, userData, username, email }: any) {
  if (!resume) return null;
  const name = userData?.name || username;
  return (
    <div className="text-gray-900 font-sans" id="resume-print">
      {/* Header */}
      <div className="text-center border-b-2 border-indigo-600 pb-5 mb-5">
        <h1 className="text-3xl font-bold text-gray-900">{name}</h1>
        <div className="flex flex-wrap items-center justify-center gap-3 mt-2 text-sm text-gray-600">
          <span>{email}</span>
          {userData?.location && <><span>•</span><span>{userData.location}</span></>}
          {userData?.github && <><span>•</span><a href={userData.github} className="text-indigo-600">{userData.github}</a></>}
          {userData?.linkedin && <><span>•</span><a href={userData.linkedin} className="text-indigo-600">LinkedIn</a></>}
        </div>
      </div>

      {/* Summary */}
      {resume.summary && (
        <Section title="Professional Summary">
          <p className="text-sm text-gray-700 leading-relaxed">{resume.summary}</p>
        </Section>
      )}

      {/* Skills */}
      {resume.skills && Object.keys(resume.skills).length > 0 && (
        <Section title="Technical Skills">
          <div className="space-y-1.5">
            {Object.entries(resume.skills).map(([cat, items]: any) =>
              items?.length > 0 ? (
                <div key={cat} className="flex gap-2 items-start">
                  <span className="text-sm font-medium text-gray-700 w-28 flex-shrink-0 capitalize">{cat}:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {items.map((s: string) => <span key={s} className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full">{s}</span>)}
                  </div>
                </div>
              ) : null
            )}
          </div>
        </Section>
      )}

      {/* Experience */}
      {resume.experience?.length > 0 && (
        <Section title="Work Experience">
          <div className="space-y-4">
            {resume.experience.map((exp: any, i: number) => (
              <div key={i}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-900">{exp.role}</p>
                    <p className="text-sm text-indigo-600 font-medium">{exp.company}</p>
                  </div>
                  <span className="text-xs text-gray-500">{exp.duration}</span>
                </div>
                {exp.points?.length > 0 && <ul className="mt-2 list-disc list-inside space-y-1">{exp.points.map((p: string, j: number) => <li key={j} className="text-sm text-gray-700">{p}</li>)}</ul>}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Education */}
      {resume.education?.length > 0 && (
        <Section title="Education">
          <div className="space-y-3">
            {resume.education.map((edu: any, i: number) => (
              <div key={i} className="flex justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{edu.institution}</p>
                  <p className="text-sm text-gray-600">{edu.degree} in {edu.field}</p>
                </div>
                <span className="text-xs text-gray-500">{edu.year}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Projects */}
      {resume.projects?.length > 0 && (
        <Section title="Projects">
          <div className="space-y-3">
            {resume.projects.map((proj: any, i: number) => (
              <div key={i}>
                <div className="flex justify-between items-start">
                  <p className="font-semibold text-gray-900">{proj.name}</p>
                  {proj.link && <a href={proj.link} className="text-xs text-indigo-600 underline">Link</a>}
                </div>
                <p className="text-sm text-gray-700 mt-0.5">{proj.description}</p>
                {proj.technologies?.length > 0 && (
                  <div className="flex gap-1.5 mt-1.5">{proj.technologies.map((t: string) => <span key={t} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{t}</span>)}</div>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Achievements */}
      {resume.achievements?.length > 0 && (
        <Section title="Achievements">
          <ul className="list-disc list-inside space-y-1">
            {resume.achievements.map((a: string, i: number) => <li key={i} className="text-sm text-gray-700">{a}</li>)}
          </ul>
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <h2 className="text-base font-bold text-indigo-700 uppercase tracking-wider border-b-2 border-indigo-200 pb-1 mb-3">{title}</h2>
      {children}
    </div>
  );
}

function ResumeAnalysis({ analysis }: { analysis: any }) {
  const scoreColor = analysis.score >= 80 ? 'text-green-600' : analysis.score >= 60 ? 'text-yellow-600' : 'text-red-600';
  const scoreBg = analysis.score >= 80 ? 'bg-green-100 dark:bg-green-900/20' : analysis.score >= 60 ? 'bg-yellow-100 dark:bg-yellow-900/20' : 'bg-red-100 dark:bg-red-900/20';

  return (
    <div className="space-y-4">
      {/* Score Overview */}
      <div className="bg-white/[0.03] rounded-2xl border border-white/10 p-6">
        <div className="flex items-center gap-6">
          <div className={`w-24 h-24 rounded-full ${scoreBg} flex items-center justify-center flex-shrink-0`}>
            <span className={`text-3xl font-bold ${scoreColor}`}>{analysis.score}</span>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-1">Resume Score</h3>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-3">
              <div className={`h-3 rounded-full transition-all ${analysis.score >= 80 ? 'bg-green-500' : analysis.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${analysis.score}%` }} />
            </div>
            <p className="text-sm text-gray-400">ATS Compatibility: <span className="font-semibold text-gray-200">{analysis.atsCompatibility}%</span></p>
          </div>
        </div>
      </div>

      {/* Section Scores */}
      {analysis.sectionScores && (
        <div className="bg-white/[0.03] rounded-2xl border border-white/10 p-6">
          <h3 className="font-semibold text-white mb-4">Section Breakdown</h3>
          <div className="space-y-3">
            {Object.entries(analysis.sectionScores).map(([section, score]: any) => (
              <div key={section}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="capitalize text-gray-300">{section}</span>
                  <span className="font-medium text-white">{score}/100</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-2">
                  <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid: strengths, weaknesses, missing skills, suggestions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnalysisCard title="✅ Strengths" items={analysis.strengths} colorClass="text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800" />
        <AnalysisCard title="⚠️ Weaknesses" items={analysis.weaknesses} colorClass="text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800" />
        <AnalysisCard title="📚 Missing Skills" items={analysis.missingSkills} colorClass="text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800" />
        <AnalysisCard title="💡 Suggestions" items={analysis.suggestions} colorClass="text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-800" />
      </div>
    </div>
  );
}

function AnalysisCard({ title, items, colorClass }: { title: string; items: string[]; colorClass: string }) {
  return (
    <div className={`rounded-2xl border p-5 ${colorClass}`}>
      <h3 className="font-semibold mb-3 text-sm">{title}</h3>
      <ul className="space-y-1.5">
        {items?.map((item: string, i: number) => (
          <li key={i} className="text-sm flex items-start gap-2">
            <ChevronRight className="w-3 h-3 flex-shrink-0 mt-0.5" />{item}
          </li>
        ))}
      </ul>
    </div>
  );
}
