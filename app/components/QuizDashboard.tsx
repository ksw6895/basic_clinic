'use client';

import { useMemo, useState } from 'react';
import type { QuizCategory } from '../../lib/quizTypes';
import QuizCard from './QuizCard';
import styles from './QuizDashboard.module.css';

interface QuizDashboardProps {
  categories: QuizCategory[];
}

export default function QuizDashboard({ categories }: QuizDashboardProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState(categories[0]?.id ?? '');

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === selectedCategoryId) ?? categories[0],
    [categories, selectedCategoryId]
  );

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <h1>의학 통합 퀴즈</h1>
        <p className={styles.subtitle}>
          quiz.md에 정리된 공식 문제와 해설을 그대로 옮겨 놓았습니다. 카테고리를 선택해 실제 출제 문항을 확인하고 풀어보세요.
        </p>
        <div className={styles.categoryList}>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setSelectedCategoryId(category.id)}
              className={`${styles.categoryButton} ${
                selectedCategoryId === category.id ? styles.categoryButtonActive : ''
              }`}
            >
              {category.title}
            </button>
          ))}
        </div>
      </aside>
      <main className={styles.main}>
        {selectedCategory ? (
          <>
            <section className={styles.quizIntro}>
              <h2>{selectedCategory.title}</h2>
              <p>
                이 섹션의 모든 문항과 해설은 quiz.md에 작성된 내용을 그대로 반영합니다. 정답 확인 후에는 제공된 해설을 통해 근거와 오답
                포인트를 꼼꼼하게 복습하세요.
              </p>
            </section>
            <div className={styles.quizList}>
              {selectedCategory.questions.map((question, index) => (
                <QuizCard key={question.id} question={question} index={index} />
              ))}
            </div>
          </>
        ) : (
          <p className={styles.emptyState}>표시할 카테고리가 없습니다.</p>
        )}
      </main>
    </div>
  );
}
