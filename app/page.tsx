import QuizDashboard from './components/QuizDashboard';
import { quizCategories } from '../data/quizCategories';

export default function Page() {
  return <QuizDashboard categories={quizCategories} />;
}
