import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { mockLevels } from '../data/mockData';
import { Lock, CheckCircle, PlayCircle, Code } from 'lucide-react';

export default function Levels() {
  const navigate = useNavigate();
  const { isAuthenticated, userProgress } = useAuth();
  const [levels, setLevels] = useState(mockLevels);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!userProgress) {
      navigate('/select-language');
      return;
    }

    // Update level locked status and titles based on user progress and language
    const updatedLevels = mockLevels.map((level) => {
      // Customize title and description based on language
      const isPython = userProgress.language === 'python';
      let title = level.title;
      let description = level.description;
      
      if (isPython) {
        // Replace Java with Python in titles and descriptions
        title = title.replace('Java', 'Python');
        description = description.replace('Java', 'Python').replace('java', 'python');
      }
      
      return {
        ...level,
        title,
        description,
        isLocked:
          level.id > 1 &&
          !userProgress.levelsCompleted.includes(level.id - 1),
      };
    });
    setLevels(updatedLevels);
  }, [isAuthenticated, userProgress, navigate]);

  const handleLevelClick = (level: typeof mockLevels[0]) => {
    if (level.isLocked) return;
    navigate(`/level/${level.id}`);
  };

  const getLevelStatus = (levelId: number) => {
    if (!userProgress) return 'locked';
    if (userProgress.levelsCompleted.includes(levelId)) return 'completed';
    if (levelId === userProgress.currentLevel) return 'current';
    return 'locked';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Code className="w-8 h-8 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900">Code-UI</h1>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            ← Dashboard
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {userProgress?.language === 'java' ? 'Java' : 'Python'} Course
          </h2>
          <p className="text-gray-600">
            Complete all 10 levels to master {userProgress?.language === 'java' ? 'Java' : 'Python'} programming
          </p>
        </div>

        {/* Progress Overview */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Course Progress</h3>
            <span className="text-sm text-gray-600">
              {userProgress?.levelsCompleted.length || 0} / 10 Levels Completed
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
              style={{
                width: `${((userProgress?.levelsCompleted.length || 0) / 10) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Levels Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {levels.map((level) => {
            const status = getLevelStatus(level.id);
            const isLocked = status === 'locked';
            const isCompleted = status === 'completed';
            const isCurrent = status === 'current';

            return (
              <div
                key={level.id}
                onClick={() => handleLevelClick(level)}
                className={`
                  relative bg-white p-6 rounded-xl shadow-sm border-2 transition-all
                  ${isLocked ? 'border-gray-200 opacity-60 cursor-not-allowed' : 'border-gray-200 hover:border-indigo-500 hover:shadow-md cursor-pointer'}
                  ${isCurrent ? 'border-indigo-500 ring-2 ring-indigo-200' : ''}
                  ${isCompleted ? 'border-green-500' : ''}
                `}
              >
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  {isLocked && <Lock className="w-6 h-6 text-gray-400" />}
                  {isCompleted && <CheckCircle className="w-6 h-6 text-green-500" />}
                  {isCurrent && <PlayCircle className="w-6 h-6 text-indigo-600" />}
                </div>

                <div className="mb-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-3">
                    <span className="text-xl font-bold text-indigo-600">
                      {level.id}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {level.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {level.description}
                  </p>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <p>📝 10 MCQ Questions</p>
                  <p>💻 15 Coding Problems</p>
                  <p>🎯 Min Score: 60%</p>
                </div>

                {isCompleted && userProgress && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Your Score:</span>
                      <span className="font-bold text-green-600">
                        {userProgress.scores.find((s) => s.level === level.id)?.totalScore}%
                      </span>
                    </div>
                  </div>
                )}

                {isCurrent && (
                  <div className="mt-4">
                    <div className="bg-indigo-50 text-indigo-700 px-3 py-2 rounded-lg text-sm font-medium text-center">
                      Current Level
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}