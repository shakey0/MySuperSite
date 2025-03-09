import { createRoot } from 'react-dom/client';
import Brain from '../components/brain/Brain';

document.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.getElementById('brain-root');
  if (rootElement) {
    const root = createRoot(rootElement);
    root.render(<Brain />);
  }
});
