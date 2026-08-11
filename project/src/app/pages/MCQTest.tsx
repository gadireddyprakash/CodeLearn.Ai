import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { mockLevels } from '../data/mockData';
import { getPythonMCQs } from '../data/pythonData';
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react';

export default function MCQTest() {
  const { levelId } = useParams<{ levelId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, userProgress, updateProgress } = useAuth();
  const [level, setLevel] = useState(mockLevels.find((l) => l.id === Number(levelId)));
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes

  useEffect(() => {
    if (!isAuthenticated || !level) {
      navigate('/levels');
      return;
    }

    // Load language-specific questions
    if (userProgress?.language === 'python') {
      const pythonMCQs = getPythonMCQs(Number(levelId));
      setLevel({
        ...level,
        mcqQuestions: pythonMCQs
      });
    }

    // Timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isAuthenticated, level?.id, userProgress?.language]);

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    setAnswers({ ...answers, [questionIndex]: answerIndex });
  };

  const handleNext = () => {
    if (level && currentQuestion < level.mcqQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    if (!level || !userProgress) return;

    // Calculate score
    let correct = 0;
    level.mcqQuestions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correct++;
      }
    });

    const scorePercentage = Math.round((correct / level.mcqQuestions.length) * 100);
    setScore(scorePercentage);
    setShowResults(true);

    // Check if passed (70% = 7/10 questions)
    const passed = correct >= 7;
    
    // Check if this is first time passing MCQ for this level
    const existingScore = userProgress.scores.find(s => s.level === level.id);
    const wasAlreadyPassed = existingScore?.mcqPassed || false;
    
    // Update progress with MCQ result
    const existingScoreIndex = userProgress.scores.findIndex(s => s.level === level.id);
    let updatedScores = [...userProgress.scores];
    
    if (existingScoreIndex >= 0) {
      // Update existing score
      updatedScores[existingScoreIndex] = {
        ...updatedScores[existingScoreIndex],
        mcqScore: scorePercentage,
        mcqPassed: passed,
      };
    } else {
      // Add new score entry
      updatedScores.push({
        level: level.id,
        mcqScore: scorePercentage,
        mcqPassed: passed,
        codingScore: 0,
        totalScore: 0,
        passed: false,
        completedAt: new Date().toISOString(),
      });
    }
    
    // Add +5% progress if MCQ passed for first time
    let newProgress = userProgress.progressPercentage;
    if (passed && !wasAlreadyPassed) {
      newProgress = Math.min(userProgress.progressPercentage + 5, 100);
    }
    
    updateProgress({ 
      scores: updatedScores,
      progressPercentage: newProgress
    });
  };

  const handleContinue = () => {
    if (!level) return;
    
    if (score >= 70) {
      navigate(`/level/${level.id}/code`);
    } else {
      navigate(`/level/${level.id}`);
    }
  };

  if (!level) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const question = level.mcqQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / level.mcqQuestions.length) * 100;

  if (showResults) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            {score >= 70 ? (
              <>
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Congratulations! 🎉
                </h2>
                <p className="text-gray-600 mb-2">You passed the MCQ test!</p>
                <p className="text-sm text-green-600 font-medium">
                  +5% Progress Added
                </p>
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-12 h-12 text-red-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Not Quite There Yet
                </h2>
                <p className="text-gray-600">You need 70% to unlock coding challenges</p>
              </>
            )}
          </div>

          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <p className="text-gray-600 mb-1">Your Score</p>
                <p className="text-4xl font-bold text-indigo-600">{score}%</p>
              </div>
              <div className="text-center">
                <p className="text-gray-600 mb-1">Correct Answers</p>
                <p className="text-4xl font-bold text-gray-900">
                  {Math.round((score / 100) * level.mcqQuestions.length)}/
                  {level.mcqQuestions.length}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {score >= 70 ? (
              <>
                <button
                  onClick={handleContinue}
                  className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center justify-center gap-2"
                >
                  Continue to Coding Challenges
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigate(`/level/${level.id}`)}
                  className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                >
                  Back to Level
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => window.location.reload()}
                  className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                >
                  Try Again
                </button>
                <button
                  onClick={() => navigate(`/level/${level.id}`)}
                  className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                >
                  Review Material
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-900">MCQ Test - {level.title}</h1>
              <p className="text-sm text-gray-600">
                Question {currentQuestion + 1} of {level.mcqQuestions.length}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Time Remaining</p>
                <p className="text-xl font-bold text-indigo-600">{formatTime(timeLeft)}</p>
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {/* Question */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {question.question}
            </h2>

            {/* Options */}
            <div className="space-y-3">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(currentQuestion, index)}
                  className={`
                    w-full text-left p-4 rounded-lg border-2 transition-all
                    ${answers[currentQuestion] === index
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className={`
                      w-6 h-6 rounded-full border-2 flex items-center justify-center
                      ${answers[currentQuestion] === index
                        ? 'border-indigo-600 bg-indigo-600'
                        : 'border-gray-300'
                      }
                    `}>
                      {answers[currentQuestion] === index && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                    <span className="text-gray-900">{option}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <div className="flex gap-2">
              {level.mcqQuestions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestion(index)}
                  className={`
                    w-10 h-10 rounded-lg font-medium transition-all
                    ${currentQuestion === index
                      ? 'bg-indigo-600 text-white'
                      : answers[index] !== undefined
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }
                  `}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            {currentQuestion === level.mcqQuestions.length - 1 ? (
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Submit Test
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}