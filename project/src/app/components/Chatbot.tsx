import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { aiAPI } from '../services/api';

// Simple markdown renderer for chatbot messages
function renderMarkdown(text: string) {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code block
    if (line.trim().startsWith('```')) {
      const lang = line.trim().slice(3);
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(
        <pre key={i} className="bg-black/60 border border-white/10 rounded-lg p-3 my-2 overflow-x-auto text-xs text-green-300 font-mono whitespace-pre-wrap">
          {lang && <span className="text-gray-500 text-[10px] block mb-1">{lang}</span>}
          {codeLines.join('\n')}
        </pre>
      );
      i++;
      continue;
    }

    // Table
    if (line.includes('|') && lines[i + 1]?.includes('---')) {
      const headers = line.split('|').filter(Boolean).map(h => h.trim());
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].includes('|')) {
        rows.push(lines[i].split('|').filter(Boolean).map(c => c.trim()));
        i++;
      }
      elements.push(
        <div key={i} className="overflow-x-auto my-2">
          <table className="text-xs w-full border-collapse">
            <thead>
              <tr>{headers.map((h, j) => <th key={j} className="px-2 py-1 bg-white/10 border border-white/10 text-left text-indigo-300">{h}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri}>{row.map((cell, ci) => <td key={ci} className="px-2 py-1 border border-white/5 text-gray-300">{cell}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // Headings
    if (line.startsWith('## ')) {
      elements.push(<p key={i} className="font-bold text-indigo-300 text-sm mt-2 mb-1">{inlineMarkdown(line.slice(3))}</p>);
    } else if (line.startsWith('# ')) {
      elements.push(<p key={i} className="font-black text-white text-sm mt-2 mb-1">{inlineMarkdown(line.slice(2))}</p>);
    } else if (line.startsWith('- ') || line.startsWith('• ')) {
      elements.push(<li key={i} className="ml-3 text-gray-200 list-disc list-inside text-sm">{inlineMarkdown(line.slice(2))}</li>);
    } else if (/^\d+\. /.test(line)) {
      elements.push(<li key={i} className="ml-3 text-gray-200 list-decimal list-inside text-sm">{inlineMarkdown(line.replace(/^\d+\. /, ''))}</li>);
    } else if (line.trim() === '') {
      elements.push(<div key={i} className="h-1" />);
    } else {
      elements.push(<p key={i} className="text-gray-200 text-sm">{inlineMarkdown(line)}</p>);
    }
    i++;
  }
  return <div className="space-y-0.5 leading-relaxed">{elements}</div>;
}

function inlineMarkdown(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-white font-bold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} className="bg-black/40 text-green-300 px-1 rounded text-xs font-mono">{part.slice(1, -1)}</code>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={i} className="text-indigo-300 italic">{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    {
      role: 'bot',
      text: "Hi! I'm your **CodeLearn AI Assistant** 🤖\n\nAsk me about any coding concept:\n- Data Structures (arrays, trees, graphs)\n- Algorithms (sorting, binary search, DP)\n- Big O complexity\n- Python / JavaScript basics\n\nWhat would you like to learn?"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const context = `User is currently on path: ${window.location.pathname}`;
      const res = await aiAPI.chat(userMessage, context);
      setMessages(prev => [...prev, { role: 'bot', text: res.reply }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'bot',
        text: "Sorry, I'm having trouble connecting right now. Make sure the backend server is running on port 5000."
      }]);
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = ['Binary Search', 'Dynamic Programming', 'Graph BFS DFS', 'Big O complexity'];

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center z-50 ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Chat Window */}
      <div
        className={`fixed bottom-6 right-6 w-80 md:w-[420px] bg-[#0a0d20] border border-indigo-500/30 rounded-2xl shadow-2xl flex flex-col z-50 transition-all duration-300 transform origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}
        style={{ maxHeight: '85vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-indigo-900/50 to-purple-900/50 rounded-t-2xl flex-shrink-0">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-white">CodeLearn AI</h3>
            <span className="text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full">Online</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-indigo-600' : 'bg-gray-800 border border-white/10'}`}>
                {msg.role === 'user'
                  ? <User className="w-4 h-4 text-white" />
                  : <Bot className="w-4 h-4 text-indigo-400" />}
              </div>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${msg.role === 'user'
                ? 'bg-indigo-600 text-white rounded-tr-none text-sm'
                : 'bg-white/5 text-gray-200 border border-white/5 rounded-tl-none'
              }`}>
                {msg.role === 'bot' ? renderMarkdown(msg.text) : msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-800 border border-white/10 flex items-center justify-center">
                <Bot className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="bg-white/5 border border-white/5 rounded-2xl rounded-tl-none px-4 py-3">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Quick suggestions (only on first message) */}
        {messages.length === 1 && (
          <div className="px-4 pb-2 flex flex-wrap gap-1.5 flex-shrink-0">
            {quickQuestions.map(q => (
              <button key={q} onClick={() => setInput(q)}
                className="text-xs px-2.5 py-1 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 rounded-full transition-colors">
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-white/10 bg-white/[0.02] rounded-b-2xl flex-shrink-0">
          <form onSubmit={handleSend} className="relative">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about any coding concept..."
              className="w-full bg-black/50 border border-white/10 rounded-full pl-4 pr-12 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="absolute right-1 top-1 w-8 h-8 rounded-full bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center text-white disabled:opacity-50 transition-colors"
            >
              <Send className="w-3 h-3" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
