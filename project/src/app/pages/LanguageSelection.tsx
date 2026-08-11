import { useNavigate } from 'react-router';
import Navbar from '../components/Navbar';
import { motion } from 'motion/react';
import { Code2, Terminal } from 'lucide-react';

const languages = [
  { id: 'python', name: 'Python', icon: Terminal, color: 'from-blue-500 to-yellow-500' },
  { id: 'javascript', name: 'JavaScript', icon: Code2, color: 'from-yellow-400 to-yellow-600' },
  { id: 'java', name: 'Java', icon: Terminal, color: 'from-red-500 to-orange-500' },
  { id: 'cpp', name: 'C++', icon: Code2, color: 'from-blue-600 to-blue-800' },
];

export default function LanguageSelection() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#050818] text-white">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black mb-4">Choose Your Language Track</h1>
          <p className="text-gray-400">Master programming through our 10-level structured curriculum.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {languages.map((lang, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={lang.id}
              onClick={() => navigate(`/levels/${lang.id}`)}
              className="cursor-pointer group relative bg-white/[0.02] border border-white/10 p-6 rounded-2xl hover:bg-white/[0.05] transition-all overflow-hidden"
            >
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-br ${lang.color} transition-opacity`} />
              <div className={`w-14 h-14 rounded-xl mb-4 flex items-center justify-center bg-gradient-to-br ${lang.color}`}>
                <lang.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{lang.name}</h3>
              <p className="text-sm text-gray-500">10 Levels to Mastery</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
