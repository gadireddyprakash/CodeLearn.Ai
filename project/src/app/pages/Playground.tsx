import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { codeAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router';
import { Play, RotateCcw, Copy, Check, Terminal, Clock, Cpu } from 'lucide-react';

const LANGUAGES = [
  { id: 'python', label: 'Python 3', defaultCode: '# Python Playground\nprint("Hello, World!")\n' },
  { id: 'javascript', label: 'JavaScript', defaultCode: '// JavaScript Playground\nconsole.log("Hello, World!");\n' },
  { id: 'cpp', label: 'C++', defaultCode: '#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n  cout << "Hello, World!" << endl;\n  return 0;\n}\n' },
  { id: 'java', label: 'Java', defaultCode: 'import java.util.*;\npublic class Solution {\n  public static void main(String[] args) {\n    System.out.println("Hello, World!");\n  }\n}\n' },
  { id: 'c', label: 'C', defaultCode: '#include <stdio.h>\nint main() {\n  printf("Hello, World!\\n");\n  return 0;\n}\n' },
  { id: 'go', label: 'Go', defaultCode: 'package main\nimport "fmt"\nfunc main() {\n  fmt.Println("Hello, World!")\n}\n' },
  { id: 'rust', label: 'Rust', defaultCode: 'fn main() {\n  println!("Hello, World!");\n}\n' },
];

export default function PlaygroundPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [lang, setLang] = useState(LANGUAGES[0]);
  const [code, setCode] = useState(LANGUAGES[0].defaultCode);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState<any>(null);
  const [running, setRunning] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleLangChange = (langId: string) => {
    const selected = LANGUAGES.find(l => l.id === langId)!;
    setLang(selected);
    setCode(selected.defaultCode);
    setOutput(null);
  };

  const handleRun = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setRunning(true);
    setOutput(null);
    try {
      const result = await codeAPI.run({ code, language: lang.id, input });
      setOutput(result);
    } catch (e: any) {
      setOutput({ error: e.message, status: 'Error' });
    } finally {
      setRunning(false);
    }
  };

  const handleReset = () => { setCode(lang.defaultCode); setOutput(null); setInput(''); };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <Terminal className="w-5 h-5 text-indigo-400" />
          <h1 className="font-bold text-lg">Code Playground</h1>
          <select
            value={lang.id}
            onChange={e => handleLangChange(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500"
          >
            {LANGUAGES.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleCopy} className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors">
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button onClick={handleReset} className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors">
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
          <button
            onClick={handleRun}
            disabled={running}
            className="flex items-center gap-2 px-5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg text-sm font-semibold transition-colors"
          >
            <Play className="w-3.5 h-3.5" /> {running ? 'Running…' : 'Run Code'}
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 56px)' }}>
        {/* Editor */}
        <div className="flex-1 flex flex-col">
          <Editor
            height="100%"
            language={lang.id === 'cpp' ? 'cpp' : lang.id}
            value={code}
            onChange={v => setCode(v || '')}
            theme="vs-dark"
            options={{
              fontSize: 14,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              minimap: { enabled: true },
              scrollBeyondLastLine: false,
              lineNumbers: 'on',
              renderLineHighlight: 'all',
              tabSize: 2,
              wordWrap: 'on',
              padding: { top: 16 },
              bracketPairColorization: { enabled: true },
              autoIndent: 'full',
            }}
          />
        </div>

        {/* Right panel: Input + Output */}
        <div className="w-80 flex flex-col border-l border-gray-800">
          {/* Input */}
          <div className="flex-shrink-0 border-b border-gray-800">
            <div className="px-4 py-2 bg-gray-900 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              stdin (input)
            </div>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Enter input here..."
              className="w-full bg-gray-950 text-sm text-gray-200 font-mono p-4 resize-none focus:outline-none"
              style={{ height: '180px' }}
            />
          </div>

          {/* Output */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="px-4 py-2 bg-gray-900 border-b border-gray-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Output</span>
              {output && (
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  {output.executionTime != null && (
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{output.executionTime}ms</span>
                  )}
                  {output.memoryUsed != null && (
                    <span className="flex items-center gap-1"><Cpu className="w-3 h-3" />{output.memoryUsed}KB</span>
                  )}
                </div>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {running && (
                <div className="flex items-center gap-3 text-gray-400">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-500" />
                  <span className="text-sm">Executing code…</span>
                </div>
              )}
              {!running && !output && (
                <p className="text-gray-600 text-sm">Run your code to see output here.</p>
              )}
              {!running && output && (
                <div>
                  <div className={`text-xs font-bold mb-2 px-2 py-1 rounded inline-block ${
                    output.error ? 'bg-red-900/30 text-red-400' : 'bg-green-900/30 text-green-400'
                  }`}>
                    {output.status || (output.error ? 'Error' : 'Success')}
                  </div>
                  {output.error ? (
                    <pre className="text-red-400 text-sm whitespace-pre-wrap font-mono leading-relaxed">{output.error}</pre>
                  ) : (
                    <pre className="text-gray-100 text-sm whitespace-pre-wrap font-mono leading-relaxed">{output.output || '(no output)'}</pre>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
