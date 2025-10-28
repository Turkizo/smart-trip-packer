import React, { useState } from 'react';
import type { ClarificationQuestion, ClarificationAnswer } from '../types';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface ClarificationQuestionsFormProps {
  questions: ClarificationQuestion[];
  onSubmit: (answers: ClarificationAnswer[]) => void;
  onSkip: () => void;
  isLoading: boolean;
}

export const ClarificationQuestionsForm: React.FC<ClarificationQuestionsFormProps> = ({
  questions,
  onSubmit,
  onSkip,
  isLoading
}) => {
  const [answers, setAnswers] = useState<Map<string, boolean>>(new Map());

  const handleAnswer = (questionId: string, answer: boolean) => {
    setAnswers(prev => new Map(prev).set(questionId, answer));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const answerList: ClarificationAnswer[] = Array.from(answers.entries()).map(([questionId, answer]) => ({
      questionId,
      answer
    }));
    onSubmit(answerList);
  };

  if (questions.length === 0) {
    return null;
  }

  return (
    <div className="w-full animate-fade-in">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-slate-200 mb-2">כמה שאלות מהירות</h2>
        <p className="text-slate-400">כדי ליצור רשימת ציוד מדויקת יותר</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {questions.map((question) => (
          <div
            key={question.id}
            className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50"
          >
            <p className="text-slate-200 mb-3 text-right">{question.question}</p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => handleAnswer(question.id, false)}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  answers.get(question.id) === false
                    ? 'bg-red-600 text-white'
                    : 'bg-slate-600/50 text-slate-300 hover:bg-slate-600'
                }`}
              >
                לא
              </button>
              <button
                type="button"
                onClick={() => handleAnswer(question.id, true)}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  answers.get(question.id) === true
                    ? 'bg-green-600 text-white'
                    : 'bg-slate-600/50 text-slate-300 hover:bg-slate-600'
                }`}
              >
                כן
              </button>
            </div>
          </div>
        ))}

        <div className="flex gap-3 justify-center mt-6">
          <button
            type="button"
            onClick={onSkip}
            disabled={isLoading}
            className="px-6 py-3 bg-slate-700/50 text-slate-400 font-semibold rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            דלג
          </button>
          <button
            type="submit"
            disabled={isLoading || answers.size === 0}
            className="px-8 py-3 bg-cyan-600 text-white font-bold rounded-lg hover:bg-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2 shadow-lg shadow-cyan-900/50 transform hover:scale-105 disabled:scale-100"
          >
            {isLoading ? (
              <>
                <SpinnerIcon className="w-5 h-5" />
                יוצר רשימה...
              </>
            ) : (
              'המשך'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

