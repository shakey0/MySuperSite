import { createRoot } from 'react-dom/client';
import KnowledgeReview from '../components/brain/knowledge/KnowledgeReview';

document.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.getElementById('knowledge-review-root');
  if (rootElement) {
    const root = createRoot(rootElement);
    root.render(<KnowledgeReview />);
  }
});
