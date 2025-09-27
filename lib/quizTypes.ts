export interface QuizOption {
  id: string;
  label: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: QuizOption[];
  answerId: string;
  explanationHtml: string;
}

export interface QuizCategory {
  id: string;
  title: string;
  questions: QuizQuestion[];
}
