'use client'

import { useState, useCallback } from 'react';
import GuessInput from './GuessInput';
import QuizTable from './QuizTable';
import Stopwatch from './Stopwatch';
import { Entry } from '@prisma/client';

interface QuizGameClientProps {
  entries: Entry[];
  totalEntries: number; 
  slug: string;
}

export default function QuizGame({ entries, totalEntries, slug }: QuizGameClientProps) {
  const [correctGuesses, setCorrectGuesses] = useState<Entry[]>([]);
  const [incorrectGuesses, setIncorrectGuesses] = useState<string[]>([]);

  const handleCorrectGuess = useCallback((entry: Entry) => {
    if (correctGuesses.includes(entry)) {
      return;
    }
    
    setCorrectGuesses(prev => [...prev, entry]);
  }, [correctGuesses]);

  const handleIncorrectGuess = useCallback((guess: string) => {
    if (incorrectGuesses.includes(guess)) {
      return;
    }
    
    setIncorrectGuesses(prev => [...prev, guess]);
  }, [incorrectGuesses]);

  return (
    <div className="quiz-container">
      <div className="quiz-top-layer">
        <div className="stopwatch">
          <Stopwatch />
        </div>
      </div>

      <div className="quiz-second-layer">
        <div className="category-name">
          {slug.replace('-', ' ').toUpperCase()}
        </div>

        <div className="difficulty-picker">
          <div className="text-sm text-gray-600">
            {correctGuesses.length} / {totalEntries} correct
          </div>
        </div>
      </div>

      <div className="quiz-third-layer">
        <div className="input-guesser">
          <GuessInput 
            entries={entries}
            onCorrectGuess={handleCorrectGuess}
            onIncorrectGuess={handleIncorrectGuess}
          />
        </div>
      </div>

      <QuizTable 
        correctGuesses={correctGuesses}
        incorrectGuesses={incorrectGuesses}
      />
    </div>
  );
}