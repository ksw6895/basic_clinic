'use client';

import { useMemo } from 'react';
import type { KnowledgeCategory, KnowledgeValue } from '../../lib/knowledgeTypes';
import { formatLabel } from '../../lib/labelMap';
import styles from './KnowledgeSection.module.css';

interface KnowledgeSectionProps {
  category: KnowledgeCategory;
}

function renderValue(value: KnowledgeValue, depth = 0): JSX.Element {
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return <p className={styles.detail} style={{ marginLeft: depth * 16 }}>{String(value)}</p>;
  }

  if (Array.isArray(value)) {
    return (
      <ul className={styles.list} style={{ marginLeft: depth * 16 }}>
        {value.map((item, idx) => (
          <li key={idx}>{renderValue(item, depth + 1)}</li>
        ))}
      </ul>
    );
  }

  return (
    <div className={styles.record} style={{ marginLeft: depth * 16 }}>
      {Object.entries(value).map(([key, val]) => (
        <div key={key} className={styles.recordItem}>
          <strong className={styles.label}>{formatLabel(key)}</strong>
          {renderValue(val, depth + 1)}
        </div>
      ))}
    </div>
  );
}

export default function KnowledgeSection({ category }: KnowledgeSectionProps) {
  const memoizedContent = useMemo(() => {
    return category.topics.map((topic) => (
      <section key={topic.title} className={styles.topicSection}>
        <h3>{topic.title}</h3>
        {Object.entries(topic)
          .filter(([key]) => key !== 'title')
          .map(([key, value]) => (
            <div key={key} className={styles.topicContent}>
              <h4>{formatLabel(key)}</h4>
              {renderValue(value as KnowledgeValue, 0)}
            </div>
          ))}
      </section>
    ));
  }, [category]);

  return (
    <div className={styles.container}>
      <h2>참고 자료</h2>
      <p className={styles.guide}>퀴즈는 아래 내용을 기반으로 구성되었습니다. 학습을 위해 모든 세부 정보를 확인하세요.</p>
      {memoizedContent}
    </div>
  );
}
