import { createRoot } from 'react-dom/client';
import Brain from '../components/brain/brain';

document.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.getElementById('brain-root');
  if (rootElement) {
    const root = createRoot(rootElement);
    root.render(<Brain />);
  }
});
