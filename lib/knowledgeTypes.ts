export interface KnowledgeTopic {
  title: string;
  [key: string]: unknown;
}

export interface KnowledgeCategory {
  category: string;
  topics: KnowledgeTopic[];
}

export interface KnowledgeData {
  medical_summary: KnowledgeCategory[];
}

export type KnowledgeValue = string | number | boolean | KnowledgeRecord | KnowledgeValue[];

export interface KnowledgeRecord {
  [key: string]: KnowledgeValue;
}

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  category: string;
  prompt: string;
  options: QuizOption[];
  answerId: string;
  explanation: string;
  referencePaths: string[];
}
