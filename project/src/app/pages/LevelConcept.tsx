import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import Navbar from '../components/Navbar';
import { levelAPI } from '../services/api';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, PlayCircle } from 'lucide-react';

export default function LevelConcept() {
  const { language, levelNumber } = useParams<{ language: string, levelNumber: string }>();
  const navigate = useNavigate();
  const [level, setLevel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [pages, setPages] = useState<string[]>([]);

  useEffect(() => {
    if (!language || !levelNumber) return;
    levelAPI.getLevelDetails(language, parseInt(levelNumber))
      .then(data => {
        setLevel(data.level);
        if (data.level && data.level.conceptText) {
          setPages(data.level.conceptText.split('---PAGE_BREAK---').map((p: string) => p.trim()));
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        navigate(`/levels/${language}`);
      });
  }, [language, levelNumber, navigate]);

  if (loading) return <div className="min-h-screen bg-[#050818] text-white flex items-center justify-center">Loading concept...</div>;
  if (!level) return null;

  return (
    <div className="min-h-screen bg-[#050818] text-white">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link to={`/levels/${language}`} className="inline-flex items-center text-indigo-400 hover:text-indigo-300 mb-6 font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Map
        </Link>
        
        <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
          
          <div className="mb-8 border-b border-white/10 pb-8">
            <span className="text-xs font-bold px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full uppercase tracking-wider mb-4 inline-block">
              Level {level.levelNumber} Concept
            </span>
            <h1 className="text-3xl md:text-5xl font-black text-white">{level.title}</h1>
          </div>

          <div className="prose prose-invert prose-indigo max-w-none prose-h3:text-indigo-300 prose-a:text-indigo-400 min-h-[300px]">
            <ReactMarkdown>{pages[currentPage] || level.conceptText}</ReactMarkdown>
          </div>

          {/* Related Video Tutorial */}
          {currentPage === pages.length - 1 && level.youtubeUrl && (
            <div className="mt-12 pt-8 border-t border-white/10">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                Video Tutorial: Recommended Watch
              </h3>
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-lg bg-[#0a0d20]">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={getYoutubeEmbedUrl(level.youtubeUrl)}
                  title={`YouTube video player for ${level.title}`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          )}

          <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex gap-4 w-full sm:w-auto">
               {currentPage > 0 && (
                 <button 
                   onClick={() => setCurrentPage(prev => prev - 1)}
                   className="flex-1 sm:flex-none px-6 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all"
                 >
                   Previous
                 </button>
               )}
               {currentPage < pages.length - 1 && (
                 <button 
                   onClick={() => setCurrentPage(prev => prev + 1)}
                   className="flex-1 sm:flex-none px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 transition-all"
                 >
                   Next Page
                 </button>
               )}
            </div>

            {currentPage === pages.length - 1 && (
              <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                <p className="text-gray-400 text-sm">
                  Read and understood the concept?
                  <br/>
                  <strong className="text-amber-400">Note: The test requires Focus Mode (No tab switching).</strong>
                </p>
                <button 
                  onClick={() => navigate(`/levels/${language}/${level.levelNumber}/test`)}
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-xl hover:shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all flex items-center justify-center gap-2"
                >
                  Start Level Test <PlayCircle className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const getYoutubeEmbedUrl = (url: string) => {
  if (!url) return '';
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11
    ? `https://www.youtube.com/embed/${match[2]}`
    : url;
};
