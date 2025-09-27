import type { KnowledgeCategory, KnowledgeRecord, KnowledgeValue } from './knowledgeTypes';
import { formatLabel } from './labelMap';

export interface FlattenedDetail {
  category: string;
  topic: string;
  context: string;
  text: string;
}

function isRecord(value: KnowledgeValue): value is KnowledgeRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function collectFromValue(
  value: KnowledgeValue,
  contextLabels: string[],
  collector: FlattenedDetail[],
  category: string,
  topic: string
) {
  if (typeof value === 'string') {
    const cleaned = value.trim();
    if (cleaned.length >= 6) {
      collector.push({
        category,
        topic,
        context: contextLabels.join(' > '),
        text: cleaned
      });
    }
    return;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    collector.push({
      category,
      topic,
      context: contextLabels.join(' > '),
      text: String(value)
    });
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      const label = contextLabels[contextLabels.length - 1];
      const arrayLabel = label ? `${label} ${index + 1}` : `항목 ${index + 1}`;
      collectFromValue(item, [...contextLabels.slice(0, -1), arrayLabel], collector, category, topic);
    });
    return;
  }

  if (isRecord(value)) {
    Object.entries(value).forEach(([key, val]) => {
      const formatted = formatLabel(key);
      collectFromValue(val as KnowledgeValue, [...contextLabels, formatted], collector, category, topic);
    });
  }
}

export function flattenKnowledge(categories: KnowledgeCategory[]): FlattenedDetail[] {
  const collector: FlattenedDetail[] = [];

  categories.forEach((category) => {
    category.topics.forEach((topic) => {
      Object.entries(topic)
        .filter(([key]) => key !== 'title')
        .forEach(([key, value]) => {
          const formatted = formatLabel(key);
          collectFromValue(value as KnowledgeValue, [formatted], collector, category.category, topic.title);
        });
    });
  });

  return collector;
}

export function groupDetailsByCategory(details: FlattenedDetail[]): Record<string, FlattenedDetail[]> {
  return details.reduce<Record<string, FlattenedDetail[]>>((acc, detail) => {
    if (!acc[detail.category]) {
      acc[detail.category] = [];
    }
    acc[detail.category].push(detail);
    return acc;
  }, {});
}
