import fs from 'fs';
import path from 'path';
import { marked } from 'marked';
import type { QuizCategory, QuizOption, QuizQuestion } from './quizTypes';

const QUIZ_SOURCE = path.join(process.cwd(), 'quiz.md');

const CATEGORY_SEPARATOR = /\n\*\*\*\n/g;
const OPTION_REGEX = /^([a-d])\)\s*(.+)$/gm;
const QUESTION_REGEX = /\*\*(\d+)\.\s*([\s\S]*?)\*\*[\r\n]+([\s\S]*?)(?:\n<br>|$)/g;
const EXPLANATION_REGEX = /\*\*(\d+)\.\s*정답:\s*([a-d])\)\*\*[\r\n]+([\s\S]*?)(?=\n\*\*[0-9]+\.\s*정답:|$)/g;

function sanitizePrompt(raw: string): string {
  return raw.replace(/\s+/g, ' ').trim();
}

function parseOptions(block: string, baseId: string): QuizOption[] {
  const options: QuizOption[] = [];
  let match: RegExpExecArray | null;
  while ((match = OPTION_REGEX.exec(block)) !== null) {
    const [, label, text] = match;
    options.push({
      id: `${baseId}-option-${label}`,
      label,
      text: text.trim()
    });
  }
  OPTION_REGEX.lastIndex = 0;
  return options;
}

function parseQuestions(content: string, categoryId: string): Omit<QuizQuestion, 'explanationHtml'>[] {
  const questions: Omit<QuizQuestion, 'explanationHtml'>[] = [];
  let match: RegExpExecArray | null;
  while ((match = QUESTION_REGEX.exec(content)) !== null) {
    const [, number, prompt, optionsBlock] = match;
    const id = `${categoryId}-q${number}`;
    const options = parseOptions(optionsBlock, id);
    questions.push({
      id,
      prompt: sanitizePrompt(prompt),
      options,
      answerId: ''
    });
  }
  QUESTION_REGEX.lastIndex = 0;
  return questions;
}

function attachExplanations(
  questions: Omit<QuizQuestion, 'explanationHtml'>[],
  explanationMarkdown: string
): QuizQuestion[] {
  const enriched: QuizQuestion[] = questions.map((question) => ({
    ...question,
    explanationHtml: ''
  }));

  let match: RegExpExecArray | null;
  while ((match = EXPLANATION_REGEX.exec(explanationMarkdown)) !== null) {
    const [, number, answerLabel, body] = match;
    const questionIdSuffix = `q${number}`;
    const target = enriched.find((item) => item.id.endsWith(questionIdSuffix));
    if (!target) {
      continue;
    }

    const answerOption = target.options.find((option) => option.label === answerLabel);
    if (answerOption) {
      target.answerId = answerOption.id;
    }

    const markdown = `**정답: ${answerLabel.toUpperCase()}**\n${body.trim()}`;
    target.explanationHtml = marked.parse(markdown);
  }
  EXPLANATION_REGEX.lastIndex = 0;

  return enriched.map((question) => {
    if (!question.answerId && question.options.length > 0) {
      return {
        ...question,
        answerId: question.options[0].id,
        explanationHtml:
          question.explanationHtml ||
          marked.parse(`**정답: ${question.options[0].label.toUpperCase()}**\n해설이 제공되지 않았습니다.`)
      };
    }
    return question;
  });
}

export function loadQuizCategories(): QuizCategory[] {
  const raw = fs.readFileSync(QUIZ_SOURCE, 'utf-8');
  const sections = raw
    .split(CATEGORY_SEPARATOR)
    .map((section) => section.trim())
    .filter(Boolean);

  return sections.map((section, index) => {
    const headerMatch = section.match(/^###\s+(.+?)\s*$/m);
    const title = headerMatch ? headerMatch[1].trim() : `섹션 ${index + 1}`;
    const withoutHeader = headerMatch
      ? section.slice(section.indexOf(headerMatch[0]) + headerMatch[0].length).trim()
      : section;

    const detailsStart = withoutHeader.indexOf('<details>');
    const questionContent =
      detailsStart >= 0 ? withoutHeader.slice(0, detailsStart).trim() : withoutHeader.trim();
    const explanationContent =
      detailsStart >= 0 ? withoutHeader.slice(detailsStart).trim() : '';

    const explanationMarkdown = explanationContent
      .replace(/^<details>\s*<summary><b>해설 보기<\/b><\/summary>\s*/i, '')
      .replace(/<\/details>$/i, '')
      .trim();

    const categoryId = `cat-${index + 1}`;
    const questionList = parseQuestions(questionContent, categoryId);
    const questionsWithExplanations = attachExplanations(questionList, explanationMarkdown);

    return {
      id: categoryId,
      title,
      questions: questionsWithExplanations
    } satisfies QuizCategory;
  });
}
