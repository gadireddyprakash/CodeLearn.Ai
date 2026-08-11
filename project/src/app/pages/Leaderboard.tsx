import { useAuth } from '../context/AuthContext';
import { Trophy, Clock, Target, TrendingUp, Medal, Award, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { UserStats } from '../types';
import { generateMockLeaderboard } from '../data/mockData';
import { usersAPI } from '../services/api';

export default function Leaderboard() {
  const { user, userProgress } = useAuth();
  const [leaderboard, setLeaderboard] = useState<UserStats[]>([]);
  const [currentUserStats, setCurrentUserStats] = useState<UserStats | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await usersAPI.getLeaderboard();
        if (res.success && res.leaderboard) {
          const apiLeaderboard = res.leaderboard.map((u: any) => ({
            userId: u.id,
            username: u.username,
            totalScore: u.score || 0,
            timeSpent: u.streak * 10, // Mock timeSpent based on streak for display
            levelsCompleted: u.problemsSolved || 0,
            rank: u.rank,
            progressPercentage: Math.min((u.problemsSolved / 10) * 100, 100) || 0
          }));
          
          setLeaderboard(apiLeaderboard);
          
          if (user) {
            const current = apiLeaderboard.find((u: any) => u.userId === user.id);
            if (current) setCurrentUserStats(current);
          }
        }
      } catch (error) {
        console.error("Failed to load leaderboard:", error);
      }
    };
    fetchLeaderboard();
  }, [user, userProgress]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Award className="w-6 h-6 text-amber-600" />;
    return <span className="text-lg font-bold text-gray-500">#{rank}</span>;
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    if (rank === 2) return 'bg-gray-100 text-gray-800 border-gray-300';
    if (rank === 3) return 'bg-amber-100 text-amber-800 border-amber-300';
    return 'bg-blue-50 text-blue-800 border-blue-200';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Trophy className="w-8 h-8 text-indigo-600" />
                Leaderboard
              </h1>
              <p className="text-gray-600 mt-1">See how you rank against other learners</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Current User Stats Card */}
        {currentUserStats && (
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-6 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm font-medium mb-1">Your Rank</p>
                <div className="flex items-center gap-3">
                  <div className="text-5xl font-bold">#{currentUserStats.rank}</div>
                  {currentUserStats.rank <= 10 && (
                    <Star className="w-8 h-8 text-yellow-300 fill-yellow-300" />
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Target className="w-5 h-5" />
                  </div>
                  <div className="text-2xl font-bold">{currentUserStats.totalScore}</div>
                  <p className="text-xs text-indigo-100">Avg Score</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div className="text-2xl font-bold">{currentUserStats.levelsCompleted}</div>
                  <p className="text-xs text-indigo-100">Levels Done</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="text-2xl font-bold">{currentUserStats.timeSpent}</div>
                  <p className="text-xs text-indigo-100">Minutes</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Top Performers
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Score
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Levels
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time Spent
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leaderboard.slice(0, 50).map((userStat, index) => (
                  <tr
                    key={userStat.userId}
                    className={`
                      hover:bg-gray-50 transition-colors
                      ${userStat.userId === user?.id ? 'bg-indigo-50 border-l-4 border-indigo-600' : ''}
                      ${index < 3 ? 'bg-gradient-to-r from-yellow-50 to-transparent' : ''}
                    `}
                  >
                    {/* Rank */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getRankIcon(userStat.rank)}
                      </div>
                    </td>

                    {/* Username */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold">
                          {userStat.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 flex items-center gap-2">
                            {userStat.username}
                            {userStat.userId === user?.id && (
                              <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                                You
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Total Score */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold border ${getRankBadgeColor(userStat.rank)}`}>
                        {userStat.totalScore} pts
                      </span>
                    </td>

                    {/* Levels Completed */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Target className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-gray-900">{userStat.levelsCompleted}/10</span>
                      </div>
                    </td>

                    {/* Time Spent */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span className="text-gray-700">{userStat.timeSpent} min</span>
                      </div>
                    </td>

                    {/* Progress */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${userStat.progressPercentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600 font-medium">
                          {userStat.progressPercentage}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Motivational Message */}
        <div className="mt-8 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-xl p-6 border border-purple-200">
          <div className="flex items-start gap-4">
            <Star className="w-8 h-8 text-purple-600 flex-shrink-0 fill-purple-600" />
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Keep Learning!</h3>
              <p className="text-gray-700">
                {currentUserStats && currentUserStats.rank <= 10
                  ? "🎉 Amazing work! You're in the top 10. Keep up the excellent progress!"
                  : currentUserStats && currentUserStats.rank <= 50
                  ? "💪 You're doing great! Complete more levels to climb the leaderboard."
                  : "🚀 Start completing levels to improve your rank and compete with other learners!"}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}