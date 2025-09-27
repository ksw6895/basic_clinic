import knowledgeData from './knowledge';
import type { QuizQuestion } from '../lib/knowledgeTypes';
import { flattenKnowledge } from '../lib/knowledgeUtils';

interface InternalDetail {
  category: string;
  topic: string;
  context: string;
  text: string;
}

const DETAILS = flattenKnowledge(knowledgeData.medical_summary) as InternalDetail[];

function buildPrompt(detail: InternalDetail): string {
  const context = detail.context ? `(${detail.context})` : '';
  return `${detail.category} · ${detail.topic}${context}에서 옳은 설명은 무엇인가요?`;
}

function buildExplanation(detail: InternalDetail): string {
  const context = detail.context ? `${detail.context}에 따르면 ` : '';
  return `knowledge.json에 수록된 "${detail.topic}" 항목의 ${context}${detail.text}`;
}

function pickWrongOptions(detail: InternalDetail, count: number, startIndex: number): InternalDetail[] {
  const pool = DETAILS.filter((item) => item.text !== detail.text || item.context !== detail.context || item.topic !== detail.topic);
  const wrong: InternalDetail[] = [];
  let offset = 1;

  while (wrong.length < count && pool.length > 0) {
    const index = (startIndex + offset * 17) % pool.length;
    const candidate = pool[index];
    if (!wrong.some((item) => item.text === candidate.text)) {
      wrong.push(candidate);
    }
    offset += 1;
  }

  return wrong;
}

function selectDetailsByCategory(category: string, limit: number): InternalDetail[] {
  const categoryDetails = DETAILS.filter((detail) => detail.category === category);
  if (categoryDetails.length <= limit) {
    return categoryDetails;
  }
  const step = Math.ceil(categoryDetails.length / limit);
  return categoryDetails.filter((_, index) => index % step === 0).slice(0, limit);
}

const QUESTIONS_PER_CATEGORY = 6;

const quizBank: QuizQuestion[] = knowledgeData.medical_summary.flatMap((category, categoryIndex) => {
  const selectedDetails = selectDetailsByCategory(category.category, QUESTIONS_PER_CATEGORY);

  return selectedDetails.map((detail, detailIndex) => {
    const wrongOptions = pickWrongOptions(detail, 3, categoryIndex * 101 + detailIndex * 31);
    const optionTexts = [detail, ...wrongOptions];

    const arranged = optionTexts
      .map((item, idx) => ({
        item,
        sortKey: (item.text.length + idx * 37 + detailIndex * 13 + categoryIndex * 7) % 193
      }))
      .sort((a, b) => a.sortKey - b.sortKey);

    const options = arranged.map((entry, optionIndex) => ({
      id: `option-${categoryIndex}-${detailIndex}-${optionIndex}`,
      text: entry.item.text
    }));

    const correctOptionId = options.find((option) => option.text === detail.text)?.id ?? options[0].id;

    return {
      id: `q-${categoryIndex}-${detailIndex}`,
      category: category.category,
      prompt: buildPrompt(detail),
      options,
      answerId: correctOptionId,
      explanation: buildExplanation(detail),
      referencePaths: [`${category.category} > ${detail.topic} > ${detail.context}`]
    } satisfies QuizQuestion;
  });
});

export { quizBank };
