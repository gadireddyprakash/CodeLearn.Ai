import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import Navbar from '../components/Navbar';
import { levelAPI } from '../services/api';
import { Lock, Unlock, Star, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function LevelMap() {
  const { language } = useParams<{ language: string }>();
  const navigate = useNavigate();
  const [levels, setLevels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!language) return;
    levelAPI.getLevels(language)
      .then(data => {
        setLevels(data.levels);
        setLoading(false);
      })
      .catch(console.error);
  }, [language]);

  if (loading) return <div className="min-h-screen bg-[#050818] text-white flex items-center justify-center">Loading levels...</div>;

  return (
    <div className="min-h-screen bg-[#050818] text-white overflow-hidden">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-12 relative">
        <h1 className="text-4xl font-black text-center mb-2 capitalize">{language} Journey</h1>
        <p className="text-center text-gray-400 mb-6">Complete levels sequentially to reach mastery.</p>

        {/* Track selector buttons */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {[
            { id: 'python', name: 'Python' },
            { id: 'javascript', name: 'JavaScript' },
            { id: 'java', name: 'Java' },
            { id: 'cpp', name: 'C++' }
          ].map(l => (
            <button
              key={l.id}
              onClick={() => navigate(`/levels/${l.id}`)}
              className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                language === l.id
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {l.name}
            </button>
          ))}
        </div>

        <div className="relative space-y-8 pl-8 md:pl-0">
          {/* Vertical Path Line (Mobile) */}
          <div className="absolute left-12 top-0 bottom-0 w-1 bg-white/10 md:hidden" />
          
          {levels.map((level, idx) => {
            const isUnlocked = level.isUnlocked;
            const isLeft = idx % 2 === 0;

            return (
              <motion.div 
                key={level.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`relative flex md:items-center ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8`}
              >
                {/* Desktop Path Line Segment */}
                <div className="hidden md:block absolute left-1/2 top-1/2 bottom-[-4rem] w-1 bg-white/10 -translate-x-1/2" 
                     style={{ display: idx === levels.length - 1 ? 'none' : 'block' }} />

                <div className="flex-1 hidden md:block" />

                <div className={`z-10 flex items-center justify-center w-16 h-16 rounded-full shrink-0 shadow-[0_0_30px_rgba(0,0,0,0.3)]
                  ${isUnlocked ? 'bg-gradient-to-r from-indigo-500 to-violet-500 border-4 border-indigo-300' : 'bg-gray-800 border-4 border-gray-700'}`}>
                  {isUnlocked ? <Unlock className="w-6 h-6 text-white" /> : <Lock className="w-6 h-6 text-gray-500" />}
                </div>

                <div className={`flex-1 w-full max-w-sm ${isLeft ? 'md:text-right' : 'md:text-left'}`}>
                  <div 
                    onClick={() => isUnlocked && navigate(`/levels/${language}/${level.levelNumber}/concept`)}
                    className={`p-6 rounded-2xl border transition-all ${isUnlocked ? 'bg-white/[0.05] border-white/10 hover:border-indigo-500 hover:bg-white/[0.08] cursor-pointer' : 'bg-white/[0.01] border-white/5 opacity-60 cursor-not-allowed'}`}
                  >
                    <div className={`flex items-center gap-2 mb-2 ${isLeft ? 'md:justify-end' : 'md:justify-start'}`}>
                      <span className="text-xs font-bold px-2 py-1 bg-white/10 rounded uppercase text-indigo-300">Level {level.levelNumber}</span>
                      {level.score > 0 && <span className="text-xs font-bold text-amber-400 flex items-center"><Star className="w-3 h-3 mr-1" />{level.score} pts</span>}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{level.title}</h3>
                    <div className={`flex items-center gap-1 text-sm font-medium ${isUnlocked ? 'text-indigo-400' : 'text-gray-500'} ${isLeft ? 'md:justify-end' : 'md:justify-start'}`}>
                      {isUnlocked ? <>Start Level <ArrowRight className="w-4 h-4" /></> : 'Locked'}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
