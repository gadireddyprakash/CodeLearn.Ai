import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { mockLevels } from '../data/mockData';
import { BookOpen, Code as CodeIcon, ArrowRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function LevelDetail() {
  const { levelId } = useParams<{ levelId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, userProgress } = useAuth();
  const [level, setLevel] = useState(mockLevels.find((l) => l.id === Number(levelId)));
  const [showMCQSection, setShowMCQSection] = useState(false);

  useEffect(() => {
    const foundLevel = mockLevels.find((l) => l.id === Number(levelId));
    if (!foundLevel) {
      navigate('/levels-legacy'); // Wait! In routes.tsx, /levels is now /levels/:language, and /levels-legacy is Levels. Let's redirect to /levels-legacy.
      return;
    }

    // Customize level content based on language
    if (userProgress && userProgress.language === 'python') {
      const pythonLevel = {
        ...foundLevel,
        title: foundLevel.title.replace('Java', 'Python'),
        description: foundLevel.description.replace('Java', 'Python').replace('java', 'python'),
        learningContent: foundLevel.learningContent
          .replace(/Java/g, 'Python')
          .replace(/java/g, 'python')
          .replace(/public class/g, 'class')
          .replace(/public static void main\(String\[\] args\)/g, 'if __name__ == "__main__":')
          .replace(/System\.out\.println/g, 'print')
      };
      setLevel(pythonLevel);
    } else {
      setLevel(foundLevel);
    }

    // Check if level is locked
    if (foundLevel.isLocked && userProgress) {
      const canAccess = 
        foundLevel.id === 1 || 
        userProgress.levelsCompleted.includes(foundLevel.id - 1);
      
      if (!canAccess) {
        navigate('/levels');
        return;
      }
    }
  }, [isAuthenticated, levelId, navigate, userProgress]);

  if (!level) return null;

  const isCompleted = userProgress?.levelsCompleted.includes(level.id);
  const levelScore = userProgress?.scores.find((s) => s.level === level.id);
  const hasMCQPassed = levelScore?.mcqPassed || false;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{level.title}</h1>
            <p className="text-gray-600">{level.description}</p>
          </div>
          <button
            onClick={() => navigate('/levels')}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            ← Back to Levels
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Banner */}
        {isCompleted && levelScore && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-green-900 mb-1">
                  ✓ Level Completed
                </h3>
                <p className="text-green-700">
                  You scored {levelScore.totalScore}% on this level
                </p>
              </div>
              <button
                onClick={() => navigate(`/level/${level.id}/mcq`)}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Retake Test
              </button>
            </div>
          </div>
        )}

        {/* Learning Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="w-6 h-6 text-indigo-600" />
            <h2 className="text-2xl font-bold">Learning Material</h2>
          </div>
          
          <div className="prose max-w-none">
            <ReactMarkdown
              components={{
                h1: ({ children }) => (
                  <h1 className="text-3xl font-bold mb-4 mt-6">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-2xl font-semibold mb-3 mt-5">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-xl font-semibold mb-2 mt-4">{children}</h3>
                ),
                p: ({ children }) => <p className="mb-4 leading-7">{children}</p>,
                code: ({ children }) => (
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-indigo-600">
                    {children}
                  </code>
                ),
                pre: ({ children }) => (
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4">
                    {children}
                  </pre>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside mb-4 space-y-2">{children}</ul>
                ),
                li: ({ children }) => <li className="ml-4">{children}</li>,
              }}
            >
              {level.learningContent}
            </ReactMarkdown>
          </div>
        </div>

        {/* Assessment Section */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📝</span>
              </div>
              <div>
                <h3 className="font-bold text-lg">MCQ Test</h3>
                <p className="text-sm text-gray-600">10 Questions</p>
              </div>
            </div>
            <p className="text-gray-600 mb-4">
              Answer multiple choice questions to test your understanding. Score 7+ to unlock coding challenges.
            </p>
            <button
              onClick={() => navigate(`/level/${level.id}/mcq`)}
              className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2"
            >
              Start MCQ Test
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <CodeIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Coding Challenges</h3>
                <p className="text-sm text-gray-600">15 Problems</p>
              </div>
            </div>
            {hasMCQPassed ? (
              <>
                <p className="text-gray-600 mb-4">
                  Solve coding problems and pass test cases.
                </p>
                <button
                  onClick={() => navigate(`/level/${level.id}/code`)}
                  className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2"
                >
                  Start Coding
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <p className="text-gray-600 mb-4">
                  🔒 Pass the MCQ test with 70% or higher to unlock coding challenges.
                </p>
                <button
                  disabled
                  className="w-full py-3 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Locked - Pass MCQ First
                </button>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}