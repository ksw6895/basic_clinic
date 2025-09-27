'use client';

import { useMemo, useState } from 'react';
import type { KnowledgeCategory, QuizQuestion } from '../../lib/knowledgeTypes';
import QuizCard from './QuizCard';
import KnowledgeSection from './KnowledgeSection';
import styles from './QuizDashboard.module.css';

interface QuizDashboardProps {
  categories: KnowledgeCategory[];
  questions: QuizQuestion[];
}

export default function QuizDashboard({ categories, questions }: QuizDashboardProps) {
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.category ?? '');

  const filteredQuestions = useMemo(
    () => questions.filter((question) => question.category === selectedCategory),
    [questions, selectedCategory]
  );

  const activeCategory = useMemo(
    () => categories.find((category) => category.category === selectedCategory) ?? categories[0],
    [categories, selectedCategory]
  );

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <h1>의학 통합 퀴즈</h1>
        <p className={styles.subtitle}>
          knowledge.json에 수록된 외과·응급 의학 핵심 내용을 기반으로 카테고리를 선택하고, 4지선다형 문제를 풀어보세요.
        </p>
        <div className={styles.categoryList}>
          {categories.map((category) => (
            <button
              key={category.category}
              type="button"
              onClick={() => setSelectedCategory(category.category)}
              className={`${styles.categoryButton} ${
                selectedCategory === category.category ? styles.categoryButtonActive : ''
              }`}
            >
              {category.category}
            </button>
          ))}
        </div>
      </aside>
      <main className={styles.main}>
        <section className={styles.quizIntro}>
          <h2>{selectedCategory}</h2>
          <p>
            아래 문제들은 해당 카테고리의 실전 임상 포인트를 기반으로 구성되었습니다. 정답과 해설에는 knowledge.json에 포함된 상세 설명이
            그대로 담겨 있어 복습에 도움이 됩니다.
          </p>
        </section>
        <div className={styles.quizList}>
          {filteredQuestions.map((question, index) => (
            <QuizCard key={question.id} question={question} index={index} />
          ))}
        </div>
        {activeCategory && <KnowledgeSection category={activeCategory} />}
      </main>
    </div>
  );
}
