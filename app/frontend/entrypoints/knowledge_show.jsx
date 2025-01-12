import { createRoot } from 'react-dom/client';
import KnowledgeShow from '../components/brain/knowledge/KnowledgeShow';

document.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.getElementById('knowledge-show-root');
  if (rootElement) {
    const root = createRoot(rootElement);
    root.render(<KnowledgeShow />);
  }
});
