import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { usersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Trophy, Medal, Flame, TrendingUp, Star, Crown } from 'lucide-react';

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    usersAPI.getLeaderboard()
      .then((d: any) => setLeaders(d.leaderboard || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const myRank = leaders.findIndex(l => l.username === user?.username) + 1;

  const medalColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-500';
    if (rank === 2) return 'text-gray-400';
    if (rank === 3) return 'text-amber-600';
    return 'text-gray-300 dark:text-gray-600';
  };

  return (
    <div className="min-h-screen bg-[#050818] text-white p-6 relative">
      <Navbar />
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
              <Trophy className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white">Leaderboard</h1>
          <p className="text-gray-400 mt-1">Top coders ranked by score</p>
        </div>

        {/* My rank */}
        {myRank > 0 && (
          <div className="mb-6 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Star className="w-5 h-5 text-indigo-600" />
              <span className="font-semibold text-indigo-800 dark:text-indigo-200">Your Rank</span>
            </div>
            <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">#{myRank}</span>
          </div>
        )}

        {/* Top 3 podium */}
        {!loading && leaders.length >= 3 && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            {/* 2nd */}
            <PodiumCard user={leaders[1]} rank={2} className="mt-6" />
            {/* 1st */}
            <PodiumCard user={leaders[0]} rank={1} className="" featured />
            {/* 3rd */}
            <PodiumCard user={leaders[2]} rank={3} className="mt-10" />
          </div>
        )}

        {/* Full list */}
        <div className="bg-white/[0.03] rounded-2xl border border-white/10 overflow-hidden">
          <div className="grid grid-cols-12 gap-2 px-5 py-3 bg-gray-50 bg-white/5 border-b border-gray-100 dark:border-gray-700">
            <div className="col-span-1 text-xs font-semibold text-gray-400 uppercase">Rank</div>
            <div className="col-span-5 text-xs font-semibold text-gray-400 uppercase">User</div>
            <div className="col-span-2 text-xs font-semibold text-gray-400 uppercase text-center">Solved</div>
            <div className="col-span-2 text-xs font-semibold text-gray-400 uppercase text-center">Streak</div>
            <div className="col-span-2 text-xs font-semibold text-gray-400 uppercase text-right">Score</div>
          </div>
          {loading ? (
            <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" /></div>
          ) : leaders.length === 0 ? (
            <div className="text-center py-16 text-gray-400">No data yet. Be the first to solve problems!</div>
          ) : (
            leaders.map((leader, idx) => {
              const isMe = leader.username === user?.username;
              return (
                <div key={leader.id} className={`grid grid-cols-12 gap-2 px-5 py-3.5 items-center border-b border-gray-50 dark:border-gray-700/50 last:border-b-0 ${isMe ? 'bg-indigo-50 dark:bg-indigo-900/10' : idx % 2 === 0 ? '' : 'bg-gray-50/50 bg-white/[0.02]'}`}>
                  <div className="col-span-1 flex items-center gap-1">
                    <Medal className={`w-5 h-5 ${medalColor(leader.rank)}`} />
                    <span className={`text-sm font-bold ${leader.rank <= 3 ? 'text-white' : 'text-gray-400'}`}>{leader.rank}</span>
                  </div>
                  <div className="col-span-5 flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${isMe ? 'bg-indigo-600 text-white' : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'}`}>
                      {leader.username?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <span className={`font-medium text-sm ${isMe ? 'text-indigo-600 dark:text-indigo-400' : 'text-white'}`}>{leader.username}</span>
                      {isMe && <span className="ml-2 text-xs text-indigo-500 font-medium">(you)</span>}
                    </div>
                  </div>
                  <div className="col-span-2 text-center text-sm text-gray-300 font-medium">{leader.problemsSolved}</div>
                  <div className="col-span-2 text-center">
                    <span className="flex items-center justify-center gap-1 text-sm text-orange-500">
                      <Flame className="w-3.5 h-3.5" />{leader.streak}
                    </span>
                  </div>
                  <div className="col-span-2 text-right text-sm font-bold text-indigo-600 dark:text-indigo-400">{leader.score}</div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function PodiumCard({ user, rank, className, featured }: { user: any; rank: number; className?: string; featured?: boolean }) {
  const colors = { 1: 'from-yellow-400 to-amber-500', 2: 'from-gray-300 to-gray-400', 3: 'from-amber-600 to-orange-600' };
  const icons = { 1: <Crown className="w-6 h-6 text-white" />, 2: <Medal className="w-5 h-5 text-white" />, 3: <Medal className="w-5 h-5 text-white" /> };
  return (
    <div className={`${className} flex flex-col items-center`}>
      <div className={`relative w-14 h-14 rounded-full bg-gradient-to-br ${colors[rank as keyof typeof colors]} flex items-center justify-center shadow-lg mb-2`}>
        <span className="text-xl font-bold text-white">{user?.username?.[0]?.toUpperCase()}</span>
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-white/[0.03] rounded-full flex items-center justify-center shadow-sm">
          {icons[rank as keyof typeof icons]}
        </div>
      </div>
      <p className="text-sm font-semibold text-white truncate max-w-[90px]">{user?.username}</p>
      <p className="text-xs text-gray-400 mb-1">{user?.problemsSolved} solved</p>
      <div className={`w-full rounded-t-xl bg-gradient-to-b ${colors[rank as keyof typeof colors]} flex items-end justify-center py-3 ${rank === 1 ? 'h-20' : rank === 2 ? 'h-14' : 'h-10'}`}>
        <span className="font-bold text-white text-sm">{user?.score}</span>
      </div>
    </div>
  );
}
