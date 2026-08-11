import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import Editor from '@monaco-editor/react';
import { problemsAPI, codeAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Play, Send, ChevronLeft, ChevronDown, ChevronUp,
  CheckCircle2, XCircle, Clock, MemoryStick, AlertCircle,
  Lightbulb, BookOpen, Terminal, TestTube, Trophy
} from 'lucide-react';

const LANGUAGES = [
  { id: 'python', label: 'Python 3', ext: '.py' },
  { id: 'javascript', label: 'JavaScript', ext: '.js' },
  { id: 'cpp', label: 'C++', ext: '.cpp' },
  { id: 'java', label: 'Java', ext: '.java' },
  { id: 'c', label: 'C', ext: '.c' },
];

const DEFAULT_CODE: Record<string, string> = {
  python: '# Write your solution here\n',
  javascript: '// Write your solution here\n',
  cpp: '#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n  // Write your solution here\n  return 0;\n}\n',
  java: 'import java.util.*;\npublic class Solution {\n  public static void main(String[] args) {\n    // Write your solution here\n  }\n}\n',
  c: '#include <stdio.h>\nint main() {\n  // Write your solution here\n  return 0;\n}\n',
};

const diffColor: Record<string, string> = {
  Easy: 'text-green-500', Medium: 'text-yellow-500', Hard: 'text-red-500',
};

type TabType = 'description' | 'hints' | 'submissions';
type ResultTabType = 'testcases' | 'result';

