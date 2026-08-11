import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Link } from 'react-router';
import { aiAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Brain, Map, BookOpen, Target, TrendingUp, ArrowRight,
  Loader2, ChevronRight, Zap, Star, AlertTriangle, Trophy
} from 'lucide-react';

const diffColor: Record<string, string> = {
  Easy: 'text-green-600 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
  Medium: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
  Hard: 'text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
};

const priorityColor: Record<string, string> = {
  high: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400',
  medium: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400',
  low: 'bg-white/5 text-gray-300',
};

export default function RecommendationsPage() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    aiAPI.getRecommendations()
      .then((d: any) => setData(d.recommendations))
      .catch((e: any) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-[#050818] text-white flex items-center justify-center">
      <Navbar />
      <div className="text-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto mb-3" />
        <p className="text-gray-400">Analyzing your performance…</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050818] text-white p-6 relative">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Brain className="w-8 h-8 text-indigo-600" />
            AI Learning Recommendations
          </h1>
          <p className="text-gray-400 mt-1">
            Personalized roadmap based on your coding performance and activity
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />{error}
          </div>
        )}

        {data && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <StatCard icon={Target} label="Weak Areas" value={data.weakAreas?.length || 0} desc="Topics needing focus" color="text-red-600 bg-red-100 dark:bg-red-900/30" />
              <StatCard icon={BookOpen} label="Recommended Problems" value={data.recommendedProblems?.length || 0} desc="Curated for you" color="text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30" />
              <StatCard icon={Map} label="Roadmap Phases" value={data.roadmap?.length || 0} desc="Steps to excellence" color="text-green-600 bg-green-100 dark:bg-green-900/30" />
            </div>

            {/* Weak Areas */}
            {data.weakAreas?.length > 0 && (
              <div className="bg-white/[0.03] rounded-2xl border border-white/10 p-6">
                <h2 className="font-bold text-white mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-500" /> Areas Needing Improvement
                </h2>
                <div className="flex flex-wrap gap-2">
                  {data.weakAreas.map((area: string) => (
                    <span key={area} className="px-3 py-1.5 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800 rounded-full text-sm font-medium">
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Category Stats */}
            {data.stats && Object.keys(data.stats).length > 0 && (
              <div className="bg-white/[0.03] rounded-2xl border border-white/10 p-6">
                <h2 className="font-bold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-600" /> Performance by Category
                </h2>
                <div className="space-y-3">
                  {Object.entries(data.stats).map(([cat, stats]: any) => {
                    const rate = stats.total > 0 ? Math.round((stats.passed / stats.total) * 100) : 0;
                    return (
                      <div key={cat}>
                        <div className="flex justify-between items-center text-sm mb-1">
                          <span className="text-gray-200 font-medium">{cat}</span>
                          <span className="text-gray-400">{stats.passed}/{stats.total} ({rate}%)</span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${rate >= 70 ? 'bg-green-500' : rate >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${rate}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recommended Problems */}
            {data.recommendedProblems?.length > 0 && (
              <div className="bg-white/[0.03] rounded-2xl border border-white/10 p-6">
                <h2 className="font-bold text-white mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-indigo-600" /> Recommended Problems for You
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {data.recommendedProblems.map((problem: any) => (
                    <Link
                      key={problem._id}
                      to={`/problems/${problem.slug}`}
                      className="flex items-center justify-between p-4 bg-gray-50 bg-white/5 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors group border border-gray-100 dark:border-gray-700 hover:border-indigo-300"
                    >
                      <div>
                        <p className="font-medium text-white text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{problem.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${diffColor[problem.difficulty]}`}>{problem.difficulty}</span>
                          <span className="text-xs text-gray-400">{problem.category}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">+{problem.points}pts</span>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Learning Roadmap */}
            {data.roadmap?.length > 0 && (
              <div className="bg-white/[0.03] rounded-2xl border border-white/10 p-6">
                <h2 className="font-bold text-white mb-6 flex items-center gap-2">
                  <Map className="w-5 h-5 text-indigo-600" /> Your Learning Roadmap
                </h2>
                <div className="relative">
                  {/* Vertical line */}
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-indigo-200 dark:bg-indigo-900/50" />
                  <div className="space-y-6">
                    {data.roadmap.map((phase: any, i: number) => (
                      <div key={i} className="relative flex gap-6 pl-12">
                        {/* Circle */}
                        <div className="absolute left-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md shadow-indigo-300 dark:shadow-indigo-900 flex-shrink-0">
                          {i + 1}
                        </div>
                        <div className="flex-1 bg-gray-50 bg-white/5 rounded-xl p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-white">{phase.phase}</h3>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColor[phase.priority]}`}>
                                {phase.priority} priority
                              </span>
                              <span className="text-xs text-gray-400 bg-white/5 px-2 py-0.5 rounded-full">
                                {phase.duration}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {phase.topics.map((topic: string) => (
                              <span key={topic} className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 rounded-full">
                                {topic}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Topics to study */}
            {data.topicsToStudy?.length > 0 && (
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
                <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <Star className="w-5 h-5" /> Start Here Today
                </h2>
                <p className="text-indigo-200 text-sm mb-4">Focus on these topics for maximum improvement:</p>
                <div className="flex flex-wrap gap-2">
                  {data.topicsToStudy.map((topic: string) => (
                    <span key={topic} className="px-3 py-1.5 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm">
                      {topic}
                    </span>
                  ))}
                </div>
                <Link to="/problems" className="mt-4 inline-flex items-center gap-2 bg-white text-indigo-600 px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-indigo-50 transition-colors">
                  Browse Problems <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        )}

        {!data && !loading && !error && (
          <div className="text-center py-16 bg-white/[0.03] rounded-2xl border border-white/10">
            <Brain className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Solve some problems first to get personalized recommendations!</p>
            <Link to="/problems" className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors">
              Start Practicing <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, desc, color }: any) {
  return (
    <div className="bg-white/[0.03] rounded-xl border border-white/10 p-5 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${color}`}><Icon className="w-5 h-5" /></div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-sm font-medium text-gray-200">{label}</p>
        <p className="text-xs text-gray-400">{desc}</p>
      </div>
    </div>
  );
}
