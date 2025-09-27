import QuizDashboard from './components/QuizDashboard';
import knowledgeData from '../data/knowledge';
import { quizBank } from '../data/questions';

export default function Page() {
  return <QuizDashboard categories={knowledgeData.medical_summary} questions={quizBank} />;
}
