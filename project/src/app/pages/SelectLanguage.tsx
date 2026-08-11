import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { languages } from '../data/mockData';

interface LanguageProgress {
  language: string;
  currentLevel: number;
  levelsCompleted: number;
  progressPercentage: number;
}

export default function SelectLanguage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, refreshProgress } = useAuth();
  const [languageProgress, setLanguageProgress] = useState<Record<string, LanguageProgress>>({});

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Load progress for both languages
    if (user) {
      const javaProgress = localStorage.getItem('progress_java');
      const pythonProgress = localStorage.getItem('progress_python');
      
      const progressData: Record<string, LanguageProgress> = {};
      
      if (javaProgress) {
        const jp = JSON.parse(javaProgress);
        if (jp.userId === user.id) {
          progressData.java = {
            language: 'java',
            currentLevel: jp.currentLevel,
            levelsCompleted: jp.levelsCompleted.length,
            progressPercentage: jp.progressPercentage
          };
        }
      }
      
      if (pythonProgress) {
        const pp = JSON.parse(pythonProgress);
        if (pp.userId === user.id) {
          progressData.python = {
            language: 'python',
            currentLevel: pp.currentLevel,
            levelsCompleted: pp.levelsCompleted.length,
            progressPercentage: pp.progressPercentage
          };
        }
      }
      
      setLanguageProgress(progressData);
    }
  }, [isAuthenticated, user, navigate]);

  const handleSelectLanguage = async (languageId: string) => {
    if (user) {
      const progressStr = localStorage.getItem(`progress_${languageId}`);
      if (!progressStr) {
        // Create initial progress
        const initialProgress = {
          userId: user.id,
          language: languageId,
          currentLevel: 1,
          levelsCompleted: [],
          scores: [],
          timeSpent: 0,
          progressPercentage: 0
        };
        localStorage.setItem(`progress_${languageId}`, JSON.stringify(initialProgress));
      }
    }
    await refreshProgress(languageId);
    navigate('/levels');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Language
          </h1>
          <p className="text-xl text-gray-600">
            Select a programming language to start or continue your learning journey
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {languages.map((language) => {
            const progress = languageProgress[language.id];
            const hasProgress = !!progress;
            
            return (
              <div
                key={language.id}
                onClick={() => handleSelectLanguage(language.id)}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer border-2 border-transparent hover:border-indigo-500 relative"
              >
                {hasProgress && (
                  <div className="absolute top-4 right-4 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                    In Progress
                  </div>
                )}
                
                <div className="text-6xl mb-4 text-center">{language.icon}</div>
                <h2 className="text-3xl font-bold text-center mb-4">
                  {language.name}
                </h2>
                
                {hasProgress ? (
                  <>
                    <div className="bg-indigo-50 rounded-lg p-4 mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Your Progress</span>
                        <span className="text-sm font-bold text-indigo-600">{progress.progressPercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                        <div
                          className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full"
                          style={{ width: `${progress.progressPercentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Level {progress.currentLevel}</span>
                        <span>{progress.levelsCompleted}/10 completed</span>
                      </div>
                    </div>
                    <button className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">
                      Continue Learning {language.name}
                    </button>
                  </>
                ) : (
                  <>
                    <div className="space-y-2 text-gray-600 mb-6">
                      <p>✓ 10 Structured Levels</p>
                      <p>✓ 100 MCQ Questions</p>
                      <p>✓ 150 Coding Challenges</p>
                      <p>✓ Real-time Code Execution</p>
                    </div>
                    <button className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">
                      Start Learning {language.name}
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}