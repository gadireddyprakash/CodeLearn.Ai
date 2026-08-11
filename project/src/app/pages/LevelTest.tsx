import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import { levelAPI, codeAPI } from '../services/api';
import Editor from '@monaco-editor/react';
import { AlertTriangle, CheckCircle2, XCircle, Brain, Loader2, Play, Clock, ShieldAlert, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

const MCQ_TIME = 30 * 60;   // 30 min
const CODE_TIME = 100 * 60; // 100 min

function Timer({ seconds, onExpire, label }: { seconds: number; onExpire: () => void; label: string }) {
  const [left, setLeft] = useState(seconds);
  const ref = useRef<ReturnType<typeof setInterval>>();
  useEffect(() => {
    setLeft(seconds);
    ref.current = setInterval(() => {
      setLeft(p => {
        if (p <= 1) { clearInterval(ref.current); onExpire(); return 0; }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(ref.current);
  }, [seconds]);
  const m = String(Math.floor(left / 60)).padStart(2, '0');
  const s = String(left % 60).padStart(2, '0');
  const warn = left < 300;
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-sm font-bold ${warn ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-white/10 text-white'}`}>
      <Clock className="w-4 h-4" /> {label}: {m}:{s}
    </div>
  );
}

export default function LevelTest() {
  const { language, levelNumber } = useParams<{ language: string; levelNumber: string }>();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  const [level, setLevel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState<'mcq' | 'coding' | 'result'>('mcq');

  // MCQ state
  const [mcqAnswers, setMcqAnswers] = useState<Record<string, number>>({});
  const [mcqEval, setMcqEval] = useState<any>(null);
  const [mcqSubmitting, setMcqSubmitting] = useState(false);

  // Coding state
  const [currentQ, setCurrentQ] = useState(0);
  const [codingAnswers, setCodingAnswers] = useState<Record<string, string>>({});
  const [runResult, setRunResult] = useState<any>(null);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Security
  const [violations, setViolations] = useState(0);
  const violationsRef = useRef(0);
  const [result, setResult] = useState<any>(null);

  // Load level
  useEffect(() => {
    if (!language || !levelNumber) return;
    levelAPI.getLevelDetails(language, parseInt(levelNumber))
      .then(d => { setLevel(d.level); if (!d.level.mcqs?.length) setPhase('coding'); setLoading(false); })
      .catch(() => navigate(`/levels/${language}`));
  }, [language, levelNumber, navigate]);

  // Fullscreen + security
  useEffect(() => {
    if (!level || phase === 'result') return;
    containerRef.current?.requestFullscreen?.().catch(() => {});

    const onVis = () => {
      if (document.hidden) {
        violationsRef.current += 1;
        setViolations(violationsRef.current);
        toast.error(`⚠️ Tab switch detected! Violation ${violationsRef.current}/3`, { duration: 4000 });
        if (violationsRef.current >= 3) {
          toast.error('3 violations — exam terminated!', { duration: 6000 });
          navigate(`/levels/${language}`);
        }
      }
    };

    document.addEventListener('visibilitychange', onVis);

    return () => {
      document.removeEventListener('visibilitychange', onVis);
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    };
  }, [level, phase]);

  const handleAutoSubmit = useCallback(() => {
    if (phase === 'coding') doSubmit(true);
  }, [phase]);

  const handleMCQSubmit = async () => {
    const total = level.mcqs?.length || 0;
    const answered = Object.keys(mcqAnswers).length;
    if (answered < total && !confirm(`You answered ${answered}/${total}. Submit anyway?`)) return;
    setMcqSubmitting(true);
    try {
      const res = await levelAPI.evaluateMCQ({ language, levelNumber, mcqAnswers });
      setMcqEval(res);
      if (res.passed) {
        toast.success(`MCQs Passed! ${res.score}/${res.total} correct. Coding section unlocked!`);
        setPhase('coding');
      } else {
        toast.error(`MCQ Failed: ${res.score}/${res.total} (${res.percentage}%). Need 60%.`);
        setResult({ passed: false, score: res.percentage, mcqPercentage: res.percentage, codingPercentage: 0, codingFeedback: [], aiFeedback: 'MCQ not passed. Review concepts and try again.' });
        setPhase('result');
        document.exitFullscreen?.().catch(() => {});
      }
    } catch (e: any) { toast.error(e.message || 'Submission failed'); }
    finally { setMcqSubmitting(false); }
  };

  const handleRunCode = async () => {
    const prob = level.codingQuestions[currentQ];
    const code = codingAnswers[prob._id] || '';
    if (!code.trim()) { toast.warning('Write some code first'); return; }
    setRunning(true); setRunResult(null);
    try {
      const tc = prob.testCases?.filter((t: any) => !t.isHidden).slice(0, 3) || [];
      const res = await codeAPI.runLevel({ code, language, testCases: tc });
      setRunResult(res);
    } catch (e: any) { toast.error(e.message || 'Run failed'); }
    finally { setRunning(false); }
  };

  const doSubmit = async (auto = false) => {
    if (!auto) {
      if (document.fullscreenElement) {
        await document.exitFullscreen().catch(() => {});
        // Small delay to allow UI to settle before blocking confirm
        await new Promise(r => setTimeout(r, 100));
      }
      if (!window.confirm('Submit coding exam? This cannot be undone.')) return;
    }
    setSubmitting(true);
    try {
      const res = await levelAPI.evaluate({
        language, levelNumber,
        mcqAnswers, codingAnswers,
        mcqScore: mcqEval?.score || 0,
        mcqTotal: mcqEval?.total || 0,
        violations: violationsRef.current,
      });
      if (mcqEval) res.mcqPercentage = mcqEval.percentage;
      setResult(res);
      setPhase('result');
      document.exitFullscreen?.().catch(() => {});
    } catch (e: any) { toast.error(e.message || 'Submission failed'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="min-h-screen bg-[#050818] text-white flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-400" /></div>;
  if (!level) return null;

  // ── RESULT SCREEN ────────────────────────────────────────────────────────────
  if (phase === 'result' && result) {
    return (
      <div className="min-h-screen bg-[#050818] text-white p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 text-center mb-6">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${result.passed ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
              {result.passed ? <CheckCircle2 className="w-12 h-12 text-green-400" /> : <XCircle className="w-12 h-12 text-red-400" />}
            </div>
            <h1 className="text-4xl font-black mb-2">{result.passed ? '🎉 Level Passed!' : 'Level Failed'}</h1>
            <p className="text-gray-400 text-lg mb-8">Final Score: <span className={`font-bold ${result.passed ? 'text-green-400' : 'text-red-400'}`}>{result.score}%</span></p>

            <div className="grid md:grid-cols-3 gap-4 mb-8">
              {[
                { label: 'MCQ Score', val: `${result.mcqPercentage ?? '—'}%`, color: 'text-indigo-400' },
                { label: 'Coding Score', val: `${result.codingPercentage ?? '—'}%`, color: 'text-violet-400' },
                { label: 'Violations', val: violationsRef.current, color: violationsRef.current > 0 ? 'text-red-400' : 'text-green-400' },
              ].map(s => (
                <div key={s.label} className="p-5 bg-white/5 rounded-xl border border-white/5">
                  <p className="text-xs text-gray-400 mb-1">{s.label}</p>
                  <p className={`text-3xl font-black ${s.color}`}>{s.val}</p>
                </div>
              ))}
            </div>

            {result.aiFeedback && (
              <div className="text-left bg-indigo-500/10 border border-indigo-500/20 p-5 rounded-xl mb-6">
                <p className="font-bold flex items-center gap-2 mb-2"><Brain className="w-4 h-4 text-indigo-400" /> AI Feedback</p>
                <p className="text-gray-300 text-sm leading-relaxed">{result.aiFeedback}</p>
              </div>
            )}

            {result.codingFeedback?.length > 0 && (
              <div className="text-left space-y-2 mb-6">
                <p className="font-bold text-sm text-gray-300 mb-3">Coding Breakdown:</p>
                {result.codingFeedback.map((fb: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-lg">
                    <span className="text-sm">{fb.title}</span>
                    <span className={`text-sm font-bold ${fb.passed ? 'text-green-400' : 'text-red-400'}`}>
                      {fb.passed ? '✓ Passed' : `${fb.passedCount}/${fb.totalCount}`}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <button onClick={() => navigate(`/levels/${language}`)} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors">
              Back to Level Map
            </button>
          </div>
        </div>
      </div>
    );
  }

  const mcqs = level.mcqs?.slice(0, 10) || [];
  const codingQs = level.codingQuestions?.slice(0, 10) || [];
  const prob = codingQs[currentQ];

  // ── EXAM SCREEN ──────────────────────────────────────────────────────────────
  return (
    <div 
      ref={containerRef} 
      className="min-h-screen bg-[#050818] text-white flex flex-col"
      onCopy={(e) => { e.preventDefault(); toast.warning('Copy disabled during exam', { duration: 1500 }); }}
      onPaste={(e) => { e.preventDefault(); toast.warning('Paste disabled during exam', { duration: 1500 }); }}
      onCut={(e) => { e.preventDefault(); toast.warning('Cut disabled during exam', { duration: 1500 }); }}
      onContextMenu={(e) => { e.preventDefault(); toast.warning('Context menu disabled during exam', { duration: 1500 }); }}
    >
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#050818]/95 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="font-bold text-sm">Level {level.levelNumber} — {phase === 'mcq' ? 'MCQ Test' : `Coding Q${currentQ + 1}/${codingQs.length}`}</h1>
          {violations > 0 && (
            <span className="flex items-center gap-1 text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded-full">
              <ShieldAlert className="w-3 h-3" /> {violations}/3 violations
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {phase === 'mcq' && <Timer seconds={MCQ_TIME} onExpire={handleMCQSubmit} label="MCQ" />}
          {phase === 'coding' && <Timer seconds={CODE_TIME} onExpire={() => doSubmit(true)} label="Coding" />}
          <span className="text-xs text-amber-400 hidden md:flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Proctored</span>
          {phase === 'mcq' && (
            <button onClick={handleMCQSubmit} disabled={mcqSubmitting}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-lg disabled:opacity-50 flex items-center gap-2">
              {mcqSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit MCQs'}
            </button>
          )}
          {phase === 'coding' && (
            <button onClick={() => doSubmit()} disabled={submitting}
              className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-bold rounded-lg disabled:opacity-50 flex items-center gap-2">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Exam'}
            </button>
          )}
        </div>
      </div>

      {/* MCQ Phase */}
      {phase === 'mcq' && (
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-black">Multiple Choice Questions</h2>
              <p className="text-gray-400 text-sm mt-1">Answer all {mcqs.length} questions. Score ≥ 60% to unlock coding section.</p>
            </div>
            {mcqs.map((mcq: any, idx: number) => (
              <div key={mcq.id || idx} className="p-6 bg-white/[0.02] border border-white/10 rounded-2xl">
                <p className="font-semibold mb-4 leading-relaxed">{idx + 1}. {mcq.question}</p>
                <div className="space-y-2">
                  {mcq.options.map((opt: string, oIdx: number) => {
                    const key = String(mcq.id || idx);
                    const selected = mcqAnswers[key] === oIdx;
                    return (
                      <label key={oIdx} className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${selected ? 'bg-indigo-500/20 border-indigo-500' : 'bg-white/[0.02] border-white/5 hover:border-white/20'}`}>
                        <input type="radio" className="hidden" checked={selected} onChange={() => setMcqAnswers(p => ({ ...p, [key]: oIdx }))} />
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selected ? 'border-indigo-500' : 'border-gray-600'}`}>
                          {selected && <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full" />}
                        </div>
                        <span className="text-sm">{opt}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
            <div className="pb-8 text-center">
              <button onClick={handleMCQSubmit} disabled={mcqSubmitting}
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2 mx-auto">
                {mcqSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" />Evaluating…</> : 'Submit MCQs →'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Coding Phase */}
      {phase === 'coding' && prob && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Question Nav */}
          <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5 bg-white/[0.01] flex-shrink-0 overflow-x-auto">
            {codingQs.map((_: any, i: number) => {
              const qId = codingQs[i]._id;
              const done = !!(codingAnswers[qId]?.trim());
              return (
                <button key={i} onClick={() => { setCurrentQ(i); setRunResult(null); }}
                  className={`flex-shrink-0 w-9 h-9 rounded-lg text-sm font-bold transition-all ${i === currentQ ? 'bg-indigo-600 text-white' : done ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                  {i + 1}
                </button>
              );
            })}
          </div>

          {/* Split: Problem | Editor */}
          <div className="flex-1 flex overflow-hidden">
            {/* Problem Panel */}
            <div className="w-2/5 flex-shrink-0 overflow-y-auto border-r border-white/5 p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold">{currentQ + 1}. {prob.title}</h3>
                <span className={`text-xs px-2 py-0.5 rounded font-bold ${prob.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' : prob.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                  {prob.difficulty}
                </span>
              </div>
              <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed mb-4">{prob.description}</p>
              {prob.examples?.length > 0 && (
                <div className="space-y-2 mb-4">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Examples</p>
                  {prob.examples.map((ex: any, i: number) => (
                    <div key={i} className="bg-black/30 rounded-lg p-3 text-xs font-mono">
                      <p className="text-gray-400">Input: <span className="text-white">{ex.input}</span></p>
                      <p className="text-gray-400">Output: <span className="text-white">{ex.output}</span></p>
                      {ex.explanation && <p className="text-gray-500 mt-1">{ex.explanation}</p>}
                    </div>
                  ))}
                </div>
              )}
              {prob.constraints && (
                <div className="text-xs text-gray-500 border-t border-white/5 pt-3">
                  <p className="font-bold text-gray-400 mb-1">Constraints:</p>
                  <p className="whitespace-pre-wrap">{prob.constraints}</p>
                </div>
              )}
              {prob.hints?.length > 0 && (
                <details className="mt-4">
                  <summary className="text-xs text-indigo-400 cursor-pointer">💡 Show Hints</summary>
                  <ul className="mt-2 space-y-1">
                    {prob.hints.map((h: string, i: number) => <li key={i} className="text-xs text-gray-400">• {h}</li>)}
                  </ul>
                </details>
              )}
            </div>

            {/* Editor Panel */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Editor Toolbar */}
              <div className="flex items-center justify-between px-3 py-2 bg-[#0d1117] border-b border-white/5 flex-shrink-0">
                <span className="text-xs text-gray-400 font-mono capitalize">{language}</span>
                <button onClick={handleRunCode} disabled={running}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 text-green-400 text-xs font-bold rounded-lg transition-all disabled:opacity-50">
                  {running ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                  {running ? 'Running…' : 'Run Code'}
                </button>
              </div>

              <div className="flex-1 overflow-hidden">
                <Editor
                  height="100%"
                  language={language === 'c' ? 'cpp' : language}
                  theme="vs-dark"
                  value={codingAnswers[prob._id] || (language === 'python' ? `# Write your python solution here\n` : `// Write your ${language} solution here\n`)}
                  onChange={val => setCodingAnswers(p => ({ ...p, [prob._id]: val || '' }))}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    padding: { top: 16 },
                    scrollBeyondLastLine: false,
                    wordWrap: 'on',
                    readOnly: false,
                  }}
                  onMount={(editor, monaco) => {
                    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyV, () => {
                      toast.warning('Paste disabled during exam', { duration: 1500 });
                    });
                    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyC, () => {
                      toast.warning('Copy disabled during exam', { duration: 1500 });
                    });
                    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyX, () => {
                      toast.warning('Cut disabled during exam', { duration: 1500 });
                    });
                  }}
                />
              </div>

              {/* Run Results */}
              {runResult && (
                <div className="flex-shrink-0 border-t border-white/5 bg-[#0d1117] overflow-y-auto" style={{ maxHeight: '220px' }}>
                  <div className="px-3 py-2 flex items-center gap-2 border-b border-white/5">
                    <span className="text-xs font-bold text-gray-300">Test Results</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${runResult.passedCount === runResult.totalCount ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {runResult.passedCount}/{runResult.totalCount} passed
                    </span>
                  </div>
                  <div className="p-3 space-y-2">
                    {runResult.results?.map((r: any, i: number) => (
                      <div key={i} className={`p-3 rounded-lg border text-xs ${r.passed ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          {r.passed ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> : <XCircle className="w-3.5 h-3.5 text-red-400" />}
                          <span className="font-bold">Test {r.testCase}</span>
                        </div>
                        <div className="font-mono text-gray-400 space-y-0.5">
                          <p>Input: <span className="text-white">{r.input?.slice(0, 60)}</span></p>
                          <p>Expected: <span className="text-green-300">{r.expectedOutput}</span></p>
                          <p>Got: <span className={r.passed ? 'text-green-300' : 'text-red-300'}>{r.actualOutput || r.error?.slice(0, 80)}</span></p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Nav */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/5 bg-[#050818] flex-shrink-0">
            <button onClick={() => { setCurrentQ(p => Math.max(0, p - 1)); setRunResult(null); }} disabled={currentQ === 0}
              className="flex items-center gap-1.5 px-4 py-2 bg-white/5 hover:bg-white/10 text-sm font-semibold rounded-lg disabled:opacity-30 transition-colors">
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <span className="text-xs text-gray-500">
              {Object.values(codingAnswers).filter((v: any) => v?.trim()).length}/{codingQs.length} answered
            </span>
            {currentQ < codingQs.length - 1 ? (
              <button onClick={() => { setCurrentQ(p => p + 1); setRunResult(null); }}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-sm font-bold rounded-lg transition-colors">
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={() => doSubmit()} disabled={submitting}
                className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-500 text-sm font-bold rounded-lg transition-colors disabled:opacity-50">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : '✓ Submit Exam'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
