'use client';

import { useMemo, useState } from 'react';
import type { QuizQuestion } from '../../lib/knowledgeTypes';
import styles from './QuizCard.module.css';

interface QuizCardProps {
  question: QuizQuestion;
  index: number;
}

export default function QuizCard({ question, index }: QuizCardProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const isCorrect = useMemo(() => selected === question.answerId, [selected, question.answerId]);

  const handleSelect = (optionId: string) => {
    if (showExplanation) return;
    setSelected(optionId);
  };

  const handleCheck = () => {
    if (selected) {
      setShowExplanation(true);
    }
  };

  const handleReset = () => {
    setSelected(null);
    setShowExplanation(false);
  };

  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <span className={styles.number}>문제 {index + 1}</span>
        <p className={styles.prompt}>{question.prompt}</p>
      </div>
      <div className={styles.options}>
        {question.options.map((option) => {
          const state =
            showExplanation && option.id === question.answerId
              ? 'correct'
              : showExplanation && option.id === selected
              ? 'wrong'
              : option.id === selected
              ? 'selected'
              : 'default';

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => handleSelect(option.id)}
              className={`${styles.option} ${styles[state]}`}
              aria-pressed={selected === option.id}
            >
              <span className={styles.optionText}>{option.text}</span>
            </button>
          );
        })}
      </div>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.checkButton}
          onClick={handleCheck}
          disabled={!selected || showExplanation}
        >
          정답 확인
        </button>
        <button type="button" className={styles.resetButton} onClick={handleReset}>
          다시 풀기
        </button>
      </div>
      {showExplanation && (
        <div className={`${styles.explanation} ${isCorrect ? styles.explanationCorrect : styles.explanationWrong}`}>
          <strong>{isCorrect ? '정답입니다!' : '오답입니다.'}</strong>
          <p>{question.explanation}</p>
          {question.referencePaths.length > 0 && (
            <p className={styles.reference}>참고: {question.referencePaths.join(' / ')}</p>
          )}
        </div>
      )}
    </article>
  );
}