export default function ProblemSolverPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [problem, setProblem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState('python');
  const [code, setCode] = useState(DEFAULT_CODE.python);
  const [customInput, setCustomInput] = useState('');
  const [output, setOutput] = useState<any>(null);
  const [submissionResult, setSubmissionResult] = useState<any>(null);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [leftTab, setLeftTab] = useState<TabType>('description');
  const [resultTab, setResultTab] = useState<ResultTabType>('testcases');
  const [bottomExpanded, setBottomExpanded] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await problemsAPI.getOne(slug!);
        setProblem(data.problem);
        // Set starter code
        const starter = data.problem.starterCode?.[lang] || DEFAULT_CODE[lang];
        setCode(starter);
        if (data.problem.testCases?.[0]) {
          setCustomInput(data.problem.testCases[0].input || '');
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [slug]);

  const handleLangChange = (newLang: string) => {
    setLang(newLang);
    const starter = problem?.starterCode?.[newLang] || DEFAULT_CODE[newLang];
    setCode(starter);
  };

  const handleRun = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setRunning(true);
    setBottomExpanded(true);
    setResultTab('testcases');
    try {
      const result = await codeAPI.run({ code, language: lang, input: customInput });
      setOutput(result);
    } catch (e: any) {
      setOutput({ error: e.message, output: '', status: 'Error' });
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (!problem) return;
    setSubmitting(true);
    setBottomExpanded(true);
    setResultTab('result');
    try {
      const result = await codeAPI.submit(problem._id, { code, language: lang });
      setSubmissionResult(result.submission);
    } catch (e: any) {
      setSubmissionResult({ status: 'Error', error: e.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
    </div>
  );

  if (!problem) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
      Problem not found. <Link to="/problems" className="ml-2 text-indigo-400 underline">Go back</Link>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-gray-950 text-white overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800 flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/problems" className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors text-sm">
            <ChevronLeft className="w-4 h-4" /> Problems
          </Link>
          <span className="text-gray-600">|</span>
          <span className="font-semibold text-sm truncate max-w-xs">{problem.title}</span>
          <span className={`text-xs font-medium ${diffColor[problem.difficulty]}`}>{problem.difficulty}</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Language selector */}
          <select
            value={lang}
            onChange={e => handleLangChange(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500"
          >
            {LANGUAGES.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
          </select>
          <button
            onClick={handleRun}
            disabled={running || submitting}
            className="flex items-center gap-2 px-4 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5" /> {running ? 'Running…' : 'Run'}
          </button>
          <button
            onClick={handleSubmit}
            disabled={running || submitting}
            className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" /> {submitting ? 'Submitting…' : 'Submit'}
          </button>
        </div>
      </div>

      {/* Main 2-panel layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT: Problem Description */}
        <div className="w-[420px] flex-shrink-0 flex flex-col border-r border-gray-800 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-800 bg-gray-900">
            {(['description', 'hints', 'submissions'] as TabType[]).map(t => (
              <button
                key={t}
                onClick={() => setLeftTab(t)}
                className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors ${leftTab === t ? 'text-white border-b-2 border-indigo-500' : 'text-gray-400 hover:text-gray-200'}`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-700">
            {leftTab === 'description' && (
              <div>
                <h1 className="text-lg font-bold mb-3">{problem.title}</h1>
                <div className="flex gap-2 mb-4 flex-wrap">
                  {problem.tags?.map((tag: string) => (
                    <span key={tag} className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded">{tag}</span>
                  ))}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap mb-5">{problem.description}</p>

                {problem.examples?.map((ex: any, i: number) => (
                  <div key={i} className="mb-4 bg-gray-900 rounded-lg p-3">
                    <p className="text-xs text-gray-400 font-semibold mb-2">Example {i + 1}:</p>
                    <div className="text-sm space-y-1">
                      <p><span className="text-gray-400">Input: </span><code className="text-green-400">{ex.input}</code></p>
                      <p><span className="text-gray-400">Output: </span><code className="text-blue-400">{ex.output}</code></p>
                      {ex.explanation && <p className="text-gray-400 mt-1">Explanation: {ex.explanation}</p>}
                    </div>
                  </div>
                ))}

                {problem.constraints && (
                  <div className="bg-gray-900 rounded-lg p-3">
                    <p className="text-xs text-gray-400 font-semibold mb-2">Constraints:</p>
                    <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">{problem.constraints}</pre>
                  </div>
                )}

                <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
                  <span>Acceptance: {problem.acceptanceRate || 0}%</span>
                  <span>Points: {problem.points}</span>
                </div>
              </div>
            )}

            {leftTab === 'hints' && (
              <div className="space-y-3">
                {problem.hints?.length > 0 ? problem.hints.map((hint: string, i: number) => (
                  <details key={i} className="bg-gray-900 rounded-lg p-3 group">
                    <summary className="flex items-center gap-2 cursor-pointer text-sm font-medium text-yellow-400">
                      <Lightbulb className="w-4 h-4" /> Hint {i + 1}
                    </summary>
                    <p className="mt-2 text-sm text-gray-300">{hint}</p>
                  </details>
                )) : <p className="text-gray-400 text-sm">No hints available for this problem.</p>}
              </div>
            )}

            {leftTab === 'submissions' && (
              <SubmissionsTab problemId={problem._id} isAuthenticated={isAuthenticated} />
            )}
          </div>
        </div>

        {/* RIGHT: Editor + Output */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Monaco Editor */}
          <div className={`flex-1 overflow-hidden transition-all ${bottomExpanded ? 'h-[55%]' : 'flex-1'}`}>
            <Editor
              height="100%"
              language={lang === 'cpp' ? 'cpp' : lang === 'c' ? 'c' : lang}
              value={code}
              onChange={v => setCode(v || '')}
              theme="vs-dark"
              options={{
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                renderLineHighlight: 'all',
                tabSize: 2,
                wordWrap: 'on',
                padding: { top: 12 },
              }}
            />
          </div>

          {/* Bottom Panel: Custom Input + Results */}
          <div
            className={`flex-shrink-0 border-t border-gray-800 bg-gray-900 flex flex-col transition-all ${bottomExpanded ? 'h-[45%]' : 'h-12'}`}
          >
            {/* Bottom panel header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800">
              <div className="flex gap-4">
                {(['testcases', 'result'] as ResultTabType[]).map(t => (
                  <button
                    key={t}
                    onClick={() => { setResultTab(t); setBottomExpanded(true); }}
                    className={`text-sm font-medium capitalize transition-colors flex items-center gap-1.5 ${resultTab === t && bottomExpanded ? 'text-white' : 'text-gray-400 hover:text-gray-200'}`}
                  >
                    {t === 'testcases' ? <Terminal className="w-3.5 h-3.5" /> : <TestTube className="w-3.5 h-3.5" />}
                    {t}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setBottomExpanded(!bottomExpanded)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                {bottomExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </button>
            </div>

            {/* Bottom panel content */}
            {bottomExpanded && (
              <div className="flex-1 overflow-y-auto p-4">
                {resultTab === 'testcases' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-400 font-medium uppercase tracking-wider">Custom Input</label>
                      <textarea
                        value={customInput}
                        onChange={e => setCustomInput(e.target.value)}
                        placeholder="Enter your custom input here..."
                        className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm text-white font-mono resize-none focus:outline-none focus:border-indigo-500"
                        rows={3}
                      />
                    </div>
                    {output && (
                      <div className="bg-gray-800 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-xs font-bold ${output.status === 'Accepted' || !output.error ? 'text-green-400' : 'text-red-400'}`}>
                            {output.status || 'Output'}
                          </span>
                          {output.executionTime != null && (
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />{output.executionTime}ms
                            </span>
                          )}
                        </div>
                        {output.error ? (
                          <pre className="text-red-400 text-sm whitespace-pre-wrap font-mono">{output.error}</pre>
                        ) : (
                          <pre className="text-green-300 text-sm whitespace-pre-wrap font-mono">{output.output || '(no output)'}</pre>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {resultTab === 'result' && submissionResult && (
                  <div>
                    <div className={`flex items-center gap-3 mb-4 p-3 rounded-lg ${
                      submissionResult.status === 'Accepted'
                        ? 'bg-green-900/30 border border-green-700/50'
                        : 'bg-red-900/30 border border-red-700/50'
                    }`}>
                      {submissionResult.status === 'Accepted'
                        ? <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0" />
                        : <XCircle className="w-6 h-6 text-red-400 flex-shrink-0" />}
                      <div>
                        <p className={`font-bold ${submissionResult.status === 'Accepted' ? 'text-green-400' : 'text-red-400'}`}>
                          {submissionResult.status}
                        </p>
                        <p className="text-sm text-gray-400">
                          {submissionResult.passedCount}/{submissionResult.totalCount} test cases passed
                          {submissionResult.score != null && ` · +${submissionResult.score} pts`}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {submissionResult.testResults?.map((tc: any, i: number) => (
                        <div key={i} className={`p-3 rounded-lg border ${tc.passed ? 'border-green-800/50 bg-green-900/10' : 'border-red-800/50 bg-red-900/10'}`}>
                          <div className="flex items-center gap-2 mb-2">
                            {tc.passed ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <XCircle className="w-4 h-4 text-red-400" />}
                            <span className="text-sm font-medium">Test Case {tc.testCase}</span>
                            {tc.isHidden && <span className="text-xs text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded">Hidden</span>}
                          </div>
                          {!tc.isHidden && (
                            <div className="text-xs font-mono space-y-1 text-gray-300">
                              <p><span className="text-gray-500">Input:</span> {tc.input}</p>
                              <p><span className="text-gray-500">Expected:</span> <span className="text-blue-400">{tc.expectedOutput}</span></p>
                              {!tc.passed && <p><span className="text-gray-500">Got:</span> <span className="text-red-400">{tc.actualOutput || tc.error}</span></p>}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Submissions sub-component
function SubmissionsTab({ problemId, isAuthenticated }: { problemId: string; isAuthenticated: boolean }) {
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return; }
    codeAPI.getSubmissions({ problemId, limit: 10 })
      .then((d: any) => setSubs(d.submissions || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [problemId, isAuthenticated]);

  if (!isAuthenticated) return <p className="text-gray-400 text-sm">Login to view your submissions.</p>;
  if (loading) return <div className="text-center py-4"><div className="animate-spin h-5 w-5 border-b-2 border-indigo-500 rounded-full mx-auto" /></div>;

  return (
    <div className="space-y-2">
      {subs.length === 0 ? (
        <p className="text-gray-400 text-sm">No submissions yet. Try solving the problem!</p>
      ) : subs.map((s: any) => (
        <div key={s._id} className="bg-gray-900 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {s.status === 'Accepted' ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <XCircle className="w-4 h-4 text-red-400" />}
            <div>
              <p className={`text-sm font-medium ${s.status === 'Accepted' ? 'text-green-400' : 'text-red-400'}`}>{s.status}</p>
              <p className="text-xs text-gray-500">{s.language} · {new Date(s.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          <span className="text-xs text-gray-500">{s.passedCount}/{s.totalCount}</span>
        </div>
      ))}
    </div>
  );
}
