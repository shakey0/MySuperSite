import { createRoot } from 'react-dom/client';
import KnowledgeQuiz from '../components/brain/knowledge/KnowledgeQuiz';

document.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.getElementById('knowledge-quiz-root');
  if (rootElement) {
    const root = createRoot(rootElement);
    root.render(<KnowledgeQuiz />);
  }
});
