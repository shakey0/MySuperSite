import { createRoot } from 'react-dom/client';
import KnowledgeIndex from '../components/brain/knowledge/KnowledgeIndex';

document.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.getElementById('knowledge-index-root');
  if (rootElement) {
    const root = createRoot(rootElement);
    root.render(<KnowledgeIndex />);
  }
});
