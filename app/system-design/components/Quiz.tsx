'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertCircle, RefreshCw, ChevronRight, Award } from 'lucide-react';
import { useProgress } from './useProgress';

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export default function Quiz({ title, questions }: { title: string; questions: Question[] }) {
  const { markModuleCompleted, saveQuizScore } = useProgress();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const handleSelect = (index: number) => {
    if (showResult) return;
    setSelectedOption(index);
    setShowResult(true);
    if (index === questions[currentQuestion].correctAnswer) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(c => c + 1);
      setSelectedOption(null);
      setShowResult(false);
    } else {
      setIsFinished(true);
    }
  };

  useEffect(() => {
    if (isFinished) {
      // Map title to module id
      let mId = 'module-1';
      if (title.includes('Microservice')) mId = 'module-2';
      if (title.includes('Practical')) mId = 'module-3';
      if (title.includes('Real-World')) mId = 'module-4';
      if (title.includes('AWS')) mId = 'module-5';
      markModuleCompleted(mId);
      saveQuizScore(mId, score);
    }
  }, [isFinished]);

  const restart = () => {
    setCurrentQuestion(0);
    setSelectedOption(null);
    setShowResult(false);
    setScore(0);
    setIsFinished(false);
  };

  if (isFinished) {
    return (
      <div className="bg-slate-100 dark:bg-slate-800/60 rounded-xl border border-slate-300 dark:border-slate-700/50 p-8 my-12 text-center max-w-2xl mx-auto">
        <Award className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{title} Complete!</h3>
        <p className="text-lg text-slate-700 dark:text-slate-300 mb-6">
          You scored <strong className="text-blue-700 dark:text-blue-500">{score}</strong> out of {questions.length}.
        </p>
        <button 
          onClick={restart}
          className="flex items-center gap-2 mx-auto bg-blue-600 hover:bg-blue-500 text-slate-900 dark:text-white px-6 py-2 rounded-lg font-bold transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Retry Quiz
        </button>
      </div>
    );
  }

  const q = questions[currentQuestion];

  return (
    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/50 rounded-xl p-6 md:p-8 my-12 max-w-3xl mx-auto shadow-lg relative overflow-hidden">
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 h-1 bg-blue-500 transition-all duration-300" style={{ width: `${((currentQuestion) / questions.length) * 100}%` }} />
      
      <div className="flex justify-between items-end mb-8 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h3 className="text-sm font-bold text-blue-700 dark:text-blue-500 tracking-wider uppercase mb-1">Knowledge Check</h3>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
        </div>
        <div className="text-sm font-mono text-slate-500 dark:text-slate-400 font-bold">
          {currentQuestion + 1} / {questions.length}
        </div>
      </div>

      <div className="mb-8">
        <h4 className="text-lg text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
          {q.text}
        </h4>
      </div>

      <div className="space-y-3 mb-8">
        {q.options.map((opt, idx) => {
          let styleClass = "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-400 dark:hover:border-blue-500 text-slate-700 dark:text-slate-300";
          let icon = null;
          
          if (showResult) {
            if (idx === q.correctAnswer) {
              styleClass = "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300";
              icon = <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
            } else if (idx === selectedOption) {
              styleClass = "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300";
              icon = <XCircle className="w-5 h-5 text-red-500" />;
            } else {
              styleClass = "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 opacity-50";
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={showResult}
              className={`w-full text-left px-5 py-4 rounded-lg border-2 transition-all flex justify-between items-center ${styleClass}`}
            >
              <span>{opt}</span>
              {icon && <span>{icon}</span>}
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg flex gap-3 items-start ${
              selectedOption === q.correctAnswer 
                ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30' 
                : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30'
            }`}
          >
            <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
              selectedOption === q.correctAnswer ? 'text-emerald-500' : 'text-blue-500'
            }`} />
            <div>
              <p className={`text-sm font-bold mb-1 ${
                selectedOption === q.correctAnswer ? 'text-emerald-800 dark:text-emerald-300' : 'text-blue-800 dark:text-blue-300'
              }`}>
                {selectedOption === q.correctAnswer ? 'Correct!' : 'Incorrect'}
              </p>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {q.explanation}
              </p>
              
              <button 
                onClick={handleNext}
                className="mt-4 flex items-center gap-1 text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                {currentQuestion < questions.length - 1 ? 'Next Question' : 'View Results'} <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
